# 03 — Backlog atómico y secuenciado para Kilo

**Regla:** cada fila = máximo una entrega acotada. No ejecutar un bloque completo de golpe. Orden dentro de fase ascendente. Los estados se consignan en `04_REGISTRO_AVANCE.md`.

| ID | Microentrega | Fase | Prueba obligatoria / salida |
|---|---|---|---|
| `A01` | Identificar rama, commit local y deploy activo; mapa rutas/configuración; sin cambiar código | A | Informe verificable, sin cambio de comportamiento |
| `A02` | Ejecutar lint, typecheck, unit tests, build y registrar resultados | A | Informe verificable, sin cambio de comportamiento |
| `A03` | Probar migraciones existentes en base local desechable y cotejar con Supabase desplegado sin modificarlo | A | Informe verificable, sin cambio de comportamiento |
| `B01` | Escribir pruebas del saldo inicial y verificar si el flujo genera transacción compensatoria | B | Unit tests financieros y caso adverso |
| `B02` | Corregir cálculo de saldo inicial solo si test falla; evitar duplicación | B | Unit tests financieros y caso adverso |
| `B03` | Definir y probar política de múltiples monedas y transferencias neutrales | B | Unit tests financieros y caso adverso |
| `C01` | Verificar usuario A/B y RLS por entidad existente (lectura, escritura, FK) | C | Prueba E2E/RLS con usuario distinto |
| `C02` | E2E auth + onboarding + cuenta + ingreso + gasto + disponible | C | Prueba E2E/RLS con usuario distinto |
| `C03` | E2E obligaciones/reserva + rollback + checkpoint CI/Vercel | C | Prueba E2E/RLS con usuario distinto |
| `D01` | Definir tokens Lukiva y paleta en tema sin afectar semántica ni contraste | D | Visual responsive, accesibilidad y build |
| `D02` | Aplicar nombre/copy Lukiva a login, registro, onboarding y shell | D | Visual responsive, accesibilidad y build |
| `D03` | Cambiar título, manifest, PWA icons y OG para Lukiva con verificación build | D | Visual responsive, accesibilidad y build |
| `E01` | Rediseñar sidebar/bottom nav: eliminar accesos muertos y reflejar módulos reales | E | Playwright o inspección visual reproducible |
| `E02` | Rediseñar dashboard responsive con estados vacíos y jerarquía clara | E | Playwright o inspección visual reproducible |
| `E03` | Unificar formulario, botones, tablas, feedback y accesibilidad | E | Playwright o inspección visual reproducible |
| `F01` | Auditar view model y KPIs contra dominio financiero | F | Cálculo vs fixtures y visual |
| `F02` | Gráfico período y breakdown con pruebas de datos/estados | F | Cálculo vs fixtures y visual |
| `G01` | Migración budgets + constraints + RLS + test aislado | G | Migración RLS + unit + E2E |
| `G02` | Acciones servidor y reglas presupuesto mes/categoría | G | Migración RLS + unit + E2E |
| `G03` | Pantallas presupuesto y E2E de límite/consumo | G | Migración RLS + unit + E2E |
| `H01` | Migración goals + goal_contributions + RLS + test | H | Migración RLS + unit + E2E |
| `H02` | Dominio de metas/aportes y cálculo de progreso | H | Migración RLS + unit + E2E |
| `H03` | UI metas y E2E de aporte | H | Migración RLS + unit + E2E |
| `I01` | Migración recurring_transactions + RLS | I | Idempotencia, RLS y E2E |
| `I02` | Motor de recurrencias idempotente con pruebas de fechas | I | Idempotencia, RLS y E2E |
| `I03` | Pantallas recurrencias y E2E | I | Idempotencia, RLS y E2E |
| `J01` | Migración subscriptions + RLS | J | Fechas, RLS y E2E |
| `J02` | Cálculos próxima renovación/costo y tests | J | Fechas, RLS y E2E |
| `J03` | Pantallas suscripciones y E2E | J | Fechas, RLS y E2E |
| `K01` | Migraciones debts/debt_payments + RLS + constraints | K | Precisión monetaria, RLS y E2E |
| `K02` | Lógica deuda/abonos/interés con unit tests | K | Precisión monetaria, RLS y E2E |
| `K03` | Pantallas de deuda y E2E | K | Precisión monetaria, RLS y E2E |
| `L01` | Migración alerts + RLS + deduplicación | L | Deduplicación, RLS y E2E |
| `L02` | Reglas de alertas y consultas por usuario | L | Deduplicación, RLS y E2E |
| `L03` | Centro de notificaciones y E2E | L | Deduplicación, RLS y E2E |
| `M01` | Matriz permisos usuario/soporte/admin y amenazas; revisión privacidad | M | Denegación predeterminada, multiusuario |
| `M02` | Migraciones aditivas RBAC + RLS + auditoría | M | Denegación predeterminada, multiusuario |
| `M03` | Tests de autorización, escalada y denegación | M | Denegación predeterminada, multiusuario |
| `N01` | Layout /admin con verificación server-side | N | Protección servidor + trazabilidad + E2E |
| `N02` | Listado seguro de usuarios/roles y cambios auditables | N | Protección servidor + trazabilidad + E2E |
| `N03` | Métricas agregadas y pruebas de no exposición datos financieros | N | Protección servidor + trazabilidad + E2E |
| `O01` | Definir contratos de proyecciones y simulación contra casos de uso | O | Pruebas deterministas con ejemplos |
| `O02` | Construir simulador y proyecciones con tests | O | Pruebas deterministas con ejemplos |
| `O03` | Insights financieros y E2E con explicaciones | O | Pruebas deterministas con ejemplos |
| `P01` | Auditar responsive, accesibilidad, PWA, carga y seguridad | P | Reporte de cumplimiento y regresión |
| `P02` | Matriz UC 01-50 y nuevos UC-ADM con evidencia | P | Reporte de cumplimiento y regresión |
| `P03` | Release, recuperación, documentación y validación despliegue | P | Reporte de cumplimiento y regresión |

## Criterio universal para cerrar una microentrega
1) No rompe despliegue actual. 2) Regla cubierta en test o documentada limitación. 3) Sin secretos. 4) Código integrado con patrones existentes. 5) Estado anotado. 6) Kilo se detiene.

## Orden recomendado hoy
**A01** primero. En el primer ciclo que toque interfaz iniciar **D01** al cerrar A01-A03; no esperar a implementar los ocho módulos para comenzar Lukiva. El orden G-L y M-N puede alternarse únicamente después del núcleo seguro y registrando la razón.
