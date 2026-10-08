# AGENTS.md — FinWise

> Instrucciones obligatorias para cualquier agente de código, asistente de desarrollo o automatización que trabaje en este repositorio.
>
> **Lee este archivo completo antes de modificar cualquier archivo.**

---

## 1. Proyecto

FinWise es una aplicación de inteligencia y gestión financiera personal.

No es un CRUD de gastos.

Flujo conceptual:

```text
Registrar
→ Interpretar
→ Analizar
→ Predecir
→ Alertar
→ Recomendar
→ Apoyar decisión
```

Pregunta central:

> **¿Cuánto dinero puede gastar el usuario realmente sin comprometer sus obligaciones, reservas y objetivos financieros?**

El principal KPI del producto es:

```text
dinero disponible
```

no el saldo bancario.

---

## 2. Documentación obligatoria

Antes de implementar una tarea, lee como mínimo:

```text
contexto/FINWISE_CONTEXTO_MAESTRO.md
contexto/desarrollo/CONVENCIONES_DESARROLLO.md
contexto/desarrollo/GESTION_GITHUB_Y_RAMAS.md
```

Después consulta según la tarea:

### Arquitectura / backend / datos

```text
contexto/arquitectura/ARQUITECTURA_TECNICA.md
contexto/arquitectura/MODELO_DATOS_Y_SEGURIDAD.md
contexto/arquitectura/adr/
```

### Producto / comportamiento

```text
contexto/producto/CASOS_DE_USO_Y_FLUJOS.md
```

### UI / UX

```text
contexto/diseno/SISTEMA_DISENO_FINWISE.md
contexto/diseno/WIREFRAMES_Y_PANTALLAS.md
```

### Planificación

```text
contexto/planificacion/BACKLOG_MVP.md
contexto/planificacion/PLAN_IMPLEMENTACION_MVP.md
```

### Testing

```text
contexto/calidad/ESTRATEGIA_PRUEBAS.md
```

Si un archivo aún no existe físicamente en el checkout, no inventes su contenido. Trabaja con la documentación disponible y reporta la ausencia.

---

## 3. Orden de autoridad

Si detectas contradicción:

```text
1. Seguridad / privacidad
2. Integridad financiera
3. FINWISE_CONTEXTO_MAESTRO.md
4. MODELO_DATOS_Y_SEGURIDAD.md
5. ARQUITECTURA_TECNICA.md + ADRs
6. CASOS_DE_USO_Y_FLUJOS.md
7. SISTEMA_DISENO_FINWISE.md
8. WIREFRAMES_Y_PANTALLAS.md
9. GESTION_GITHUB_Y_RAMAS.md
10. BACKLOG / PLAN
11. tu preferencia
```

No cambies una decisión establecida silenciosamente.

---

## 4. Alcance actual

Prioridad actual:

```text
MVP académico P0
```

Debe demostrar:

```text
1. Registrar ingresos/gastos
2. Resumen financiero básico
3. Dinero disponible después de compromisos
```

Soporte técnico P0:

```text
auth
profiles
accounts
categories
transactions
obligations
safety reserve
dashboard
```

No implementes funcionalidades P1/P2 solo porque "serían útiles" si la tarea no las requiere.

---

## 5. Stack oficial

Usa:

```text
Next.js 16.x
React
TypeScript strict
Tailwind CSS
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
Supabase CLI

Vitest
React Testing Library
Playwright

pnpm
GitHub Actions
Vercel
```

No introduzcas por defecto:

```text
Prisma
Drizzle
NestJS
Redis
Kafka
RabbitMQ
GraphQL
tRPC
Redux
Zustand
TanStack Query
Realtime
Edge Functions
```

Si una tarea parece exigir una tecnología no adoptada, explica la necesidad antes de instalarla.

---

## 6. Arquitectura

Estilo:

```text
monolito modular
```

Dirección de dependencia:

```text
Presentation
→ Application
→ Domain
→ Infrastructure
→ Database
```

### Regla crítica

La lógica financiera **NO** debe vivir en componentes React.

El dominio no debe depender de:

```text
react
next/*
@supabase/*
```

cuando la regla puede ser una función pura.

---

## 7. Next.js

Preferir:

### Lecturas

```text
Server Components
```

### Mutaciones de la aplicación

```text
Server Actions
```

### HTTP explícito

```text
Route Handlers
```

solo cuando exista un contrato HTTP real, webhook o integración.

No uses `"use client"` en árboles completos por comodidad.

---

## 8. Identidad y datos

Autenticación:

```text
auth.users
```

Perfil:

```text
public.profiles
```

No crees otra tabla `users` paralela.

MVP data:

```text
profiles
accounts
categories
transactions
obligations
```

---

## 9. Dinero

### Database

```text
numeric(20,4)
```

### TypeScript domain

```text
decimal.js
```

No uses aritmética con `number` para cálculos monetarios críticos.

En límites server/client preferir:

```text
decimal string
```

No redondees en pasos intermedios innecesariamente.

---

## 10. Invariantes financieras

Nunca violes:

```text
saldo != dinero disponible
crédito disponible != efectivo
transferencia != ingreso
transferencia != gasto
```

Tarjeta de crédito:

- compra aumenta deuda;
- compra cuenta como gasto;
- no reduce liquidez inmediatamente.

Pago de tarjeta:

```text
TRANSFER desde activo
+
TRANSFER hacia tarjeta
```

No duplicar el gasto.

---

## 11. Dinero disponible MVP

Fórmula:

```text
saldoLiquido
- obligacionesPendientes
- reservaSeguridad
```

Debe devolver/permitir breakdown:

```text
saldoLiquido
obligacionesPendientes
reservaSeguridad
disponible
```

No muestres un resultado negativo como:

```text
Puedes gastar -$X
```

Usa un mensaje de déficit.

---

## 12. Transferencias

Dos transactions:

```text
origen: TRANSFER + OUTFLOW
destino: TRANSFER + INFLOW
```

Mismo:

```text
transfer_group_id
user
amount
currency
```

Diferentes cuentas.

Operación atómica.

---

## 13. Seguridad

Toda tabla multiusuario:

```text
user_id
RLS
index user_id
policies explícitas
```

No confíes en filtros del frontend como autorización.

No uses service role para operaciones normales.

`service_role` jamás llega al cliente.

---

## 14. Ownership

Siempre valida que relaciones pertenecen al mismo usuario.

Cuando el schema use FK compuesta de ownership, respétala.

Nunca relajes RLS para "hacer funcionar" una feature.

---

## 15. Migraciones

Todo cambio de DB:

```text
supabase/migrations/
```

Debe considerar:

- schema;
- constraints;
- indexes;
- grants;
- RLS;
- policies;
- triggers/functions;
- tests.

No hagas cambios manuales rutinarios en producción.

No borres datos para resolver una incompatibilidad salvo entorno local desechable y autorización.

---

## 16. Soft delete

Cuando exista `deleted_at`, las queries normales deben excluirlo.

No hard-delete histórico arbitrariamente.

---

## 17. Código y naming

Código:

```text
English
```

UI y documentación:

```text
Spanish
```

Convenciones:

```text
camelCase
PascalCase
UPPER_SNAKE_CASE
```

TypeScript:

```text
strict
```

Evita `any`.

Usa `unknown` + narrowing cuando corresponda.

---

## 18. UI de FinWise

Dirección:

```text
Apple premium
+
Fintech premium
+
Soft luxury
```

Primary:

```text
#2563EB
```

Accent:

```text
#06B6D4
```

Fonts:

```text
Manrope headings
Geist UI/data
```

Glass:

```text
moderado, no universal
```

No generes:

- interfaz SaaS genérica;
- gradientes morado/rosa;
- neon;
- glow excesivo;
- neumorfismo fuerte;
- tarjetas dentro de tarjetas sin motivo.

---

## 19. Mobile first-class

Mobile es igual o más importante que desktop.

Diseña/implementa primero mobile cuando la feature tenga UI.

Navegación mobile:

```text
Inicio
Movimientos
+
Metas
Más
```

Bottom nav:

```text
floating glass
```

Quick Create:

```text
Gasto
Ingreso
Transferencia
Obligación
```

No reduzcas simplemente el layout desktop.

---

## 20. Desktop

Sidebar:

```text
floating glass
+
collapsible
```

No uses densidad extrema.

---

## 21. Light / Dark

Todo componente nuevo debe funcionar en:

```text
Light
Dark
System
```

No hardcodees colores que rompan uno de los temas.

---

## 22. Motion

La animación explica estado.

No añadas motion decorativo permanente.

Usa presets compartidos.

Respeta:

```text
prefers-reduced-motion
```

Si un efecto reduce performance:

```text
reduce blur/motion
```

---

## 23. PWA

FinWise es PWA desde el MVP.

Respeta:

```text
safe areas
standalone
mobile bottom nav
touch targets
```

No implementes escritura financiera offline sin diseño específico.

---

## 24. Accesibilidad

Mínimo:

```text
WCAG AA
```

Buscar AAA razonable en información crítica.

Requisitos:

- labels;
- focus visible;
- keyboard;
- touch targets;
- errors asociados;
- no depender solo de color;
- reduced motion;
- charts con alternativa textual.

---

## 25. Estados UI

Cuando aplique, cubre:

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

No entregues solo happy path.

---

## 26. Formularios

Usa:

```text
React Hook Form + Zod
```

Errores de campo:

```text
inline
```

No uses únicamente toast.

Monto financiero:

- `> 0`;
- UI formatea;
- domain conserva precisión.

---

## 27. Testing

### Unit

Vitest.

Todo cálculo financiero relevante necesita pruebas.

### Component

React Testing Library.

Probar comportamiento.

### DB / RLS

Probar A/B/anon.

### E2E

Playwright para flujos críticos.

No borres tests para hacer pasar el build.

---

## 28. Checks antes de entregar

Ejecuta:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Cuando existan suites correspondientes:

```text
integration
e2e
```

Si algo falla, no declares la tarea lista.

---

# GIT / GITHUB

## 29. Ramas protegidas

Permanentes:

```text
main
staging
```

`main`:

```text
producción en Vercel
```

`staging`:

```text
integración y pruebas locales
```

NO trabajes directamente sobre ninguna.

---

## 30. Antes de comenzar una tarea

Primero identifica la rama:

```bash
git branch --show-current
```

Si estás en `main` o `staging`:

1. actualiza `staging`;
2. crea una rama de trabajo.

Ejemplo:

```bash
git switch staging
git fetch origin
git pull --ff-only origin staging
git switch -c funcionalidad/nombre
```

No empieces cambios de feature directamente en `staging`.

---

## 31. Nombres de ramas

En español:

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

Sin espacios ni acentos.

Ejemplo:

```text
funcionalidad/registro-gastos
```

---

## 32. Regla de oro Git

> **La rama nueva se adapta a staging. Staging nunca se adapta a la rama nueva.**

Si otros cambios ya entraron a `staging`, considéralos válidos.

No los elimines para facilitar tu merge.

---

## 33. Antes del PR hacia staging

Estando en TU rama:

```bash
git fetch origin
git merge origin/staging
```

Si hay conflictos:

```text
resolver en tu rama
```

Nunca modificar `staging` para resolverlos.

Después:

```text
lint
typecheck
test
build
```

Y revisar:

```bash
git status
git diff origin/staging...HEAD
```

---

## 34. Si el diff muestra cambios inesperados

Si ves:

- muchos archivos eliminados;
- cambios ajenos;
- configuraciones que no pertenecen a la tarea;
- pérdida de funcionalidad integrada;

**DETENTE**.

No intentes "hacerlo pasar".

Investiga el origen.

Si existe conflicto de negocio, solicita revisión humana.

---

## 35. Prohibido en main/staging

No ejecutes para reescribir ramas protegidas:

```bash
git push --force
git push --force-with-lease
git reset --hard
git clean -fd
git branch -D
```

No:

- hagas push directo;
- deshabilites protecciones;
- reviertas cambios ajenos para arreglar tu feature;
- copies una rama encima de staging;
- decidas que "ours" o "theirs" gana todo sin revisar.

---

## 36. Pull Request a staging

Requisitos:

```text
rama actualizada
sin conflictos
checks verdes
1 aprobación de otra persona
conversaciones resueltas
```

Merge:

```text
Squash and Merge
```

Después del merge:

```text
eliminar rama de trabajo
```

---

## 37. Producción

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

Usar:

```text
Merge Commit
```

No intentes fusionar una feature directamente a `main`.

---

## 38. Hotfix

Solo para producción crítica.

Nace desde:

```text
main
```

Nombre:

```text
urgencia/*
```

Después debe sincronizarse de vuelta a `staging` mediante:

```text
sincronizacion/*
→ PR
→ staging
```

Nunca push directo.

---

## 39. Conflictos complejos

Si dos implementaciones válidas chocan y no está claro qué comportamiento debe prevalecer:

**NO elijas borrando trabajo ajeno.**

Solicita decisión humana.

Especialmente si afecta:

- finanzas;
- seguridad;
- modelo de datos;
- UX acordada;
- migraciones.

---

## 40. Agente y operaciones destructivas

No ejecutes comandos destructivos con posibilidad de pérdida de trabajo sin autorización explícita.

Si necesitas rescatar cambios:

- crea rama de rescate;
- conserva historial;
- explica la situación.

La prioridad es no perder trabajo de otros.

---

# DESARROLLO

## 41. No dupliques

Antes de crear:

- service;
- repository;
- component;
- hook;
- schema;
- utility;

busca si ya existe algo equivalente.

No crees una segunda implementación porque sea más rápido.

---

## 42. Dependencias

Antes de instalar un paquete:

1. verifica si el stack actual resuelve;
2. comprueba necesidad;
3. evita duplicar librerías;
4. documenta dependencia relevante.

Si `pnpm-lock.yaml` cambia, debe ser intencional.

---

## 43. Errores

No muestres:

- stack;
- SQL;
- secrets;
- tokens.

No loguees información financiera completa sin necesidad.

---

## 44. Cambios de arquitectura

No reemplaces:

- Supabase;
- auth;
- modelo de dinero;
- Next.js;
- branching;
- fórmula de disponible;

sin una decisión explícita.

Si consideras imprescindible el cambio:

```text
explica problema
propón alternativa
describe impacto
requiere ADR
```

antes de implementarlo.

---

## 45. Documentación

Si cambias:

- regla financiera;
- entidad;
- flujo;
- arquitectura;
- diseño global;
- política Git;

actualiza el documento correspondiente.

No dejes código y docs contradiciéndose.

---

## 46. Definition of Done del agente

No declares una tarea terminada hasta que:

- [ ] implementaste el alcance solicitado;
- [ ] no introdujiste scope creep;
- [ ] seguridad está intacta;
- [ ] precisión financiera está intacta;
- [ ] RLS/ownership se respetan;
- [ ] estados UI relevantes existen;
- [ ] mobile está revisado;
- [ ] dark mode está revisado si aplica;
- [ ] accesibilidad relevante está cubierta;
- [ ] tests pertinentes pasan;
- [ ] lint pasa;
- [ ] typecheck pasa;
- [ ] build pasa;
- [ ] rama está actualizada con staging;
- [ ] conflictos se resolvieron en la rama propia;
- [ ] diff fue revisado;
- [ ] documentación se actualizó cuando correspondía.

---

## 47. Formato de entrega recomendado

Al finalizar una tarea informa:

```text
Rama:
Objetivo:
Archivos principales modificados:
Qué se implementó:
Migraciones:
Pruebas ejecutadas:
Resultados:
Riesgos/pendientes:
Documentación actualizada:
```

No digas simplemente:

```text
"Listo"
```

sin indicar qué cambió.

---

## 48. Principios finales

### Producto

> El usuario necesita comprender su dinero, no solo registrar movimientos.

### Código

> La solución más simple que protege correctamente el dominio es preferible a la sobrearquitectura.

### Seguridad

> El frontend nunca es la barrera final de autorización.

### Finanzas

> Los cálculos deben ser exactos, reproducibles y explicables.

### Diseño

> Claridad y legibilidad prevalecen sobre efectos.

### Git

> La rama nueva se adapta a `staging`; `staging` no se sacrifica para acomodar trabajo nuevo.

---

# Fin de AGENTS.md
