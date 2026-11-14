# 07 — Release, recuperación y validación de despliegue (P03)

**Fecha:** 2026-11-14. Este documento no autoriza ningún despliegue: producción solo cambia con aprobación del propietario sobre el merge a `main`.

## 1. Cadena de PR pendiente de merge
Los PR están apilados; se mergean **en orden** y, tras cada uno, se reapunta la base del siguiente a `staging`:

| Orden | PR | Contenido |
|---|---|---|
| 1 | #40 | Estabilización E2E, tarjetas como deuda, F01 (bug real de fechas) y F02 |
| 2 | #41 | G: presupuestos · H: metas |
| 3 | #42 | I: recurrentes · J: suscripciones · K: deudas · L: alertas |
| 4 | #43 | M-N: RBAC y consola `/admin` (**ADR-008 por ratificar**) |
| 5 | este PR | O: inteligencia financiera · P: cierre, parche de seguridad de Next.js |

## 2. Migraciones nuevas (aditivas, en este orden)
| Migración | Qué hace | Rollback |
|---|---|---|
| `20261114120000_seed_default_categories` | `handle_new_user()` siembra categorías (solo usuarios nuevos) | Restaurar la función previa; archivar categorías `is_default` |
| `20261114130000_budgets` | `budgets` + trigger de categoría EXPENSE + RLS | `drop table public.budgets` |
| `20261114130100_goals` | `goals`, `goal_contributions` + RLS | `drop table goal_contributions; drop table goals` |
| `20261114140000_recurring_transactions` | `recurring_transactions`, FK en `transactions`, índice único de idempotencia | quitar índice y FK; `drop table` |
| `20261114150000_subscriptions` | `subscriptions` | `drop table` |
| `20261114160000_debts` | `debts`, `debt_payments`, `record_debt_payment`, `void_debt_payment` | `drop function` ×2; `drop table` ×2 |
| `20261114170000_alerts` | `alerts` | `drop table` |
| `20261114180000_rbac_admin` | tablas RBAC, funciones de administración, `bootstrap_first_admin` | ver cabecera de la migración |

Ninguna toca datos existentes ni las políticas RLS de las 5 tablas originales. Todas se ensayaron en la instancia local; el esquema remoto **no se pudo cotejar** (sin credenciales): **pendiente de comprobación remota**.

## 3. Antes de desplegar a producción
1. **Revisar y mergear la cadena** (§1). CI debe estar en verde en cada PR: `ci` (lint, typecheck, test, build), `rls` (suite completa de RLS, incluida la nueva) y `e2e`.
2. **Hacer una copia de seguridad de la base de producción** (Supabase: Database → Backups; o `supabase db dump`). No migrar sin copia.
3. **Comprobar en producción** que no existen transacciones de saldo inicial compensatorias heredadas (riesgo R2 de B02):
   `select count(*) from transactions where description ilike '%saldo inicial%';` debe ser 0.
4. `deploy-migrations` aplica las migraciones al hacer push a `main` (job con `needs: ci` y environment `production`). Confirmar que `SUPABASE_ACCESS_TOKEN` y `SUPABASE_PROJECT_REF` siguen vigentes.
5. **Crear el primer administrador** (no hay UI a propósito), con un operador con acceso al proyecto, en el SQL editor:
   `select private.bootstrap_first_admin('<uuid del usuario>');`
   Solo funciona mientras no exista ningún admin y queda registrado en `admin_audit_logs` (`role.bootstrap`).
6. **Ratificar ADR-008** antes de dar acceso a más administradores o a soporte.

## 4. Variables de entorno
Sin cambios: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. **No** se usa la clave `service_role` en la aplicación. Los E2E de administración usan `E2E_SUPABASE_URL` y `E2E_SERVICE_ROLE_KEY` solo en CI contra el Supabase **local** del runner; nunca apuntarlas a producción.

## 5. Validación posterior al despliegue (humo)
- [ ] `/login` y registro responden; un usuario nuevo recibe categorías por defecto.
- [ ] Dashboard: disponible = líquido − obligaciones − reserva (comparar con una cuenta real).
- [ ] `/presupuestos`, `/metas`, `/recurrentes`, `/suscripciones`, `/deudas`, `/alertas`, `/analisis` cargan sin error.
- [ ] Un usuario sin rol recibe 404 en `/admin`; el admin recién creado entra y ve métricas sin importes.
- [ ] `select count(*) from public.admin_audit_logs where action = 'role.bootstrap'` = 1.
- [ ] En Vercel: despliegue en verde y sin errores de runtime tras 15 minutos.

## 6. Recuperación
| Situación | Acción |
|---|---|
| Migración defectuosa | Restaurar la copia previa o aplicar el rollback de §2 (todas son aditivas: borrar tablas nuevas no afecta a las originales) |
| Despliegue de Vercel defectuoso | Promover el despliegue anterior desde el panel de Vercel (no requiere tocar la base de datos) |
| Admin comprometido | Otro admin cambia su rol (queda auditado); si no hay otro, un operador lo revierte por SQL en `user_roles` |
| Saldo de deuda inconsistente | Anular el abono con `void_debt_payment`; el saldo se recalcula de forma atómica |
| Recurrencia duplicada | Imposible por el índice único `(recurring_transaction_id, transaction_date)`; si el índice faltara, no ejecutar "Registrar vencidos" |

## 7. Riesgos y acciones manuales abiertas
1. **Seguridad de Next.js (hecho en este PR):** `next@16.4.0` tenía 2 advisories **críticos** (RCE sin autenticación en el optimizador de imágenes y en `use cache`) y 1 alto (DoS con Server Actions). Se subió a **16.4.1** (parche de la misma versión menor). Verificado: unit 229/229, E2E 19/19, build. `pnpm audit --prod` ya no reporta Next. Existe 16.4.6 (última); actualizar es decisión del propietario.
2. **Dependencias transitivas altas:** 7 advisories altos (`undici`, `body-parser`, `systeminformation`, `zod`) vienen de la CLI `shadcn`, declarada como dependencia de **producción**. No se tocó: moverla a `devDependencies` requiere comprobar que ningún import en tiempo de build la necesite.
3. **Protección de ramas** `main`/`staging` sin activar en GitHub (acción del propietario).
4. **Cotejo del esquema remoto** y de las variables de Vercel: pendiente de comprobación remota.
5. **Brechas de producto** listadas en `06_MATRIZ_UC_50.md` (recuperar contraseña, transferencias, editar/eliminar movimientos, editar presupuesto, duplicar presupuestos, detección de recurrencias, navegación persistente en escritorio).
6. **Advertencia de hidratación** en el navegador al visitar `/transacciones`, sin causa identificada; no afecta a las pruebas.
7. **Suite RLS completa** no se ejecuta en local (borra datos de desarrollo); se ejecutó el bloque RBAC contra el Supabase local y el resto lo cubre `rls.yml`.
