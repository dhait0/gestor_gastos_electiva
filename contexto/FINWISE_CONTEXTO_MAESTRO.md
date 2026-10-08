# FinWise — Contexto Maestro del Proyecto

> **Fuente de verdad principal del proyecto FinWise**
>
> Estado: **actualizado y consolidado para implementación**
>
> Fecha de consolidación: **7 de octubre de 2026**
>
> Este documento reemplaza las versiones anteriores del contexto maestro cuando exista contradicción.
>
> La documentación especializada conserva mayor detalle técnico y funcional, pero ninguna decisión derivada puede contradecir este archivo sin una modificación explícita del contexto o un ADR aprobado.

---

# 0. Gobierno del contexto maestro

## 0.1 Propósito

Este documento concentra las decisiones vigentes de producto, alcance, arquitectura, datos, seguridad, experiencia, diseño, planificación, calidad y colaboración de FinWise.

Debe permitir que una persona o agente nuevo comprenda:

- qué es FinWise;
- qué problema resuelve;
- cuál es el MVP;
- cómo se calcula la información financiera;
- qué tecnologías se utilizan;
- cómo se organiza el código;
- cómo se protegen los datos;
- cómo debe diseñarse la interfaz;
- cómo se trabaja con GitHub;
- cómo se prueba;
- qué NO debe construirse todavía.

---

## 0.2 Regla de precedencia

Cuando dos decisiones entren en conflicto, usar este orden:

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
10. Planificación
11. Preferencia del desarrollador o agente
```

Nunca sacrificar seguridad o integridad financiera para simplificar una implementación.

---

## 0.3 Documentos oficiales

Estructura documental recomendada:

```text
contexto/
├── INDICE_DOCUMENTACION.md
├── FINWISE_CONTEXTO_MAESTRO.md
│
├── arquitectura/
│   ├── ARQUITECTURA_TECNICA.md
│   ├── MODELO_DATOS_Y_SEGURIDAD.md
│   └── adr/
│       ├── README.md
│       ├── ADR-001-STACK-Y-MONOLITO-MODULAR.md
│       ├── ADR-002-ACCESO-DATOS-Y-RLS.md
│       ├── ADR-003-PRECISION-MONETARIA.md
│       ├── ADR-004-LIMITES-SERVER-NEXTJS.md
│       ├── ADR-005-MOBILE-FIRST-Y-PWA.md
│       ├── ADR-006-CI-CD-VERCEL-GITHUB.md
│       └── ADR-007-MIGRACIONES-SUPABASE.md
│
├── producto/
│   └── CASOS_DE_USO_Y_FLUJOS.md
│
├── diseno/
│   ├── SISTEMA_DISENO_FINWISE.md
│   └── WIREFRAMES_Y_PANTALLAS.md
│
├── planificacion/
│   ├── BACKLOG_MVP.md
│   └── PLAN_IMPLEMENTACION_MVP.md
│
├── desarrollo/
│   ├── CONVENCIONES_DESARROLLO.md
│   └── GESTION_GITHUB_Y_RAMAS.md
│
└── calidad/
    └── ESTRATEGIA_PRUEBAS.md
```

En la raíz del repositorio debe existir:

```text
AGENTS.md
```

para instruir a agentes de desarrollo.

---

## 0.4 Fuente de verdad

La base de datos es la fuente de verdad de los datos persistentes.

Los valores derivados deben calcularse desde datos persistidos y reglas de dominio.

No duplicar como columnas editables valores que pueden derivarse de forma confiable, salvo decisión explícita.

---

## 0.5 Principio rector

FinWise no es un CRUD de gastos.

Su filosofía es:

```text
Registrar
→ Interpretar
→ Analizar
→ Predecir
→ Alertar
→ Recomendar
→ Apoyar la decisión
```

---

## 0.6 Pregunta central del producto

> **¿Cuánto dinero puedo gastar realmente sin comprometer mis obligaciones, reservas y objetivos financieros?**

La respuesta a esta pregunta es el principal diferenciador de FinWise.

---

# 1. Identidad del proyecto

Nombre:

```text
FinWise
```

Concepto:

> Aplicación de inteligencia y gestión financiera personal que transforma registros financieros en información comprensible para apoyar decisiones.

FinWise debe comunicar:

- claridad;
- control;
- confianza;
- contexto;
- prevención;
- progreso.

---

# 2. Contexto académico

FinWise es un proyecto universitario que debe demostrar más que operaciones CRUD.

El valor académico principal estará en:

- modelado de dominio;
- seguridad;
- lógica financiera;
- análisis;
- cálculos reproducibles;
- UX;
- arquitectura;
- pruebas;
- control de versiones;
- despliegue.

La primera entrega no necesita implementar toda la visión futura.

---

# 3. Problemática

Muchas personas pueden consultar cuánto dinero existe en una cuenta, pero no saben cuánto de ese dinero es realmente utilizable.

La información financiera suele estar dispersa entre:

- aplicaciones bancarias;
- notas;
- hojas de cálculo;
- tarjetas;
- facturas;
- suscripciones;
- aplicaciones de presupuesto.

Esto dificulta:

- comprender gastos;
- anticipar obligaciones;
- ahorrar;
- planificar;
- controlar deuda;
- saber cuánto se puede gastar sin comprometer pagos futuros.

---

# 4. Propuesta de solución

FinWise centraliza y estructura información financiera para producir:

- saldos;
- métricas;
- presupuestos;
- obligaciones;
- metas;
- tendencias;
- alertas;
- proyecciones;
- simulaciones;
- recomendaciones futuras.

La aplicación debe distinguir siempre entre:

```text
hecho
cálculo
estimación
recomendación
```

---

# 5. Usuarios objetivo

Personas que desean comprender y organizar sus finanzas personales, por ejemplo:

- estudiantes;
- jóvenes profesionales;
- trabajadores independientes;
- personas con varias cuentas;
- personas con metas de ahorro;
- personas con compromisos recurrentes;
- personas que buscan mejorar control financiero.

---

# 6. Alcance oficial

## 6.1 MVP académico — obligatorio

Exactamente tres capacidades Must:

1. Registrar manualmente ingresos y gastos.
2. Consultar un resumen financiero básico.
3. Calcular cuánto dinero está disponible para gastar después de compromisos configurados.

Para soportar esas tres capacidades, técnicamente se requieren además:

- autenticación;
- profile;
- cuentas;
- categorías;
- obligaciones;
- reserva de seguridad;
- dashboard mínimo.

---

## 6.2 Fórmula MVP

```text
dineroDisponibleMVP =
saldoLiquido
- obligacionesPendientes
- reservaSeguridad
```

---

## 6.3 MVP funcional posterior

Después de cerrar el MVP académico:

- edición y eliminación de transacciones;
- transferencias;
- presupuestos;
- metas;
- alertas;
- forecast;
- recurrencias.

---

## 6.4 V2

- suscripciones;
- deudas;
- pagos de deuda;
- snowball;
- avalanche;
- Financial Score;
- simulador;
- reportes;
- importación/exportación.

---

## 6.5 V3 / capacidades avanzadas

- categorización inteligente;
- IA financiera;
- detección avanzada de patrones;
- sincronización bancaria;
- open banking;
- finanzas compartidas;
- análisis predictivo avanzado.

---

## 6.6 Fuera de alcance por defecto

No implementar sin decisión explícita:

```text
microservicios
NestJS separado
Redis
Kafka/RabbitMQ
GraphQL/tRPC
Redux global por defecto
IA productiva
Open Banking
sincronización bancaria
crypto
portafolios de inversión
OCR de recibos
multiusuario familiar
```

---

# 7. Invariantes de dominio

## 7.1 Saldo no es disponible

```text
saldoLiquido != dineroDisponible
```

---

## 7.2 Crédito no es efectivo

```text
availableCredit != liquidMoney
```

El límite de crédito jamás se suma al saldo líquido.

---

## 7.3 Transferencia no es ingreso ni gasto

```text
TRANSFER != INCOME
TRANSFER != EXPENSE
```

---

## 7.4 Una obligación pendiente no modifica saldo bancario

Reduce capacidad de gasto, pero no crea una salida financiera hasta existir una transacción real.

---

## 7.5 Marcar una obligación como pagada no inventa una transacción

El usuario puede registrar explícitamente el gasto/pago correspondiente.

---

## 7.6 Una meta no inventa movimiento bancario

Los aportes y movimientos reales deben distinguirse.

---

## 7.7 Forecast no es certeza

Toda predicción debe presentarse como:

```text
estimación
proyección
escenario
```

nunca como saldo real.

---

# 8. Stack tecnológico oficial

## Aplicación

```text
Next.js 16.x
React
TypeScript strict
```

## Styling / UI

```text
Tailwind CSS
shadcn/ui
Radix UI
Lucide
```

## Motion

```text
Motion
```

## Gráficas

```text
Recharts
```

## Formularios y validación

```text
React Hook Form
Zod
```

## Fechas

```text
date-fns
```

## Dinero en TypeScript

```text
decimal.js
```

## Backend / datos

```text
Next.js Server Components
Next.js Server Actions
Next.js Route Handlers
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

## Paquetes

```text
pnpm
```

## Repositorio / CI/CD

```text
GitHub
GitHub Actions
Vercel
```

---

# 9. Tecnologías no adoptadas inicialmente

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

Una de estas tecnologías puede incorporarse en el futuro únicamente si existe una necesidad real y se documenta la decisión.

---

# 10. Arquitectura oficial

Estilo:

```text
monolito modular
```

Dependencias:

```text
Presentation
      ↓
Application
      ↓
Domain
      ↓
Infrastructure
      ↓
Supabase / PostgreSQL
```

La lógica financiera debe permanecer independiente de:

```text
React
Next.js
Supabase
```

cuando sea lógica de dominio pura.

---

# 11. Responsabilidades por capa

## Presentation

- páginas;
- componentes;
- formularios;
- view models;
- estados visuales;
- interacción.

## Application

- casos de uso;
- coordinación;
- autorización contextual;
- transacciones de aplicación;
- repositorios.

## Domain

- cálculos;
- invariantes;
- reglas financieras;
- tipos de dominio.

## Infrastructure

- Supabase;
- queries;
- persistencia;
- mapeos;
- servicios externos.

---

# 12. Estrategia de servidor Next.js

## Lecturas

Preferir:

```text
Server Components
```

## Mutaciones originadas por la aplicación

Preferir:

```text
Server Actions
```

## HTTP explícito

Usar:

```text
Route Handlers
```

para:

- webhooks;
- integraciones;
- contratos HTTP;
- endpoints externos.

---

# 13. Estado de aplicación

Orden de preferencia:

```text
1. Server Components
2. Server Actions
3. URL state
4. estado React local
```

No introducir state manager global sin necesidad demostrada.

No introducir TanStack Query únicamente por costumbre.

---

# 14. Identidad del usuario

No existe una tabla de usuarios paralela para autenticación.

Identidad:

```text
auth.users
```

Datos de aplicación:

```text
public.profiles
```

Relación:

```text
profiles.id = auth.users.id
```

con FK y `ON DELETE CASCADE`.

No duplicar email en `profiles` salvo necesidad futura documentada.

---

# 15. Profile

Campos conceptuales:

```text
id
display_name
currency_code
timezone
safety_reserve
locale
created_at
updated_at
```

Defaults iniciales:

```text
currency_code = COP
timezone = America/Bogota
locale = es-CO
safety_reserve = 0
```

---

# 16. Entidades principales

Modelo actual:

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

No todas se implementan en el MVP académico.

---

# 17. Entidades P0 del MVP académico

Solo se requieren inicialmente:

```text
auth.users
profiles
accounts
categories
transactions
obligations
```

más los cálculos derivados.

---

# 18. Dinero y precisión

PostgreSQL:

```text
numeric(20,4)
```

TypeScript domain:

```text
decimal.js
```

Evitar para cálculos críticos:

```text
float
double precision
JavaScript number arithmetic
```

En límites server/client preferir valores monetarios como decimal string.

El formateo visual no es representación de dominio.

---

# 19. Monedas

Cada registro monetario relevante contiene `currency_code`.

MVP inicial:

```text
COP
```

No sumar monedas distintas sin módulo formal de conversión.

No introducir tasas FX implícitas.

---

# 20. Fechas

Usar:

```text
date
```

para fechas financieras.

Usar:

```text
timestamptz
```

para eventos técnicos.

No inferir `transaction_date` a partir de `created_at`.

Zona horaria inicial:

```text
America/Bogota
```

---

# 21. Accounts

Una cuenta representa dónde existe dinero o crédito.

Tipos iniciales:

```text
CASH
CHECKING
SAVINGS
CREDIT_CARD
DIGITAL_WALLET
OTHER
```

Campos conceptuales:

```text
id
user_id
name
type
currency_code
opening_balance
credit_limit
payment_due_day
statement_closing_day
is_archived
deleted_at
created_at
updated_at
```

`current_balance` no se persiste inicialmente como valor editable.

---

# 22. Balance de cuenta

Activo:

```text
opening_balance + inflows - outflows
```

Tarjeta de crédito:

```text
opening_debt + outflows - inflows
```

Crédito disponible:

```text
credit_limit - current_debt
```

El crédito disponible nunca forma parte del saldo líquido.

---

# 23. Transactions

Ledger financiero canónico.

Campos conceptuales:

```text
id
user_id
account_id
category_id
type
direction
amount
currency_code
description
transaction_date
notes
recurring_transaction_id
transfer_group_id
deleted_at
created_at
updated_at
```

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

---

# 24. Income / Expense

Ingreso:

```text
type = INCOME
direction = INFLOW
```

Gasto:

```text
type = EXPENSE
direction = OUTFLOW
```

Monto siempre:

```text
> 0
```

El signo visual se deriva del contexto; no almacenar montos negativos como regla normal.

---

# 25. Transferencias

Una transferencia se representa con dos transactions relacionadas por:

```text
transfer_group_id
```

Origen:

```text
TRANSFER + OUTFLOW
```

Destino:

```text
TRANSFER + INFLOW
```

Reglas V1:

- mismo usuario;
- mismo monto;
- misma moneda;
- cuentas diferentes;
- creación atómica;
- no cambia ingresos/gastos globales.

---

# 26. Tarjeta de crédito

Compra con tarjeta:

```text
EXPENSE + OUTFLOW
```

en cuenta `CREDIT_CARD`.

Efecto:

```text
aumenta deuda
no reduce saldo líquido inmediatamente
sí aumenta gasto del periodo
```

Pago de tarjeta:

```text
bank account: TRANSFER + OUTFLOW
credit card: TRANSFER + INFLOW
```

No registrar el pago de tarjeta como un segundo gasto.

---

# 27. Categories

Categorias propiedad del usuario en V1.

Tipos:

```text
INCOME
EXPENSE
```

No utilizar categoría de ingreso para gasto ni viceversa.

Categorías iniciales pueden copiarse por usuario.

Evitar duplicados activos por:

```text
user_id + type + lower(name)
```

---

# 28. Obligations

Entidad explícita necesaria para el cálculo de disponible.

Campos conceptuales:

```text
id
user_id
name
description
amount
currency_code
due_date
status
source
source_id
paid_at
deleted_at
created_at
updated_at
```

Estados iniciales:

```text
PENDING
PAID
```

Source inicial:

```text
MANUAL
```

No duplicar una obligación derivada de otra fuente en el futuro.

---

# 29. Safety reserve

Se almacena inicialmente en:

```text
profiles.safety_reserve
```

No modifica saldo real.

Reduce el dinero considerado disponible.

Puede ser:

```text
0
```

---

# 30. Budgets

Modelo mensual por categoría.

Usar:

```text
period_month DATE
```

representando el primer día del mes.

Único por:

```text
user_id + category_id + period_month
```

`spent` es derivado de transacciones.

Estados visuales iniciales:

```text
0–69%   NORMAL
70–89%  WARNING
90–99%  HIGH
>=100%  EXCEEDED
```

---

# 31. Goals

Campos conceptuales:

```text
target_amount
initial_amount
monthly_commitment_amount
currency_code
target_date
status
```

`currentAmount` no se persiste como campo editable.

Se deriva:

```text
initial_amount + goal_contributions
```

La recomendación mensual también es derivada.

---

# 32. Recurrencias y suscripciones

Son posteriores al MVP académico.

La detección puede utilizar inicialmente:

- descripción similar;
- monto similar;
- categoría similar;
- intervalo similar;
- mínimo tres repeticiones.

Una sugerencia de recurrencia no se activa automáticamente sin confirmación.

---

# 33. Debts

Posterior al MVP académico.

A diferencia del balance de cuenta simple, `current_balance` de deuda puede persistirse porque intereses, cargos y refinanciaciones externas pueden modificarlo.

Pago:

```text
principal + interest = amount
```

---

# 34. Alerts

Campos conceptuales:

```text
type
title
message
severity
is_read
read_at
metadata
dedup_key
expires_at
```

`metadata` no reemplaza schema formal.

---

# 35. Datos derivados — no tablas inicialmente

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

# 36. Motor financiero

Funciones de dominio esperadas:

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

Implementarlas cuando el alcance las necesite.

---

# 37. Saldo líquido

MVP:

```text
sum(balance of CASH)
+ sum(balance of CHECKING)
+ sum(balance of SAVINGS)
+ sum(balance of DIGITAL_WALLET)
```

Excluir:

```text
CREDIT_CARD
credit_limit
available_credit
```

---

# 38. Dinero disponible

MVP:

```text
dineroDisponible =
saldoLiquido
- obligacionesPendientes
- reservaSeguridad
```

Versión completa futura:

```text
dineroDisponible =
saldoLiquido
- obligacionesPendientes
- metasAhorroComprometidas
- pagosDeudaPendientes
- reservaSeguridad
```

El resultado debe ser explicable mediante breakdown.

---

# 39. Resultado negativo

No mostrar:

```text
Puedes gastar -$200.000
```

Mostrar algo como:

> Tus compromisos actuales superan tu saldo líquido en aproximadamente $200.000.

Internamente el valor puede conservarse negativo para análisis.

---

# 40. Forecast

Primera aproximación:

```text
gastoDiarioPromedio =
gastosMes / diasTranscurridos

gastoProyectado =
gastoDiarioPromedio * diasTotalesMes
```

Debe manejar:

- primer día;
- cero gastos;
- datos incompletos.

Siempre etiquetar como estimación.

---

# 41. Snowball / Avalanche

Posterior.

Snowball:

```text
ORDER BY current_balance ASC
```

Avalanche:

```text
ORDER BY interest_rate_percent DESC
```

FinWise recomienda orden; no ejecuta pagos.

---

# 42. Seguridad

Toda tabla financiera multiusuario debe estar protegida por:

```text
RLS
```

Regla central:

```text
(select auth.uid()) = user_id
```

según política.

No depender del frontend como autorización.

---

# 43. Ownership

Todas las entidades financieras contienen:

```text
user_id
```

En relaciones críticas preferir protección compuesta:

```text
(child_fk, user_id)
→
(parent_id, user_id)
```

cuando aporte integridad.

---

# 44. RLS

Para cada tabla:

- habilitar RLS;
- policies explícitas;
- `authenticated`;
- separar SELECT/INSERT/UPDATE cuando corresponda;
- usar `USING` y `WITH CHECK`;
- indexar `user_id`;
- no abrir acceso a `anon`.

No crear policy genérica `FOR ALL` por comodidad salvo justificación.

---

# 45. Service role

```text
service_role
```

es estrictamente server-only.

No se usa para operaciones normales del usuario.

Nunca se expone al cliente.

---

# 46. Functions / triggers

Preferir:

```text
SECURITY INVOKER
```

`SECURITY DEFINER` solo con necesidad explícita y controles:

- search_path seguro;
- nombres schema-qualified;
- grants mínimos;
- validación de ownership.

El trigger de creación de `profiles` tras signup es una excepción aceptada y debe probarse.

---

# 47. Soft delete

Aplicable inicialmente a:

```text
accounts
categories
transactions
obligations
goals
recurring_transactions
subscriptions
debts
```

Usar:

```text
deleted_at
```

Las consultas normales excluyen filas eliminadas.

No hard-delete histórico como comportamiento normal.

---

# 48. Migraciones

Ubicación:

```text
supabase/migrations/
```

Toda modificación de schema debe ser reproducible.

Una migración funcional debe considerar:

- tabla/columna;
- constraints;
- indexes;
- grants;
- RLS;
- policies;
- functions/triggers;
- pruebas.

No resolver producción manualmente y olvidar migración.

Cambios destructivos:

```text
Expand
→ Migrate
→ Contract
```

---

# 49. Seeds

Solo datos ficticios.

Nunca usar información financiera real.

El seed debe permitir escenarios:

- normal;
- déficit;
- obligaciones;
- tarjeta;
- movimientos;
- posteriormente presupuesto/meta.

---

# 50. Estrategia de testing

## Unit

```text
Vitest
```

Proteger especialmente:

- dinero;
- saldos;
- liquidez;
- disponible;
- tarjetas;
- transferencias.

## Component

```text
React Testing Library
```

Probar comportamiento, no clases Tailwind.

## Database / RLS

Probar:

```text
A puede acceder a A
B no puede acceder a A
A no escribe para B
anon no accede
```

## E2E

```text
Playwright
```

Flujo principal:

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

# 51. CI obligatoria

Pull Requests deben ejecutar inicialmente:

```text
lint
typecheck
test
build
```

Cuando existan:

```text
integration
e2e
security
```

podrán añadirse como checks obligatorios.

---

# 52. Diseño visual oficial

Dirección:

```text
60% Apple premium
25% Fintech premium
15% Soft luxury
```

Con:

```text
glassmorphism moderado
soft UI sutil
Motion funcional
```

No usar:

- estilo cripto;
- neón;
- glow excesivo;
- gradientes morado/rosa genéricos;
- neumorfismo extremo;
- dashboard SaaS genérico.

---

# 53. Colores

Primary:

```text
#2563EB
```

Accent cyan:

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

Light background:

```text
#F4F7FB
```

Cyan es acento, no color dominante.

Gradiente azul→cyan solo en elementos especiales.

---

# 54. Tipografía

Headings:

```text
Manrope
```

UI / números:

```text
Geist
```

Montos:

```css
font-variant-numeric: tabular-nums;
```

---

# 55. Light y Dark

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

No crear componentes que funcionen solo en un tema.

---

# 56. Glass

Nivel:

```text
2 — premium moderado
```

Usar en:

- sidebar;
- bottom nav;
- hero;
- sheets/modals especiales;
- overlays.

No usar en todas las cards.

Si blur afecta rendimiento o contraste:

```text
reducir efecto
```

---

# 57. Mobile es primera clase

Regla oficial:

> **La experiencia móvil es igual o más importante que desktop.**

No diseñar desktop y reducirlo.

Diseñar primero mobile.

---

# 58. PWA

FinWise será PWA desde el MVP.

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

# 59. Navegación móvil

```text
Inicio
Movimientos
+
Metas
Más
```

Bottom navigation:

```text
floating glass
```

El botón central `+` abre Quick Create.

---

# 60. Quick Create

Acciones:

```text
Gasto
Ingreso
Transferencia
Obligación
```

Gasto aparece primero y ligeramente priorizado sin romper el diseño.

---

# 61. Navegación desktop

```text
Sidebar glass flotante + colapsable
```

Secciones:

```text
Dashboard
Movimientos
Presupuestos
Metas
Alertas
Configuración
```

según módulos disponibles.

No mostrar módulos falsos como activos.

---

# 62. Dashboard

El principal número visual es:

```text
Dinero disponible
```

No saldo total.

Orden mobile recomendado:

```text
Header
↓
Disponible hero
↓
Ingresos/Gastos
↓
Cash flow
↓
Insights/Alertas
↓
Movimientos recientes
```

---

# 63. AvailableToSpendCard

Debe mostrar:

```text
Disponible
Monto
Cambio contextual si existe
Saldo
Compromisos
Reserva
Estado
```

Ejemplo:

```text
Disponible
$2.150.000

Saldo          $4.850.000
Compromisos   -$2.200.000
Reserva         -$500.000
```

La evolución solo aparece si existe comparación válida.

---

# 64. Mobile — registro rápido

Gasto:

```text
¿Cuánto gastaste?

$ 25.000

Categoría
Cuenta
Fecha
Nota
Más detalles

[ Registrar gasto ]
```

Una sola pantalla.

CTA fijo sobre safe area.

Cuenta muestra saldo de forma secundaria.

Categoría muestra frecuentes y permite buscar todas.

---

# 65. Motion

Regla:

> La animación debe explicar el cambio de estado.

Tiempos aproximados:

```text
micro        140–180ms
hover        150–180ms
reveal       180–240ms
page         220–300ms
sheet/modal  240–340ms
counter      350–500ms
chart        450–650ms
```

Preferir digit morph para montos; fallback a counter.

Respetar:

```text
prefers-reduced-motion
```

Nunca retrasar operaciones por animación decorativa.

---

# 66. Accesibilidad

Objetivo mínimo:

```text
WCAG AA
```

Intentar AAA donde sea razonable en:

- montos críticos;
- estados de riesgo;
- información esencial.

Touch target:

```text
44x44 mínimo
48x48 preferido en mobile
```

No depender solo del color.

---

# 67. Voz del producto

Debe ser:

```text
cercana
corta
elegante
clara
```

Ejemplo:

> Tu presupuesto de alimentación está casi al límite.

No:

> ¡OJO! 😱 ¡Te estás quedando sin dinero!

Usar emojis de forma mínima.

---

# 68. GitHub — ramas permanentes

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

# 69. Regla Git principal

> **La rama nueva se adapta a `staging`; `staging` jamás se modifica para acomodar una rama nueva.**

Si `staging` cambió:

```text
rama nueva
→ trae staging
→ resuelve conflictos en sí misma
→ adapta código
→ vuelve a probar
→ PR
```

Nunca:

```text
modificar staging para que la feature entre
```

---

# 70. Protección de ramas

`main` y `staging`:

```text
sin push directo
sin force push
sin eliminación
solo Pull Request
```

No deshabilitar protecciones para acelerar trabajo.

---

# 71. Ramas de trabajo

Nacen normalmente desde:

```text
staging actualizado
```

Tipos en español:

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

Ejemplo:

```text
funcionalidad/registro-gastos
```

Una rama = un objetivo coherente.

---

# 72. Integración hacia staging

Antes del PR:

```bash
git fetch origin
git merge origin/staging
```

ejecutado desde la rama nueva.

Los conflictos se resuelven en esa rama.

Después ejecutar:

```text
lint
typecheck
test
build
```

Revisar:

```bash
git diff origin/staging...HEAD
```

---

# 73. PR hacia staging

Requiere:

```text
rama actualizada
sin conflictos
checks verdes
mínimo 1 aprobación de otra persona
conversaciones resueltas
```

Si se hace un push relevante después de aprobación:

```text
revisar nuevamente
```

Merge:

```text
Squash and Merge
```

Después:

```text
eliminar rama de trabajo
```

---

# 74. Release a producción

Flujo normal:

```text
staging
→ Pull Request
→ main
→ Vercel
```

Solo la persona responsable de producción puede autorizar/fusionar:

```text
staging → main
```

Merge:

```text
Merge Commit
```

Durante validación final se recomienda congelar temporalmente `staging`.

---

# 75. Hotfix

Solo para error crítico de producción.

Nace desde:

```text
main
```

Rama:

```text
urgencia/*
```

Después de arreglar `main`, el cambio debe regresar a `staging` mediante:

```text
sincronizacion/*
→ PR
→ staging
```

Nunca push directo.

---

# 76. Acciones Git prohibidas para agentes

Un agente no debe ejecutar sobre ramas protegidas:

```text
git push --force
git push --force-with-lease
git reset --hard
git clean -fd
git branch -D
```

ni operaciones destructivas que puedan perder trabajo, salvo autorización humana explícita y contexto seguro.

No puede:

- borrar trabajo ajeno para resolver conflicto;
- reescribir `staging`;
- reescribir `main`;
- fusionar producción;
- desactivar reglas;
- decidir unilateralmente qué implementación "gana" en conflicto de negocio.

---

# 77. Convenciones de desarrollo

Código:

```text
English
```

UI/documentación:

```text
Spanish
```

Naming:

```text
camelCase      variables/functions
PascalCase     components/types
UPPER_SNAKE    constants globales
```

TypeScript:

```text
strict = true
```

Evitar:

```text
any
```

---

# 78. Componentes React

Preferir Server Components.

Usar `"use client"` solo cuando se necesite:

- state;
- effects;
- browser APIs;
- forms interactivos;
- Motion interactivo.

No convertir árboles completos a client por comodidad.

---

# 79. UI components

`shadcn/ui` es base, no estilo final.

Reutilizar componentes FinWise y tokens.

No introducir hex, radius o shadows arbitrarios si ya existe token.

Motion debe usar presets compartidos.

Recharts debe envolverse en componentes FinWise.

---

# 80. Manejo de errores

No exponer:

- stack traces;
- SQL;
- secrets;
- detalles internos.

UI:

- mensaje comprensible;
- retry cuando aplique;
- conservar formulario razonablemente.

Errores de campo:

```text
inline
```

No solo toast.

---

# 81. Estados obligatorios de interfaz

Todo componente de datos debe contemplar cuando aplique:

```text
loading
empty
success
warning
error
disabled
partial data
no permission
retry
```

---

# 82. Logging

No registrar:

- passwords;
- tokens;
- service role;
- datos financieros completos innecesarios.

Logs deben servir para diagnóstico sin aumentar exposición.

---

# 83. Performance

Prioridad:

```text
fluidez
>
efectos visuales
```

Si blur/glass/Motion degrada:

- scroll;
- input;
- sheets;
- carga;

reducir el efecto.

---

# 84. Caching

No utilizar cache compartida insegura para información financiera privada.

Toda estrategia de caching debe respetar ownership y frescura.

---

# 85. Backlog P0

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

# 86. Orden de implementación

Orden recomendado mediante vertical slices:

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

---

# 87. Vertical slice

Evitar construir todas las capas por separado durante semanas.

Cada slice debe atravesar:

```text
UI
→ Application
→ Domain
→ Infrastructure
→ Database
→ Tests
```

Primer slice de producto recomendado:

```text
Login
→ Cuenta
→ Registrar gasto
→ Persistir
→ Recalcular
→ Mostrar nuevo disponible
```

---

# 88. Definition of Done transversal

Una funcionalidad está terminada cuando:

- flujo funciona;
- criterios se cumplen;
- entradas se validan;
- ownership se protege;
- RLS aplica;
- precisión financiera se conserva;
- loading/error/empty existen cuando aplican;
- mobile está revisado;
- desktop está revisado cuando corresponda;
- light/dark funcionan;
- accesibilidad relevante está cubierta;
- tests necesarios pasan;
- lint pasa;
- typecheck pasa;
- build pasa;
- documentación se actualizó si cambió una decisión.

---

# 89. Casos de uso P0

Prioridad MVP académico:

```text
Registro
Login
Logout
Onboarding
Crear cuenta
Registrar ingreso
Registrar gasto
Crear obligación
Configurar reserva
Consultar saldo líquido
Consultar dinero disponible
Dashboard
Estados vacíos
Validaciones
Errores
```

---

# 90. Escenario principal de aceptación

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

La UI debe explicar cómo se obtuvo.

---

# 91. Escenario de déficit

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

Mensaje:

> Tus compromisos actuales superan tu saldo líquido en aproximadamente $200.000.

---

# 92. Escenario de gasto

Inicial:

```text
Saldo líquido      $1.800.000
Obligaciones         $600.000
Reserva              $200.000
Disponible         $1.000.000
```

Gasto desde ahorro:

```text
$100.000
```

Resultado:

```text
Saldo líquido      $1.700.000
Disponible           $900.000
```

---

# 93. Escenario de tarjeta

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

# 94. Escenario de transferencia

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

# 95. Datos y diseño responsables

FinWise no debe:

- celebrar gasto excesivo;
- ocultar riesgo;
- presentar crédito como efectivo;
- presentar forecast como hecho;
- manipular emocionalmente;
- usar dark patterns.

La claridad financiera prevalece sobre engagement.

---

# 96. Regla anti-sobreingeniería

Cuando varias soluciones sean correctas:

> Elegir la más sencilla que satisfaga los requisitos actuales sin bloquear una evolución razonable.

No construir infraestructura para funciones que aún no existen.

---

# 97. Regla contra deuda técnica inducida por agentes

Un agente no debe:

- duplicar servicios sin revisar;
- crear entidades duplicadas;
- instalar dependencias por comodidad;
- desactivar RLS;
- mover cálculos críticos al frontend;
- borrar tests para hacer pasar CI;
- usar `any` para esconder errores;
- cambiar schema sin migración;
- reescribir ramas protegidas;
- reemplazar stack sin ADR.

---

# 98. Cambio de decisiones

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

# 99. Uso de ui-ux-pro-max

Puede utilizarse como apoyo de diseño si está disponible.

Orden:

```text
Contexto Maestro
↓
Sistema de Diseño
↓
Wireframes
↓
ui-ux-pro-max
↓
preferencia del agente
```

La herramienta no puede reinterpretar la identidad de FinWise por su cuenta.

---

# 100. Prioridad actual

La fase documental base está cerrada.

Prioridad siguiente:

```text
Inicializar repositorio
↓
Configurar Next.js
↓
Configurar Supabase
↓
Migraciones P0
↓
Auth
↓
Primer vertical slice
```

No seguir agregando documentación preventiva salvo que aparezca una decisión nueva.

---

# 101. Checklist obligatorio antes de una feature

Responder:

```text
¿Qué caso de uso implementa?
¿Es P0/P1/P2?
¿Qué entidades toca?
¿Qué reglas financieras toca?
¿Qué riesgos de seguridad existen?
¿Qué documentos aplican?
¿Qué pruebas necesita?
¿Qué rama debe crearse?
```

---

# 102. Checklist obligatorio para un agente

Antes de modificar código:

```text
1. Leer AGENTS.md.
2. Leer este contexto.
3. Leer documentación específica.
4. Confirmar rama.
5. Actualizar desde staging.
6. Crear/usar rama de trabajo.
7. Revisar código existente.
8. Implementar el mínimo cambio correcto.
9. Probar.
10. Traer staging nuevamente antes del PR.
11. Resolver conflictos en su rama.
12. Revisar diff.
13. Dejar PR listo.
```

---

# 103. Principio final

FinWise debe crecer:

```text
primero en confiabilidad y profundidad
después en cantidad de funciones
```

Y todo cambio debe respetar dos ideas fundamentales:

> **El usuario necesita comprender su dinero, no solo registrar movimientos.**

> **El trabajo nuevo debe adaptarse al proyecto integrado; el proyecto integrado no debe sacrificarse para acomodar una rama nueva.**

---

# Fin del contexto maestro
