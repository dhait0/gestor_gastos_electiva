# 07 — Release, recuperación y validación de despliegue (P03)

**Fecha:** 2026-11-14 · **actualizado 2026-11-17** tras integrar la cadena de PR en `staging`. Este documento no autoriza ningún despliegue: producción solo cambia con aprobación del propietario sobre el merge a `main`.

## 1. Estado de la integración
**Los 6 PR de las fases F–P y del cierre de brechas están integrados en `staging`** (2026-11-14), mergeados en orden con *merge commit* y no con *squash*, a propósito: las ramas estaban apiladas y un squash reescribe la ascendencia y habría producido conflictos al reapuntar cada PR siguiente. Tras cada merge se esperó a que el CI de `staging` (`ci`, `rls` y `e2e`) terminara en verde antes del siguiente.

| Orden | PR | Merge en `staging` | Contenido |
|---|---|---|---|
| 1 | #40 | `9247854` | Estabilización E2E, tarjetas como deuda, F01 (bug real de fechas) y F02 |
| 2 | #41 | `abb3cec` | G: presupuestos · H: metas |
| 3 | #42 | `1202489` | I: recurrentes · J: suscripciones · K: deudas · L: alertas |
| 4 | #43 | `de5c4d7` | M-N: RBAC y consola `/admin` (**ADR-008 por ratificar**) |
| 5 | #44 | `c6e9dc5` | O: inteligencia financiera · P: cierre, parche de seguridad de Next.js |
| 6 | #46 | `37abe16` | Cierre de brechas: UC-03, 11, 12, 13, 21, 24, 25, 30, 41, 46, 47, 50 |

Resultado: `staging` @ `37abe16`, con unit 294/294, lint sin errores y E2E de 35 tests contra el build de producción. **`main` no se ha tocado**: va 38 commits por detrás de `staging` (los 5 que `main` tiene de más son los merges de promociones anteriores `staging → main`, sin contenido nuevo). Las ramas de trabajo se borraron una vez comprobado que estaban totalmente fusionadas.

**Lo que falta para llegar a producción** es un único paso, que requiere aprobación del propietario: el PR `staging → main` (convención del repositorio, como #32, #33 y #37). Ver §3.

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

Ninguna toca datos existentes ni las políticas RLS de las 5 tablas originales. Todas se ensayaron en la instancia local y la suite RLS completa pasó en el CI de `staging` sobre base limpia; el esquema remoto de producción **no se pudo cotejar** (sin credenciales): **pendiente de comprobación remota**.

> **Estas 8 migraciones son exactamente lo que `main` aún no tiene.** Se aplicarán a producción de forma automática en el momento del merge a `main` (ver §3, punto 4).

## 3. Antes de desplegar a producción
1. **Cadena integrada en `staging`** (§1): hecho, con `ci`, `rls` y `e2e` en verde en cada paso. Queda **revisar el diff `staging → main`** y abrir el PR de promoción; los checks de ese PR deben estar en verde.
2. **Hacer una copia de seguridad de la base de producción** (Supabase: Database → Backups; o `supabase db dump`) **antes** de mergear a `main`, porque el merge dispara las migraciones. No migrar sin copia.
3. **Comprobar en producción** que no existen transacciones de saldo inicial compensatorias heredadas (riesgo R2 de B02):
   `select count(*) from transactions where description ilike '%saldo inicial%';` debe ser 0.
4. `deploy-migrations` aplica las migraciones al hacer push a `main` (job con `needs: ci` y environment `production`): **el merge `staging → main` es el momento exacto en que las 8 migraciones de §2 llegan a producción**, sin otro paso intermedio. Confirmar antes que `SUPABASE_ACCESS_TOKEN` y `SUPABASE_PROJECT_REF` siguen vigentes y que los puntos 2, 3 y 6 están hechos. Si el job falla a medias, no reintentar a ciegas: ver §6.
5. **Crear el primer administrador** (no hay UI a propósito), con un operador con acceso al proyecto, en el SQL editor:
   `select private.bootstrap_first_admin('<uuid del usuario>');`
   Solo funciona mientras no exista ningún admin y queda registrado en `admin_audit_logs` (`role.bootstrap`).
6. **Recuperar contraseña (UC-03): configurar Supabase Auth.** En el panel (Authentication → URL Configuration) añadir a *Redirect URLs* la URL de producción `https://<tu-dominio>/auth/callback` y comprobar que *Site URL* sea la de la app; sin eso el enlace del correo no vuelve a la aplicación. Configurar además un proveedor SMTP propio para producción (el de pruebas de Supabase tiene límites muy bajos). Probar con una cuenta real antes de anunciarlo.
7. **Ratificar ADR-008** antes de dar acceso a más administradores o a soporte.

## 4. Variables de entorno
Sin cambios: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. **No** se usa la clave `service_role` en la aplicación. Los E2E de administración usan `E2E_SUPABASE_URL` y `E2E_SERVICE_ROLE_KEY` solo en CI contra el Supabase **local** del runner; nunca apuntarlas a producción.

## 5. Validación posterior al despliegue (humo)
- [ ] `/login` y registro responden; un usuario nuevo recibe categorías por defecto.
- [ ] "¿Olvidaste tu contraseña?" envía un correo cuyo enlace vuelve a la app y permite elegir otra contraseña.
- [ ] Transferir entre dos cuentas deja el saldo líquido total igual; eliminar la transferencia borra ambas partes.
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
1. **Seguridad de Next.js (hecho, ya en `staging`):** `next@16.4.0` tenía 2 advisories **críticos** (RCE sin autenticación en el optimizador de imágenes y en `use cache`) y 1 alto (DoS con Server Actions). Se subió a **16.4.1** (parche de la misma versión menor); `pnpm audit --prod` ya no reporta Next. **Producción sigue en 16.4.0 hasta el merge a `main`**, así que esa exposición persiste hasta entonces. Existe 16.4.6 (última); actualizar es decisión del propietario.
2. **Dependencias transitivas altas:** 7 advisories altos (`undici`, `body-parser`, `systeminformation`, `zod`) vienen de la CLI `shadcn`, declarada como dependencia de **producción**. No se tocó: moverla a `devDependencies` requiere comprobar que ningún import en tiempo de build la necesite.
3. **Protección de ramas** `main`/`staging` sin activar en GitHub (acción del propietario).
4. **Cotejo del esquema remoto** y de las variables de Vercel: pendiente de comprobación remota.
5. **Brechas de producto:** cerradas (ver `06_MATRIZ_UC_50.md`, 50/50). Quedan mejoras opcionales listadas allí en "Límites conocidos".
6. ~~Advertencia de hidratación en `/transacciones`~~: **resuelta** (era un `<tbody>` anidado en la tabla).
7. **Suite RLS completa** no se ejecuta en local (borra datos de desarrollo); se ejecutó el bloque RBAC contra el Supabase local y la suite completa la ejecuta `rls.yml` en cada PR y en cada push a `staging`/`main`.
8. **Migraciones en CI (incidente 2026-11-17, corregido):** la primera promoción `staging → main` (#49) desplegó el código en Vercel pero **no aplicó las 8 migraciones**: el job `Deploy Migrations to Supabase` usaba `supabase/setup-cli` con `version: latest`, que pasó a ser el CLI 3.2.0, el cual exige confirmación en cada `db push` y, sin terminal, aborta con *«Confirmation required… Re-run with --yes. Nothing was changed»*. El fallo fue seguro (no cambió nada) pero dejó producción con código nuevo sobre el esquema viejo. Corrección: CLI **fijado en 3.2.0** en `ci.yml`, `rls.yml` y `e2e.yml`, `db push --yes`, y un paso previo `db push --dry-run` que deja en el log qué se va a aplicar. Subir la versión del CLI es ahora una decisión explícita. Esto también elimina los fallos por *rate limit* al resolver `latest`.
9. **Páginas `/terminos` y `/privacidad`:** provisionales, pendientes de revisión jurídica; no presentarlas como definitivas.
