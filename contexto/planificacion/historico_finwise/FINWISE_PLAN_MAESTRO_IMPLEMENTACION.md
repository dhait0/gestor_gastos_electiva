# FinWise — Plan maestro estandarizado de implementación

**Versión:** 1.0 · **Fecha:** 21 de octubre de 2026  
**Estado:** Propuesta de consolidación; no acredita funcionalidades implementadas.  
**Meta:** Implementar el producto completo documentado, **sin retrasar el cierre verificable del MVP académico**.

> **Principio rector:** las 14 entidades forman parte de la arquitectura prevista de FinWise. El orden de entrega es incremental: primero se estabiliza el núcleo y después se activan, prueban y despliegan los demás módulos. Que una tabla esté diseñada o migrada no significa que su funcionalidad esté terminada.

## 1. Documentos fuente y precedencia

Este documento consolida los siguientes archivos existentes del ZIP `contexto.zip`:

- `FINWISE_CONTEXTO_MAESTRO.md` (fuente principal de decisiones).
- `arquitectura/MODELO_DATOS_Y_SEGURIDAD.md` (fuente del modelo de dominio, moneda, transferencias y RLS).
- `producto/CASOS_DE_USO_Y_FLUJOS.md` (50 casos de uso y ejemplos de aceptación).
- `calidad/ESTRATEGIA_PRUEBAS.md` (estrategia de pruebas).
- `planificacion/BACKLOG_MVP.md` (épicas y criterios del núcleo).
- `planificacion/PLAN_IMPLEMENTACION_MVP.md` (desarrollo por vertical slices).
- `planificacion/PLAN_EJECUCION_KILO (completado).md` (25 fases operativas; “completado” en el nombre **no equivale** a ejecución comprobada).
- `FINWISE_SCHEMA_DDL_COMPLETO.md` y `finwise_schema_completo_borrador.sql` (propuestas SQL derivadas; **validar** contra el documento de arquitectura antes de usarlas como migración canónica).

**Cuando haya contradicción, prevalece el orden de autoridad del Contexto Maestro**, especialmente privacidad, integridad de dinero y reglas de dominio. Este plan cambia el calendario de entrega, no redefine unilateralmente las reglas financieras.

## 2. Objetivos y límites

### Resultado A — MVP académico funcional (obligatorio primero)

Un usuario puede registrarse, iniciar sesión, completar onboarding, crear cuentas, administrar categorías, registrar ingresos/gastos, gestionar obligaciones y reserva, y consultar el **dinero disponible** junto a un dashboard e historial básico. El flujo se valida en móvil, con pruebas de integridad y aislamiento entre usuarios, CI y despliegue.

### Resultado B — FinWise integral (compromiso de producto)

Sobre el núcleo estable, habilitar operaciones completas, presupuestos, metas y aportes, movimientos recurrentes, suscripciones, deudas y sus pagos, alertas y las capacidades de análisis/simulación previstas en los casos de uso. Nada de esto se descarta; se entrega por módulos verificables.

### Fuera del compromiso automático

Integración bancaria real, OCR, inversiones, cripto, IA generativa productiva o infraestructura distribuida **no se agregan** por defecto: requieren decisión formal de alcance, diseño y pruebas. No confundir *diseñar para evolucionar* con *construir extras*.

## 3. Línea base: 14 entidades previstas

| Dominio | Entidades | Relaciones / responsabilidad principal |
|---|---|---|
| Identidad | `auth.users`, `profiles` | Identidad Supabase; configuración personal 1:1 |
| Registro financiero | `accounts`, `categories`, `transactions` | Cuentas y categorías de un usuario; transacciones ligadas a cuenta y, según tipo, categoría |
| Compromisos | `obligations` | Compromisos del usuario; afectan disponible según reglas de negocio |
| Presupuestos | `budgets` | Límites periódicos por usuario/categoría; consumo derivado de transacciones |
| Ahorro | `goals`, `goal_contributions` | Objetivos del usuario y aportes a cada objetivo |
| Automatización | `recurring_transactions`, `subscriptions` | Plantillas/frecuencias y suscripciones; evitar dobles cargos al generar movimientos |
| Crédito | `debts`, `debt_payments` | Deudas del usuario y pagos imputables a cada deuda |
| Comunicación | `alerts` | Alertas del usuario y estado de lectura |

**Reglas transversales:** importes exactos con `numeric` en PostgreSQL; nunca `float` para cálculos financieros; persistencia de fuentes, no de saldos derivados inicialmente; controles de propiedad/RLS en todas las tablas privadas; consistencia de moneda, fechas y zonas horarias; `auth.users` es gestionada por Supabase y no se recrea en `public`.

## 4. Método único para implementar y reportar

### 4.1 Unidad de trabajo: historia vertical

Cada historia debe conectar **caso de uso → regla de negocio → tablas/migración → servicio/consulta de servidor → validación → interfaz Next.js → pruebas → demostración**. Evitar implementar pantallas o tablas desconectadas del caso de uso.

### 4.2 Estados válidos

`NO_INICIADA` · `EN_PROGRESO` · `BLOQUEADA` · `EN_REVISION` · `VALIDADA`.

Una fase/historia **solo puede marcarse `VALIDADA`** cuando hay evidencias (commit/PR, migración probada, captura/demo si aplica, resultados de tests). Un checkbox heredado o un nombre de archivo no son evidencia suficiente.

### 4.3 Definition of Done (DoD)

- [ ] Función corresponde al caso de uso y criterios de aceptación oficiales.
- [ ] Validación de entradas, límites y errores; estados loading/empty/error.
- [ ] Restricciones y relaciones coherentes en base de datos; migración reversible o plan seguro de corrección.
- [ ] Ownership/RLS verificado cuando hay datos privados; **usuario B no puede acceder a datos de A**.
- [ ] Pruebas de dominio y de integración relevantes; E2E para flujo crítico.
- [ ] Montos exactos y cálculos reproducibles; casos límite comprobados.
- [ ] Diseño responsive, accesibilidad básica y coherencia visual.
- [ ] `lint`, `typecheck`, tests y build pasan en CI (o se documenta bloqueo).
- [ ] PR revisado, documentación/casos de uso actualizados y demostración reproducible.

### 4.4 Política de Git y agentes

Seguir `desarrollo/GESTION_GITHUB_Y_RAMAS.md` y `AGENTS.md` del proyecto. Una fase = varias historias pequeñas; **no** una rama gigante por toda la aplicación. Antes de editar: revisar archivos mínimos relevantes y auditar código ya existente. Al cerrar: registrar qué cambió, evidencia, riesgos y siguiente tarea. No borrar código funcional por asumir que algo no existe.

## 5. Ruta de entrega y puertas de control

### PUERTA G0 — Auditoría real del repositorio (antes de programar)

**Objetivo:** saber exactamente qué existe, qué falla y qué falta, sin rehacer trabajo.

1. Registrar commit y rama base, scripts disponibles, árbol `src/`, versiones Next.js, Supabase y herramientas de tests.
2. Verificar variables de entorno sin revelar secretos, migraciones, RLS, pruebas existentes y despliegues.
3. Ejecutar scripts existentes de lint, typecheck, tests y build; anotar salidas y fallos.
4. Comparar el código con las 14 entidades, los 50 casos de uso y el backlog; clasificar evidencia.
5. Publicar `ESTADO_ACTUAL.md` y backlog con prioridad/estado real.

**Salida G0:** inventario auditado y primer conjunto de tareas sin duplicados.

### BLOQUE 1 — Núcleo MVP (prioridad P0, no negociable)

Se conservan como checklist de referencia las **fases 0–24 de `PLAN_EJECUCION_KILO`**. En este plan se agrupan así para gestionar por entregables:

| Orden | Paquete / fases Kilo relacionadas | Entrega demostrable | Prueba/gate |
|---|---|---|---|
| M0 | Auditoría (0) | Estado real documentado | Scripts y evidencia de repo |
| M1 | Base técnica, diseño, Supabase (1–3) | App ejecutable y cliente Supabase configurado | Build y smoke test local |
| M2 | Modelo P0, RLS, Auth (4–6) | Migraciones iniciales, aislamiento, registro/login | Tests SQL/RLS de 2 usuarios, Auth E2E |
| M3 | Shell, onboarding, cuentas, categorías (7–9) | Usuario configura primera cuenta y categorías | Crear/listar y ownership |
| M4 | Motor, ingresos y gastos (10–12) | Transacciones válidas; saldos derivados | Unit tests monetarios + flujos E2E |
| M5 | Obligaciones, reserva y disponible (13–15) | Disponible explicable y reproducible | Casos con déficit, reserva y obligaciones |
| M6 | Dashboard e historial (16–17) | KPIs y movimientos con datos reales | Comparación contra cálculo de dominio |
| M7 | UX, PWA, seguridad, E2E, CI y deploy (18–24) | MVP demostrable y protegido | E2E crítico, CI verde y smoke staging |

**Puerta G1 — MVP cerrado:** se ejecuta el escenario de aceptación principal del documento de casos de uso; un usuario no ve datos de otro; dinero disponible coincide con el desglose; flujo completo funciona en entorno desplegado. Si falla esta puerta, las funciones posteriores no tienen precedencia sobre reparar el núcleo.

### BLOQUE 2 — Operación financiera completa (P1)

| ID | Módulo/historias | Entidades activadas | Entregable y criterio de aceptación |
|---|---|---|---|
| F01 | Editar/anular movimientos, búsqueda y filtros | `transactions`, `accounts`, `categories` | Totales consistentes después de editar/anular; historiales reflejan cambios |
| F02 | Transferencias entre cuentas | `transactions`, `accounts` | Traslado no altera patrimonio total; operación atómica y sin duplicidad |
| F03 | Gestión completa de obligaciones | `obligations` y movimientos vinculados según modelo | Estados, vencimientos y pagos coherentes; no contar doble un compromiso |
| F04 | Presupuestos por categoría y mes | `budgets`, `categories`, `transactions` | Consumo y restante correctos para cada periodo |
| F05 | Metas de ahorro y aportes | `goals`, `goal_contributions` | Progreso derivado de aportes; evitar persistir duplicado de acumulado |

**Puerta G2:** flujos de operaciones, presupuestos y ahorro con pruebas de datos, UI y RLS; no regresiones al disponible del MVP.

### BLOQUE 3 — Automatización y obligaciones de largo plazo (P2)

| ID | Módulo/historias | Entidades activadas | Entregable y criterio de aceptación |
|---|---|---|---|
| F06 | Movimientos recurrentes | `recurring_transactions`, `transactions` | Frecuencia, siguiente ejecución e idempotencia; no duplicados al reintentar |
| F07 | Suscripciones | `subscriptions`, `transactions` y reglas de obligación si corresponden | Próximo cobro, estado y representación correcta en previsión/disponible |
| F08 | Deudas y pagos | `debts`, `debt_payments` | Capital/interés/saldo de deuda reproducible, según reglas documentadas |
| F09 | Alertas | `alerts` y fuentes derivadas | Alertas justificadas, sin duplicados innecesarios; lectura y ownership |

**Puerta G3:** recurrencias y suscripciones no generan cobros duplicados; pagos no reducen dos veces la liquidez; alertas reproducibles.

### BLOQUE 4 — Inteligencia financiera y cierre del producto (P3)

| ID | Funcionalidad prevista | Fuente principal de datos | Resultado verificable |
|---|---|---|---|
| F10 | Proyección / forecast | Movimientos, recurrencias, suscripciones, obligaciones | Proyección etiquetada como estimación, con horizonte y supuestos visibles |
| F11 | Simulador de compra | Disponible y compromisos | Mostrar impacto estimado antes de registrar gasto; simular no modifica datos |
| F12 | Estrategias de deuda Snowball/Avalanche | Deudas y sus pagos | Orden propuesto coherente y explicable; no altera deudas por consultar |
| F13 | Financial Score / recomendaciones | Indicadores derivados | Fórmula trazable, criterio de interpretación y casos de borde |
| F14 | Endurecimiento final y release integral | Todas | Regression E2E, performance razonable, seguridad, UX y documentación |

**Puerta G4:** aplicación integral con funciones declaradas implementadas y validadas, sin presentar proyecciones como saldos confirmados ni recomendaciones como asesoría financiera garantizada.

> Nota: las capacidades analíticas pueden usar las 14 entidades existentes y servicios de cálculo; **no requieren automáticamente tablas nuevas**. Cualquier entidad adicional debe justificarse mediante un caso de uso, migración y aprobación de arquitectura.

## 6. Catálogo mínimo de pruebas por dominio

| ID de prueba | Caso | Resultado exigido |
|---|---|---|
| T-AUTH-01 | Registrarse/iniciar/cerrar sesión | Acceso autorizado y rutas privadas protegidas |
| T-RLS-01 | Usuario B consulta/edita registros de A | Acceso denegado; no filtración por joins ni servicios |
| T-MONEY-01 | Ingreso y gasto con decimales | Cálculo exacto, sin errores de coma flotante |
| T-TRANS-01 | Transferencia entre cuentas | Doble movimiento coherente; patrimonio total no cambia |
| T-DISP-01 | Saldo, obligación y reserva | Disponible coincide con desglose; déficit explícito |
| T-BUD-01 | Presupuesto por categoría y mes | Gasto del período correcto; no mezcla meses |
| T-GOAL-01 | Registrar aporte a meta | Progreso reflejado una sola vez |
| T-REC-01 | Reintentar ejecución recurrente | No crea cargo duplicado |
| T-SUB-01 | Pausar o cancelar suscripción | Estado y próximas previsiones coherentes |
| T-DEBT-01 | Registrar pago | Saldo de deuda cambia por componentes correctos |
| T-ALERT-01 | Generar y leer alerta | Motivación, propiedad y lectura consistentes |
| T-SIM-01 | Simular compra | Se ve el impacto sin persistir movimiento |
| T-E2E-01 | Usuario nuevo → disponible → dashboard | Flujo funcional de extremo a extremo |

Para cada test real registrar `ID`, caso de uso origen, **Given/When/Then**, datos de prueba, resultado esperado, resultado observado, evidencia y estado. Los nombres de IDs anteriores son convenciones propuestas, no pruebas ya ejecutadas.

## 7. Gobierno de esquema y migraciones

1. **Congelar una versión canónica de las 14 entidades como diseño** antes de crear nuevas migraciones. Comparar `MODELO_DATOS_Y_SEGURIDAD.md` y el DDL entregado anteriormente: resolver diferencias explícitamente.
2. Mantener migraciones numeradas en control de versiones y datos semilla separados de datos productivos.
3. Migrar el núcleo P0 primero si reduce riesgo, aunque el DER y DDL objetivo presenten el conjunto completo de entidades.
4. Para cada tabla: propiedad, PK, FK, checks, unicidad, índices necesarios, RLS, políticas de operaciones y casos de prueba.
5. Para relaciones entre registros de un usuario, imponer integridad de ownership en DB cuando corresponda; RLS por sí sola no sustituye todas las restricciones.
6. Evitar almacenar saldos, progreso de metas o KPIs redundantes si pueden derivarse; documentar excepciones deliberadas.
7. No ejecutar el borrador SQL completo en producción sin prueba de migración en base limpia y validación contra especificación oficial.

## 8. Estructura estándar del repositorio para seguimiento

```text
contexto/
  FINWISE_CONTEXTO_MAESTRO.md
  planificacion/
    PLAN_MAESTRO_IMPLEMENTACION.md      # este documento
    ESTADO_ACTUAL.md                    # auditoría y evidencia real
    BACKLOG_UNIFICADO.md                # historia, prioridad, estado, dependencia
    REGISTRO_DECISIONES.md              # cambios de alcance/arquitectura
    REPORTE_AVANCE.md                   # cierre de iteraciones
  arquitectura/
    MODELO_DATOS_Y_SEGURIDAD.md
  producto/
    CASOS_DE_USO_Y_FLUJOS.md
  calidad/
    ESTRATEGIA_PRUEBAS.md
supabase/migrations/                      # según estructura real del proyecto
```

Los documentos anteriores son **nuevos entregables propuestos**: no asumir que ya existen en el repositorio.

## 9. Formato de historia / tarea para cualquier desarrollador o IA

```md
### [ID] Título
- Estado: NO_INICIADA | EN_PROGRESO | BLOQUEADA | EN_REVISION | VALIDADA
- Prioridad: P0 | P1 | P2 | P3
- Caso(s) de uso: UC-XX
- Dependencias: [IDs]
- Contexto requerido: [rutas precisas]
- Objetivo observable:
- No-alcance:
- Entidades y relaciones afectadas:
- Implementación: migración + dominio + Next.js + UI
- Criterios de aceptación (Given/When/Then):
- Pruebas: unit | DB/RLS | component | integration | E2E
- Evidencia: PR/commit, comandos y resultados, captura/demo
- Riesgos y rollback:
- Siguiente tarea desbloqueada:
```

## 10. Tablero de control inicial (estado NO verificado)

| Paquete | Prioridad | Estado inicial | Dependencia |
|---|---|---|---|
| G0 Auditoría del repo | P0 | NO_INICIADA / por verificar | Acceso al código actual |
| M1–M7 MVP académico | P0 | POR AUDITAR | G0 |
| F01–F05 Operación/planificación | P1 | NO VERIFICADO | G1 |
| F06–F09 Automatización/deuda/alertas | P2 | NO VERIFICADO | G2 |
| F10–F14 Inteligencia y cierre | P3 | NO VERIFICADO | G3 |

**No asignar porcentajes de avance a partir de documentos o checkboxes sin código y evidencia.**

## 11. Secuencia exacta para empezar ahora

1. Adjuntar o abrir el repositorio actual (sin `.env`, tokens ni claves) y producir la auditoría G0.
2. Comparar el schema DDL propuesto con `MODELO_DATOS_Y_SEGURIDAD.md`; generar una lista de discrepancias y aprobar migración canónica.
3. Cargar en el backlog las historias de M1–M7 según código existente; marcar `VALIDADA` solo tras pruebas.
4. Implementar el primer *vertical slice* faltante de extremo a extremo, con al menos una prueba automatizada.
5. Completar G1 antes de iniciar P1 de manera sostenida; se puede diseñar P1/P2 en paralelo, pero no sacrificar calidad del MVP.
6. Continuar F01→F14 por dependencias y gates, integrando de forma continua, con una demo reproducible al cerrar cada paquete.

## 12. Cómo saber si el plan terminó

**MVP terminado:** G1 cumplida en staging/despliegue, con evidencia de pruebas.  
**Producto completo terminado:** G4 cumplida; todas las funcionalidades acordadas tienen implementación, prueba, trazabilidad y documentación.  
**Documento terminado ≠ funcionalidad terminada.**
