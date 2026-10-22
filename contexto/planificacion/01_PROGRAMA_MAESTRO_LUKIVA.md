# 01 — Programa maestro único de Lukiva

## Objetivo
Evolucionar **la aplicación existente** hasta el producto completo, conservando infraestructura y núcleo construido. El MVP ya tiene implementación parcial y una primera versión publicada; el siguiente trabajo es **validar, completar y pulir**, no reempezar.

## Modelo de ejecución
Cada fase se fragmenta en tareas de 1 cambio coherente, idealmente una migración o un flujo vertical acotado. Kilo ejecuta **una tarea por turno**; entrega evidencia y se detiene. El número de fases no representa semanas.

## Fases ordenadas y puertas de salida

| Fase | Objetivo | Entrega / definición de terminado |
|---|---|---|
| **A** — Consolidar línea base | Comparar commit del ZIP con main/despliegue; ejecutar checks; inventariar fallos; generar evidencia. | Snapshot, resultados lint/typecheck/test/build, migraciones cotejadas, cero cambios de negocio |
| **B** — Corrección de núcleo monetario | Cubrir opening balance, moneda y neutralidad de transferencias en pruebas; arreglar únicamente los defectos confirmados. | Unit/integration pasando, cifras reproducibles |
| **C** — Seguridad y MVP verificable | RLS multiusuario, onboarding, login, gastos/ingresos, obligaciones, E2E; checkpoint Vercel. | Recorrido completo, evidencias E2E y despliegue estable |
| **D** — Branding Lukiva base | Tokens de marca, copy visible, metadata, app name, iconos y manifest; preservar rutas/IDs y configuración productiva. | Interfaz clave Lukiva coherente, contrastes y PWA verificados |
| **E** — Sistema de diseño y UX | Shell desktop/mobile, navegación real sin entradas muertas, accesibilidad, formularios, estados vacíos/carga/error. | Patrones consistentes en pantallas existentes, visual QA |
| **F** — Dashboard y analítica | KPIs correctos, gráfico de flujo, breakdown explicable, filtro de período, visualizaciones con datos reales. | Datos consistentes con transacciones, estados vacíos y responsive |
| **G** — Presupuestos | Migración budgets; dominio/calculo por mes-categoría, CRUD, vistas y test de límites. | Presupuesto vs gasto correcto, RLS y E2E |
| **H** — Metas y aportes | Migraciones goals y goal_contributions, estado/avance calculado, CRUD y flujos de aporte. | Progreso correcto sin duplicación, permisos y E2E |
| **I** — Movimientos recurrentes | Migración recurring_transactions; reglas de frecuencia y generación idempotente, interfaz y pruebas. | No genera duplicados en reintento, zona horaria correcta |
| **J** — Suscripciones | Migración subscriptions; seguimiento vencimientos y costos; UI y pruebas. | Suscripciones listadas, fechas calculadas y alertas integrables |
| **K** — Deudas y abonos | Migraciones debts y debt_payments; cálculo saldos, interés/abono según requisitos, UI y RLS. | Cuadre de saldos, validación de pagos y test de moneda |
| **L** — Alertas | Migración alerts, generación/lectura y configuración, sin enviar avisos no consentidos. | Alertas correctas, deduplicadas y seguras |
| **M** — Roles y arquitectura administrativa | Definir matriz de autorización y política de privacidad; migraciones aditivas roles, permissions, user_roles, role_permissions, admin_audit_logs según decisión. | Modelo y revisión de amenazas aprobados, políticas probadas |
| **N** — Consola administrativa | Rutas /admin protegidas en servidor; usuarios/roles, métricas operacionales agregadas, auditoría; tests de denegación. | Sin acceso cruzado a finanzas; trazas y E2E de permisos |
| **O** — Funciones avanzadas | Simulación de compras, proyecciones, insights, estrategia de pago y reporting con contratos de datos explícitos. | Cálculos documentados y resultados deterministas |
| **P** — Cierre de producto | Responsive, accesibilidad, rendimiento, documentación, backups, QA regresión y release final. | Matriz de cobertura cerrada, pruebas/rollback, despliegue aprobado |

## Ruta crítica y dependencias
A → B → C debe cerrarse **antes de tocar lógica financiera extendida**. D puede iniciarse tras A (sin esperar todos los módulos), pero E necesita D. G/H después del núcleo estable; I/J/K/L después de migraciones, reglas y pruebas previas. M (modelo roles) precede a N (panel admin). O después de módulos de datos. P al final.

## Estrategia de datos
- 14 entidades financieras previstas (incluida `auth.users` de Supabase). Añadir las ocho tablas pendientes mediante migraciones nuevas **sin volver a crear las cinco actuales**.
- Tablas de identidad/autorización de plataforma son **complementarias** y se diseñan por una necesidad nueva, no para inflar el modelo financiero.
- Priorizar índices por user_id/fecha, FK de pertenencia, RLS, soft delete según modelo vigente, numeric(20,4) y cálculo de derivados en servicios.
- No ejecutar el DDL integral de exposición directamente sobre el esquema existente.

## Identidad durante desarrollo
- Producto visible = **Lukiva**; histórico técnico, nombres de rutas y referencias de documentación conservadas cuando cambiarlas implique riesgo.
- Prioridad para login, onboarding, shell, dashboard, metadatos y PWA; después todos los módulos nuevos nacen ya como Lukiva.
- Dominio, nombre de package, identificadores Supabase y repositorio GitHub no se cambian automáticamente.

## Chequeos recurrentes
`pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`; tests de Supabase/RLS y Playwright cuando el entorno lo permite. Guardar comandos y resultados en registro. Publicar solo con CI aprobada y verificación manual.

## Mecanismo de salida
Al terminar cada microtarea: archivos cambiados, diferencias, pruebas corridas, evidencias, riesgos, siguiente ID, STOP. No marcar una fase completa por haber hecho su primer archivo.

## Fuente de requisitos
`../producto/CASOS_DE_USO_Y_FLUJOS.md`; `../arquitectura/MODELO_DATOS_Y_SEGURIDAD.md`; ADR; `../calidad/ESTRATEGIA_PRUEBAS.md`; `../diseno/SISTEMA_DISENO_FINWISE.md` (referencia visual histórica), complementada por Lukiva.


## Gobernanza de fuentes
Este documento es el único plan operativo activo; el detalle por pasos es `03_TAREAS_ATOMICAS.md`. La lista inicial es una planificación, no una afirmación de cumplimiento. Revisar `../../AGENTS.md` y `../LUKIVA_CONTEXTO_MAESTRO.md`. Los planes de FinWise bajo `historico_finwise/` no autorizan ejecución simultánea.
