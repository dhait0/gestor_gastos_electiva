# FinWise — Contexto Maestro del Proyecto

> **Fuente de verdad principal del proyecto FinWise**  
> Estado: **Aprobado para implementación**  
> Fecha de consolidación: **8 de octubre de 2026**
>
> Este documento reemplaza versiones anteriores del Contexto Maestro cuando exista contradicción.

---

# 0. Gobierno del contexto

## 0.1 Propósito

Este documento consolida las decisiones vigentes de:

- producto;
- alcance;
- arquitectura;
- datos;
- seguridad;
- diseño;
- testing;
- Git/GitHub;
- eficiencia de agentes;
- recuperación de contexto;
- planificación.

Debe permitir que una persona o agente nuevo comprenda rápidamente qué es FinWise, qué debe construir y qué reglas no puede romper.

## 0.2 Orden de autoridad

Si dos decisiones entran en conflicto, usar este orden:

```text
1. Seguridad y privacidad
2. Integridad y precisión financiera
3. Reglas de dominio
4. Alcance vigente
5. Modelo de datos y seguridad
6. Arquitectura + ADRs
7. Casos de uso y criterios de aceptación
8. Sistema de diseño y accesibilidad
9. Política de Git/GitHub
10. Eficiencia de agentes y gestión de contexto
11. Planificación
12. Preferencia del desarrollador o agente
```

La eficiencia nunca justifica reducir seguridad, precisión financiera o integridad de datos.

## 0.3 Documentos oficiales

```text
contexto/
├── FINWISE_CONTEXTO_MAESTRO.md
├── INDICE_DOCUMENTACION.md
├── arquitectura/
│   ├── ARQUITECTURA_TECNICA.md
│   ├── MODELO_DATOS_Y_SEGURIDAD.md
│   └── adr/
├── producto/
│   └── CASOS_DE_USO_Y_FLUJOS.md
├── diseno/
│   ├── SISTEMA_DISENO_FINWISE.md
│   └── WIREFRAMES_Y_PANTALLAS.md
├── desarrollo/
│   ├── CONVENCIONES_DESARROLLO.md
│   ├── GESTION_GITHUB_Y_RAMAS.md
│   └── POLITICA_EFICIENCIA_AGENTES.md
├── calidad/
│   └── ESTRATEGIA_PRUEBAS.md
└── planificacion/
    ├── BACKLOG_MVP.md
    └── PLAN_IMPLEMENTACION_MVP.md
```

En la raíz del repositorio:

```text
AGENTS.md
```

`AGENTS.md` funciona como **router de contexto**, no como orden de leer todos los documentos en cada tarea.

---

# 1. Identidad del producto

Nombre:

```text
FinWise
```

FinWise es una aplicación de inteligencia y gestión financiera personal.

No es únicamente un CRUD de gastos.

Filosofía:

```text
Registrar
→ Interpretar
→ Analizar
→ Predecir
→ Alertar
→ Recomendar
→ Apoyar la decisión
```

Pregunta central:

> **¿Cuánto dinero puedo gastar realmente sin comprometer mis obligaciones, reservas y objetivos financieros?**

El principal número de producto es:

```text
DINERO DISPONIBLE
```

no el saldo bancario bruto.

---

# 2. Contexto académico

FinWise es un proyecto universitario que debe demostrar más que operaciones CRUD.

Debe destacar especialmente por:

- modelado de dominio;
- seguridad;
- lógica financiera;
- cálculos reproducibles;
- UX;
- arquitectura;
- testing;
- control de versiones;
- despliegue.

---

# 3. Problema

Una persona puede saber cuánto dinero tiene en sus cuentas y aun así no saber cuánto puede gastar realmente.

La información financiera suele estar dispersa entre:

- bancos;
- tarjetas;
- notas;
- hojas de cálculo;
- facturas;
- suscripciones;
- aplicaciones de presupuesto.

FinWise debe convertir esa información en una visión accionable.

---

# 4. Alcance

## 4.1 MVP académico — Must

El MVP académico tiene exactamente tres capacidades obligatorias:

1. Registrar manualmente ingresos y gastos.
2. Consultar un resumen financiero básico.
3. Calcular cuánto dinero está disponible para gastar después de compromisos configurados.

Para soportarlas técnicamente se requieren:

```text
auth
profiles
accounts
categories
transactions
obligations
safety reserve
dashboard mínimo
```

## 4.2 Fórmula MVP

```text
dineroDisponible =
saldoLiquido
- obligacionesPendientes
- reservaSeguridad
```

## 4.3 Alcance posterior

Después del MVP académico:

```text
edición/eliminación de transacciones
transferencias
presupuestos
metas
alertas
forecast
recurrencias
suscripciones
deudas
snowball/avalanche
Financial Score
simulador
reportes
```

## 4.4 Fuera de alcance inicial

No implementar sin decisión explícita:

```text
microservicios
NestJS separado
Redis
Kafka/RabbitMQ
GraphQL/tRPC
Redux global
IA productiva
Open Banking
sincronización bancaria
crypto
OCR
multiusuario familiar
```

---

# 5. Invariantes financieras

## 5.1 Saldo no es disponible

```text
saldoLiquido != dineroDisponible
```

## 5.2 Crédito no es efectivo

```text
availableCredit != liquidMoney
```

Nunca sumar límite de crédito al saldo líquido.

## 5.3 Transferencia no es ingreso ni gasto

```text
TRANSFER != INCOME
TRANSFER != EXPENSE
```

## 5.4 Obligación pendiente

Una obligación pendiente reduce capacidad de gasto, pero no crea una salida de dinero hasta existir una transacción real.

## 5.5 Meta

Una meta no inventa movimiento bancario.

## 5.6 Forecast

Toda predicción debe presentarse como:

```text
estimación
proyección
escenario
```

nunca como saldo real.

---

# 6. Stack oficial

## Aplicación

```text
Next.js 16.x
React
TypeScript strict
```

## UI

```text
Tailwind CSS
shadcn/ui
Radix UI
Lucide
Motion
Recharts
```

## Formularios / validación

```text
React Hook Form
Zod
```

## Fechas

```text
date-fns
```

## Dinero

```text
decimal.js
```

## Backend / datos

```text
Supabase PostgreSQL
Supabase Auth
Supabase RLS
@supabase/supabase-js
@supabase/ssr
Supabase-generated TypeScript types
Supabase CLI
```

## Testing

```text
Vitest
React Testing Library
Playwright
```

## Entorno

```text
pnpm
GitHub
GitHub Actions
Vercel
```

---

# 7. Tecnologías no adoptadas inicialmente

No usar por defecto:

```text
Prisma
Drizzle
NestJS
Redis
microservicios
Kafka
RabbitMQ
GraphQL
tRPC
Redux
Zustand
TanStack Query
Supabase Realtime
Supabase Edge Functions
Sentry
```

Una nueva tecnología requiere necesidad real y decisión documentada.

---

# 8. Arquitectura

Estilo:

```text
monolito modular
```

Dirección:

```text
Presentation
→ Application
→ Domain
→ Infrastructure
→ Supabase/PostgreSQL
```

La lógica financiera debe ser independiente de React, Next.js y Supabase cuando pueda expresarse como dominio puro.

## 8.1 Next.js

Lecturas:

```text
Server Components
```

Mutaciones:

```text
Server Actions
```

HTTP explícito:

```text
Route Handlers
```

para webhooks, integraciones o contratos HTTP reales.

## 8.2 Estado

Orden preferido:

```text
1. Server Components
2. Server Actions
3. URL state
4. React local state
```

No introducir state manager global sin necesidad demostrada.

---

# 9. Identidad y perfiles

Identidad:

```text
auth.users
```

Datos de aplicación:

```text
public.profiles
```

No crear una segunda tabla de usuarios para autenticación.

Relación:

```text
profiles.id = auth.users.id
```

Defaults iniciales:

```text
currency_code = COP
timezone = America/Bogota
locale = es-CO
safety_reserve = 0
```

---

# 10. Entidades principales

Modelo completo previsto:

```text
profiles
accounts
categories
transactions
obligations
budgets
goals
goal_contributions
recurring_transactions
subscriptions
debts
debt_payments
alerts
```

MVP P0:

```text
auth.users
profiles
accounts
categories
transactions
obligations
```

---

# 11. Dinero y precisión

PostgreSQL:

```text
numeric(20,4)
```

TypeScript:

```text
decimal.js
```

No usar `number` para aritmética monetaria crítica.

En límites server/client preferir decimal strings.

No sumar monedas diferentes sin módulo de FX.

Moneda inicial:

```text
COP
```

---

# 12. Fechas

Fechas financieras:

```text
date
```

Eventos técnicos:

```text
timestamptz
```

No inferir `transaction_date` desde `created_at`.

Zona inicial:

```text
America/Bogota
```

---

# 13. Cuentas

Tipos iniciales:

```text
CASH
CHECKING
SAVINGS
CREDIT_CARD
DIGITAL_WALLET
OTHER
```

`current_balance` no se persiste inicialmente como valor editable.

Activo:

```text
opening_balance + inflows - outflows
```

Tarjeta:

```text
opening_debt + outflows - inflows
```

Crédito disponible:

```text
credit_limit - current_debt
```

El crédito disponible no forma parte del saldo líquido.

---

# 14. Transactions

Ledger canónico.

Tipos:

```text
INCOME
EXPENSE
TRANSFER
```

Direcciones:

```text
INFLOW
OUTFLOW
```

Ingreso:

```text
INCOME + INFLOW
```

Gasto:

```text
EXPENSE + OUTFLOW
```

Monto siempre mayor que cero.

---

# 15. Transferencias

Una transferencia usa dos transacciones con el mismo:

```text
transfer_group_id
user_id
amount
currency_code
```

Origen:

```text
TRANSFER + OUTFLOW
```

Destino:

```text
TRANSFER + INFLOW
```

Reglas:

- cuentas diferentes;
- mismo usuario;
- misma moneda;
- creación atómica;
- sin efecto sobre ingresos/gastos globales.

---

# 16. Tarjetas de crédito

Compra:

```text
EXPENSE + OUTFLOW
```

Efecto:

```text
aumenta deuda
cuenta como gasto
no reduce saldo líquido inmediatamente
```

Pago:

```text
activo: TRANSFER + OUTFLOW
tarjeta: TRANSFER + INFLOW
```

No registrar el pago como segundo gasto.

---

# 17. Categorías

Propiedad del usuario.

Tipos:

```text
INCOME
EXPENSE
```

No usar una categoría de ingreso para gasto ni viceversa.

Evitar duplicados activos por:

```text
user_id + type + lower(name)
```

---

# 18. Obligaciones

Entidad explícita del MVP.

Estados iniciales:

```text
PENDING
PAID
```

Source inicial:

```text
MANUAL
```

Marcar obligación pagada no debe inventar automáticamente una transacción.

---

# 19. Reserva de seguridad

Inicialmente:

```text
profiles.safety_reserve
```

No cambia el saldo real.

Reduce el dinero disponible.

Puede ser cero.

---

# 20. Datos derivados

No crear tablas específicas inicialmente para:

```text
dashboard summary
available-to-spend
forecast
Financial Score
savings rate
net cash flow
monthly analysis
```

Son cálculos/view models.

---

# 21. Motor financiero

Funciones previstas:

```text
calculateAccountBalance()
calculateLiquidBalance()
calculateAvailableToSpend()
calculateBudgetUsage()
calculateSavingsRate()
calculateGoalRequiredSaving()
calculateMonthlyForecast()
detectRecurringTransactions()
calculateDebtStrategy()
calculateFinancialScore()
```

Implementar solo cuando el alcance las necesite.

---

# 22. Saldo líquido

MVP:

```text
sum(CASH)
+ sum(CHECKING)
+ sum(SAVINGS)
+ sum(DIGITAL_WALLET)
```

Excluir:

```text
CREDIT_CARD
credit_limit
available_credit
```

---

# 23. Dinero disponible

MVP:

```text
dineroDisponible =
saldoLiquido
- obligacionesPendientes
- reservaSeguridad
```

Debe ser explicable con breakdown.

Si el resultado es negativo, no mostrar:

```text
Puedes gastar -$X
```

Mostrar un mensaje de déficit.

---

# 24. Seguridad

Toda tabla financiera multiusuario debe usar:

```text
user_id
RLS
```

Regla central:

```text
(select auth.uid()) = user_id
```

No depender del frontend como autorización.

No abrir acceso a `anon`.

Indexar `user_id`.

Usar `USING` y `WITH CHECK` según corresponda.

---

# 25. Service role

```text
service_role
```

es estrictamente server-only.

Nunca exponer al cliente.

No usar para operaciones normales del usuario.

---

# 26. Functions / triggers

Preferir:

```text
SECURITY INVOKER
```

`SECURITY DEFINER` solo con necesidad explícita y controles estrictos.

El trigger de creación de profile después de signup es una excepción aceptada y debe probarse.

---

# 27. Soft delete

Usar `deleted_at` cuando corresponda.

Las consultas normales excluyen filas eliminadas.

No hard-delete histórico como comportamiento normal.

---

# 28. Migraciones

Ubicación:

```text
supabase/migrations/
```

Toda modificación de schema debe ser reproducible.

Considerar:

- constraints;
- indexes;
- grants;
- RLS;
- policies;
- functions/triggers;
- tests.

Cambios destructivos:

```text
Expand
→ Migrate
→ Contract
```

---

# 29. Testing

## Unit

```text
Vitest
```

Prioridad:

- dinero;
- balances;
- liquidez;
- disponible;
- tarjetas;
- transferencias.

## Component

```text
React Testing Library
```

## RLS / DB

Probar:

```text
A accede a A
B no accede a A
A no escribe para B
anon no accede
```

## E2E

```text
Playwright
```

Flujo MVP:

```text
signup
→ onboarding
→ account
→ income
→ expense
→ obligation
→ available-to-spend
```

---

# 30. CI

Pull Requests deben ejecutar inicialmente:

```text
lint
typecheck
test
build
```

Posteriormente pueden añadirse:

```text
integration
e2e
security
```

---

# 31. Diseño visual

Dirección:

```text
Apple premium
+
Fintech premium
+
Soft luxury
```

Glassmorphism moderado.

Soft UI sutil.

No usar:

- neón;
- glow excesivo;
- purple/pink AI gradients;
- neumorfismo extremo;
- SaaS genérico.

---

# 32. Colores y tipografía

Primary:

```text
#2563EB
```

Accent:

```text
#06B6D4
```

Dark background:

```text
#0B1220
```

Dark surface:

```text
#111827
```

Headings:

```text
Manrope
```

UI/números:

```text
Geist
```

Montos con números tabulares.

---

# 33. Light / Dark

Soportar desde el inicio:

```text
Light
Dark
System
```

Default:

```text
System
```

---

# 34. Mobile first-class

> **Mobile es igual o más importante que desktop.**

No diseñar desktop y simplemente reducirlo.

Navegación móvil:

```text
Inicio
Movimientos
+
Metas
Más
```

Quick Create:

```text
Gasto
Ingreso
Transferencia
Obligación
```

---

# 35. Dashboard

El número principal es:

```text
Dinero disponible
```

Orden mobile:

```text
Header
→ Disponible hero
→ Ingresos/Gastos
→ Cash flow
→ Insights/Alertas
→ Movimientos recientes
```

---

# 36. Motion

La animación debe explicar estado.

No retrasar operaciones por decoración.

Respetar:

```text
prefers-reduced-motion
```

Performance prevalece sobre blur/motion.

---

# 37. Accesibilidad

Objetivo mínimo:

```text
WCAG AA
```

Intentar AAA donde sea razonable para información financiera crítica.

Touch targets:

```text
44x44 mínimo
48x48 preferido mobile
```

No depender solo del color.

---

# 38. PWA

FinWise será PWA desde MVP.

Incluir:

```text
manifest
icons
maskable icon
apple-touch-icon
display: standalone
safe areas
theme colors
```

No prometer escritura financiera offline en MVP.

---

# 39. Git — ramas permanentes

```text
main
staging
```

`main`:

```text
producción
Vercel
```

`staging`:

```text
integración
pruebas locales
```

---

# 40. Regla de oro Git

> **La rama nueva se adapta a `staging`; `staging` jamás se modifica para acomodar una rama nueva.**

Si staging cambió:

```text
rama nueva
→ trae staging
→ resuelve conflictos en sí misma
→ adapta código
→ vuelve a probar
→ PR
```

---

# 41. Protección de ramas

`main` y `staging`:

```text
sin push directo
sin force push
sin eliminación
solo Pull Request
```

No desactivar protecciones para acelerar trabajo.

---

# 42. Ramas de trabajo

Nacen normalmente desde staging actualizado.

Tipos:

```text
funcionalidad/
correccion/
urgencia/
refactorizacion/
mantenimiento/
documentacion/
pruebas/
sincronizacion/
```

Una rama = un objetivo coherente.

---

# 43. Integración hacia staging

Desde la rama de trabajo:

```bash
git fetch origin
git merge origin/staging
```

Resolver conflictos en la rama nueva.

Después:

```text
lint
typecheck
test
build
```

Revisar diff antes del PR.

---

# 44. PR hacia staging

Requiere:

```text
rama actualizada
sin conflictos
checks verdes
mínimo 1 aprobación de otra persona
conversaciones resueltas
```

Merge:

```text
Squash and Merge
```

Después eliminar la rama temporal.

---

# 45. Producción

Flujo:

```text
staging
→ Pull Request
→ main
→ Vercel
```

Solo la persona responsable de producción puede autorizar/fusionar `staging → main`.

Merge:

```text
Merge Commit
```

---

# 46. Hotfix

Solo para error crítico en producción.

Rama:

```text
urgencia/*
```

nace desde `main`.

Después debe sincronizarse de vuelta mediante:

```text
sincronizacion/*
→ PR
→ staging
```

---

# 47. Convenciones de desarrollo

Código:

```text
English
```

UI/documentación:

```text
Spanish
```

TypeScript:

```text
strict = true
```

Evitar `any`.

Reutilizar componentes/tokens antes de crear nuevos.

---

# 48. Estados UI obligatorios

Cuando apliquen:

```text
loading
empty
success
warning
error
disabled
no permission
retry
```

No entregar solo happy path.

---

# 49. Política oficial de eficiencia de agentes

Documento:

```text
contexto/desarrollo/POLITICA_EFICIENCIA_AGENTES.md
```

Principio:

> **El agente debe realizar el mínimo trabajo correcto necesario para cumplir la tarea.**

Modo por defecto:

```text
ECONÓMICO
```

No asumir modo autónomo profundo por defecto.

---

# 50. Niveles de esfuerzo

## Rápido

Para:

- copy;
- CSS puntual;
- icono;
- bug localizado;
- documentación pequeña.

Presupuesto orientativo:

```text
1–5 archivos relevantes
```

## Normal

Para:

- formulario;
- Server Action;
- pantalla;
- query;
- caso de uso.

Presupuesto orientativo:

```text
3–12 archivos relevantes
```

## Profundo

Solo cuando exista:

- seguridad;
- RLS;
- dinero;
- migración;
- pérdida de datos;
- arquitectura;
- bug transversal desconocido.

Los límites son blandos. Superarlos requiere razón técnica.

---

# 51. Regla de detención

Cuando la tarea esté:

```text
implementada
+
verificada
```

detenerse.

No continuar automáticamente con:

- refactors;
- mejoras;
- optimizaciones;
- documentación adicional;
- nuevas features.

Si detecta algo fuera de alcance:

```text
mencionarlo
+
no implementarlo
```

---

# 52. Lectura selectiva de contexto

`AGENTS.md` es un **router**.

El agente NO debe cargar todos los documentos antes de cada tarea.

Debe recuperar solo el contexto relevante.

Ejemplos:

## UI

```text
AGENTS.md
→ sección relevante del Design System
→ wireframe relevante
→ componente afectado
```

## Datos/RLS

```text
AGENTS.md
→ MODELO_DATOS_Y_SEGURIDAD.md
→ ADR relacionado
→ tablas/migraciones afectadas
```

## Git

```text
AGENTS.md
→ GESTION_GITHUB_Y_RAMAS.md
```

## Cálculo financiero

```text
AGENTS.md
→ sección relevante de este contexto
→ caso de uso
→ código de dominio
```

---

# 53. Recuperación oficial de contexto

Orden:

```text
1. búsqueda exacta por nombre/símbolo
2. índice semántico del codebase
3. lectura de archivos candidatos
4. documentación especializada relevante
5. dependencias relacionadas
6. web/MCP externo solo si hace falta
```

No comenzar leyendo todo el repositorio.

---

# 54. Búsqueda exacta vs semántica

Si se conoce un símbolo como:

```text
AvailableToSpendCard
calculateLiquidBalance
transactionSchema
```

usar búsqueda exacta primero.

Si se conoce el concepto pero no el archivo:

```text
"dónde se calcula el dinero disponible"
```

usar búsqueda semántica.

El índice localiza; el código real sigue siendo fuente de verdad.

---

# 55. Estado actual de Kilo

Kilo tiene configurado:

```text
Codebase Indexing / embeddings
```

Uso esperado:

```text
semantic search
→ pocos candidatos
→ leer archivos reales
→ implementar
```

Preferir inicialmente:

```text
5–10 resultados
```

Kilo es una herramienta de desarrollo, no una dependencia del producto.

---

# 56. Estado actual de OpenCode

OpenCode utilizará inicialmente:

```text
AGENTS.md
+
búsqueda textual/selectiva
+
lectura bajo demanda
```

No existe obligación actual de añadir un servidor MCP semántico.

Regla:

> **No añadir infraestructura de contexto hasta demostrar que la recuperación actual es insuficiente.**

---

# 57. Infraestructura compartida de contexto

Estado actual:

```text
Kilo → indexación semántica disponible
OpenCode → recuperación selectiva
Servidor central → no obligatorio
```

Opciones futuras:

```text
Qdrant
Context MCP
Context7
otro vector store compartido
```

No desplegar por posibilidad técnica solamente.

---

# 58. Cuándo considerar servidor central

Evaluar si aparecen varias señales:

- múltiples desarrolladores necesitan compartir índice;
- diferentes herramientas duplican indexación;
- agentes leen demasiados archivos;
- documentación crece demasiado;
- múltiples agentes necesitan recuperación común;
- índices locales duplican esfuerzo significativamente.

Hasta entonces:

```text
mantener solución simple
```

---

# 59. Arquitectura futura posible de contexto

Si se justifica:

```text
GitHub / repo
     ↓
indexación incremental
     ↓
Qdrant/vector store
     ↓
FinWise Context MCP
  ↙      ↓      ↘
Kilo  OpenCode  otros
```

El servidor debería:

- devolver pocos fragmentos relevantes;
- incluir ruta/origen;
- soportar top-k;
- actualizar incrementalmente;
- respetar branch/version;
- excluir secretos;
- no inyectar todo el repo.

---

# 60. Política de MCP

Los MCP agregan herramientas/esquemas al contexto.

Por tanto:

> **No activar muchos MCP simultáneamente por defecto.**

Preferir:

```text
1 MCP de contexto/código
+
1 MCP externo específico
```

solo cuando hagan falta.

Un MCP debe reducir trabajo total, no aumentarlo.

---

# 61. Indexación recomendada

Priorizar:

```text
src/
supabase/
contexto/
AGENTS.md
```

Excluir:

```text
node_modules/
.next/
coverage/
dist/
build/
.git/
archivos generados
binarios grandes
.env
credenciales
secretos
```

No indexar datos financieros reales.

---

# 62. Política de skills

No activar todas las skills instaladas.

Usar solo la directamente relevante.

Si varias se solapan:

```text
preferir la más específica
```

Orden:

```text
Contexto Maestro
→ documentación especializada
→ skill específica
→ preferencia del agente
```

---

# 63. Política anti-loop

Ante el mismo error:

```text
máximo 2 intentos sustancialmente similares
```

Después:

```text
analizar nueva evidencia
→ cambiar estrategia
```

Si continúa bloqueado:

```text
reportar bloqueo
```

---

# 64. Pruebas proporcionales

Durante desarrollo:

## Cambio pequeño

```text
prueba específica
```

## Feature normal

```text
tests del módulo
+
typecheck relevante
```

## Antes del PR

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

No ejecutar E2E completo después de cada edición trivial.

---

# 65. Web / documentación externa

Para preguntas internas:

```text
repo/index > web
```

Usar web cuando:

- framework/API puede haber cambiado;
- documentación oficial es necesaria;
- existe error externo;
- dependencia debe verificarse;
- usuario pide investigación.

Prioridad:

```text
documentación oficial
→ repositorio oficial
→ fuentes secundarias
```

---

# 66. Señales de trabajo excesivo

Detener y reevaluar si:

- tarea pequeña requiere >15 archivos;
- repite búsquedas similares;
- modifica módulos fuera de alcance;
- inicia refactors no solicitados;
- ejecuta suites completas repetidamente;
- activa MCP innecesarios;
- sigue trabajando después de cumplir objetivo.

No son prohibiciones absolutas, pero requieren justificación técnica.

---

# 67. Backlog P0

Épicas principales:

```text
E0 Fundación
E1 Auth
E2 Onboarding
E3 Cuentas
E4 Categorías
E5 Transacciones
E6 Obligaciones
E7 Reserva
E8 Motor financiero
E9 Dashboard
E10 Navegación/PWA
E11 Calidad/Seguridad
E12 CI/CD
```

---

# 68. Orden de implementación

```text
1. Bootstrap
2. Tokens/theme
3. Supabase base
4. Auth
5. Onboarding + primera cuenta
6. Primer ingreso
7. Primer gasto
8. Motor dinero disponible
9. Obligaciones
10. Reserva
11. Dashboard MVP
12. Movimientos
13. PWA/mobile polish
14. Seguridad
15. E2E
16. Deploy
```

Preferir vertical slices.

---

# 69. Primer vertical slice

```text
Login
→ Cuenta
→ Registrar gasto
→ Persistir
→ Recalcular
→ Mostrar nuevo disponible
```

Cada slice atraviesa:

```text
UI
→ Application
→ Domain
→ Infrastructure
→ DB
→ Tests
```

---

# 70. Escenario principal de aceptación

Dado:

```text
Saldo líquido      $1.800.000
Obligaciones         $600.000
Reserva              $200.000
```

Resultado:

```text
Disponible         $1.000.000
```

La UI debe explicar el cálculo.

---

# 71. Escenario de déficit

Dado:

```text
Saldo líquido        $500.000
Obligaciones         $600.000
Reserva              $100.000
```

Resultado interno:

```text
-$200.000
```

Mensaje esperado:

> Tus compromisos actuales superan tu saldo líquido en aproximadamente $200.000.

---

# 72. Escenario de tarjeta

Inicial:

```text
Saldo líquido      $1.800.000
Deuda tarjeta        $300.000
```

Compra tarjeta:

```text
$100.000
```

Resultado:

```text
Deuda tarjeta        $400.000
Saldo líquido      $1.800.000
Gastos periodo      +$100.000
```

---

# 73. Escenario de transferencia

Antes:

```text
Cuenta A  $1.000.000
Cuenta B    $500.000
```

Transferencia:

```text
$200.000
```

Después:

```text
Cuenta A    $800.000
Cuenta B    $700.000
Total     $1.500.000
```

Ingresos/gastos globales:

```text
sin cambios
```

---

# 74. Definition of Done

Una funcionalidad está terminada cuando, según corresponda:

- alcance solicitado cumplido;
- sin scope creep;
- validación correcta;
- seguridad preservada;
- precisión financiera preservada;
- ownership/RLS correctos;
- loading/error/empty cubiertos;
- mobile revisado;
- desktop revisado;
- light/dark correctos;
- accesibilidad relevante;
- tests pertinentes;
- lint pasa;
- typecheck pasa;
- build pasa;
- documentación actualizada si cambió una decisión;
- rama actualizada con staging;
- diff revisado.

---

# 75. Anti-sobreingeniería

Cuando varias soluciones sean correctas:

> Elegir la más sencilla que satisfaga los requisitos actuales sin bloquear una evolución razonable.

No construir infraestructura para funciones que aún no existen.

---

# 76. Regla contra deuda técnica inducida por agentes

Un agente no debe:

- duplicar servicios sin revisar;
- crear entidades duplicadas;
- instalar dependencias por comodidad;
- desactivar RLS;
- mover lógica financiera al frontend;
- borrar tests para hacer pasar CI;
- usar `any` para ocultar errores;
- cambiar schema sin migración;
- reescribir ramas protegidas;
- reemplazar stack sin ADR;
- ampliar alcance sin solicitud.

---

# 77. Cambio de decisiones

Si una tarea requiere cambiar una decisión establecida, documentar:

```text
Decisión actual:
Cambio propuesto:
Motivo:
Impacto:
Migración necesaria:
Documentos afectados:
```

No cambiar silenciosamente:

- modelo;
- fórmula;
- stack;
- auth;
- branching;
- UX fundamental.

---

# 78. Uso de ui-ux-pro-max

Puede utilizarse como apoyo si está instalada.

Orden:

```text
Contexto Maestro
→ Sistema de Diseño
→ Wireframes
→ ui-ux-pro-max
→ preferencia del agente
```

La skill no puede reinterpretar la identidad de FinWise por su cuenta.

---

# 79. Estrategia documental final

La documentación base se considera suficientemente madura para comenzar implementación.

No crear nuevos `.md` preventivos por defecto.

Crear/actualizar documentación cuando:

- cambie una decisión real;
- exista un ADR nuevo;
- cambie dominio;
- cambie arquitectura;
- cambie modelo de datos;
- cambie seguridad;
- cambie diseño global;
- cambie Git/GitHub;
- cambie política de agentes.

---

# 80. Prioridad inmediata

A partir de este documento, la prioridad es construir.

```text
repositorio
→ configuración base
→ Supabase
→ migraciones P0
→ Auth
→ onboarding
→ primera cuenta
→ primer ingreso
→ primer gasto
→ motor de disponible
→ obligaciones
→ reserva
→ dashboard MVP
→ pruebas
→ deploy
```

No seguir ampliando documentación salvo decisión bloqueante.

---

# 81. Instrucción final para agentes

Antes de trabajar:

```text
1. leer AGENTS.md
2. clasificar tarea: rápido/normal/profundo
3. recuperar solo contexto relevante
4. confirmar rama
5. trabajar en rama temporal
6. implementar mínimo cambio correcto
7. probar proporcionalmente
8. traer staging antes del PR
9. resolver conflictos en la rama propia
10. revisar diff
11. detenerse cuando objetivo esté cumplido
```

---

# 82. Principios finales

> **El usuario necesita comprender su dinero, no solo registrar movimientos.**

> **La rama nueva se adapta a `staging`; `staging` no se sacrifica para acomodar trabajo nuevo.**

> **El mejor agente no es el que más archivos lee ni el que más pasos ejecuta; es el que encuentra el contexto correcto, realiza el cambio mínimo correcto y sabe cuándo detenerse.**

> **FinWise debe crecer primero en confiabilidad y profundidad, y después en cantidad de funciones.**

---

# Fin del contexto maestro
