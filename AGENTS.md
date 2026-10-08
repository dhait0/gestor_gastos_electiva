# AGENTS.md — FinWise

> Instrucciones obligatorias para cualquier agente de código, asistente de desarrollo o automatización que trabaje en este repositorio.
>
> **Lee este archivo antes de modificar cualquier archivo.**
>
> Este archivo actúa como router: no obliga a leer toda la documentación. Lee únicamente el contexto relevante para la tarea.

---

# 1. Principios principales

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

Principios operativos:

```text
seguridad
+
precisión financiera
+
cambio mínimo correcto
+
eficiencia
```

---

# 2. Política de eficiencia — OBLIGATORIA

Documento completo:

```text
contexto/desarrollo/POLITICA_EFICIENCIA_AGENTES.md
```

Regla:

> **Haz el mínimo trabajo correcto necesario para cumplir la tarea.**

Modo por defecto:

```text
ECONÓMICO
```

No:

```text
AUTÓNOMO PROFUNDO
```

por defecto.

---

# 3. Clasifica la tarea

Internamente:

```text
RÁPIDO
NORMAL
PROFUNDO
```

## Rápido

Ejemplos:

- copy;
- CSS;
- icono;
- bug localizado;
- documentación pequeña.

Objetivo orientativo:

```text
1–5 archivos relevantes
```

## Normal

Ejemplos:

- formulario;
- Server Action;
- pantalla;
- query;
- caso de uso.

Objetivo orientativo:

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

Los límites son blandos; no justifican trabajo incorrecto.

---

# 4. Detente cuando termines

Si la tarea está:

```text
implementada
+
verificada
```

detente.

No continúes con:

- mejoras no solicitadas;
- refactors;
- optimizaciones;
- documentación adicional;
- nuevas features.

Si detectas algo fuera de alcance:

```text
menciónalo
pero no lo implementes
```

---

# 5. No explores todo el repositorio

No empieces leyendo recursivamente todo el repo.

Orden:

```text
1. identificar módulo
2. búsqueda exacta si conoces nombre
3. búsqueda semántica si conoces concepto
4. abrir candidatos relevantes
5. expandir solo si hace falta
```

---

# 6. Usa indexación semántica

Si existe codebase indexing:

```text
semantic_search
→ pocos candidatos
→ leer archivos reales
→ modificar
```

Preferir inicialmente:

```text
5–10 resultados
```

El índice localiza; el código real es la verdad.

---

# 7. MCP: pocos y específicos

Los MCP consumen contexto mediante herramientas y schemas.

No activar muchos por defecto.

Preferir:

```text
1 servidor de contexto/código
+
1 servidor externo específico si realmente hace falta
```

No cargar GitHub/Slack/Notion/browser/database/etc. simultáneamente sin necesidad.

---

# 8. Lectura documental selectiva

Siempre debes respetar:

```text
contexto/FINWISE_CONTEXTO_MAESTRO.md
contexto/desarrollo/CONVENCIONES_DESARROLLO.md
contexto/desarrollo/GESTION_GITHUB_Y_RAMAS.md
contexto/desarrollo/POLITICA_EFICIENCIA_AGENTES.md
```

Pero **no cargues todos completos en cada tarea**.

Usa este archivo como router.

---

# 9. Router documental

## UI / UX

```text
contexto/diseno/SISTEMA_DISENO_FINWISE.md
contexto/diseno/WIREFRAMES_Y_PANTALLAS.md
```

Leer solo la sección/pantalla afectada.

## Arquitectura / backend

```text
contexto/arquitectura/ARQUITECTURA_TECNICA.md
contexto/arquitectura/adr/
```

solo si aplica.

## Datos / seguridad

```text
contexto/arquitectura/MODELO_DATOS_Y_SEGURIDAD.md
ADR relacionado
```

## Producto

```text
contexto/producto/CASOS_DE_USO_Y_FLUJOS.md
```

## Planificación

```text
contexto/planificacion/BACKLOG_MVP.md
contexto/planificacion/PLAN_IMPLEMENTACION_MVP.md
```

## Testing

```text
contexto/calidad/ESTRATEGIA_PRUEBAS.md
```

No leas documentos no relacionados "por si acaso".

---

# 10. Orden de autoridad

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
10. POLITICA_EFICIENCIA_AGENTES.md
11. BACKLOG / PLAN
12. preferencia del agente
```

La eficiencia nunca justifica romper seguridad o precisión.

---

# 11. Alcance actual

```text
MVP académico P0
```

Debe demostrar:

```text
1. Registrar ingresos/gastos
2. Resumen financiero básico
3. Dinero disponible después de compromisos
```

Soporte P0:

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

No implementes P1/P2 sin solicitud.

---

# 12. Stack oficial

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

---

# 13. Arquitectura

```text
Presentation
→ Application
→ Domain
→ Infrastructure
→ Database
```

Lógica financiera fuera de React.

El dominio no depende de:

```text
react
next/*
@supabase/*
```

cuando pueda ser una función pura.

---

# 14. Next.js

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

solo para contratos HTTP reales/webhooks/integraciones.

---

# 15. Datos e identidad

```text
auth.users
public.profiles
```

No crear otra tabla `users`.

P0:

```text
profiles
accounts
categories
transactions
obligations
```

---

# 16. Dinero

DB:

```text
numeric(20,4)
```

TypeScript:

```text
decimal.js
```

No `number` para cálculos críticos.

---

# 17. Invariantes

```text
saldo != dinero disponible
crédito disponible != efectivo
transferencia != ingreso
transferencia != gasto
```

Compra con tarjeta:

- aumenta deuda;
- es gasto;
- no reduce liquidez inmediatamente.

Pago tarjeta:

```text
TRANSFER desde activo
+
TRANSFER hacia tarjeta
```

---

# 18. Disponible MVP

```text
saldoLiquido
- obligacionesPendientes
- reservaSeguridad
```

Debe explicar:

```text
saldoLiquido
obligacionesPendientes
reservaSeguridad
disponible
```

---

# 19. Transferencias

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

Cuentas distintas. Operación atómica.

---

# 20. Seguridad

Toda tabla multiusuario:

```text
user_id
RLS
index user_id
policies explícitas
```

No confiar en frontend.

No usar `service_role` para operaciones normales.

---

# 21. Migraciones

Todo cambio DB:

```text
supabase/migrations/
```

Considerar:

- schema;
- constraints;
- indexes;
- grants;
- RLS;
- policies;
- triggers/functions;
- tests.

---

# 22. Código

Código:

```text
English
```

UI/docs:

```text
Spanish
```

TypeScript strict. Evitar `any`.

---

# 23. UI

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
Manrope
Geist
```

No producir:

- SaaS genérico;
- purple/pink AI gradient;
- neón;
- glow excesivo;
- neumorfismo fuerte;
- glass en todo.

---

# 24. Mobile

Mobile es igual o más importante que desktop.

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

# 25. Light / Dark / Motion

Todo componente nuevo:

```text
Light
Dark
System
```

Motion breve, funcional y compatible con reduced motion.

Performance prevalece.

---

# 26. PWA

Respetar:

```text
safe areas
standalone
touch targets
bottom navigation
```

No escrituras financieras offline sin diseño específico.

---

# 27. Accesibilidad

Mínimo:

```text
WCAG AA
```

- labels;
- focus;
- keyboard;
- touch targets;
- errores asociados;
- no solo color;
- reduced motion;
- fallback textual para charts.

---

# 28. Estados UI

Cuando aplique:

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

---

# 29. Formularios

```text
React Hook Form + Zod
```

Errores inline.

---

# 30. Testing proporcional

Durante desarrollo:

```text
cambio pequeño → test específico
feature → tests del módulo
```

Antes del PR:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

No E2E completo tras cada pequeña edición.

---

# 31. Intentos

Máximo orientativo:

```text
2 intentos sustancialmente similares
```

Luego cambiar estrategia o reportar bloqueo.

---

# 32. Web

No investigar internet por defecto.

Para preguntas internas:

```text
repo/index > web
```

---

# 33. Ramas protegidas

```text
main
staging
```

`main` = producción Vercel.

`staging` = integración + pruebas locales.

Nunca trabajar directamente sobre ellas.

---

# 34. Crear rama

```bash
git switch staging
git fetch origin
git pull --ff-only origin staging
git switch -c funcionalidad/nombre
```

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

---

# 35. Regla de oro Git

> **La rama nueva se adapta a staging. Staging nunca se adapta a la rama nueva.**

No borrar cambios integrados para facilitar un merge.

---

# 36. Antes del PR

En tu rama:

```bash
git fetch origin
git merge origin/staging
```

Resolver conflictos EN TU RAMA.

Luego:

```text
lint
typecheck
test
build
```

Revisar:

```bash
git status
git diff origin/staging...HEAD
```

---

# 37. Diff inesperado

Si aparecen muchas eliminaciones/cambios ajenos:

```text
DETENER
```

Investigar o solicitar revisión.

---

# 38. Prohibido

No reescribir ramas protegidas con:

```bash
git push --force
git push --force-with-lease
git reset --hard
git clean -fd
git branch -D
```

sin autorización humana explícita.

No:

- push directo;
- desactivar protecciones;
- borrar trabajo ajeno;
- copiar rama sobre staging;
- aceptar `ours/theirs` masivamente.

---

# 39. PR a staging

Requiere:

```text
actualizada
sin conflictos
checks verdes
1 aprobación externa
conversaciones resueltas
```

Merge:

```text
Squash and Merge
```

Eliminar rama después.

---

# 40. Producción

```text
staging
→ PR
→ main
→ Vercel
```

Solo responsable de producción autoriza/fusiona.

Usar:

```text
Merge Commit
```

---

# 41. Hotfix

Solo crítico:

```text
urgencia/*
```

desde `main`.

Luego:

```text
sincronizacion/*
→ PR
→ staging
```

---

# 42. No dupliques

Antes de crear:

- component;
- hook;
- service;
- repository;
- schema;
- utility;

buscar equivalente.

---

# 43. Dependencias

No instalar si el stack actual resuelve razonablemente.

`pnpm-lock.yaml` cambia solo intencionalmente.

---

# 44. Refactor

No refactorizar fuera de alcance.

Si detectas mejora:

```text
reportar
no implementar
```

salvo bloqueo real.

---

# 45. Documentación

No generar Markdown extra por defecto.

Actualizar solo si cambia una decisión/regla.

---

# 46. Errores y logging

No exponer:

- stack;
- SQL;
- secretos;
- tokens.

No loguear datos financieros completos innecesariamente.

---

# 47. Cambio de arquitectura

No reemplazar silenciosamente:

- Supabase;
- auth;
- dinero decimal;
- Next.js;
- branching;
- fórmula disponible.

Cambio relevante requiere ADR.

---

# 48. Definition of Done

- [ ] alcance cumplido;
- [ ] sin scope creep;
- [ ] seguridad intacta;
- [ ] precisión financiera intacta;
- [ ] RLS/ownership respetados;
- [ ] estados UI relevantes;
- [ ] mobile revisado;
- [ ] dark revisado si aplica;
- [ ] accesibilidad relevante;
- [ ] tests pertinentes;
- [ ] lint;
- [ ] typecheck;
- [ ] build;
- [ ] rama actualizada con staging;
- [ ] conflictos en rama propia;
- [ ] diff revisado;
- [ ] docs actualizadas si corresponde.

---

# 49. Entrega

Respuesta final:

```text
Implementado:
- ...

Archivos:
- ...

Validación:
- ...

Pendientes:
- ...
```

Ser breve.

---

# 50. Principios finales

### Producto
> El usuario necesita comprender su dinero, no solo registrar movimientos.

### Código
> La solución más simple que protege el dominio es preferible a la sobrearquitectura.

### Seguridad
> El frontend nunca es la barrera final de autorización.

### Finanzas
> Los cálculos deben ser exactos, reproducibles y explicables.

### Diseño
> Claridad prevalece sobre efectos.

### Git
> La rama nueva se adapta a `staging`.

### Eficiencia
> Localiza el contexto correcto, realiza el cambio mínimo correcto y detente cuando el objetivo esté cumplido.

---

# Fin de AGENTS.md
