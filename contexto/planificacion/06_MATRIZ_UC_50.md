# 06 — Matriz de casos de uso UC-01 a UC-50 con evidencia (P02)

**Fecha:** 2026-11-14 · **Rama:** feature/lukiva-fase-o-p
**Estados:** ✅ Completo (UI + dominio + prueba) · 🟡 Parcial (qué falta en la columna Brecha) · ❌ No implementado.
La evidencia citada existe en el repositorio y se ejecutó el 2026-11-14 (unit 229/229, E2E 19/19, bloque RBAC de RLS 29/29, build y lint en verde). Los IDs de nuevas necesidades de administración se registran como UC-ADM al final.

| UC | Caso | Estado | Evidencia | Brecha / pendiente |
|---|---|:-:|---|---|
| 01 | Registro de usuario | ✅ | `(auth)/registro`; E2E "registro → onboarding → dashboard"; trigger que crea perfil y categorías por defecto (RLS "default categories on signup") | — |
| 02 | Inicio de sesión | ✅ | `(auth)/login`; E2E "login → dashboard → logout" | — |
| 03 | Recuperar contraseña | ❌ | — | **No existe `/forgot-password`** y el login enlaza a esa ruta (404). Requiere flujo `resetPasswordForEmail` + página de nueva contraseña y proveedor de correo |
| 04 | Cerrar sesión | ✅ | `logoutAction`; E2E login/logout | — |
| 05 | Onboarding inicial | ✅ | `/onboarding`; E2E de registro y de flujo completo | — |
| 06 | Crear cuenta | ✅ | `/cuentas/nueva`; contratos B02 (21) y `credit-card-debt.test.ts` | — |
| 07 | Editar cuenta | ✅ | `/cuentas/[id]/editar`; `updateAccountAction` | Sin aviso en UI de que editar el saldo inicial cambia el saldo actual (riesgo R4) |
| 08 | Archivar cuenta | ✅ | `archiveAccountAction` (solo `is_archived`); sección "Archivadas" visible | — |
| 09 | Registrar ingreso | ✅ | `/transacciones/nuevo?type=income`; E2E | — |
| 10 | Registrar gasto | ✅ | `/transacciones/nuevo?type=expense`; E2E | — |
| 11 | Editar transacción | 🟡 | `updateTransactionAction` (acción de servidor) | **Sin pantalla**: no hay ruta de detalle/edición de movimientos |
| 12 | Eliminar transacción | 🟡 | `deleteTransactionAction` (borrado lógico) | **Sin pantalla** |
| 13 | Transferir entre cuentas | 🟡 | `createTransferAction` + `createTransferPair`; pruebas de neutralidad y de moneda | **Sin pantalla de transferencia** |
| 14 | Crear obligación | ✅ | `/obligaciones/nueva`; E2E (déficit) | — |
| 15 | Editar obligación | ✅ | `/obligaciones/[id]/editar` | — |
| 16 | Marcar obligación pagada | ✅ | `handleMarkPaid` en `/obligaciones` | No genera movimiento de gasto (decisión de producto pendiente: evitar doble conteo) |
| 17 | Reserva de seguridad | ✅ | `/ajustes` y onboarding; E2E (disponible 770.000) | — |
| 18 | Saldo líquido | ✅ | `calculateLiquidBalance`; dashboard; contratos B02/B03 | — |
| 19 | Dinero disponible | ✅ | `calculateAvailableToSpend`; E2E (770.000 y déficit) | Aún no descuenta compromisos de metas ni pagos mínimos de deudas (ver "Decisiones pendientes") |
| 20 | Dashboard principal | ✅ | `/dashboard`; F01/F02; E2E | Mensaje de déficit duplicado en la vista (cosmético) |
| 21 | Consultar movimientos | 🟡 | `/transacciones` (últimos 50) | Filtros avanzados "próximamente"; hora "00:00" fija junto a cada movimiento (el dato es solo fecha) |
| 22 | Administrar categorías | ✅ | `/categorias`, `/nueva`, `/[id]/editar`; categorías por defecto | — |
| 23 | Crear presupuesto | ✅ | `/presupuestos`, `/nuevo`; `budgets.test.ts` (15); E2E G03; RLS | — |
| 24 | Editar presupuesto | 🟡 | `updateBudgetAction` | **Sin pantalla** de edición del límite (se puede eliminar y recrear) |
| 25 | Duplicar presupuestos del mes anterior | ❌ | — | No implementado |
| 26 | Crear meta | ✅ | `/metas/nueva`; `goals.test.ts` (10); E2E H03 | — |
| 27 | Aporte a meta | ✅ | `/metas/[id]`; E2E (aporte no mueve dinero entre cuentas) | — |
| 28 | Pausar o cancelar meta | ✅ | `GoalStatusControls` | — |
| 29 | Forecast de fin de mes | ✅ | `forecast.ts` (7 pruebas); `/analisis`; presentado siempre como estimación | — |
| 30 | Detectar recurrencia | ❌ | — | No hay detección automática; las recurrencias se crean a mano |
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
| 41 | Estado vacío: usuario nuevo | 🟡 | Dashboard con CTA "Crear primera cuenta" y estado sin movimientos | El texto exacto del UC no está en todas las pantallas |
| 42 | Estado vacío: sin obligaciones | ✅ | "Sin obligaciones pendientes" en dashboard | — |
| 43 | Estado vacío: sin presupuestos | ✅ | "Sin presupuestos en este mes" | — |
| 44 | Error de validación | ✅ | Zod por campo con `role="alert"` en todos los formularios nuevos; E2E (duplicado de presupuesto, sobrepago de deuda) | — |
| 45 | Error de autorización | ✅ | RLS + `requirePermission` (404); E2E "usuario sin rol no accede a /admin"; RLS RBAC 29/29 | — |
| 46 | Error de persistencia | 🟡 | Mensajes genéricos en español sin detalles internos en las acciones | Sin reintento ni registro centralizado de errores |
| 47 | Loading state | 🟡 | Estados `isPending` en botones y spinners en formularios | Sin `loading.tsx` por ruta ni skeletons en listas |
| 48 | Responsive | ✅ | E2E `responsive-a11y` (21 rutas a 390 px sin desbordamiento horizontal; se corrigió `/obligaciones`) | Sin revisión visual con capturas |
| 49 | Accesibilidad de formularios | ✅ | Mismo E2E: controles y botones con nombre accesible, `lang`, `title`, un `h1`; corregidos menú móvil, menús de acciones, enlaces "Volver" y selector de cuenta | Sin prueba con lector de pantalla ni contraste automatizado |
| 50 | Navegación principal | 🟡 | Menú con todos los módulos (hoja lateral) y barra inferior | **El escritorio no tiene navegación persistente propia** (la barra inferior móvil es la única visible en pantallas grandes); la barra inferior sigue con 4 destinos |

**Resumen:** 38 ✅ · 9 🟡 (UC-11, 12, 13, 21, 24, 41, 46, 47, 50) · 3 ❌ (UC-03, UC-25, UC-30).

## UC-ADM (administración, ADR-008)
| ID | Caso | Estado | Evidencia |
|---|---|:-:|---|
| UC-ADM-01 | Acceso a `/admin` solo con permiso | ✅ | `requirePermission`; E2E sin rol → 404; RLS RBAC |
| UC-ADM-02 | Listar usuarios con datos mínimos | ✅ | `admin_list_users` (solo 5 columnas verificadas); E2E |
| UC-ADM-03 | Cambiar rol con auditoría | ✅ | `admin_set_user_role`; auditoría atómica; E2E; RLS |
| UC-ADM-04 | Soporte sin escalada ni auditoría ni métricas | ✅ | RLS RBAC; E2E soporte |
| UC-ADM-05 | Métricas agregadas sin importes | ✅ | `admin_aggregate_metrics`; E2E; RLS |
| UC-ADM-06 | Admin/soporte sin acceso a finanzas ajenas | ✅ | RLS RBAC (13 tablas, lectura y modificación) |
| UC-ADM-07 | Alta del primer administrador | 🟡 | `private.bootstrap_first_admin` (solo SQL, a propósito) | Requiere acción manual documentada en `07_RELEASE_Y_RECUPERACION.md` |

## Decisiones de producto pendientes que afectan a la matriz
1. **Dinero disponible completo** (UC-19): ¿descuenta compromisos mensuales de metas y pagos mínimos de deudas? Hoy no.
2. **Financial Score** (UC-40): ratificar componentes, pesos iguales y umbrales (30 % / 20 % / 15–40 %).
3. **Obligación pagada** (UC-16): ¿debe crear el movimiento de gasto para no dejar el saldo sin reflejar el pago?
4. **Deuda de tarjeta vs. cuenta `CREDIT_CARD`**: son entidades separadas sin conciliación.
5. **ADR-008** (roles): ratificar la matriz y el procedimiento de alta del primer admin.
