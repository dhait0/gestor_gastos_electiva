# FinWise — Plan de Ejecución por Fases para Kilo

> Documento operativo para implementación asistida por IA.
>
> Ubicación recomendada: `contexto/planificacion/PLAN_EJECUCION_KILO.md`
>
> Este archivo NO reemplaza `AGENTS.md` ni `FINWISE_CONTEXTO_MAESTRO.md`.
> Su función es definir qué construir, en qué orden y cuándo detenerse.

---

# 0. Regla principal

Kilo NO debe intentar construir FinWise completo en una sola ejecución.

Debe trabajar siempre así:

```text
una fase
→ implementar
→ validar
→ resumir
→ detenerse
→ esperar autorización para continuar
```

Está prohibido interpretar este archivo como:

```text
"haz todo el proyecto"
```

Cada fase es un límite explícito de alcance.

---

# 1. Autoridad documental

Usar `AGENTS.md` como router de contexto.

No cargar todos los `.md` completos en cada tarea.

Orden de autoridad:

```text
1. Seguridad y privacidad
2. Integridad financiera
3. FINWISE_CONTEXTO_MAESTRO.md
4. MODELO_DATOS_Y_SEGURIDAD.md
5. ARQUITECTURA_TECNICA.md + ADRs
6. CASOS_DE_USO_Y_FLUJOS.md
7. SISTEMA_DISENO_FINWISE.md
8. WIREFRAMES_Y_PANTALLAS.md
9. GESTION_GITHUB_Y_RAMAS.md
10. POLITICA_EFICIENCIA_AGENTES.md
11. Este plan
12. Preferencia del agente
```

---

# 2. Política de eficiencia

Modo por defecto:

```text
ECONÓMICO
```

Recuperación:

```text
1. búsqueda exacta si se conoce el símbolo
2. semantic search si se conoce el concepto
3. abrir pocos candidatos
4. ampliar solo si falta contexto
```

Objetivo inicial:

```text
5–10 resultados semánticos
→ 3–8 archivos realmente relevantes
```

No:

- explorar todo el repo;
- refactorizar fuera de alcance;
- implementar fases siguientes;
- instalar dependencias por comodidad;
- repetir el mismo intento indefinidamente.

Máximo orientativo:

```text
2 intentos sustancialmente similares
```

Si la tarea está cumplida:

```text
DETENER
```

---

# 3. Regla Git

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

# 4. Checks oficiales

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Durante desarrollo pueden ejecutarse tests específicos.

Antes de cerrar una fase que cambió aplicación/configuración, los checks correspondientes deben quedar verdes.

---

# 5. Estado esperado de partida

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

También pueden existir ya:

```text
Supabase dependencies
Supabase CLI
Playwright
```

La Fase 0 debe confirmar el estado real.

---

# 6. Mapa de fases

```text
FASE 0  Auditoría actual
FASE 1  Fundación técnica
FASE 2  Sistema visual base
FASE 3  Supabase local y clientes
FASE 4  Modelo de datos P0
FASE 5  RLS y perfil
FASE 6  Autenticación
FASE 7  App shell + onboarding
FASE 8  Cuentas
FASE 9  Categorías
FASE 10 Motor de transacciones
FASE 11 Registro de ingreso
FASE 12 Registro de gasto
FASE 13 Obligaciones
FASE 14 Reserva de seguridad
FASE 15 Motor de saldo líquido/disponible
FASE 16 Dashboard MVP
FASE 17 Historial mínimo
FASE 18 Estados + accesibilidad + responsive
FASE 19 PWA
FASE 20 Hardening seguridad/datos
FASE 21 E2E crítico
FASE 22 CI/CD
FASE 23 Vercel + producción
FASE 24 Cierre MVP académico
```

No ejecutar P1/P2 antes del cierre del MVP académico.

---

# FASE 0 — Auditoría del estado actual

## Objetivo

Determinar exactamente qué existe antes de cambiar nada.

## Rama

No crear rama si solo se inspecciona.

## Leer

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

## Hacer

1. Confirmar rama.
2. Revisar `package.json`.
3. Confirmar scripts:
   - dev
   - build
   - start
   - lint
   - typecheck
   - test
   - test:watch
4. Confirmar shadcn:
   - Radix
   - Luma
   - Lucide
5. Confirmar Vitest.
6. Confirmar Playwright.
7. Confirmar Supabase CLI.
8. Ejecutar:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

## No hacer

- no instalar;
- no refactorizar;
- no crear DB;
- no modificar UI.

## Entrega

```text
Estado:
Checks:
Faltantes para Fase 1:
Bloqueos:
```

## STOP

---

# FASE 1 — Fundación técnica

## Rama

```text
mantenimiento/fundacion-tecnica
```

## Leer

```text
AGENTS.md
FINWISE_CONTEXTO_MAESTRO.md
ARQUITECTURA_TECNICA.md
CONVENCIONES_DESARROLLO.md
```

Solo secciones de stack/configuración.

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

Asegurar ignores de ESLint:

```text
.agents/**
.kilo/**
.next/**
coverage/**
```

## Aceptación

```text
lint       PASS
typecheck  PASS
test       PASS
build      PASS
```

## STOP

No Auth, DB ni pantallas funcionales todavía.

---

# FASE 2 — Sistema visual base

## Rama

```text
funcionalidad/sistema-visual-base
```

## Leer

```text
SISTEMA_DISENO_FINWISE.md
WIREFRAMES_Y_PANTALLAS.md
```

solo reglas globales.

## Decisiones

```text
Primary        #2563EB
Accent         #06B6D4
Dark bg        #0B1220
Dark surface   #111827
Heading        Manrope
UI/data        Geist
shadcn         Radix + Luma
icons          Lucide
```

## Hacer

1. Configurar Geist + Manrope con `next/font`.
2. Crear tokens CSS.
3. Ajustar radius/shadows.
4. Soportar Light/Dark/System.
5. Crear tokens semánticos.
6. Definir presets Motion mínimos.
7. Mantener glass moderado.

Instalar solo componentes shadcn necesarios.

## Aceptación

- light/dark correctos;
- fonts correctas;
- tokens reutilizables;
- build verde.

## STOP

No crear Dashboard completo.

---

# FASE 3 — Supabase local y clientes

## Rama

```text
mantenimiento/supabase-base
```

## Leer

```text
ARQUITECTURA_TECNICA.md
MODELO_DATOS_Y_SEGURIDAD.md
ADR-002
ADR-007
```

## Hacer

1. Verificar `supabase/config.toml`.
2. Si falta:

```bash
pnpm supabase init
```

3. Confirmar runtime de contenedores.
4. Iniciar local cuando corresponda:

```bash
pnpm supabase start
```

5. Crear `.env.example`.
6. Mantener `.env.local` fuera de Git.
7. Crear clientes Supabase:
   - browser
   - server
8. Configurar SSR/cookies según versiones instaladas.
9. Nunca exponer service role.

Estructura orientativa:

```text
src/lib/supabase/
├── client.ts
└── server.ts
```

## Aceptación

- Supabase local funciona;
- browser/server client compilan;
- env documentado;
- checks verdes.

## STOP

No tablas todavía.

---

# FASE 4 — Modelo de datos P0

## Rama

```text
funcionalidad/modelo-datos-p0
```

## Leer

```text
MODELO_DATOS_Y_SEGURIDAD.md
FINWISE_CONTEXTO_MAESTRO.md
```

## Crear solamente

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

## Reglas

Dinero:

```text
numeric(20,4)
```

Fechas financieras:

```text
date
```

Eventos técnicos:

```text
timestamptz
```

No persistir:

```text
current balance
liquid balance
available-to-spend
dashboard summary
```

## Migraciones orientativas

```text
base helpers/types
profiles
accounts/categories
transactions
obligations
```

Usar el formato real generado por Supabase CLI.

## Aceptación

```bash
pnpm supabase db reset
```

reconstruye todo desde cero.

## STOP

No UI.

---

# FASE 5 — RLS y perfil

## Rama

Puede continuar en `funcionalidad/modelo-datos-p0` si sigue siendo un PR pequeño.

Si no:

```text
funcionalidad/rls-p0
```

## Leer

```text
MODELO_DATOS_Y_SEGURIDAD.md
ADR-002-ACCESO-DATOS-Y-RLS.md
ESTRATEGIA_PRUEBAS.md
```

## Hacer

Toda tabla financiera:

```text
RLS ON
```

Policies explícitas por usuario.

Patrón base:

```text
(select auth.uid()) = user_id
```

Profiles:

```text
self SELECT
self UPDATE
```

Profile tras signup:

- trigger controlado;
- no duplicar email;
- probar fallo.

## Pruebas

```text
Usuario A accede A
Usuario B NO accede A
Anon NO accede
```

## STOP

---

# FASE 6 — Autenticación

## Rama

```text
funcionalidad/autenticacion
```

## Leer

```text
UC-01
UC-02
UC-03
UC-04
secciones auth de arquitectura/diseño
```

## Alcance

```text
registro
login
logout
recuperación si corresponde
protección de rutas
```

No OAuth extra inicialmente.

## Stack

```text
Server Actions
Zod
Supabase Auth
```

## Aceptación

```text
signup
→ profile
→ login
→ área privada
→ logout
```

## STOP

No Dashboard funcional todavía.

---

# FASE 7 — App shell + onboarding

## Rama

```text
funcionalidad/onboarding
```

## Leer

```text
UC-05
UC-06
wireframes onboarding/navigation
design system
```

## Mobile

```text
Inicio
Movimientos
+
Metas
Más
```

No mostrar como funcional lo que aún no existe.

## Desktop

Sidebar flotante/colapsable.

## Onboarding mínimo

```text
display name si aplica
COP default
primera cuenta
saldo inicial
```

## Aceptación

```text
signup
→ onboarding
→ primera cuenta
→ app privada
```

## STOP

---

# FASE 8 — Cuentas

## Rama

```text
funcionalidad/cuentas
```

## Leer

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

No persistir `currentBalance`.

Balance deriva de ledger.

UI:

```text
crear
editar
archivar
```

No hard delete normal.

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

- propiedad del usuario;
- no duplicados activos por tipo/nombre;
- categoría INCOME no se usa en EXPENSE.

Defaults mínimos:

```text
Ingresos: Salario, Honorarios, Otros ingresos
Gastos: Alimentación, Transporte, Vivienda, Servicios, Salud, Educación, Entretenimiento, Otros
```

## STOP

---

# FASE 10 — Motor de transacciones

## Rama

```text
funcionalidad/motor-transacciones
```

## Leer

```text
MODELO_DATOS_Y_SEGURIDAD.md transactions
ARQUITECTURA_TECNICA.md
CONVENCIONES_DESARROLLO.md
```

## Dominio

```text
INCOME
EXPENSE
TRANSFER

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

Monto siempre > 0.

## Arquitectura

Separar razonablemente:

```text
application
domain
infrastructure
```

Sin sobreingeniería.

## Tests

Unit tests de invariantes obligatorios.

## STOP

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

## Leer

```text
UC-10
wireframe quick expense
design system
```

## Form

```text
amount
category
account
date
note
```

Gasto es la acción priorizada de Quick Create.

Persistir:

```text
EXPENSE + OUTFLOW
```

## Aceptación

- guarda;
- ownership correcto;
- balance derivado cambia;
- tests relevantes.

## STOP

---

# FASE 13 — Obligaciones

## Rama

```text
funcionalidad/obligaciones
```

## Leer

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

Reglas:

```text
pendiente reduce disponible
pendiente NO cambia saldo bancario
marcar pagada NO crea gasto automáticamente
```

UI:

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

Persistencia:

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

## Rama

```text
funcionalidad/dinero-disponible
```

## Leer obligatoriamente

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

No usar `number` para cálculo crítico.

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
1.800.000 - 600.000 - 200.000 = 1.000.000
```

Déficit:

```text
500.000 - 600.000 - 100.000 = -200.000
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
- soft delete.

## STOP

No Financial Score.

---

# FASE 16 — Dashboard MVP

## Rama

```text
funcionalidad/dashboard-mvp
```

## Leer

```text
wireframes dashboard
design system
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

Principal:

```text
DINERO DISPONIBLE
```

No saldo total.

Breakdown:

```text
Saldo líquido
Compromisos
Reserva
Disponible
```

Déficit:

No:

```text
Puedes gastar -$200.000
```

Sí:

```text
Tus compromisos superan tu saldo líquido...
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

# FASE 17 — Historial mínimo

## Rama

```text
funcionalidad/movimientos
```

## Alcance

```text
lista
fecha
tipo
categoría
cuenta
monto
detalle básico
```

No agregar filtros complejos si no hacen falta.

Edición/eliminación puede posponerse.

Si hay eliminación:

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

Accesibilidad:

```text
WCAG AA
focus
keyboard
labels
44x44 touch targets
reduced motion
contraste
no color-only
```

Responsive:

```text
mobile primero
desktop después
```

## STOP

---

# FASE 19 — PWA

## Rama

```text
funcionalidad/pwa
```

## Implementar

```text
manifest
icons
maskable icon
apple-touch-icon
display standalone
theme colors
safe areas
```

No implementar escritura financiera offline.

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

Pruebas A/B/anon.

No cambiar arquitectura sin problema real.

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
→ ingreso
→ gasto
→ obligación
→ reserva
→ disponible
```

Agregar déficit si es razonable.

No automatizar todo el producto.

## STOP

---

# FASE 22 — CI/CD GitHub Actions

## Rama

```text
mantenimiento/ci-github
```

## Leer

```text
GESTION_GITHUB_Y_RAMAS.md
ADR-006
ESTRATEGIA_PRUEBAS.md
```

Checks:

```text
lint
typecheck
test
build
```

Protección:

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

Publicar de forma controlada.

Flujo:

```text
staging
→ PR
→ main
→ Vercel
```

Configurar:

- Vercel;
- variables de producción;
- Supabase production;
- Auth redirect URLs;
- migraciones.

No editar DB productiva manualmente como sustituto de migraciones.

Solo responsable de producción autoriza:

```text
staging → main
```

Merge:

```text
Merge Commit
```

Smoke:

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
1. Registrar manualmente ingresos/gastos
2. Resumen financiero básico
3. Dinero disponible después de compromisos
```

Checklist:

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
- [ ] decimal.js
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

# 7. Fuera de alcance hasta autorización

No ejecutar todavía:

```text
Budgets
Goals
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
```

No construirlas como "mejora".

---

# 8. Prompt maestro para Kilo

Usar este patrón al iniciar cualquier fase:

```text
Estamos implementando FinWise.

Trabaja EXCLUSIVAMENTE en la FASE <N> — <NOMBRE> definida en:
contexto/planificacion/PLAN_EJECUCION_KILO.md

Antes de modificar:
1. Lee AGENTS.md.
2. Recupera solo la documentación relevante indicada para esta fase.
3. Usa semantic search antes de explorar ampliamente.
4. Confirma la rama actual y no trabajes directamente en main/staging.
5. Evalúa lo existente para no duplicar trabajo.

Durante:
- Haz el mínimo cambio correcto.
- No implementes fases siguientes.
- No refactorices fuera de alcance.
- No agregues dependencias innecesarias.
- Respeta arquitectura, RLS, precisión monetaria y sistema visual.
- Máximo 2 intentos similares ante el mismo error antes de cambiar estrategia.

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

# 9. Prompt para comenzar ahora

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

# 10. Agrupación razonable de ramas

No es obligatorio crear una rama por cada número si varias fases forman una unidad pequeña y coherente.

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

# 11. Cuándo pedir decisión humana

Detener y preguntar si:

- dos documentos se contradicen;
- una migración puede destruir datos;
- hace falta cambiar arquitectura;
- hace falta cambiar una fórmula financiera;
- hace falta relajar RLS;
- un conflicto Git implica eliminar trabajo ajeno;
- una dependencia sustituye una decisión establecida;
- el diseño exige cambiar el sistema visual;
- se necesita salir de la fase actual.

No preguntar por detalles triviales ya definidos.

---

# 12. Definition of Done por fase

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
docs actualizadas solo si cambió una decisión
```

No basta con:

```text
"funciona en mi navegador"
```

---

# 13. PR

Kilo puede preparar cambios/commit si se le autoriza.

No debe:

```text
mergear
push directo a staging
push directo a main
```

Flujo:

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

# 14. Documentación durante implementación

No crear `.md` por cada feature.

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

# 15. Regla final

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
