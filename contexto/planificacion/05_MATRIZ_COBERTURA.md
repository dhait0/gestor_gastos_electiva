# 05 — Cobertura funcional y trazabilidad

**Fuentes:** `../producto/CASOS_DE_USO_Y_FLUJOS.md`, modelo de datos y backlog histórico. Los 50 casos originales deben mapearse por ID sin renumerar; las nuevas necesidades de administración tendrán IDs `UC-ADM-*`.

| Grupo | Datos | Microfases | Evidencia de aceptación | Evidencia de línea base (A01–A03, 2026-10-21) |
|---|---|---|---|---|
| Autenticación, sesión, onboarding | auth.users, profiles | A-C, D-E | E2E y pruebas de acceso | Parcial: `profiles` con RLS (SELECT/UPDATE) y trigger `on_auth_user_created` verificados; **sin** prueba ejecutable de onboarding (E2E bloqueado por A03-17); copy FinWise pendiente (A01 #6) |
| Cuentas, categorías y movimientos | accounts, categories, transactions | B-C, E-F | Ingresos/gastos, transferencias, saldos exactos | **Saldo inicial corregido en B02** (estrategia B: `opening_balance + entradas − salidas`, 21/21 contratos y verificación de solo lectura contra la base local, 0 transacciones compensatorias). **Pendiente**: FK `transactions_category_fk` defectuosa (A01 #2); ruta `/movimientos` 404 (A02-12); semántica de `opening_balance` en `CREDIT_CARD` sin decidir (B02-02) |
| Obligaciones y reserva | obligations, profiles | B-C, F | Disponible y vencimientos correctos | Parcial: tabla y 3 políticas RLS verificadas; el disponible ya consume el saldo líquido con saldo inicial (B02), pero **sigue sin distinguir monedas** (A01 #3 → B03) |
| Presupuestos | budgets + categories + transactions | G | Presupuesto usado/restante por mes | No existe la tabla; sin evidencia |
| Metas | goals + goal_contributions | H | Aportes y progreso verificable | No existen las tablas; acceso muerto en navegación (A01 #7) |
| Recurrencia | recurring_transactions + transactions | I | Generación única, precisión fechas | No existe la tabla; `transactions.recurring_transaction_id` es columna huérfana (A01) |
| Suscripciones | subscriptions | J | Próximos pagos y costo recurrente | No existe la tabla |
| Deudas | debts + debt_payments | K | Saldo pendiente tras abonos | No existen las tablas |
| Alertas | alerts + demás módulos | L | Lectura/confirmación y no duplicación | No existe la tabla |
| Plataforma y permisos (alcance añadido) | auth.users + RBAC + audit log | M-N | Acceso admin solo autorizado y sin lectura financiera ajena | No existe el módulo RBAC; ownership sí respaldado por FK compuestas (verificado en A03) |
| Insights, simulación y proyección | lecturas agregadas por usuario | O | Modelos calculados y test de escenarios | No existe el módulo |
| Calidad transversal | todas | todas, P | RLS, unit, E2E, CI, accesibilidad | **53/53 unitarias verdes** (32 originales + 21 contratos de B02, ya en la suite por defecto); lint/typecheck/build en verde (A02 y B02); **48 RLS + 7 E2E sin ejecutar** (A01 #10, A03-16, A03-17); arnés de base desechable probado y reproducible (A03) |

## Procedimiento obligatorio de trazabilidad
Antes de cada microtarea, localizar UC relacionado en `CASOS_DE_USO_Y_FLUJOS.md`; registrar código de caso, regla exacta y evidencia. Si un requisito no está en los UC, añadir especificación con ID nuevo y criterios aprobados en vez de inventarlo silenciosamente.

## Actualización 2026-11-14 (cierre de fases F–P)
La tabla anterior refleja la línea base de octubre. Estado actual por grupo (detalle por caso de uso en `06_MATRIZ_UC_50.md`; despliegue y recuperación en `07_RELEASE_Y_RECUPERACION.md`):

| Grupo | Estado | Evidencia vigente |
|---|---|---|
| Autenticación, sesión, onboarding | Parcial | E2E de registro, login, logout y redirección; **falta recuperar contraseña (UC-03)** |
| Cuentas, categorías y movimientos | Parcial | Saldo inicial y tarjetas como deuda con contratos; **sin UI de transferencias ni de editar/eliminar movimientos** |
| Obligaciones y reserva | Completo | E2E de disponible (770.000) y déficit |
| Presupuestos | Completo | `budgets` + RLS, 15 pruebas de dominio, E2E; sin duplicar mes anterior ni editar límite |
| Metas | Completo | `goals`/`goal_contributions` + RLS, 10 pruebas, E2E |
| Recurrencia | Completo (sin detección automática) | Índice único de idempotencia, 16 pruebas de fechas, E2E |
| Suscripciones | Completo | 15 pruebas, E2E |
| Deudas | Completo | Funciones atómicas verificadas por SQL, 13+ pruebas, E2E, estrategias |
| Alertas | Completo | 9 pruebas de reglas, deduplicación en BD, E2E |
| Plataforma y permisos | Completo, **ADR-008 por ratificar** | 29 casos RBAC ejecutados, E2E de `/admin` |
| Insights, simulación y proyección | Completo; **fórmula del score por ratificar** | forecast, simulador, estrategias, score e insights con pruebas deterministas y E2E |
| Calidad transversal | Verde | unit **229/229**, E2E **19/19**, lint 0 errores, build OK, auditoría responsive/a11y en 21 rutas; suite RLS completa en CI (`rls.yml`) |
