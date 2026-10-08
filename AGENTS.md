# AGENTS.md — FinWise

> Instrucciones operativas obligatorias para agentes de desarrollo que trabajen en este repositorio.
>
> Este archivo funciona como **router de contexto, política de ejecución y límite de autonomía**.
>
> No reemplaza la documentación especializada ubicada en `contexto/`.

Proyecto: **FinWise**

Repositorio local esperado:

`/Users/keys/Documents/proyectos/gestor_gastos_electiva`

---

# 1. Objetivo del proyecto

FinWise es una aplicación web de gestión e inteligencia financiera personal.

La pregunta central del producto es:

> **¿Cuánto dinero puedo gastar realmente sin comprometer mis obligaciones, reservas y objetivos financieros?**

Flujo conceptual:

```text
Registrar
→ Interpretar
→ Analizar
→ Predecir
→ Alertar
→ Recomendar
→ Apoyar la decisión
```

MVP académico:

```text
1. Registrar manualmente ingresos y gastos.
2. Mostrar un resumen financiero básico.
3. Calcular dinero disponible después de compromisos.
```

No ampliar el alcance del MVP sin autorización explícita.

---

# 2. Regla principal del agente

Trabajar siempre así:

```text
encontrar el contexto correcto
→ implementar el mínimo cambio correcto
→ verificar
→ detenerse
```

No intentar impresionar haciendo más trabajo del solicitado.

Cuando la tarea esté cumplida y validada:

```text
STOP
```

---

# 3. Modo operativo por defecto

Modo por defecto:

```text
MODO ECONÓMICO
```

El esfuerzo debe ser proporcional a:

```text
alcance
+
riesgo
+
incertidumbre
```

Clasificación interna recomendada:

```text
RÁPIDO
NORMAL
PROFUNDO
```

## RÁPIDO

Para:

- cambios localizados;
- textos;
- estilos pequeños;
- correcciones obvias;
- un componente aislado;
- un test puntual.

Orientación:

```text
1–5 archivos relevantes
```

## NORMAL

Para:

- una funcionalidad;
- un flujo;
- varias capas relacionadas;
- un bug no trivial.

Orientación:

```text
3–12 archivos relevantes
```

## PROFUNDO

Reservarlo para:

- seguridad;
- RLS;
- lógica financiera;
- precisión monetaria;
- migraciones;
- riesgo de pérdida de datos;
- arquitectura;
- bugs transversales sin causa conocida.

No usar análisis profundo por defecto.

---

# 4. Recuperación de contexto

No leer todo el repositorio ni toda la documentación antes de cada tarea.

Orden recomendado:

```text
1. búsqueda exacta
2. índice semántico / embeddings
3. seleccionar candidatos
4. leer archivos relevantes
5. leer dependencias directas
6. ampliar solo si sigue faltando contexto
7. web/MCP únicamente si realmente hace falta
```

Si se conoce un símbolo, ruta o función:

```text
usar búsqueda exacta primero
```

Si se conoce el concepto pero no la ubicación:

```text
usar semantic search
```

Objetivo inicial orientativo:

```text
5–10 resultados
```

Después reducir normalmente a:

```text
3–8 archivos relevantes
```

No abrir decenas de archivos "por si acaso".

---

# 5. Indexación y carpetas auxiliares

Priorizar indexación de:

```text
src/
supabase/
contexto/
AGENTS.md
```

Excluir del análisis general salvo necesidad explícita:

```text
node_modules/
.next/
coverage/
out/
build/
.git/
artefactos generados
secrets
```

`.agents/` contiene skills y configuración auxiliar.

`.kilo/` puede contener configuración y worktrees locales.

No recorrer `.agents/` ni `.kilo/` como parte de una tarea normal de aplicación.

---

# 6. AGENTS.md es un router

Este archivo NO autoriza a cargar todos los documentos listados.

Abrir únicamente los documentos relacionados con la tarea actual.

Documentación principal:

```text
contexto/FINWISE_CONTEXTO_MAESTRO.md

contexto/arquitectura/ARQUITECTURA_TECNICA.md
contexto/arquitectura/MODELO_DATOS_Y_SEGURIDAD.md

contexto/producto/CASOS_DE_USO_Y_FLUJOS.md

contexto/diseno/SISTEMA_DISENO_FINWISE.md
contexto/diseno/WIREFRAMES_Y_PANTALLAS.md

contexto/desarrollo/CONVENCIONES_DESARROLLO.md
contexto/desarrollo/GESTION_GITHUB_Y_RAMAS.md

contexto/calidad/ESTRATEGIA_PRUEBAS.md

contexto/planificacion/BACKLOG_MVP.md
contexto/planificacion/PLAN_IMPLEMENTACION_MVP.md
contexto/planificacion/PLAN_EJECUCION_KILO.md
```

También pueden existir ADRs en:

```text
contexto/arquitectura/adr/
```

o una ruta equivalente definida en el repositorio.

---

# 7. Orden de autoridad

Ante conflicto entre instrucciones:

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
11. POLITICA_EFICIENCIA_AGENTES.md, si existe
12. PLAN_EJECUCION_KILO.md
13. Convenciones locales
14. Preferencia del agente
```

Si dos documentos de autoridad similar se contradicen y la decisión puede afectar comportamiento, datos, seguridad o arquitectura:

```text
DETENER
→ explicar contradicción
→ pedir decisión humana
```

No inventar una tercera solución silenciosamente.

---

# 8. Ejecución por fases

Cuando exista:

```text
contexto/planificacion/PLAN_EJECUCION_KILO.md
```

trabajar **una fase por vez**.

Flujo obligatorio:

```text
fase actual
→ implementar
→ validar
→ revisar diff
→ resumir
→ STOP
```

No avanzar automáticamente a la siguiente fase.

No interpretar el plan como:

```text
"construye todo el proyecto"
```

---

# 9. Control de alcance

Está prohibido el scope creep.

No:

- implementar la siguiente fase;
- agregar features "ya que estamos";
- crear abstracciones por anticipación;
- refactorizar módulos no relacionados;
- cambiar librerías por preferencia personal;
- rediseñar pantallas fuera de la tarea;
- crear documentación innecesaria;
- introducir infraestructura futura sin necesidad demostrada.

Si una mejora sería útil pero no es necesaria:

```text
mencionarla al final
NO implementarla
```

---

# 10. Stack técnico oficial

Objetivo técnico del proyecto:

```text
Next.js 16.x
App Router
React 19.x
TypeScript strict
Tailwind CSS 4
shadcn/ui
Radix UI
Lucide
Motion
Recharts
React Hook Form
Zod
date-fns
decimal.js

Supabase PostgreSQL
Supabase Auth
Supabase RLS
@supabase/supabase-js
@supabase/ssr
Supabase CLI migrations

Vitest
React Testing Library
Playwright

GitHub
GitHub Actions
Vercel
pnpm
```

Arquitectura:

```text
Modular Monolith
```

No sustituir este stack sin autorización.

---

# 11. Tecnologías no adoptadas inicialmente

No introducir por iniciativa propia:

```text
Prisma
Drizzle
NestJS
Redis
microservices
Kafka
RabbitMQ
GraphQL
tRPC
Redux
Zustand
TanStack Query
Sentry
Supabase Realtime
Supabase Edge Functions
IA en producción
integraciones bancarias
Open Banking
```

Esto no significa que estén prohibidas para siempre.

Significa:

```text
NO forman parte de la arquitectura actual
```

---

# 12. Arquitectura de capas

Mantener:

```text
Presentation
↓
Application
↓
Domain
↓
Infrastructure
↓
Database
```

La lógica financiera debe ser lo más pura posible.

Idealmente el dominio no debe depender de:

```text
React
Next.js
Supabase
DOM
```

cuando pueda evitarse.

No colocar reglas financieras complejas dentro de JSX.

---

# 13. Next.js

Preferir:

```text
Server Components → lecturas
Server Actions → mutaciones de aplicación
Route Handlers → HTTP explícito, integraciones o webhooks
```

No convertir todo a Client Components.

Usar `"use client"` únicamente donde exista necesidad real de:

- estado del navegador;
- hooks de cliente;
- interacción;
- APIs del browser.

---

# 14. Supabase e identidad

Identidad:

```text
auth.users
```

Perfil:

```text
public.profiles
```

Relación:

```text
1:1
mismo UUID
```

No crear una tabla paralela de usuarios.

Todo acceso financiero debe respetar RLS.

No confiar solo en filtros de frontend.

---

# 15. Seguridad y RLS

Toda tabla financiera de usuario debe tener ownership explícito.

Patrón esperado:

```text
user_id
RLS ON
```

Validar al menos:

```text
usuario A accede a A
usuario B NO accede a A
anon NO accede
```

Preferir relaciones que refuercen ownership.

Nunca relajar RLS para "hacer que funcione".

Si la única solución aparente exige desactivar seguridad:

```text
DETENER
```

---

# 16. Service role y secretos

La service role:

```text
NUNCA
```

debe llegar al navegador.

No usarla en:

```text
NEXT_PUBLIC_*
bundle cliente
logs
commits
fixtures visibles
```

No versionar:

```text
.env
.env.local
passwords
tokens
secrets
```

Mantener:

```text
.env.example
```

con nombres de variables y valores de ejemplo no sensibles.

---

# 17. Dinero

En PostgreSQL:

```text
numeric(20,4)
```

En TypeScript para cálculos monetarios:

```text
decimal.js
```

No usar `number` como base de cálculos financieros críticos.

No usar floats SQL para dinero.

Para presentación puede utilizarse:

```text
Intl.NumberFormat
```

pero el formato visual no sustituye la precisión del dominio.

---

# 18. Fechas y moneda

Fechas financieras:

```text
date
```

Eventos técnicos:

```text
timestamptz
```

Zona horaria inicial:

```text
America/Bogota
```

Moneda inicial:

```text
COP
```

No agregar agregación cross-currency antes de tener un módulo FX explícito.

Nunca sumar monedas diferentes como si fueran equivalentes.

---

# 19. Invariantes financieros

Principios obligatorios:

```text
saldo != disponible
crédito disponible != efectivo líquido
transferencia != ingreso o gasto
obligación pendiente reduce disponible, no saldo
marcar obligación pagada no inventa transacción
forecast es estimación, nunca hecho
```

---

# 20. Ledger canónico

`transactions` es el ledger financiero canónico.

El saldo actual de una cuenta debe derivarse de movimientos.

No persistir normalmente:

```text
account.current_balance
```

si puede calcularse desde el ledger.

No crear fuentes paralelas de verdad.

---

# 21. Ingresos y gastos

Ingreso:

```text
INCOME + INFLOW
```

Gasto:

```text
EXPENSE + OUTFLOW
```

El monto debe ser positivo:

```text
amount > 0
```

La dirección determina el efecto.

Evitar representar gastos como montos negativos si el modelo oficial usa dirección/tipo.

---

# 22. Transferencias

Una transferencia:

```text
NO es ingreso
NO es gasto
```

Debe representarse como par relacionado:

```text
TRANSFER + OUTFLOW
TRANSFER + INFLOW
```

con:

```text
transfer_group_id
```

o el mecanismo oficial equivalente.

No duplicar ingresos/gastos por mover dinero entre cuentas propias.

---

# 23. Tarjetas de crédito

Una compra con tarjeta:

```text
EXPENSE + OUTFLOW
```

sobre una cuenta:

```text
CREDIT_CARD
```

Representa gasto y aumento de deuda.

No reduce inmediatamente el saldo líquido de cuentas de activo.

El pago de tarjeta:

```text
transferencia de cuenta de activo → tarjeta
```

No crear un segundo gasto.

Regla:

```text
compra con tarjeta = gasto
pago de tarjeta = transferencia
```

---

# 24. Obligaciones

Una obligación pendiente:

```text
reduce capacidad de gasto
NO reduce saldo bancario
```

hasta que exista un movimiento real.

Marcar una obligación como pagada:

```text
NO debe inventar automáticamente una transacción
```

salvo que un flujo futuro explícito lo defina.

---

# 25. Reserva de seguridad

La reserva de seguridad:

```text
reduce disponible
NO reduce saldo líquido
```

En MVP puede estar almacenada en:

```text
profiles.safety_reserve
```

según el modelo aprobado.

---

# 26. Dinero disponible

Fórmula MVP:

```text
availableToSpend =
liquidBalance
- pendingObligations
- safetyReserve
```

Fórmula futura conceptual:

```text
liquidBalance
- pendingObligations
- committedSavingsGoals
- pendingDebtPayments
- safetyReserve
```

No implementar componentes futuros de la fórmula antes de que entren al alcance.

---

# 27. Saldo líquido

Inicialmente considerar como activos líquidos:

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

Modificar esta definición requiere una decisión de dominio.

---

# 28. Forecast

Toda proyección debe presentarse como estimación.

Nunca como hecho.

Usar lenguaje como:

```text
estimado
proyectado
aproximadamente
si mantienes este ritmo
```

No afirmar certeza.

---

# 29. Soft delete

Para entidades con historial financiero, preferir:

```text
deleted_at
```

No eliminar físicamente historial financiero por defecto.

---

# 30. Migraciones

Todas las modificaciones de esquema deben estar en:

```text
supabase/migrations/
```

No depender de cambios manuales en dashboards.

Para cambios destructivos importantes:

```text
Expand
→ Migrate
→ Contract
```

No borrar columnas o datos sin analizar impacto.

---

# 31. Sistema visual

Dirección estética:

```text
Apple premium
+
fintech premium
+
soft luxury
```

Uso moderado:

```text
glassmorphism
soft UI
```

Evitar:

```text
neón excesivo
gradientes morado/rosa genéricos de IA
glows exagerados
parallax innecesario
```

Tokens base:

```text
Primary       #2563EB
Accent        #06B6D4
Dark bg       #0B1220
Dark surface  #111827
```

Tipografías objetivo:

```text
Headings  Manrope
UI/data   Geist
```

Números financieros:

```text
tabular nums
```

Temas:

```text
light
dark
system
```

---

# 32. Mobile first

Móvil tiene prioridad igual o superior a desktop.

Navegación objetivo:

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

Solo mostrar como activas funciones realmente implementadas.

---

# 33. Desktop y dashboard

Desktop puede usar:

```text
sidebar flotante/colapsable
```

con glass moderado.

El protagonista del dashboard es:

```text
DINERO DISPONIBLE
```

No el saldo total.

El usuario debe entender rápidamente:

```text
cuánto tiene
cuánto está comprometido
cuánto puede gastar
```

No inventar tendencias ni insights.

---

# 34. Registro rápido de gasto

Prioridad UX:

```text
amount primero
```

Flujo breve, especialmente en móvil.

No añadir pasos o campos innecesarios.

---

# 35. Accesibilidad y Motion

Objetivo mínimo:

```text
WCAG AA
```

Revisar:

- contraste;
- labels;
- navegación por teclado;
- focus visible;
- reduced motion;
- touch targets;
- no comunicar solo por color.

Target táctil orientativo:

```text
44x44 px
```

Motion debe ser sutil y respetar:

```text
prefers-reduced-motion
```

---

# 36. shadcn/ui

Configuración esperada:

```text
base      Radix
style     Luma
icons     Lucide
baseColor neutral
```

No instalar todo el registry.

Agregar únicamente componentes requeridos por la tarea.

shadcn es base, no identidad visual final.

---

# 37. Skills

`.agents/skills/` puede contener skills instalados.

No ejecutar todos los skills automáticamente.

Invocar únicamente el que corresponda claramente a la tarea.

Si existe `ui-ux-pro-max`, sus recomendaciones son auxiliares.

La documentación de diseño FinWise tiene prioridad.

---

# 38. MCP, web y contexto externo

No activar múltiples MCP "por si acaso".

Orientación:

```text
0–1 herramienta de contexto
+
1 herramienta externa específica si hace falta
```

Priorizar:

```text
repo/index > web/MCP
```

No introducir Context Server, Qdrant compartido u otra infraestructura RAG hasta que exista necesidad demostrada.

Usar web cuando una API/librería actual pueda haber cambiado o sea necesario verificar sintaxis contemporánea.

Priorizar documentación oficial.

---

# 39. Dependencias

Antes de instalar una dependencia:

1. comprobar si ya existe;
2. comprobar si el stack oficial ya resuelve la necesidad;
3. justificar que sea necesaria.

No agregar paquetes duplicados.

Ejemplos:

```text
si Zod existe → no agregar otra librería de schemas
si Lucide existe → no agregar otro icon pack
si date-fns existe → no agregar otra librería de fechas sin razón
```

---

# 40. Convenciones de código

Usar:

- TypeScript estricto;
- nombres descriptivos;
- funciones pequeñas;
- separación de responsabilidades;
- módulos de dominio;
- validaciones centralizadas;
- tipos explícitos cuando aporten claridad.

Evitar:

```text
any
lógica financiera en JSX
queries duplicadas
componentes gigantes
constantes mágicas
abstracciones prematuras
```

---

# 41. Formularios y validación

Preferir:

```text
React Hook Form + Zod
```

La validación crítica debe existir también en server/domain cuando corresponda.

No confiar únicamente en validación del navegador.

---

# 42. Errores y estados UI

Mensajes para usuario:

- claros;
- accionables;
- no técnicos.

No mostrar stack traces o detalles internos en UI.

Toda pantalla relevante debe considerar:

```text
loading
empty
error
retry
success
disabled
```

No dejar vistas vacías sin explicación.

---

# 43. Testing proporcional

No ejecutar toda la suite después de cada edición pequeña.

Durante desarrollo:

```text
test específico
→ typecheck relevante si aplica
```

Antes de cerrar una fase o PR:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Para lógica financiera:

```text
unit tests obligatorios
```

Para RLS:

```text
tests A/B/anon
```

Para flujo crítico MVP:

```text
Playwright
```

---

# 44. Vitest y Playwright

Vitest:

- dominio;
- utilidades;
- validaciones;
- componentes cuando tenga sentido.

No crear tests vacíos solo para aumentar conteo.

Playwright:

- flujos de alto valor;
- evitar automatizar todo por defecto.

Flujo MVP previsto:

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

---

# 45. Checks oficiales

Scripts esperados:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Antes de PR deben pasar salvo excepción explícitamente documentada.

No ocultar fallos.

---

# 46. Anti-loop

No repetir indefinidamente el mismo intento.

Máximo general:

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

No consumir tiempo/tokens con variaciones mínimas del mismo error.

---

# 47. Errores `invalid-argument`

Un error:

```text
invalid-argument
```

indica primero un problema de construcción de la llamada a la herramienta.

No asumir automáticamente que el repositorio o el código están fallando.

Flujo obligatorio:

```text
invalid-argument
→ revisar esquema/formato
→ simplificar llamada
→ un segundo intento
→ cambiar estrategia o STOP
```

Reglas:

1. No repetir inmediatamente la misma llamada.
2. Revisar el formato esperado por la herramienta.
3. Eliminar parámetros opcionales innecesarios.
4. Ejecutar una sola acción por llamada mientras se diagnostica.
5. Tras un segundo fallo equivalente:
   - abandonar esa estrategia;
   - cambiar de herramienta si es seguro;
   - o detenerse y reportar.

Nunca permitir:

```text
invalid-argument
→ misma llamada
→ misma llamada
→ misma llamada
```

El agente debe detenerse ANTES de que el sistema aborte automáticamente tras varios fallos.

---

# 48. Reanudación después de errores

Ante una interrupción de herramienta:

```text
inspeccionar estado
→ conservar trabajo válido
→ localizar pendiente
→ continuar
```

Nunca:

```text
error
→ reiniciar toda la fase
```

Antes de continuar:

```bash
git status --short
```

y después, en una llamada separada:

```bash
git diff --stat
```

Solo si hace falta, en otra llamada:

```bash
git diff
```

Reglas:

1. No reiniciar automáticamente la tarea o fase.
2. No deshacer cambios correctos.
3. Identificar qué archivos ya quedaron correctamente modificados.
4. Identificar la operación exacta pendiente.
5. Continuar únicamente desde ese punto.
6. No volver a leer todo el proyecto.
7. No volver a ejecutar trabajo ya completado.
8. Si el error persiste tras cambiar de estrategia, detenerse y reportar:
   - archivo;
   - operación;
   - error;
   - posible siguiente paso.

Una interrupción del agente NO autoriza a descartar trabajo válido existente.

---

# 49. Reglas especiales para herramientas shell/bash

Cuando se esté recuperando de un error de herramienta, usar inicialmente una sola orden simple por llamada.

Preferir:

```bash
git status --short
```

y después:

```bash
git diff --stat
```

en llamadas separadas.

Durante recuperación, evitar inicialmente:

```text
&&
;
pipes
heredocs
command substitution
scripts multilínea
```

Si una llamada simple devuelve `invalid-argument`:

```text
NO seguir probando comandos distintos
```

El problema puede estar en la invocación de la herramienta y no en el shell.

En ese caso:

```text
cambiar a herramientas de lectura/listado si existen
```

o:

```text
STOP y reportar bloqueo
```

---

# 50. Escritura de archivos

Preferir modificaciones pequeñas y localizadas.

Si una herramienta de escritura falla:

- verificar que la ruta exista;
- revisar el formato requerido;
- evitar reescribir el archivo completo si solo cambia una sección;
- usar patch/edit cuando esté disponible;
- cambiar estrategia si el mismo enfoque vuelve a fallar.

No recrear archivos correctamente modificados solo por seguridad.

---

# 51. Archivos canónicos y prevención de duplicados

Si un archivo objetivo ya existe:

```text
DEBE editarse el archivo canónico existente
```

Está prohibido resolver un fallo creando variantes como:

```text
archivo 2.md
archivo copy.md
archivo copia.md
archivo final.md
archivo nuevo.md
archivo v2.md
archivo actualizado.md
```

Flujo obligatorio:

```text
archivo existe
→ inspeccionar
→ editar/patch
→ verificar
```

Nunca:

```text
archivo existe
→ write falla
→ crear duplicado
```

Si por una ejecución interrumpida ya existe un duplicado:

1. identificar el archivo canónico;
2. comparar original y duplicado;
3. localizar cambios válidos que existan solo en el duplicado;
4. incorporar esos cambios al archivo canónico;
5. verificar el resultado;
6. eliminar el duplicado únicamente después de verificar;
7. mantener una sola fuente de verdad.

Nunca eliminar un duplicado antes de comprobar si contiene cambios válidos únicos.

Si la herramienta no permite modificar el archivo existente:

```text
NO crear una copia
```

En su lugar:

```text
cambiar a edit/patch
```

y si tampoco es posible:

```text
STOP y reportar bloqueo
```

---

# 52. Documentación canónica

Un concepto debe tener una sola fuente documental canónica.

Antes de crear cualquier `.md`:

1. buscar si ya existe un archivo con el mismo nombre;
2. buscar si ya existe un documento con el mismo propósito;
3. si existe, actualizarlo;
4. no crear variantes numeradas o "finales".

Evitar:

```text
FINAL
FINAL_V2
ACTUALIZADO
NUEVO
COPIA
2
```

en archivos que solo duplican documentación existente.

---

# 53. Git — ramas permanentes

Ramas permanentes:

```text
main     → producción
staging  → integración y validación
```

Nunca trabajar directamente en ellas.

---

# 54. Nombres de ramas

Prefijos oficiales:

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

Ejemplos:

```text
funcionalidad/autenticacion
funcionalidad/cuentas
correccion/calculo-disponible
mantenimiento/supabase-base
```

---

# 55. Crear rama normal

Siempre desde `staging` actualizado:

```bash
git switch staging
git fetch origin
git pull --ff-only origin staging
git switch -c <rama>
```

No crear features normales desde `main`.

---

# 56. Antes de integrar a staging

Actualizar la rama de trabajo con:

```bash
git fetch origin
git merge origin/staging
```

Resolver conflictos en la rama temporal.

Nunca revertir, resetear o modificar `staging` para acomodar la feature.

---

# 57. PR hacia staging

Flujo:

```text
rama temporal
→ PR
→ revisión
→ checks
→ Squash and Merge
→ staging
```

Condiciones:

```text
mínimo 1 aprobación externa
checks requeridos verdes
```

Eliminar rama temporal después de merge cuando corresponda.

---

# 58. Producción

Flujo:

```text
staging
→ PR
→ main
```

Usar:

```text
Merge Commit
```

Solo la persona responsable de producción autoriza y ejecuta el merge.

No hacer push directo a `main`.

---

# 59. Hotfix

Urgencia:

```text
urgencia/*
```

nace desde:

```text
main
```

Después sincronizar de regreso a `staging` mediante:

```text
sincronizacion/*
```

No dejar divergencia silenciosa.

---

# 60. Protección Git

Nunca:

```text
force push a main
force push a staging
delete main
delete staging
push directo a main
push directo a staging
```

No reescribir historia compartida sin autorización.

---

# 61. Commits

Commits:

- pequeños;
- coherentes;
- relacionados con una sola intención.

No mezclar:

```text
feature + refactor masivo + docs + dependencias aleatorias
```

El agente no debe hacer commit, push o merge si el usuario no lo ha autorizado para esa tarea.

---

# 62. Revisión antes de finalizar

Siempre revisar:

```bash
git status --short
```

y:

```bash
git diff --stat
```

Si es necesario:

```bash
git diff
```

Si aparecen archivos inesperados:

```text
investigar antes de continuar
```

No borrar cambios ajenos.

---

# 63. `.agents/` y `.kilo/`

No incluir normalmente en lint:

```text
.agents/**
.kilo/**
```

Pueden contener herramientas externas con convenciones distintas.

No modificar su contenido salvo tarea explícita.

---

# 64. Documentación durante implementación

No crear un `.md` por cada feature.

Actualizar documentación solo si cambia una decisión real:

- arquitectura;
- seguridad;
- modelo;
- regla financiera;
- flujo;
- sistema visual;
- Git;
- política de agentes.

Una feature normal debe producir principalmente:

```text
código + tests
```

---

# 65. PWA

PWA forma parte del MVP planificado.

Inicialmente:

- manifest;
- iconos;
- maskable icon;
- apple-touch-icon;
- standalone;
- theme colors;
- safe areas.

PWA no significa offline financiero completo.

No implementar escrituras financieras offline sin diseño de sincronización.

---

# 66. IA

La IA NO forma parte del MVP obligatorio.

No incorporar un LLM por marketing.

Primero resolver:

```text
datos
reglas
cálculos
seguridad
UX
tests
```

Si se incorpora IA en el futuro:

- no acceso SQL directo;
- no inventar movimientos;
- no ejecutar cambios financieros sin confirmación;
- no presentar predicciones como certeza.

---

# 67. Funcionalidades fuera de alcance actual

Hasta autorización, no desarrollar:

```text
budgets avanzados
goals avanzadas
recurring transactions
subscriptions
debts
snowball
avalanche
forecast avanzado
Financial Score
purchase simulator
AI
bank integrations
Open Banking
shared finances
FX
```

Que aparezcan en documentación futura no significa que deban implementarse ahora.

---

# 68. Tareas ambiguas

Primero usar el contexto existente.

No preguntar por algo ya definido en la documentación.

Pedir decisión solo si la ambigüedad afecta:

- datos;
- seguridad;
- arquitectura;
- comportamiento financiero;
- UX importante;
- alcance.

Si es una decisión local, reversible y claramente alineada con docs, actuar.

---

# 69. Cuándo detenerse y pedir decisión humana

Detenerse si:

- dos documentos de autoridad se contradicen;
- una migración puede destruir datos;
- se necesita relajar RLS;
- se requiere cambiar una fórmula financiera;
- se propone cambiar arquitectura base;
- un conflicto Git exige eliminar trabajo ajeno;
- una dependencia reemplaza una decisión oficial;
- la solución necesita salir de la fase actual;
- una herramienta no puede utilizarse correctamente tras un cambio de estrategia;
- un `invalid-argument` persiste tras un segundo intento corregido;
- no se puede continuar con seguridad.

---

# 70. Salida final del agente

Al finalizar una tarea o fase, responder brevemente con:

```text
1. Implementado
2. Archivos principales modificados
3. Validaciones ejecutadas y resultado
4. Pendientes/bloqueos
5. Estado: listo/no listo para PR
```

No producir una narración extensa salvo solicitud.

---

# 71. Definition of Done

Una tarea está terminada cuando:

```text
alcance solicitado implementado
+
sin scope creep
+
seguridad intacta
+
reglas financieras intactas
+
tipos/validaciones correctos
+
tests proporcionales
+
checks requeridos verdes
+
diff revisado
```

Para una fase:

```text
también debe haberse respetado su STOP
```

---

# 72. Estado técnico

No asumir versiones ciegamente.

El proyecto fue inicializado alrededor de:

```text
Next.js 16.4.x
React 19.x
TypeScript
Tailwind CSS 4
shadcn/ui Radix Luma
Lucide
Vitest
```

Puede haber evolucionado.

`package.json` y el código actual son la fuente real.

---

# 73. Inicio recomendado de cada fase

```text
1. leer AGENTS.md
2. abrir solo la fase relevante de PLAN_EJECUCION_KILO.md
3. recuperar documentos específicos
4. confirmar rama
5. revisar estado existente
6. implementar solo el alcance
7. validar
8. revisar diff
9. resumir
10. STOP
```

---

# 74. Reanudación de una sesión nueva después de aborto

Si una sesión anterior terminó por error de herramienta:

```text
NO asumir que no hizo nada
NO reiniciar la fase
NO volver a crear archivos
```

La nueva sesión debe comenzar así:

```text
1. leer AGENTS.md
2. confirmar fase actual
3. git status --short
4. git diff --stat
5. identificar cambios válidos
6. detectar duplicados
7. consolidar solo si hace falta
8. continuar desde la operación pendiente
```

No repetir trabajo ya completado.

---

# 75. Regla final

Comportamiento esperado:

```text
preciso
selectivo
seguro
eficiente
verificable
```

Evitar:

```text
exploración masiva
autonomía sin límites
scope creep
refactors preventivos
loops de herramientas
duplicación de archivos
reinicio innecesario de fases
```

Cuando el objetivo esté cumplido:

> **Detente.**
