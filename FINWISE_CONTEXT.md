# FinWise — Contexto Maestro para Agente de Desarrollo

> Documento de contexto funcional y técnico para construir una aplicación web universitaria de gestión financiera personal.
>
> Este archivo está pensado para ser entregado a un agente de programación con IA (Codex, Claude Code, Cursor, Copilot, Windsurf u otro) para mantener consistencia en el desarrollo.

---

## 1. Nombre del proyecto

**FinWise**

Nombre provisional. Puede cambiarse posteriormente sin alterar el dominio funcional.

### Tagline

> **Entiende tu dinero. Anticipa tus decisiones.**

---

## 2. Descripción general

FinWise es una aplicación web de gestión e inteligencia financiera personal.

Su objetivo no es limitarse a registrar ingresos y gastos, sino transformar esos datos en información accionable para que el usuario pueda:

- saber en qué está gastando;
- controlar presupuestos;
- administrar diferentes cuentas;
- identificar gastos recurrentes;
- gestionar suscripciones;
- crear metas de ahorro;
- controlar deudas;
- conocer cuánto dinero puede gastar realmente;
- anticipar si terminará el mes con déficit o superávit;
- recibir alertas financieras;
- analizar su salud financiera;
- simular decisiones de compra;
- recibir recomendaciones basadas en sus datos.

La filosofía principal del producto es:

> **Registrar → Analizar → Predecir → Recomendar**

---

# 3. Contexto académico

Este proyecto se desarrolla para una materia universitaria de **Electiva Técnica**.

El propósito académico es construir una aplicación que resuelva una problemática real y permita demostrar conocimientos relacionados con:

- desarrollo frontend;
- desarrollo backend;
- APIs;
- bases de datos relacionales;
- autenticación;
- autorización;
- diseño de interfaces;
- visualización de datos;
- lógica de negocio;
- algoritmos;
- pruebas;
- seguridad;
- despliegue;
- buenas prácticas de arquitectura;
- opcionalmente inteligencia artificial;
- control de versiones.

El proyecto debe evitar convertirse en un CRUD básico.

Por ello, el principal valor académico estará en la implementación de lógica financiera y herramientas de apoyo a la toma de decisiones.

---

# 4. Problemática

Muchas personas conocen cuánto dinero tienen en una cuenta, pero no conocen realmente su situación financiera.

La información suele encontrarse dispersa entre:

- aplicaciones bancarias;
- hojas de cálculo;
- notas;
- aplicaciones de presupuesto;
- extractos bancarios;
- aplicaciones de tarjetas de crédito;
- plataformas de suscripciones.

Esto genera problemas como:

- desconocimiento sobre en qué se está gastando el dinero;
- dificultad para controlar presupuestos;
- dificultad para ahorrar;
- pérdida de control sobre pagos recurrentes;
- suscripciones olvidadas;
- endeudamiento;
- gastos impulsivos;
- ausencia de planificación financiera;
- dificultad para estimar cuánto dinero puede gastarse sin afectar obligaciones futuras.

---

# 5. Formulación del problema

> Las personas tienen dificultades para comprender y planificar sus finanzas personales debido a la falta de herramientas centralizadas que conviertan sus registros de ingresos, gastos, obligaciones y objetivos financieros en información clara, predicciones y recomendaciones accionables.

---

# 6. Propuesta de solución

FinWise centralizará la información financiera del usuario y aplicará reglas de negocio para transformar movimientos financieros en:

- métricas;
- presupuestos;
- proyecciones;
- alertas;
- indicadores;
- recomendaciones;
- simulaciones.

La plataforma deberá permitir que el usuario pueda responder preguntas como:

- ¿Cuánto he gastado este mes?
- ¿En qué categoría gasto más?
- ¿Estoy gastando más que el mes anterior?
- ¿Estoy cumpliendo mi presupuesto?
- ¿Cuánto puedo gastar hoy?
- ¿Cuánto dinero me quedará a final de mes?
- ¿Cuánto debo ahorrar cada mes para alcanzar una meta?
- ¿Cuánto pago mensualmente en suscripciones?
- ¿Qué pagos tengo próximos?
- ¿Qué deuda debería pagar primero?
- ¿Qué impacto tendría una compra grande?
- ¿Estoy mejorando o empeorando financieramente?

---

# 7. Objetivo general

Diseñar e implementar una aplicación web de gestión financiera personal que permita registrar, centralizar, analizar y proyectar la información económica de los usuarios, ofreciendo herramientas para controlar gastos, presupuestos, metas, deudas y decisiones financieras.

---

# 8. Objetivos específicos

1. Implementar un sistema seguro de autenticación y administración de usuarios.

2. Permitir la creación y administración de cuentas financieras.

3. Registrar ingresos y gastos asociados a cuentas y categorías.

4. Permitir la definición de presupuestos mensuales por categoría.

5. Visualizar la información financiera mediante dashboards y gráficas.

6. Implementar metas de ahorro con seguimiento de progreso.

7. Detectar posibles movimientos recurrentes y suscripciones.

8. Calcular el dinero realmente disponible para gastar.

9. Implementar alertas basadas en presupuestos, pagos y comportamiento financiero.

10. Crear una proyección del gasto esperado al final del mes.

11. Permitir la administración de deudas y estrategias de pago.

12. Crear un indicador de salud financiera.

13. Implementar simulaciones financieras del tipo "¿qué pasa si compro esto?".

14. Mantener una arquitectura extensible para incorporar funciones de inteligencia artificial posteriormente.

---

# 9. Usuarios objetivo

El usuario principal es una persona que desea administrar sus finanzas personales.

Ejemplos:

- estudiantes universitarios;
- jóvenes profesionales;
- trabajadores independientes;
- personas que desean ahorrar;
- personas que quieren controlar sus gastos;
- personas con múltiples cuentas;
- personas con deudas;
- personas que usan varias suscripciones.

---

# 10. Alcance inicial

El MVP debe priorizar las funciones esenciales.

## MVP

Debe incluir:

1. Registro (email/contraseña y/o inicio de sesión con Google).
2. Inicio de sesión (email/contraseña y/o Google).
3. Recuperación o cambio de contraseña (solo para cuentas con método de contraseña).
4. Perfil del usuario.
5. Cuentas financieras.
6. Categorías.
7. Registro de ingresos.
8. Registro de gastos.
9. Edición y eliminación de transacciones.
10. Dashboard financiero.
11. Presupuesto mensual.
12. Metas financieras.
13. Gastos recurrentes.
14. Alertas.
15. Cálculo de dinero disponible.
16. Proyección de fin de mes.

---

# 11. Funciones para una segunda versión

Después del MVP:

- suscripciones;
- administración avanzada de deudas;
- métodos de pago de deuda;
- patrimonio neto;
- importación de CSV;
- exportación de datos;
- reglas automáticas de categorización;
- comparación entre meses;
- reportes;
- Financial Score;
- simulador financiero.

---

# 12. Funciones avanzadas

En una tercera versión:

- categorización inteligente;
- recomendaciones personalizadas;
- detección avanzada de patrones;
- análisis predictivo;
- asistente financiero conversacional;
- finanzas compartidas;
- cuentas familiares;
- integración con bancos;
- notificaciones push;
- aplicación móvil.

---

# 13. Principios del producto

El sistema debe seguir estos principios.

## 13.1 Simplicidad

La aplicación debe ser fácil de entender.

Evitar interfaces financieras excesivamente técnicas.

## 13.2 Información accionable

No mostrar únicamente datos.

Ejemplo incorrecto:

> Gastaste $420.000 en comida.

Ejemplo correcto:

> Gastaste $420.000 en comida y ya utilizaste el 84% de tu presupuesto mensual.

## 13.3 Contexto

Cada indicador debe intentar responder:

- qué ocurrió;
- por qué importa;
- qué puede ocurrir;
- qué puede hacer el usuario.

## 13.4 Visualización

Los dashboards deben priorizar:

- tarjetas;
- barras de progreso;
- gráficas;
- tendencias;
- comparaciones;
- alertas visuales.

---

# 14. Stack tecnológico recomendado

El stack preferido para el proyecto es:

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Componentes UI

Puede usarse:

- shadcn/ui
- Radix UI

## Gráficas

Preferencia:

- Recharts

Alternativa:

- Chart.js

## Backend

Opción recomendada:

- Next.js Route Handlers / Server Actions

Alternativa:

- Node.js
- NestJS

## Base de datos

- PostgreSQL

## ORM

Preferencia:

- Prisma

Alternativa:

- Drizzle ORM

## Autenticación

Preferencia:

- Supabase Auth

Alternativas:

- Auth.js
- Clerk

### Inicio de sesión con Google (OAuth)

El registro e inicio de sesión con cuenta de Google es **totalmente viable** y se recomienda incluirlo como método adicional (no reemplaza email/contraseña).

- Con **Supabase Auth**: habilitar el proveedor Google en el panel, crear una OAuth Client ID en Google Cloud Console y configurar los redirect URIs. Supabase gestiona el token y la sesión.
- Con **Auth.js (NextAuth)**: añadir el provider `Google` con `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`.

El usuario de FinWise (`User`) se crea/linkea automáticamente tras la confirmación del proveedor; no se debe pedir ni almacenar contraseña cuando el origen es social. Ver §17 y §51.

## Base de datos administrada

Preferencia:

- Supabase PostgreSQL

Alternativas:

- Neon
- Railway PostgreSQL

## Despliegue

Frontend / aplicación:

- Vercel

Base de datos:

- Supabase o Neon

---

# 15. Arquitectura recomendada

Se recomienda una arquitectura modular.

```text
Usuario
   ↓
Next.js / React
   ↓
API / Server Actions
   ↓
Servicios de dominio
   ↓
Prisma ORM
   ↓
PostgreSQL
```

La lógica financiera NO debe implementarse directamente dentro de componentes React.

Debe existir una separación clara:

```text
UI
↓
Controllers / API
↓
Services
↓
Domain Logic
↓
Repositories / ORM
↓
Database
```

---

# 16. Estructura sugerida del proyecto

```text
src/
│
├── app/
│   ├── auth/
│   ├── dashboard/
│   ├── transactions/
│   ├── budgets/
│   ├── goals/
│   ├── debts/
│   ├── subscriptions/
│   ├── reports/
│   └── settings/
│
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── transactions/
│   ├── budgets/
│   └── charts/
│
├── services/
│   ├── transaction.service.ts
│   ├── budget.service.ts
│   ├── forecasting.service.ts
│   ├── financial-score.service.ts
│   ├── recurring.service.ts
│   └── debt.service.ts
│
├── lib/
│   ├── db.ts
│   ├── auth.ts
│   ├── money.ts
│   ├── dates.ts
│   └── validations.ts
│
├── repositories/
│
├── types/
│
└── utils/
```

---

# 17. Entidades principales

## User

Representa un usuario.

Campos sugeridos:

```text
id
name
email
passwordHash (null si el origen es un proveedor social)
authProvider (EMAIL, GOOGLE, ...)
googleId (opcional, id del proveedor)
currency
timezone
safetyReserve (reserva de seguridad configurable, usada en §33; por defecto 0)
createdAt
updatedAt
```

Nota: cuando se use un proveedor gestionado (Supabase Auth / Auth.js), la verificación de credenciales y la sesión las maneja el proveedor. La tabla `User` de FinWise se vincula por `id` y solo almacena los datos de perfil. `passwordHash` debe ser `null` para usuarios que ingresaron únicamente vía Google.

---

# 18. Account

Representa una cuenta financiera.

Ejemplos:

- efectivo;
- cuenta de ahorros;
- cuenta corriente;
- tarjeta;
- billetera digital.

Campos:

```text
id
userId
name
type
initialBalance
currentBalance
currency
color
icon
isArchived
creditLimit (opcional; solo para tarjetas de crédito)
availableCredit (opcional; calculado para tarjetas)
paymentDueDate (opcional; para tarjetas de crédito)
deletedAt (opcional; soft-delete)
createdAt
updatedAt
```

Tipos posibles:

```text
CASH
CHECKING
SAVINGS
CREDIT_CARD
DIGITAL_WALLET
OTHER
```

---

# 19. Transaction

Representa un movimiento financiero.

Campos:

```text
id
userId
accountId
categoryId
type
amount
description
date
notes
isRecurring
recurringTransactionId
transferGroupId (opcional; agrupa las dos transacciones de una transferencia)
createdAt
updatedAt
```

Tipos:

```text
INCOME
EXPENSE
TRANSFER
```

Todos los valores monetarios deben guardarse de manera segura.

Preferir:

- DECIMAL en PostgreSQL;

o

- enteros en unidad mínima de moneda.

Nunca usar float para cálculos monetarios críticos.

---

# 20. Category

Campos:

```text
id
userId
name
type
icon
color
isDefault
deletedAt (opcional; soft-delete)
createdAt
updatedAt
```

Tipos:

```text
INCOME
EXPENSE
```

Categorías por defecto sugeridas:

### Gastos

- Alimentación
- Transporte
- Vivienda
- Servicios
- Entretenimiento
- Salud
- Educación
- Compras
- Deudas
- Suscripciones
- Viajes
- Otros

### Ingresos

- Salario
- Freelance
- Negocio
- Inversiones
- Regalos
- Otros ingresos

---

# 21. Budget

Presupuesto mensual por categoría.

Campos:

```text
id
userId
categoryId
month
year
limitAmount
createdAt
updatedAt
```

Restricción sugerida:

```text
unique(userId, categoryId, month, year)
```

---

# 22. Goal

Representa una meta financiera.

Ejemplos:

- viaje;
- computador;
- fondo de emergencia;
- vehículo;
- matrícula.

Campos:

```text
id
userId
name
description
targetAmount
currentAmount
targetDate
status
createdAt
updatedAt
```

Estados:

```text
ACTIVE
COMPLETED
PAUSED
CANCELLED
```

---

# 23. GoalContribution

Representa aportes realizados a una meta.

Campos:

```text
id
goalId
amount
date
notes
createdAt
```

---

# 24. Subscription

Campos:

```text
id
userId
name
amount
categoryId
billingFrequency
nextPaymentDate
status
source
createdAt
updatedAt
```

Frecuencias:

```text
WEEKLY
MONTHLY
QUARTERLY
YEARLY
CUSTOM
```

---

# 25. RecurringTransaction

Campos:

```text
id
userId
name
type
amount
categoryId
accountId
frequency
nextExecutionDate
isAutomatic
status
createdAt
updatedAt
```

---

# 26. Debt

Campos:

```text
id
userId
name
originalAmount
currentBalance
interestRate
minimumPayment
paymentDay
type
createdAt
updatedAt
```

Tipos:

```text
CREDIT_CARD
PERSONAL_LOAN
STUDENT_LOAN
MORTGAGE
OTHER
```

---

# 27. DebtPayment

Campos:

```text
id
debtId
amount
principalAmount
interestAmount
date
createdAt
```

---

# 28. Alert

Campos:

```text
id
userId
type
title
message
severity
read
metadata
createdAt
```

Tipos posibles:

```text
BUDGET_WARNING
BUDGET_EXCEEDED
UPCOMING_PAYMENT
LOW_BALANCE
SPENDING_SPIKE
GOAL_RISK
RECURRING_DETECTED
FORECAST_WARNING
GENERAL
```

Severidad:

```text
INFO
WARNING
CRITICAL
SUCCESS
```

---

# 29. Relaciones principales

```text
User
 ├── Accounts
 ├── Transactions
 ├── Categories
 ├── Budgets
 ├── Goals
 ├── Subscriptions
 ├── Debts
 └── Alerts
```

```text
Account
 └── Transactions
```

```text
Category
 ├── Transactions
 ├── Budgets
 └── Subscriptions
```

```text
Goal
 └── GoalContributions
```

```text
Debt
 └── DebtPayments
```

---

# 30. Dashboard

El dashboard debe ser la página principal.

Debe mostrar como mínimo:

## Resumen superior

- saldo total;
- ingresos del mes;
- gastos del mes;
- ahorro del mes;
- porcentaje de ahorro.

## Dinero disponible

Mostrar:

> Puedes gastar aproximadamente X sin comprometer tus obligaciones actuales.

## Distribución de gastos

Gráfica por categorías.

## Presupuestos

Mostrar las categorías con mayor nivel de consumo.

## Tendencia

Gráfica de gastos diarios o mensuales.

## Metas

Mostrar progreso de metas activas.

## Alertas

Mostrar alertas recientes.

## Movimientos recientes

Últimas transacciones.

---

# 31. Cálculo de saldo

Para cada cuenta:

```text
saldoActual =
saldoInicial
+ ingresos
- gastos
+ transferenciasEntrantes
- transferenciasSalientes
```

El saldo global:

```text
saldoGlobal =
sumatoria(saldos de cuentas activas)
```

Las tarjetas de crédito deben poder manejarse como pasivos.

Nota: si el usuario tiene cuentas en distintas monedas, `saldoGlobal` requiere una moneda base y conversión explícita (tasa configurada por el usuario). Para el MVP inicial con COP esto no aplica, pero el modelo debe preverlo.

---

# 32. Presupuestos

Cada presupuesto pertenece a:

- usuario;
- categoría;
- mes;
- año.

Indicador:

```text
porcentajeConsumido =
gastoCategoria / limitePresupuesto * 100
```

Estados sugeridos:

```text
0-69%   = NORMAL
70-89%  = WARNING
90-99%  = HIGH
>=100%  = EXCEEDED
```

Generar alertas configurables.

Ejemplo:

> Has utilizado el 82% del presupuesto de Alimentación.

---

# 33. Dinero disponible para gastar

Esta es una de las funciones diferenciadoras principales.

El saldo bancario no debe interpretarse automáticamente como dinero disponible.

Fórmula conceptual:

```text
dineroDisponible =
saldoLiquido
- obligacionesPendientes
- metasAhorroComprometidas
- pagosDeudaPendientes
- reservaSeguridad
```

Definición de variables:

- `saldoLiquido`: suma de saldos de cuentas no-crédito (efectivo disponible real).
- `obligacionesPendientes`: gastos facturados/no pagados + suscripciones y recurrentes con `nextPaymentDate` dentro del periodo actual.
- `metasAhorroComprometidas`: aporte mensual configurado en cada `Goal` activa (`ahorroMensualNecesario`, ver §36). Se toma del compromiso del usuario, no del saldo actual de la meta.
- `pagosDeudaPendientes`: `minimumPayment` de cada `Debt` cuya `paymentDay` cae en el periodo.
- `reservaSeguridad`: monto configurable por el usuario en su perfil (`safetyReserve`, por defecto 0). No es una entidad aparte, es un ajuste de configuración.

Posteriormente puede dividirse por los días restantes del periodo.

```text
disponibleDiario =
dineroDisponible / diasRestantes
```

Ejemplo:

```text
Saldo líquido:              $1.800.000
Facturas pendientes:          $600.000
Meta de ahorro:               $200.000
Pago de deuda:                $300.000

Disponible real:              $700.000
```

Si quedan 10 días:

```text
$700.000 / 10 = $70.000 diarios
```

Mostrar:

> Puedes gastar aproximadamente $70.000 diarios durante el resto del mes manteniendo tus compromisos actuales.

---

# 34. Proyección de fin de mes

Primera implementación sencilla:

```text
gastoDiarioPromedio =
gastosMes / diasTranscurridos

gastoProyectado =
gastoDiarioPromedio * diasTotalesMes
```

Saldo proyectado:

```text
saldoFinalEstimado =
ingresosEsperados
- gastoProyectado
- obligacionesPendientes
```

La implementación debe evitar errores cuando:

- sea el primer día del mes;
- no existan gastos;
- existan datos incompletos.

---

# 35. Mejora futura del pronóstico

Más adelante puede ponderarse el historial.

Ejemplo:

```text
forecast =
0.5 * ritmoMesActual
+ 0.3 * promedioMesAnterior
+ 0.2 * promedioTresMeses
```

También pueden excluirse gastos extraordinarios.

---

# 36. Metas de ahorro

El sistema debe calcular cuánto debería ahorrar el usuario periódicamente.

```text
faltante =
targetAmount - currentAmount
```

Si faltan N meses:

```text
ahorroMensualNecesario =
faltante / mesesRestantes
```

Mostrar:

```text
Meta: Viaje
Objetivo: $4.000.000
Ahorrado: $1.600.000
Progreso: 40%

Necesitas ahorrar aproximadamente
$600.000 por mes.
```

---

# 37. Detección de gastos recurrentes

La primera implementación puede basarse en reglas.

Una transacción puede considerarse potencialmente recurrente cuando:

- descripción similar;
- importe similar;
- misma categoría;
- intervalos de tiempo similares;
- mínimo 3 repeticiones.

Ejemplo:

```text
Netflix
26.900
05/06

Netflix
26.900
05/07

Netflix
26.900
05/08
```

Resultado:

> Posible suscripción detectada: Netflix — $26.900 mensuales.

---

# 38. Algoritmo simple de similitud recurrente

Puede utilizarse:

```text
sameMerchant
AND amountDifference <= tolerance
AND dateInterval ≈ expectedFrequency
```

Tolerancia monetaria sugerida:

```text
±5%
```

Tolerancia temporal:

```text
mensual:
26 - 35 días
```

---

# 39. Suscripciones

La pantalla de suscripciones debe mostrar:

- nombre;
- precio;
- periodicidad;
- próxima fecha;
- categoría;
- costo mensual equivalente;
- costo anual estimado.

Ejemplo:

```text
Netflix       $26.900
Spotify       $17.900
Google One     $8.900

Total mensual: $53.700
Total anual:  $644.400
```

---

# 40. Administración de deudas

El usuario podrá registrar:

- saldo;
- tasa;
- pago mínimo;
- fecha de pago.

El sistema debe soportar dos estrategias.

## Snowball

Ordenar por saldo ascendente.

## Avalanche

Ordenar por tasa de interés descendente.

Debe poder estimar:

- meses necesarios;
- intereses aproximados;
- fecha estimada de liberación.

---

# 41. Financial Score

Función diferencial.

Debe producir un indicador de 0 a 100.

NO presentarlo como una calificación bancaria oficial.

Es únicamente un indicador interno de FinWise.

Componentes posibles:

```text
Control de presupuesto      25 puntos
Tasa de ahorro              25 puntos
Nivel de endeudamiento      25 puntos
Estabilidad de gastos       25 puntos
```

Fórmulas sugeridas (cada componente entrega 0-25):

- **Control de presupuesto** = 25 × (1 − gastoPromedioCategoríasExcedidas / nPresupuestos). 0 si todos los presupuestos excedidos, 25 si ninguno consumido.
- **Tasa de ahorro** = 25 × min(savingsRate / 20%, 1). Alcanza el máximo con ahorro ≥ 20% de los ingresos.
- **Nivel de endeudamiento** = 25 × (1 − min(deudaTotal / (saldoLiquido + deudaTotal), 1)). 25 puntos con deuda 0.
- **Estabilidad de gastos** = 25 × (1 − min(desviacionGastoMesActual vs promedio3Meses, 1)). Penaliza la variabilidad impredecible del gasto.

Estas fórmulas son internas de FinWise y deben documentarse en `docs/` junto con sus pruebas unitarias.

Ejemplo:

```text
78 / 100
Salud financiera: Buena
```

Categorías sugeridas:

```text
0-39    Crítica
40-59   Mejorable
60-79   Buena
80-100  Excelente
```

Las fórmulas deben documentarse claramente.

---

# 42. Simulador financiero

Permitir ingresar una compra hipotética.

Ejemplo:

```text
Compra:
Computador

Valor:
$2.000.000
```

FinWise calculará:

- saldo después de la compra;
- dinero disponible;
- impacto sobre presupuesto;
- impacto sobre metas;
- cambio en proyección mensual;
- posible déficit.

Ejemplo de respuesta:

```text
Saldo después:
$850.000

Dinero disponible diario:
$62.000 → $28.000

Tu meta "Viaje" podría retrasarse aproximadamente 2 meses.
```

---

# 43. Alertas

Las alertas deben generarse mediante reglas.

Ejemplos:

## Presupuesto

```text
if porcentaje >= 80:
    crear alerta
```

## Gasto inusual

Comparar gasto actual contra promedio histórico.

## Pago próximo

Ejemplo:

```text
nextPaymentDate <= today + 3 days
```

## Pronóstico negativo

```text
if saldoFinalEstimado < 0:
    crear alerta crítica
```

## Meta en riesgo

Si el ahorro mensual actual es inferior al necesario.

---

# 44. Comparaciones

El usuario debería poder comparar:

```text
Mes actual vs mes anterior
```

Indicadores:

- ingresos;
- gastos;
- ahorro;
- principales categorías;
- porcentaje de cambio.

Ejemplo:

> Gastaste 14% más en restaurantes que el mes pasado.

---

# 45. Filtros de transacciones

Debe permitirse filtrar por:

- fecha;
- tipo;
- categoría;
- cuenta;
- rango de valores;
- texto;
- movimientos recurrentes.

También ordenar por:

- fecha;
- valor;
- categoría.

---

# 46. Importación CSV

Función de versión 2.

El flujo:

```text
Subir CSV
↓
Mapear columnas
↓
Previsualizar
↓
Validar
↓
Importar
```

Nunca importar automáticamente sin previsualización.

---

# 47. Exportación

Permitir exportar:

- transacciones;
- presupuestos;
- reportes.

Formatos iniciales:

- CSV.

Posteriormente:

- PDF.

---

# 48. API sugerida

Si se utiliza REST:

## Auth

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
```

## Accounts

```text
GET    /api/accounts
POST   /api/accounts
GET    /api/accounts/:id
PATCH  /api/accounts/:id
DELETE /api/accounts/:id
```

## Transactions

```text
GET    /api/transactions
POST   /api/transactions
GET    /api/transactions/:id
PATCH  /api/transactions/:id
DELETE /api/transactions/:id
```

## Categories

```text
GET    /api/categories
POST   /api/categories
PATCH  /api/categories/:id
DELETE /api/categories/:id
```

## Budgets

```text
GET    /api/budgets
POST   /api/budgets
PATCH  /api/budgets/:id
DELETE /api/budgets/:id
```

## Goals

```text
GET    /api/goals
POST   /api/goals
PATCH  /api/goals/:id
DELETE /api/goals/:id

POST   /api/goals/:id/contributions
```

## Dashboard

```text
GET /api/dashboard/summary
GET /api/dashboard/categories
GET /api/dashboard/trends
GET /api/dashboard/alerts
```

## Forecast

```text
GET /api/forecast/month
```

## Safe-to-spend

```text
GET /api/finance/available-to-spend
```

## Recurring

```text
GET  /api/recurring
POST /api/recurring/detect
```

---

# 49. Validaciones

Todas las entradas deben validarse.

Usar preferiblemente:

- Zod.

Ejemplos:

## Transaction

```text
amount > 0
date válida
accountId obligatorio
categoryId obligatorio para gastos/ingresos
description con longitud limitada
```

## Budget

```text
limitAmount > 0
month 1..12
year razonable
```

## Goal

```text
targetAmount > 0
currentAmount >= 0
targetDate futura si está activa
```

---

# 50. Seguridad

La seguridad es obligatoria.

## Autorización

Un usuario nunca debe poder consultar entidades de otro usuario.

Nunca hacer:

```text
findTransactionById(id)
```

sin comprobar ownership.

Debe ser equivalente a:

```text
findTransaction({
  id,
  userId: authenticatedUser.id
})
```

---

# 51. Contraseñas

Si se implementa autenticación propia:

- usar bcrypt o Argon2;
- jamás almacenar contraseñas en texto plano;
- aplicar requisitos mínimos.

Preferiblemente utilizar un proveedor de autenticación probado (Supabase Auth, Auth.js, Clerk).

Cuando el proveedor gestiona la autenticación (caso recomendado), el hashing de contraseñas y la emisión de tokens corren por cuenta del proveedor; FinWise no debe implementar su propio algoritmo de hashing ni almacenar secretos de sesión. El inicio de sesión con Google (§14) habilita `authProvider = GOOGLE` y deja `passwordHash` en `null`.

---

# 52. Seguridad adicional

Implementar:

- validación de inputs;
- prevención de SQL injection mediante ORM;
- protección CSRF según arquitectura;
- protección XSS;
- cookies seguras;
- variables de entorno;
- rate limiting en operaciones sensibles;
- headers seguros;
- logs sin información financiera sensible.

Nunca almacenar tokens o claves API en el repositorio.

---

# 53. Privacidad

Los datos financieros deben considerarse sensibles.

Aplicar:

- principio de mínima información;
- no registrar balances completos en logs;
- evitar exponer IDs innecesarios;
- autorización estricta;
- separación de datos por usuario.

---

# 54. UX

La interfaz debe ser moderna y sencilla.

Inspiración visual conceptual:

- fintech moderna;
- dashboards limpios;
- tarjetas;
- iconografía simple;
- espacios amplios;
- datos fáciles de escanear.

No copiar directamente el diseño de aplicaciones comerciales.

---

# 55. Navegación principal

Sidebar o navegación:

```text
Dashboard
Transacciones
Presupuestos
Metas
Suscripciones
Deudas
Reportes
Configuración
```

---

# 56. Pantalla de Dashboard

Secciones recomendadas:

```text
Header
↓
Resumen financiero
↓
Dinero disponible
↓
Gráfica ingresos vs gastos
↓
Gastos por categoría
↓
Presupuestos
↓
Metas
↓
Alertas
↓
Movimientos recientes
```

---

# 57. Pantalla de Transacciones

Debe incluir:

- buscador;
- filtros;
- botón "Nueva transacción";
- tabla o lista;
- paginación;
- edición;
- eliminación.

Modal/formulario:

```text
Tipo
Monto
Cuenta
Categoría
Fecha
Descripción
Notas
Recurrente
```

---

# 58. Pantalla de presupuestos

Mostrar tarjetas:

```text
Alimentación
$420.000 / $500.000
84%
```

Con barra de progreso.

Permitir:

- crear;
- editar;
- eliminar;
- duplicar presupuesto del mes anterior.

---

# 59. Pantalla de metas

Mostrar:

- nombre;
- monto objetivo;
- monto actual;
- porcentaje;
- fecha objetivo;
- ahorro mensual requerido.

---

# 60. Pantalla de análisis

Mostrar:

- gasto mensual;
- promedio diario;
- principales categorías;
- evolución;
- comparaciones;
- predicción.

---

# 61. Tema oscuro

Puede implementarse posteriormente.

No debe bloquear el MVP.

---

# 62. Responsive

Debe funcionar correctamente en:

- desktop;
- tablet;
- móvil.

Priorizar inicialmente desktop responsive.

---

# 63. Formato monetario

La aplicación debe soportar moneda configurable.

Para el proyecto inicial:

```text
COP
```

Formato colombiano:

```text
$1.250.000
```

Nunca concatenar manualmente strings para moneda.

Utilizar:

```text
Intl.NumberFormat
```

---

# 64. Fechas

La zona horaria inicial puede ser:

```text
America/Bogota
```

La capa de dominio debe evitar errores por conversiones UTC.

Usar librerías cuando sea necesario.

Ejemplos:

- date-fns;
- Luxon.

---

# 65. Testing

Debe existir cobertura para la lógica importante.

Priorizar pruebas para:

- presupuestos;
- saldos;
- dinero disponible;
- forecast;
- metas;
- deudas;
- detección recurrente.

Tipos:

```text
Unit tests
Integration tests
E2E tests
```

Herramientas sugeridas:

- Vitest;
- Jest;
- Playwright.

---

# 66. Casos de prueba importantes

## Presupuesto

Dado:

```text
limit = 500000
spent = 420000
```

Esperado:

```text
84%
WARNING
```

## Forecast

Dado:

```text
gastos = 1000000
día actual = 10
días mes = 30
```

Promedio:

```text
100000
```

Proyección:

```text
3000000
```

---

# 67. Estados vacíos

Toda pantalla debe tener estados vacíos.

Ejemplo:

> Aún no tienes transacciones. Registra tu primer ingreso o gasto para comenzar a analizar tus finanzas.

Evitar pantallas simplemente vacías.

---

# 68. Manejo de errores

Mostrar mensajes claros.

Incorrecto:

```text
Error 500.
```

Correcto:

> No pudimos guardar la transacción. Inténtalo nuevamente.

Los detalles técnicos deben registrarse internamente.

---

# 69. Performance

Evitar recalcular datos históricos completos en cada petición cuando el volumen crezca.

Inicialmente pueden calcularse bajo demanda.

Más adelante considerar:

- agregaciones;
- índices;
- caching;
- tablas de resumen.

---

# 70. Índices de base de datos

Considerar índices en:

```text
transactions(userId)
transactions(userId, date)
transactions(userId, categoryId)
transactions(accountId)
budgets(userId, year, month)
alerts(userId, read)
```

---

# 71. Accesibilidad

La aplicación debe intentar cumplir buenas prácticas:

- contraste;
- labels;
- navegación por teclado;
- botones claros;
- estados focus;
- aria-label cuando corresponda.

---

# 72. Inteligencia artificial

La IA NO es obligatoria para el MVP.

No incorporar un LLM simplemente por marketing.

Primero resolver correctamente:

```text
datos
reglas
algoritmos
predicciones
```

Después se puede añadir IA.

---

# 73. Posible asistente financiero

Versión futura.

Preguntas posibles:

```text
¿En qué gasté más este mes?

¿Cuánto gasté en restaurantes?

¿Estoy gastando más que el mes pasado?

¿Cuánto puedo gastar esta semana?

¿Cómo voy con mi meta del viaje?
```

El asistente debe responder usando datos propios de FinWise.

Nunca debe inventar movimientos.

---

# 74. Arquitectura futura para IA

Idealmente:

```text
Usuario
↓
Pregunta
↓
Intent detection
↓
Herramientas internas
↓
Consultas financieras
↓
Respuesta explicada
```

No permitir que el LLM tenga acceso SQL directo sin una capa controlada.

---

# 75. Restricciones del asistente IA

El asistente NO debe:

- ejecutar movimientos financieros;
- prometer rendimientos;
- dar asesoría financiera profesional;
- inventar datos;
- afirmar certeza en predicciones;
- modificar información sin confirmación.

---

# 76. Datos demo

Crear seed de desarrollo.

Usuario ejemplo:

```text
Nombre: Demo User
Moneda: COP
```

Cuentas:

```text
Cuenta Bancolombia
Nequi
Efectivo
Tarjeta de crédito
```

Transacciones:

- salario;
- arriendo;
- supermercado;
- restaurantes;
- transporte;
- Netflix;
- Spotify;
- servicios;
- gimnasio.

Esto facilitará demostraciones.

---

# 77. Datos simulados

Para desarrollo debe existir un script:

```text
npm run db:seed
```

Debe generar al menos:

- 1 usuario;
- 4 cuentas;
- 10 categorías;
- 60+ transacciones;
- 5 presupuestos;
- 2 metas;
- 3 suscripciones;
- 2 deudas;
- alertas.

---

# 78. Convenciones de código

Usar:

- TypeScript estricto;
- nombres descriptivos;
- funciones pequeñas;
- separación de responsabilidades;
- módulos de dominio;
- validaciones centralizadas.

Evitar:

- `any`;
- lógica financiera dentro de JSX;
- queries duplicadas;
- componentes gigantes;
- constantes mágicas.

---

# 79. Reglas para dinero

Crear utilidades centrales.

Ejemplo:

```text
formatMoney()
addMoney()
subtractMoney()
percentage()
```

Toda operación monetaria debe usar un formato consistente.

---

# 80. Reglas para el agente de código

El agente de desarrollo debe seguir estas instrucciones durante todo el proyecto.

## Regla 1

Antes de implementar una función grande:

1. revisar arquitectura existente;
2. revisar modelo de datos;
3. identificar módulos afectados;
4. evitar duplicar funcionalidad.

## Regla 2

No modificar arquitectura fundamental sin justificarlo.

## Regla 3

No crear lógica financiera directamente en componentes UI.

## Regla 4

Toda nueva funcionalidad debe incluir:

- validaciones;
- manejo de errores;
- autorización;
- tipos;
- pruebas cuando tenga lógica relevante.

## Regla 5

No eliminar funcionalidades existentes para resolver errores salvo que sea estrictamente necesario.

## Regla 6

Los cambios de esquema deben incluir migración.

## Regla 7

Después de cambios importantes ejecutar:

```text
lint
typecheck
tests
build
```

## Regla 8

Nunca crear código inseguro simplemente para acelerar el desarrollo.

---

# 81. Definition of Done

Una funcionalidad se considera terminada cuando:

- funciona;
- tiene interfaz usable;
- tiene validación;
- controla permisos;
- maneja errores;
- persiste correctamente;
- responde bien en móvil/desktop razonablemente;
- no rompe tests;
- no rompe el build.

Para lógica financiera:

- debe tener pruebas unitarias.

---

# 82. Roadmap recomendado

## Fase 1 — Setup

- Next.js;
- TypeScript;
- Tailwind;
- UI library;
- Prisma;
- PostgreSQL;
- Auth;
- layout base.

## Fase 2 — Core financiero

- cuentas;
- categorías;
- transacciones;
- saldos.

## Fase 3 — Dashboard

- KPIs;
- gráficas;
- resumen;
- transacciones recientes.

## Fase 4 — Presupuestos

- CRUD;
- progreso;
- alertas.

## Fase 5 — Metas

- CRUD;
- contribuciones;
- cálculos.

## Fase 6 — Inteligencia financiera

- disponible para gastar;
- forecast;
- tendencias;
- alertas.

## Fase 7 — Recurrencias

- detección;
- suscripciones.

## Fase 8 — Deudas

- deudas;
- pagos;
- snowball;
- avalanche.

## Fase 9 — Extras

- Financial Score;
- simulador;
- importación CSV;
- reportes.

---

# 83. Orden recomendado para programar

No empezar por IA.

Orden:

```text
1. Base de datos
2. Autenticación
3. Cuentas
4. Categorías
5. Transacciones
6. Dashboard
7. Presupuestos
8. Metas
9. Alertas
10. Forecast
11. Dinero disponible
12. Recurrentes
13. Suscripciones
14. Deudas
15. Simulador
16. IA
```

---

# 84. Historias de usuario principales

## HU-01

Como usuario quiero registrarme para tener un espacio financiero personal.

## HU-02

Como usuario quiero crear cuentas para representar dónde tengo mi dinero.

## HU-03

Como usuario quiero registrar gastos para saber en qué estoy utilizando mi dinero.

## HU-04

Como usuario quiero registrar ingresos para conocer mi flujo financiero.

## HU-05

Como usuario quiero categorizar movimientos para analizar mis hábitos.

## HU-06

Como usuario quiero definir presupuestos para controlar mis gastos.

## HU-07

Como usuario quiero recibir alertas cuando me acerco al límite de un presupuesto.

## HU-08

Como usuario quiero visualizar estadísticas para entender mi comportamiento financiero.

## HU-09

Como usuario quiero crear metas para organizar mi ahorro.

## HU-10

Como usuario quiero saber cuánto puedo gastar sin comprometer mis obligaciones.

## HU-11

Como usuario quiero conocer una estimación de cuánto gastaré al finalizar el mes.

## HU-12

Como usuario quiero identificar pagos recurrentes para controlar suscripciones y compromisos.

## HU-13

Como usuario quiero registrar mis deudas para crear un plan de pago.

## HU-14

Como usuario quiero simular una compra para conocer cómo afectaría mis finanzas.

---

# 85. Requisitos no funcionales

## Seguridad

Toda consulta debe limitarse al usuario autenticado.

## Rendimiento

Las páginas principales deberían cargar en tiempos razonables.

## Escalabilidad

El modelo debe permitir múltiples cuentas y miles de transacciones.

## Usabilidad

Las funciones principales deben ser comprensibles sin instrucciones extensas.

## Compatibilidad

Navegadores modernos.

## Mantenibilidad

Código modular y documentado.

---

# 86. KPIs del producto

Métricas internas que podrían utilizarse:

- usuarios activos;
- número de transacciones;
- presupuestos activos;
- porcentaje de presupuestos cumplidos;
- metas completadas;
- alertas atendidas;
- recurrencias detectadas.

Para el proyecto universitario no es obligatorio implementar telemetría real.

---

# 87. Métricas financieras mostradas

Dashboard:

```text
Total Balance
Monthly Income
Monthly Expenses
Net Cash Flow
Savings Rate
Available to Spend
Forecasted End Balance
```

Fórmulas:

```text
netCashFlow =
income - expenses
```

```text
savingsRate =
(income - expenses) / income * 100
```

Controlar división por cero.

---

# 88. Terminología

Usar de forma consistente.

Preferir:

```text
Cuenta
Transacción
Ingreso
Gasto
Categoría
Presupuesto
Meta
Suscripción
Deuda
Alerta
```

Evitar cambiar nombres entre pantallas.

---

# 89. Consideraciones de tarjetas de crédito

Una tarjeta no debe tratarse exactamente igual que una cuenta de efectivo.

Los campos específicos ya forman parte de la entidad `Account` (§18):

```text
creditLimit
availableCredit
paymentDueDate
```

`currentDebt` se deriva del saldo de la cuenta (saldo negativo o deudas asociadas). El cálculo de `availableCredit = creditLimit - currentDebt` debe hacerse en la capa de dominio, no en la UI.

La tarjeta se modela como cuenta tipo `CREDIT_CARD` y su deuda se considera pasivo en el dinero disponible (§33).

---

# 90. Transferencias

Transferencia entre cuentas:

```text
Cuenta A → Cuenta B
```

No debe afectar ingreso/gasto global.

Modelo adoptado: **dos registros `Transaction` ligados** mediante `transferGroupId` (campo opcional añadido en §19), ambos con `type = TRANSFER`. Uno representa la salida en la cuenta origen y otro la entrada en la cuenta destino; el `amount` es idéntico en ambos. Esto evita crear una entidad nueva y reutiliza los filtros y permisos existentes.

Regla:

```text
transferencia != ingreso
transferencia != gasto
```

---

# 91. Borrado de datos

Preferir soft-delete cuando sea relevante.

Especialmente:

- cuentas;
- categorías.

No permitir borrar una categoría utilizada sin:

- reasignar movimientos;

o

- archivarla.

Las entidades `Account` (§18) y `Category` (§20) incluyen el campo `deletedAt` para soft-delete; las consultas deben filtrar `deletedAt IS NULL` por defecto. Las transacciones asociadas no se eliminan, solo se ocultan las cuentas/categorías borradas.

---

# 92. Precisión financiera

Redondear únicamente en presentación cuando sea posible.

No realizar redondeos intermedios innecesarios.

---

# 93. Estado global

No introducir Redux salvo que exista una necesidad clara.

Preferir:

- Server Components;
- React Query/TanStack Query si hace falta;
- estado local;
- server state.

---

# 94. Formularios

Sugerencia:

- React Hook Form;
- Zod.

Los errores deben aparecer junto al campo correspondiente.

---

# 95. Auditoría simple

Para entidades importantes mantener:

```text
createdAt
updatedAt
```

Puede añadirse:

```text
deletedAt
```

si se utiliza soft-delete.

---

# 96. Logs

Loggear:

- errores;
- eventos de sistema relevantes.

No loggear:

- contraseñas;
- tokens;
- números financieros sensibles innecesarios.

---

# 97. Documentación

Mantener:

```text
README.md
docs/
```

Documentar:

- instalación;
- variables de entorno;
- migraciones;
- seed;
- scripts;
- arquitectura;
- reglas financieras.

---

# 98. Variables de entorno

Ejemplo:

```text
DATABASE_URL=
NEXT_PUBLIC_APP_URL=
AUTH_SECRET=
```

Nunca subir `.env` real.

Crear:

```text
.env.example
```

---

# 99. Scripts esperados

```json
{
  "dev": "...",
  "build": "...",
  "lint": "...",
  "typecheck": "...",
  "test": "...",
  "db:migrate": "...",
  "db:seed": "..."
}
```

---

# 100. Criterio académico diferenciador

La aplicación NO debe presentarse como:

> Una app para registrar gastos.

Debe presentarse como:

> **Un sistema web de apoyo a decisiones financieras personales capaz de transformar movimientos económicos en presupuestos, métricas, alertas y predicciones que ayuden al usuario a comprender y anticipar su situación financiera.**

---

# 101. Propuesta de valor

FinWise busca responder una pregunta que una aplicación bancaria tradicional normalmente no responde:

> **¿Cuánto puedo gastar realmente sin perjudicar mis compromisos y objetivos financieros?**

Esta pregunta debe guiar varias decisiones de producto.

---

# 102. Flujo conceptual principal

```text
Usuario registra movimiento
          ↓
Se actualiza su cuenta
          ↓
Se actualizan métricas
          ↓
Se recalculan presupuestos
          ↓
Se evalúan alertas
          ↓
Se recalcula forecast
          ↓
Se recalcula dinero disponible
          ↓
Dashboard muestra nueva situación
```

---

# 103. Principio para nuevas funcionalidades

Toda nueva función debe justificar al menos uno de estos objetivos:

```text
Registrar
Analizar
Predecir
Recomendar
```

Si no aporta a ninguno, evaluar si realmente debe incluirse.

---

# 104. Prompt permanente para el agente

Cuando este documento se utilice como contexto de un agente de programación, asumir lo siguiente:

> Estás trabajando en FinWise, una aplicación web universitaria de gestión e inteligencia financiera personal. Tu prioridad es mantener una arquitectura limpia, segura, modular y demostrable académicamente.
>
> Antes de generar código, revisa la estructura existente del repositorio.
>
> No reemplaces tecnologías existentes sin una razón técnica importante.
>
> No implementes lógica financiera crítica directamente en componentes UI.
>
> Toda funcionalidad debe respetar autenticación, autorización por usuario, validación de datos y precisión monetaria.
>
> Si existe ambigüedad, elige la solución más sencilla que mantenga el proyecto extensible.
>
> Prioriza terminar correctamente el MVP antes de introducir inteligencia artificial o integraciones bancarias.
>
> Cada implementación debe incluir los cambios necesarios en tipos, esquema de datos, migraciones, API, UI y pruebas cuando corresponda.
>
> Antes de considerar una tarea terminada, verifica lint, typecheck, tests y build.
>
> No inventes requisitos financieros que contradigan este documento. Si propones una mejora significativa, explica primero su impacto en alcance y arquitectura.

---

# 105. Prioridad actual

El objetivo inicial recomendado es completar esta secuencia:

```text
Setup
↓
Auth
↓
Accounts
↓
Categories
↓
Transactions
↓
Dashboard
↓
Budgets
↓
Goals
↓
Forecast
↓
Available To Spend
↓
Alerts
```

Cuando estos módulos sean estables, avanzar con:

```text
Recurring
Subscriptions
Debts
Financial Score
Simulator
AI Assistant
```

---

# 106. Resultado esperado del proyecto

Al finalizar, un usuario debería poder:

1. crear una cuenta;
2. registrar sus cuentas financieras;
3. registrar ingresos y gastos;
4. organizar movimientos por categorías;
5. visualizar su situación financiera;
6. crear presupuestos;
7. crear metas;
8. recibir alertas;
9. identificar gastos recurrentes;
10. saber aproximadamente cuánto puede gastar;
11. conocer una estimación de su balance a final de mes;
12. analizar sus hábitos;
13. planificar decisiones financieras.

---

# 107. Regla final

El éxito de FinWise no depende de tener la mayor cantidad posible de funciones.

Depende de que las funciones principales estén:

- correctamente implementadas;
- bien relacionadas;
- visualmente claras;
- respaldadas por reglas de negocio;
- protegidas por seguridad;
- demostrables en una presentación universitaria.

Primero construir una base sólida.

Después ampliar.

---

## Fin del contexto maestro
