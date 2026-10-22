# FinWise — Plan de Ejecución por Fases para Kilo

> Documento operativo para implementación asistida por IA.
>
> Ubicación recomendada:
>
> `contexto/planificacion/PLAN_EJECUCION_KILO.md`
>
> Este documento NO reemplaza `AGENTS.md` ni `FINWISE_CONTEXTO_MAESTRO.md`.
>
> Su función es definir **qué construir, en qué orden, cómo validar y cuándo detenerse**.

---

# 0. Regla principal

Kilo NO debe intentar construir FinWise completo en una sola ejecución.

Debe trabajar siempre así:

```text
una fase
→ implementar
→ validar
→ revisar diff
→ resumir
→ detenerse
→ esperar autorización
```

Está prohibido interpretar este documento como:

```text
"construye todo el proyecto"
```

Cada fase es un límite explícito de alcance.

---

# 1. Autoridad documental

Kilo debe usar `AGENTS.md` como router de contexto.

No debe cargar todos los `.md` completos en cada tarea.

Orden de autoridad:

```text
1. Seguridad y privacidad
2. Integridad financiera
3. FINWISE_CONTEXTO_MAESTRO.md
4. MODELO_DATOS_Y_SEGURIDAD.md
5. ARQUITECTURA_TECNICA.md
6. ADRs aplicables
7. CASOS_DE_USO_Y_FLUJOS.md
8. SISTEMA_DISENO_FINWISE.md
9. WIREFRAMES_Y_PANTALLAS.md
10. GESTION_GITHUB_Y_RAMAS.md
11. POLITICA_EFICIENCIA_AGENTES.md
12. Este plan
13. Preferencia del agente
```

---

# 2. Política de eficiencia

Modo por defecto:

```text
MODO ECONÓMICO
```

Antes de explorar:

```text
1. búsqueda exacta si se conoce símbolo/ruta
2. semantic search si se conoce el concepto
3. seleccionar pocos candidatos
4. leer archivos relevantes
5. ampliar solo si falta contexto
```

Objetivo inicial:

```text
5–10 resultados semánticos
→ 3–8 archivos relevantes
```

No:

- recorrer todo el repo;
- leer todos los documentos;
- hacer refactors preventivos;
- implementar mejoras fuera de fase;
- instalar dependencias por comodidad;
- repetir indefinidamente el mismo intento.

Máximo orientativo:

```text
2 intentos sustancialmente similares
```

Después:

```text
cambiar estrategia
```

o:

```text
reportar bloqueo
```

Cuando la tarea esté cumplida:

```text
STOP
```

---

# 3. Recuperación después de errores

Si Kilo se detiene por un error de herramienta, API, escritura o ejecución:

```text
NO reiniciar la fase
```

Flujo obligatorio:

```text
error
→ git status
→ git diff
→ identificar trabajo válido
→ identificar operación pendiente
→ continuar solo desde ese punto
```

Reglas:

1. No reiniciar automáticamente la fase.
2. No repetir la misma llamada inválida.
3. No deshacer cambios correctos.
4. Revisar archivos ya creados o modificados.
5. Identificar el último punto completado.
6. Continuar únicamente desde la operación pendiente.
7. Si una herramienta falla por argumentos inválidos, corregir formato o cambiar estrategia.
8. Máximo 2 intentos sustancialmente similares.
9. Si persiste el error, detenerse y reportar:
   - archivo objetivo;
   - operación pendiente;
   - error;
   - posible siguiente paso.

Nunca:

```text
error
→ borrar trabajo
→ reiniciar todo
```

---

# 4. Regla Git

Ramas permanentes:

```text
main
staging
```

Nunca trabajar directamente sobre ellas.

Antes de una rama normal:

```bash
git switch staging
git fetch origin
git pull --ff-only origin staging
git switch -c <rama>
```

Antes del PR:

```bash
git fetch origin
git merge origin/staging
```

Resolver conflictos EN LA RAMA DE TRABAJO.

Nunca modificar `staging` para acomodar una feature.

---

# 5. Checks oficiales

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Durante una tarea pequeña puede usar tests específicos.

Antes de cerrar una fase que cambió aplicación/configuración, los checks correspondientes deben quedar verdes.

---

# 6. Estado esperado al comenzar

Verificar, no asumir:

```text
Next.js 16.4.x
React 19.x
TypeScript strict
Tailwind CSS 4
shadcn/ui
Radix
Luma
Lucide
Vitest
pnpm
AGENTS.md
contexto/
.agents/
.kilo/
```

También pueden existir:

```text
Supabase dependencies
Supabase CLI
Playwright
```

La Fase 0 debe confirmar el estado real.

---

# 7. Mapa general

```text
FASE 0  Auditoría del estado actual
FASE 1  Fundación técnica
FASE 2  Sistema visual base
FASE 3  Supabase local y clientes
FASE 4  Modelo de datos P0
FASE 5  Seguridad RLS y perfil
FASE 6  Autenticación
FASE 7  App shell + onboarding
FASE 8  Cuentas
FASE 9  Categorías
FASE 10 Motor de transacciones
FASE 11 Registro de ingreso
FASE 12 Registro de gasto
FASE 13 Obligaciones
FASE 14 Reserva de seguridad
FASE 15 Motor de saldo líquido y disponible
FASE 16 Dashboard MVP
FASE 17 Movimientos e historial mínimo
FASE 18 Estados, accesibilidad y responsive
FASE 19 PWA
FASE 20 Hardening de seguridad y datos
FASE 21 E2E crítico
FASE 22 CI/CD GitHub Actions
FASE 23 Vercel + producción
FASE 24 Cierre MVP académico
```

No comenzar P1/P2 antes de cerrar el MVP académico.

---

# FASE 0 — Auditoría del estado actual

## Objetivo

Determinar exactamente qué existe antes de modificar.

## Rama

No es necesario crear una rama si solo se inspecciona.

Si se requieren correcciones:

```text
mantenimiento/fundacion-tecnica
```

## Contexto mínimo

```text
AGENTS.md
package.json
tsconfig.json
eslint.config.mjs
vitest.config.*
components.json
src/
supabase/ si existe
```

## Tareas

1. Confirmar rama actual.
2. Inspeccionar `package.json`.
3. Confirmar scripts:
   - dev
   - build
   - start
   - lint
   - typecheck
   - test
   - test:watch
4. Confirmar versiones principales.
5. Confirmar shadcn:
   - Radix
   - Luma
   - Lucide
6. Confirmar Vitest.
7. Confirmar Playwright.
8. Confirmar Supabase CLI.
9. Ejecutar:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## No hacer

- no instalar;
- no refactorizar;
- no cambiar diseño;
- no crear base de datos.

## Entrega esperada

```text
Estado actual:
Checks:
Faltantes para Fase 1:
Bloqueos:
```

## STOP

Detenerse después de reportar el estado.

---

# FASE 1 — Fundación técnica

## Objetivo

Cerrar la configuración general antes de construir funcionalidades.

## Rama

```text
mantenimiento/fundacion-tecnica
```

## Contexto

```text
AGENTS.md
FINWISE_CONTEXTO_MAESTRO.md
ARQUITECTURA_TECNICA.md
CONVENCIONES_DESARROLLO.md
```

Leer solo secciones relacionadas con stack y estructura.

## Verificar/instalar solo si falta

```text
@supabase/supabase-js
@supabase/ssr
decimal.js
zod
react-hook-form
@hookform/resolvers
date-fns
recharts
motion
lucide-react
@playwright/test
supabase
```

Asegurar scripts:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "typecheck": "tsc --noEmit",
  "test": "vitest run",
  "test:watch": "vitest"
}
```

Asegurar que ESLint ignore:

```text
.agents/**
.kilo/**
.next/**
coverage/**
```

Mantener:

```text
TypeScript strict
src directory
App Router
@/* alias
```

## Aceptación

```text
pnpm lint       PASS
pnpm typecheck  PASS
pnpm test       PASS
pnpm build      PASS
```

## No hacer

- Auth;
- DB;
- layout final;
- tokens visuales avanzados.

## STOP

---

# FASE 2 — Sistema visual base

## Objetivo

Crear la base visual FinWise antes de construir pantallas.

## Rama

```text
funcionalidad/sistema-visual-base
```

## Contexto

```text
SISTEMA_DISENO_FINWISE.md
WIREFRAMES_Y_PANTALLAS.md
```

Solo reglas globales.

## Decisiones obligatorias

```text
Primary        #2563EB
Accent         #06B6D4
Dark bg        #0B1220
Dark surface   #111827
Heading font   Manrope
UI/data font   Geist
shadcn         Radix + Luma
icons          Lucide
```

## Tareas

1. Configurar Geist y Manrope con `next/font`.
2. Crear tokens CSS globales.
3. Ajustar radios y sombras base.
4. Soportar:
   - light
   - dark
   - system
5. Definir tokens semánticos:
   - background
   - foreground
   - surface
   - primary
   - accent
   - success
   - warning
   - danger
   - muted
6. Crear presets Motion compartidos mínimos.
7. No aplicar glass globalmente.
8. Mantener shadcn como base, no identidad final.

## Componentes permitidos

Solo los necesarios:

```text
Button
Card
Input
Label
Separator
Skeleton
Sheet
Dialog
Dropdown/Menu si hace falta
```

No instalar todo shadcn.

## Aceptación

- light y dark visibles;
- tipografías correctas;
- tokens reutilizables;
- ningún color crítico repetido innecesariamente;
- build verde.

## STOP

No diseñar Dashboard completo.

---

# FASE 3 — Supabase local y clientes

## Objetivo

Configurar infraestructura Supabase reproducible.

## Rama

```text
mantenimiento/supabase-base
```

## Contexto

```text
ARQUITECTURA_TECNICA.md
MODELO_DATOS_Y_SEGURIDAD.md
ADR-002
ADR-007
```

## Tareas

1. Verificar `supabase/config.toml`.
2. Si no existe:

```bash
pnpm supabase init
```

3. Confirmar runtime de contenedores.
4. Iniciar Supabase local cuando corresponda:

```bash
pnpm supabase start
```

5. Crear `.env.example`.
6. Mantener `.env.local` fuera de Git.
7. Crear clientes:
   - browser
   - server
8. Configurar SSR/cookies según las versiones instaladas.
9. Nunca exponer service role.

Estructura orientativa:

```text
src/lib/supabase/
├── client.ts
└── server.ts
```

Usar nombres compatibles con la versión actual de Next.js/Supabase.

## Aceptación

- Supabase local inicia;
- cliente browser compila;
- cliente server compila;
- variables documentadas;
- checks verdes.

## STOP

No crear tablas todavía.

---

# FASE 4 — Modelo de datos P0

## Objetivo

Crear solamente el schema necesario para el MVP académico.

## Rama

```text
funcionalidad/modelo-datos-p0
```

## Contexto obligatorio

```text
MODELO_DATOS_Y_SEGURIDAD.md
FINWISE_CONTEXTO_MAESTRO.md
```

## Entidades P0

```text
profiles
accounts
categories
transactions
obligations
```

No crear todavía:

```text
budgets
goals
subscriptions
debts
alerts
```

## Dinero

```text
numeric(20,4)
```

## Fechas

Financieras:

```text
date
```

Técnicas:

```text
timestamptz
```

## Migraciones orientativas

```text
base helpers/types
profiles
accounts/categories
transactions
obligations
```

Usar nombres/timestamps reales de Supabase CLI.

## Constraints

- `user_id`;
- amount > 0;
- ownership;
- tipos válidos;
- soft delete;
- currency code;
- relaciones coherentes.

## No persistir

```text
current account balance
liquid balance
available-to-spend
dashboard summary
```

## Aceptación

```bash
pnpm supabase db reset
```

reconstruye DB desde cero sin intervención manual.

## STOP

No UI.

---

# FASE 5 — Seguridad RLS y perfil

## Objetivo

Cerrar seguridad de datos antes de exponer CRUD.

## Rama

Puede continuar en:

```text
funcionalidad/modelo-datos-p0
```

si sigue siendo el mismo PR pequeño.

Si no:

```text
funcionalidad/rls-p0
```

## Contexto

```text
MODELO_DATOS_Y_SEGURIDAD.md
ADR-002-ACCESO-DATOS-Y-RLS.md
ESTRATEGIA_PRUEBAS.md
```

## Reglas

Toda tabla financiera:

```text
RLS ON
```

Policies explícitas para usuario autenticado.

Patrón:

```text
(select auth.uid()) = user_id
```

según operación.

Profiles:

```text
self SELECT
self UPDATE
```

Creación de profile:

- trigger controlado tras signup;
- probar fallos;
- no duplicar email.

## Pruebas mínimas

Usuario A:

```text
lee A
escribe A
```

Usuario B:

```text
NO lee A
NO modifica A
```

Anon:

```text
NO accede
```

## Aceptación

RLS probado antes de CRUD.

## STOP

---

# FASE 6 — Autenticación

## Objetivo

Implementar acceso real a FinWise.

## Rama

```text
funcionalidad/autenticacion
```

## Contexto

```text
UC-01
UC-02
UC-03
UC-04
ARQUITECTURA_TECNICA.md auth
SISTEMA_DISENO_FINWISE.md auth
```

## Alcance

```text
registro
login
logout
recuperación si corresponde
protección de rutas
```

No OAuth adicional inicialmente.

## Pantallas

```text
/login
/registro
```

## Seguridad

- Server Actions;
- Zod;
- mensajes seguros;
- no revelar existencia de cuenta indebidamente.

## Aceptación

```text
registrarse
→ profile existe
→ iniciar sesión
→ acceder área privada
→ cerrar sesión
```

## STOP

No crear Dashboard real todavía.

---

# FASE 7 — App shell + onboarding

## Objetivo

Crear estructura privada usable y primera configuración.

## Rama

```text
funcionalidad/onboarding
```

## Contexto

```text
UC-05
UC-06
WIREFRAMES_Y_PANTALLAS.md
SISTEMA_DISENO_FINWISE.md
```

## Mobile

```text
Inicio
Movimientos
+
Metas
Más
```

Los módulos no implementados deben ocultarse o deshabilitarse de forma honesta.

## Desktop

Sidebar flotante/colapsable.

## Onboarding mínimo

```text
display name si aplica
moneda COP default
primera cuenta
saldo inicial
```

## Aceptación

```text
signup
→ onboarding
→ crea primera cuenta
→ entra a la app
```

## STOP

---

# FASE 8 — Cuentas

## Rama

```text
funcionalidad/cuentas
```

## Contexto

```text
UC-06
UC-07
UC-08
MODELO_DATOS_Y_SEGURIDAD.md accounts
```

## Tipos

```text
CASH
CHECKING
SAVINGS
CREDIT_CARD
DIGITAL_WALLET
OTHER
```

## Reglas

No persistir:

```text
currentBalance
```

El balance deriva del ledger.

UI:

```text
crear
editar
archivar
```

No hard delete normal.

## Aceptación

Ownership y RLS demostrados.

## STOP

---

# FASE 9 — Categorías

## Rama

```text
funcionalidad/categorias
```

## Tipos

```text
INCOME
EXPENSE
```

## Reglas

- user-owned;
- sin duplicados activos por tipo/nombre;
- categoría INCOME no sirve para EXPENSE.

Defaults sugeridos:

```text
Ingresos:
Salario
Honorarios
Otros ingresos

Gastos:
Alimentación
Transporte
Vivienda
Servicios
Salud
Educación
Entretenimiento
Otros
```

## STOP

---

# FASE 10 — Motor de transacciones

## Rama

```text
funcionalidad/motor-transacciones
```

## Contexto

```text
MODELO_DATOS_Y_SEGURIDAD.md transactions
ARQUITECTURA_TECNICA.md
CONVENCIONES_DESARROLLO.md
```

## Dominio

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

Transferencia:

```text
TRANSFER + OUTFLOW
TRANSFER + INFLOW
```

Monto siempre:

```text
> 0
```

## Arquitectura

Implementar razonablemente:

```text
application use cases
domain validation/calculation
infrastructure repository
```

sin sobreingeniería.

## Tests

Unit tests obligatorios de invariantes.

## STOP

No construir transferencias UI si no son necesarias aún.

---

# FASE 11 — Registro de ingreso

## Rama

```text
funcionalidad/registro-ingresos
```

## Form

```text
amount
category
account
date
note opcional
```

## Stack

```text
React Hook Form
Zod
Server Action
```

## UX

- amount protagonista;
- mobile first;
- CTA claro;
- feedback de guardado.

## Aceptación

```text
persiste
→ aparece en ledger
→ afecta balance
```

## STOP

---

# FASE 12 — Registro de gasto

## Rama

```text
funcionalidad/registro-gastos
```

## Contexto

```text
UC-10
WIREFRAMES quick expense
SISTEMA_DISENO_FINWISE
```

## Form

```text
amount
category
account
date
note
```

Gasto debe ser la acción priorizada de Quick Create.

Persistencia:

```text
EXPENSE + OUTFLOW
```

## Aceptación

- guarda;
- ownership correcto;
- balance derivado cambia;
- tests relevantes pasan.

## STOP

---

# FASE 13 — Obligaciones

## Rama

```text
funcionalidad/obligaciones
```

## Contexto

```text
UC-14
UC-15
UC-16
MODELO_DATOS_Y_SEGURIDAD.md obligations
```

## Campos P0

```text
name
amount
due_date
status
description opcional
```

## Reglas

```text
pendiente reduce disponible
pendiente NO cambia saldo bancario
marcar pagada NO crea gasto automáticamente
```

## UI

```text
crear
editar
marcar pagada
```

## STOP

---

# FASE 14 — Reserva de seguridad

## Rama

```text
funcionalidad/reserva-seguridad
```

## Persistencia

```text
profiles.safety_reserve
```

Default:

```text
0
```

Regla:

```text
NO cambia saldo
SÍ reduce disponible
```

## STOP

---

# FASE 15 — Motor de saldo líquido y disponible

## Objetivo

Implementar el corazón académico de FinWise.

## Rama

```text
funcionalidad/dinero-disponible
```

## Contexto obligatorio

```text
FINWISE_CONTEXTO_MAESTRO.md
MODELO_DATOS_Y_SEGURIDAD.md
CASOS_DE_USO_Y_FLUJOS.md
ADR-003-PRECISION-MONETARIA.md
```

## Dominio puro

Implementar:

```text
calculateAccountBalance()
calculateLiquidBalance()
calculateAvailableToSpend()
```

Usar:

```text
decimal.js
```

No usar `number` para cálculos monetarios críticos.

## Saldo líquido

Incluir:

```text
CASH
CHECKING
SAVINGS
DIGITAL_WALLET
```

Excluir:

```text
CREDIT_CARD
credit_limit
available_credit
```

## Fórmula MVP

```text
available =
liquidBalance
- pendingObligations
- safetyReserve
```

## Escenarios obligatorios

Normal:

```text
Saldo        1.800.000
Obligaciones   600.000
Reserva        200.000
Disponible   1.000.000
```

Déficit:

```text
Saldo          500.000
Obligaciones   600.000
Reserva        100.000
Disponible    -200.000
```

Tarjeta:

```text
compra NO reduce liquid balance inmediatamente
```

Transferencia:

```text
no es ingreso/gasto
```

## Tests

Cubrir:

- cero;
- déficit;
- varias cuentas;
- tarjeta;
- transferencias;
- soft-deleted transactions;
- fechas/periodo cuando aplique.

## STOP

No Financial Score.

---

# FASE 16 — Dashboard MVP

## Rama

```text
funcionalidad/dashboard-mvp
```

## Contexto

```text
WIREFRAMES_Y_PANTALLAS.md dashboard
SISTEMA_DISENO_FINWISE.md
UC-18
UC-19
UC-20
```

## Orden mobile

```text
Header
Disponible hero
Ingresos/Gastos
Cash flow simple
Insight/alerta si hay dato real
Movimientos recientes
```

## Protagonista

```text
DINERO DISPONIBLE
```

No saldo total.

## Breakdown

```text
Saldo líquido
Compromisos
Reserva
Disponible
```

## Déficit

No:

```text
Puedes gastar -$200.000
```

Sí:

```text
Tus compromisos actuales superan tu saldo líquido...
```

No inventar tendencias.

## Aceptación

El usuario entiende rápidamente:

```text
cuánto tiene
cuánto está comprometido
cuánto puede gastar
```

## STOP

---

# FASE 17 — Movimientos e historial mínimo

## Rama

```text
funcionalidad/movimientos
```

## Alcance

```text
lista
orden por fecha
tipo
categoría
cuenta
monto
detalle básico
```

No añadir filtros complejos si no son necesarios.

Edición/eliminación puede posponerse.

Si se implementa eliminación:

```text
soft delete
```

## STOP

---

# FASE 18 — Estados, accesibilidad y responsive

## Rama

```text
correccion/estados-accesibilidad
```

## Revisar

```text
loading
empty
error
retry
disabled
success
warning
```

## Accesibilidad

```text
WCAG AA
focus
keyboard
labels
44x44 touch target
reduced motion
contraste
no color-only
```

## Responsive

```text
mobile
tablet razonable
desktop
```

Mobile sigue teniendo prioridad.

## STOP

---

# FASE 19 — PWA

## Rama

```text
funcionalidad/pwa
```

## Alcance

```text
manifest
icons
maskable icon
apple-touch-icon
display standalone
theme colors
safe areas
```

No implementar sincronización financiera offline.

## STOP

---

# FASE 20 — Hardening de seguridad y datos

## Rama

```text
pruebas/seguridad-p0
```

## Auditar

```text
RLS
ownership
anon
service role
env
soft delete
money precision
currency
dates
Supabase clients
Server Actions
validation
```

Pruebas A/B/anon obligatorias.

No cambiar arquitectura si no aparece un problema real.

## STOP

---

# FASE 21 — E2E crítico

## Rama

```text
pruebas/e2e-mvp
```

## Herramienta

```text
Playwright
```

## Flujo obligatorio

```text
registro
→ onboarding
→ crear cuenta
→ registrar ingreso
→ registrar gasto
→ crear obligación
→ configurar reserva
→ ver dinero disponible
```

Casos adicionales cuando sea viable:

```text
déficit
usuario B no ve usuario A
```

No automatizar todo el producto.

## STOP

---

# FASE 22 — CI/CD GitHub Actions

## Rama

```text
mantenimiento/ci-github
```

## Contexto

```text
GESTION_GITHUB_Y_RAMAS.md
ADR-006-CI-CD-VERCEL-GITHUB.md
ESTRATEGIA_PRUEBAS.md
```

## Checks

```text
lint
typecheck
test
build
```

Más adelante:

```text
integration
e2e
```

si el costo/tiempo es razonable.

## GitHub

Proteger:

```text
staging
main
```

PR a staging:

```text
1 aprobación externa
checks verdes
rama actualizada
```

## STOP

---

# FASE 23 — Vercel + producción

## Objetivo

Preparar release real.

## Flujo

```text
staging
→ PR
→ main
→ Vercel
```

## Configurar

- proyecto Vercel;
- variables de producción;
- Supabase production;
- redirect/auth URLs;
- build;
- dominio si aplica.

## Migraciones

Aplicar de forma controlada.

Nunca editar schema productivo manualmente como sustituto de migraciones.

## Release

Solo responsable de producción autoriza:

```text
staging → main
```

Merge:

```text
Merge Commit
```

## Smoke production

```text
app abre
login
dashboard
rutas privadas
Supabase responde
```

## STOP

---

# FASE 24 — Cierre MVP académico

## Validar los 3 Must

```text
1. Registrar manualmente ingresos y gastos
2. Resumen financiero básico
3. Dinero disponible después de compromisos
```

## Checklist

- [ ] Auth
- [ ] Profile
- [ ] Cuenta
- [ ] Categorías
- [ ] Ingreso
- [ ] Gasto
- [ ] Obligaciones
- [ ] Reserva
- [ ] Saldo líquido
- [ ] Disponible
- [ ] Dashboard
- [ ] RLS
- [ ] Precisión decimal
- [ ] Mobile
- [ ] Light/Dark
- [ ] Accesibilidad crítica
- [ ] Vitest
- [ ] E2E crítico
- [ ] CI
- [ ] Producción

Resultado:

```text
MVP ACADÉMICO CERRADO
```

---

# 8. Fuera de alcance hasta autorización

No ejecutar todavía:

```text
Budgets avanzados
Goals avanzadas
Recurring transactions
Subscriptions
Debts
Snowball
Avalanche
Forecast avanzado
Financial Score
Purchase simulator
AI
Bank integrations
Open Banking
Shared finances
FX
```

No construirlas como "mejora".

---

# 9. Prompt maestro para iniciar una fase

```text
Estamos implementando FinWise.

Trabaja EXCLUSIVAMENTE en la FASE <N> — <NOMBRE> definida en:
contexto/planificacion/PLAN_EJECUCION_KILO.md

Antes de modificar:
1. Lee AGENTS.md.
2. Recupera solo la documentación relevante indicada para esta fase.
3. Usa semantic search antes de explorar ampliamente.
4. Confirma la rama actual y no trabajes directamente en main/staging.
5. Evalúa el estado existente para no duplicar trabajo.

Durante:
- Haz el mínimo cambio correcto.
- No implementes fases siguientes.
- No refactorices fuera de alcance.
- No agregues dependencias innecesarias.
- Respeta arquitectura, RLS, precisión monetaria y sistema visual.
- Máximo 2 intentos similares ante el mismo error antes de cambiar estrategia.

Si la ejecución se interrumpe:
- NO reinicies la fase.
- Ejecuta git status y git diff.
- Conserva trabajo válido.
- Identifica la operación pendiente.
- Continúa únicamente desde ahí.

Al finalizar:
- Ejecuta los checks requeridos.
- Revisa el diff.
- No hagas merge.
- No hagas push directo a main/staging.
- Detente.

Responde únicamente con:
1. Implementado.
2. Archivos principales modificados.
3. Validaciones ejecutadas y resultado.
4. Pendientes/bloqueos.
5. Si la fase está lista para PR.

NO continúes automáticamente a la siguiente fase.
```

---

# 10. Prompt para comenzar ahora

```text
Ejecuta únicamente la FASE 0 — Auditoría del estado actual de:
contexto/planificacion/PLAN_EJECUCION_KILO.md

No modifiques nada.

Lee AGENTS.md y recupera solo contexto relevante.

Confirma:
- rama actual;
- package.json y versiones;
- scripts;
- shadcn;
- Vitest;
- Playwright;
- Supabase CLI;
- estructura relevante.

Ejecuta:
pnpm lint
pnpm typecheck
pnpm test
pnpm build

Devuelve únicamente:
- estado actual;
- checks;
- faltantes para Fase 1;
- bloqueos.

Detente al terminar.
```

---

# 11. Prompt para reanudar después de un error

```text
Continúa la FASE ACTUAL desde el último estado válido.

NO reinicies la fase desde cero.
NO repitas la misma llamada fallida.
NO deshagas cambios ya aplicados correctamente.

Antes de continuar:
1. Ejecuta git status.
2. Ejecuta git diff.
3. Identifica archivos ya modificados correctamente.
4. Identifica la operación exacta que quedó pendiente.

Continúa únicamente desde ese punto.

Si una herramienta vuelve a fallar:
- cambia de estrategia una sola vez;
- máximo 2 intentos similares;
- si persiste, detente y reporta archivo, operación y error.

Mantén el alcance de la fase actual.
No avances a la siguiente fase.

Al terminar:
- ejecuta los checks correspondientes;
- revisa el diff;
- informa brevemente estado y pendientes;
- detente.
```

---

# 12. Agrupación razonable de ramas

No es obligatorio crear 24 ramas si varias fases forman una unidad pequeña y coherente.

Ejemplos:

```text
0–1   mantenimiento/fundacion-tecnica
2     funcionalidad/sistema-visual-base
3     mantenimiento/supabase-base
4–5   funcionalidad/modelo-datos-p0
6     funcionalidad/autenticacion
7     funcionalidad/onboarding
8     funcionalidad/cuentas
9     funcionalidad/categorias
10    funcionalidad/motor-transacciones
11    funcionalidad/registro-ingresos
12    funcionalidad/registro-gastos
13    funcionalidad/obligaciones
14–15 pueden agruparse si el diff sigue pequeño
16    funcionalidad/dashboard-mvp
```

No crear ramas gigantes.

---

# 13. Cuándo pedir decisión humana

Detener y preguntar si:

- dos documentos se contradicen;
- una migración puede destruir datos;
- hace falta cambiar arquitectura;
- hace falta cambiar una fórmula financiera;
- hace falta relajar RLS;
- un conflicto Git implica eliminar trabajo ajeno;
- una dependencia sustituye una decisión establecida;
- el diseño exige cambiar el sistema visual;
- la solución necesita salir de la fase;
- tras cambiar estrategia no puede continuar con seguridad.

No preguntar por detalles triviales ya definidos.

---

# 14. Definition of Done por fase

Una fase está lista cuando:

```text
alcance implementado
+
sin scope creep
+
checks requeridos verdes
+
seguridad intacta
+
precisión financiera intacta
+
diff revisado
+
documentación actualizada solo si cambió una decisión
```

No basta con:

```text
"funciona en mi navegador"
```

---

# 15. Política para commits y PR

Kilo puede preparar commits si el usuario lo autoriza.

No debe:

```text
mergear
push directo a staging
push directo a main
```

Integración:

```text
rama temporal
→ PR
→ aprobación externa
→ checks
→ Squash and Merge
→ staging
```

Producción:

```text
staging
→ PR
→ responsable producción
→ Merge Commit
→ main
→ Vercel
```

---

# 16. Documentación durante implementación

No crear nuevos `.md` por cada feature.

Actualizar documentación solo si cambia:

```text
arquitectura
modelo
seguridad
regla financiera
flujo
sistema visual
Git
política de agentes
```

Para implementación ordinaria:

```text
código + tests
```

es suficiente.

---

# 17. Regla final

> **No intentes impresionar haciendo más trabajo del solicitado.**

Objetivo:

```text
encontrar contexto correcto
→ implementar mínimo cambio correcto
→ verificar
→ detenerse
```

---

# Fin del plan
