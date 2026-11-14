# 06 — Matriz de casos de uso UC-01 a UC-50 con evidencia (P02)

> **Actualización 2026-11-14 (cierre de brechas):** los casos que figuraban como parciales o sin implementar (UC-03, 11, 12, 13, 21, 24, 25, 30, 41, 46, 47, 50) se implementaron en `feature/lukiva-cierre-brechas-uc`.

**Fecha:** 2026-11-14 · **Rama:** feature/lukiva-fase-o-p
**Estados:** ✅ Completo (UI + dominio + prueba) · 🟡 Parcial (qué falta en la columna Brecha) · ❌ No implementado.
La evidencia citada existe en el repositorio y se ejecutó el 2026-11-14 (unit 229/229, E2E 19/19, bloque RBAC de RLS 29/29, build y lint en verde). Los IDs de nuevas necesidades de administración se registran como UC-ADM al final.

| UC | Caso | Estado | Evidencia | Brecha / pendiente |
|---|---|:-:|---|---|
| 01 | Registro de usuario | ✅ | `(auth)/registro`; E2E "registro → onboarding → dashboard"; trigger que crea perfil y categorías por defecto (RLS "default categories on signup") | — |
| 02 | Inicio de sesión | ✅ | `(auth)/login`; E2E "login → dashboard → logout" | — |
| 03 | Recuperar contraseña | ✅ | `/forgot-password` y `/reset-password`; respuesta neutral (mismo mensaje con correo existente o no); E2E que lee el correo real del Mailpit local, cambia la contraseña y comprueba que la anterior deja de servir; `/terminos` y `/privacidad` ya existen (estaban enlazadas y daban 404) | En producción hay que añadir la URL de la app a la lista de redirecciones de Supabase Auth (ver `07_RELEASE_Y_RECUPERACION.md`); las páginas legales son provisionales y requieren revisión jurídica |
| 04 | Cerrar sesión | ✅ | `logoutAction`; E2E login/logout | — |
| 05 | Onboarding inicial | ✅ | `/onboarding`; E2E de registro y de flujo completo | — |
| 06 | Crear cuenta | ✅ | `/cuentas/nueva`; contratos B02 (21) y `credit-card-debt.test.ts` | — |
| 07 | Editar cuenta | ✅ | `/cuentas/[id]/editar` con aviso de que cambiar el saldo inicial cambia el saldo actual; `updateAccountAction` | — |
| 08 | Archivar cuenta | ✅ | `archiveAccountAction` (solo `is_archived`); sección "Archivadas" visible | — |
| 09 | Registrar ingreso | ✅ | `/transacciones/nuevo?type=income`; E2E | — |
| 10 | Registrar gasto | ✅ | `/transacciones/nuevo?type=expense`; E2E | — |
| 11 | Editar transacción | ✅ | `/transacciones/[id]/editar`; `transaction-edit.ts` (8 pruebas): tipo, dirección y moneda no cambian, misma moneda al cambiar de cuenta, categoría del mismo tipo; E2E (editar 30.000→45.000 actualiza el disponible) | Las transferencias no se editan por diseño (se eliminan y se recrean) |
| 12 | Eliminar transacción | ✅ | Eliminación lógica; **una transferencia elimina ambas patas** (antes quedaba una sola y el saldo descuadrado); E2E | — |
| 13 | Transferir entre cuentas | ✅ | `/transacciones/transferir` (solo destinos de la misma moneda; avisa que transferir a una tarjeta reduce su deuda); E2E: neutral para el disponible, no editable, se elimina completa; E2E de moneda distinta | — |
| 14 | Crear obligación | ✅ | `/obligaciones/nueva`; E2E (déficit) | — |
| 15 | Editar obligación | ✅ | `/obligaciones/[id]/editar` | — |
| 16 | Marcar obligación pagada | ✅ | `handleMarkPaid` en `/obligaciones` | No genera movimiento de gasto (decisión de producto pendiente: evitar doble conteo) |
| 17 | Reserva de seguridad | ✅ | `/ajustes` y onboarding; E2E (disponible 770.000) | — |
| 18 | Saldo líquido | ✅ | `calculateLiquidBalance`; dashboard; contratos B02/B03 | — |
| 19 | Dinero disponible | ✅ | `calculateAvailableToSpend`; E2E (770.000 y déficit) | Aún no descuenta compromisos de metas ni pagos mínimos de deudas (ver "Decisiones pendientes") |
| 20 | Dashboard principal | ✅ | `/dashboard`; F01/F02; E2E | Mensaje de déficit duplicado en la vista (cosmético) |
| 21 | Consultar movimientos | ✅ | `/transacciones` con filtros por URL (texto, tipo, cuenta, categoría, rango de fechas) y paginación de 25; `transaction-filters.ts` (10 pruebas: descarta valores inválidos, rango invertido, fechas imposibles); E2E; se corrigió `<tbody>` anidado (causa del aviso de hidratación) y la hora "00:00" inventada | — |
| 22 | Administrar categorías | ✅ | `/categorias`, `/nueva`, `/[id]/editar`; categorías por defecto | — |
| 23 | Crear presupuesto | ✅ | `/presupuestos`, `/nuevo`; `budgets.test.ts` (15); E2E G03; RLS | — |
| 24 | Editar presupuesto | ✅ | `/presupuestos/[id]/editar`; E2E incluye límite inválido | La categoría y el mes no cambian (se elimina y se recrea) |
| 25 | Duplicar presupuestos del mes anterior | ✅ | `/presupuestos/copiar` con vista previa y selección; `planBudgetCopy` (5 pruebas): sin duplicar categorías, solo los elegidos; E2E | — |
| 26 | Crear meta | ✅ | `/metas/nueva`; `goals.test.ts` (10); E2E H03 | — |
| 27 | Aporte a meta | ✅ | `/metas/[id]`; E2E (aporte no mueve dinero entre cuentas) | — |
| 28 | Pausar o cancelar meta | ✅ | `GoalStatusControls` | — |
| 29 | Forecast de fin de mes | ✅ | `forecast.ts` (7 pruebas); `/analisis`; presentado siempre como estimación | — |
| 30 | Detectar recurrencia | ✅ | `recurrence-detection.ts` (17 pruebas): descripción normalizada, misma categoría y moneda, importe ±10 %, intervalo semanal/mensual/trimestral/anual, mínimo 3 repeticiones, solo patrones activos, fecha propuesta futura (no genera atrasados); `/recurrentes` propone y **solo el formulario confirmado crea**; E2E | No hay "descartar sugerencia" persistente; no detecta intervalos arbitrarios de N días |
| 31 | Confirmar transacción recurrente | ✅ | `/recurrentes` "Registrar vencidos"; idempotencia en BD; `recurrence.test.ts` (16); E2E I03; RLS | — |
| 32 | Gestionar suscripción | ✅ | `/suscripciones`; `subscriptions.test.ts` (15); E2E J03; RLS | No genera obligaciones ni movimientos (a propósito) |
| 33 | Crear deuda | ✅ | `/deudas/nueva`; RLS | — |
| 34 | Registrar pago de deuda | ✅ | `record_debt_payment` / `void_debt_payment` atómicas; `debts.test.ts`; E2E K03; verificación SQL del saldo | — |
| 35 | Estrategia Snowball | ✅ | `debt-strategies.ts`; `/deudas/estrategia`; E2E O03 | — |
| 36 | Estrategia Avalanche | ✅ | idem | — |
| 37 | Consultar alertas | ✅ | `alerts.ts` (9 pruebas); `/alertas`; E2E L03 | Sin insignia de no leídas en la navegación; las alertas se evalúan al abrir `/alertas` |
| 38 | Marcar alerta leída | ✅ | `markAlertReadAction`; E2E L03; RLS (`alerts_read_consistency`) | — |
| 39 | Simular compra | ✅ | `purchase-simulator.ts` (11 pruebas); `/simulador`; E2E demuestra que no persiste | — |
| 40 | Financial Score | ✅ | `score.ts` (11 pruebas); `/analisis` con componentes explicados y aviso de que no es score bancario | **Fórmula y umbrales son decisión de producto no definida en los documentos; propuestos aquí, pendientes de ratificar** |
| 41 | Estado vacío: usuario nuevo | ✅ | Dashboard y `/transacciones` muestran el texto del UC con acciones de registrar ingreso/gasto y crear cuenta si falta; E2E con usuario nuevo | — |
| 42 | Estado vacío: sin obligaciones | ✅ | "Sin obligaciones pendientes" en dashboard | — |
| 43 | Estado vacío: sin presupuestos | ✅ | "Sin presupuestos en este mes" | — |
| 44 | Error de validación | ✅ | Zod por campo con `role="alert"` en todos los formularios nuevos; E2E (duplicado de presupuesto, sobrepago de deuda) | — |
| 45 | Error de autorización | ✅ | RLS + `requirePermission` (404); E2E "usuario sin rol no accede a /admin"; RLS RBAC 29/29 | — |
| 46 | Error de persistencia | ✅ | `error.tsx` y `global-error.tsx` (mensaje claro, sin stack trace ni detalle técnico, código de referencia, reintentar); mensajes genéricos en acciones; **los formularios ya no pierden lo escrito cuando falla** (React 19 los vaciaba: `preventFormReset` en 24 formularios, con prueba que reproduce el defecto); 404 en español | Sin registro centralizado de errores (p. ej. Sentry): hoy solo `console.error` con el digest |
| 47 | Loading state | ✅ | `loading.tsx` (esqueleto con `role=status` y `aria-busy`); botones con estado `isPending` y deshabilitados durante el envío (previene doble envío); pruebas de componente | Los esqueletos son genéricos, no uno por pantalla |
| 48 | Responsive | ✅ | E2E `responsive-a11y` (21 rutas a 390 px sin desbordamiento horizontal; se corrigió `/obligaciones`) | Sin revisión visual con capturas |
| 49 | Accesibilidad de formularios | ✅ | Mismo E2E: controles y botones con nombre accesible, `lang`, `title`, un `h1`; corregidos menú móvil, menús de acciones, enlaces "Volver" y selector de cuenta | Sin prueba con lector de pantalla ni contraste automatizado |
| 50 | Navegación principal | ✅ | Menú lateral persistente en escritorio, agrupado (Principal, Planificación, Inteligencia, Cuenta) con la sección activa marcada también en subrutas; en móvil, barra inferior con acceso rápido ("Crear" ya no está deshabilitado) y "Más" abre el menú completo; navegación sin recargar la página; la marca dejó de ser un `h1`; E2E en ambos tamaños | — |

**Resumen:** 50 ✅ · 0 🟡 · 0 ❌ (los 12 casos pendientes se cerraron el 2026-11-14; ver "Límites conocidos").

## UC-ADM (administración, ADR-008)
| ID | Caso | Estado | Evidencia |
|---|---|:-:|---|
| UC-ADM-01 | Acceso a `/admin` solo con permiso | ✅ | `requirePermission`; E2E sin rol → 404; RLS RBAC |
| UC-ADM-02 | Listar usuarios con datos mínimos | ✅ | `admin_list_users` (solo 5 columnas verificadas); E2E |
| UC-ADM-03 | Cambiar rol con auditoría | ✅ | `admin_set_user_role`; auditoría atómica; E2E; RLS |
| UC-ADM-04 | Soporte sin escalada ni auditoría ni métricas | ✅ | RLS RBAC; E2E soporte |
| UC-ADM-05 | Métricas agregadas sin importes | ✅ | `admin_aggregate_metrics`; E2E; RLS |
| UC-ADM-06 | Admin/soporte sin acceso a finanzas ajenas | ✅ | RLS RBAC (13 tablas, lectura y modificación) |
| UC-ADM-07 | Alta del primer administrador | ✅ (procedimiento manual a propósito) | `private.bootstrap_first_admin` (solo SQL, a propósito) | Requiere acción manual documentada en `07_RELEASE_Y_RECUPERACION.md` |

## Decisiones de producto pendientes que afectan a la matriz
1. **Dinero disponible completo** (UC-19): ¿descuenta compromisos mensuales de metas y pagos mínimos de deudas? Hoy no.
2. **Financial Score** (UC-40): ratificar componentes, pesos iguales y umbrales (30 % / 20 % / 15–40 %).
3. **Obligación pagada** (UC-16): ¿debe crear el movimiento de gasto para no dejar el saldo sin reflejar el pago?
4. **Deuda de tarjeta vs. cuenta `CREDIT_CARD`**: son entidades separadas sin conciliación.
5. **ADR-008** (roles): ratificar la matriz y el procedimiento de alta del primer admin.

## Límites conocidos tras el cierre
Casos completos no significa sin mejoras futuras. Lo que sigue fuera de alcance, para decidirlo con el propietario:
- Registro centralizado de errores (UC-46) y esqueletos de carga por pantalla (UC-47).
- Descartar sugerencias de recurrencia de forma persistente y detectar intervalos de N días (UC-30).
- Revisión de accesibilidad con lector de pantalla y contraste automatizado (UC-49); revisión visual con capturas (UC-48).
- Páginas de términos y privacidad: provisionales hasta la revisión jurídica.
