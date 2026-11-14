# ADR-008 — Roles, permisos y administración (M01)

**Estado:** Propuesto (implementado en la rama `feature/lukiva-fase-m-n`; pendiente de ratificación del propietario al revisar el PR).
**Fecha:** 2026-11-14

## Contexto
Lukiva incorpora una consola de administración. La dirección aprobada (`AMPLIACION_ADMIN_RBAC.md`) es administrar la plataforma y las cuentas de usuario, **no los fondos ajenos**. Este ADR cierra las decisiones que esa ampliación dejaba abiertas para M01.

## Decisiones

1. **Tres roles.** `user` (implícito: sin fila en `user_roles`), `support` y `admin`.
2. **Un rol elevado por usuario** (`user_roles.user_id` es clave primaria). Evita ambigüedad de permisos acumulados; si algún día hiciera falta combinar, se revisa.
3. **Permisos de referencia sembrados por migración**, no editables desde la API:

   | Permiso | support | admin |
   |---|:-:|:-:|
   | `admin.access` | ✓ | ✓ |
   | `users.read` (nombre, email, rol, alta) | ✓ | ✓ |
   | `users.roles.manage` | | ✓ |
   | `metrics.read` (solo conteos) | | ✓ |
   | `audit.read` | | ✓ |

4. **Ningún rol accede a datos financieros ajenos.** No existe ninguna política RLS por rol sobre `accounts`, `transactions`, `categories`, `obligations`, `budgets`, `goals`, `debts`, etc.: siguen siendo `auth.uid() = user_id`. La administración usa solo funciones `SECURITY DEFINER` que devuelven datos de cuenta mínimos y **conteos sin importes**.
5. **Denegación por defecto.** `roles`, `permissions`, `role_permissions` y `admin_audit_logs` tienen RLS activo y **ninguna política**; el cliente no puede leerlas ni escribirlas. Un usuario solo ve su propia fila de `user_roles`.
6. **Autorización en servidor y en BD.** Cada función comprueba el permiso con `auth.uid()`; el servidor Next.js vuelve a comprobar antes de renderizar `/admin`. Nada depende de lo que muestre la UI ni de metadatos editables.
7. **Cambios de rol auditados y atómicos.** `admin_set_user_role()` cambia el rol y escribe `admin_audit_logs` en la misma transacción. No se puede cambiar el propio rol y no se puede quitar el último admin. La auditoría es solo-anexar (sin políticas de escritura para el cliente).
8. **Primer administrador.** Sin UI y sin inferirlo por email: un operador con acceso al proyecto ejecuta `select private.bootstrap_first_admin('<uuid>')` en el SQL editor. Solo funciona mientras no exista ningún admin y deja registro (`role.bootstrap`). Esa función no es ejecutable desde la API.
9. **Fuera de alcance (a propósito):** sesiones de soporte, solicitudes de acceso a datos del usuario y cualquier "impersonación". Si el producto las necesitara, requieren un ADR propio con consentimiento explícito del usuario.

## Amenazas consideradas
| Amenaza | Mitigación |
|---|---|
| Usuario se auto-asigna admin | Sin políticas de escritura sobre `user_roles`; solo la función con permiso `users.roles.manage` |
| Soporte escala a admin | `admin_set_user_role` exige `users.roles.manage` (solo admin) |
| Admin lee finanzas ajenas | Sin políticas por rol; las funciones solo devuelven conteos y datos de cuenta mínimos |
| Falsificar auditoría | `admin_audit_logs` sin políticas de INSERT/UPDATE/DELETE para el cliente |
| Quedarse sin admins | Guardia de "último administrador" y regla de no autocambio |
| Abuso de `SECURITY DEFINER` | `search_path` vacío, comprobación explícita de `auth.uid()`, `revoke` a `public`/`anon` |
| Anon ejecuta funciones | `revoke execute … from public, anon` |
| Exposición de emails | Solo con `users.read` y solo nombre/email/rol/alta; sin finanzas |

## Consecuencias
- Cualquier tabla nueva de datos del usuario debe nacer con RLS `auth.uid() = user_id` y **sin** política por rol.
- Las métricas del administrador son conteos; si se necesitaran importes agregados, hay que decidirlo en un ADR nuevo (riesgo de reidentificación).
- Revocación de un admin comprometido: otro admin cambia su rol (queda auditado); si no hubiera otro, un operador lo hace por SQL.

## Verificación
`supabase/tests/rls.test.ts` (denegación por defecto, escalada, auditoría, sin acceso financiero cruzado, último admin) y E2E de `/admin` (usuario sin permiso no entra; admin sí).
