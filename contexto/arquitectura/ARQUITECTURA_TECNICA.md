# FinWise — Arquitectura Técnica

> Documento de arquitectura tecnológica y criterios de implementación para FinWise.  
> Ubicación: `contexto/arquitectura/ARQUITECTURA_TECNICA.md`  
> Estado: **Arquitectura base aprobada**  
> Fecha de referencia: **7 de octubre de 2026**

---

# 1. Propósito

Este documento define la arquitectura técnica base de **FinWise** y complementa `FINWISE_CONTEXTO_MAESTRO.md`.

Su objetivo es mantener consistencia entre desarrolladores y agentes de IA, estableciendo decisiones comunes para:

- aplicación web;
- backend;
- base de datos;
- autenticación;
- autorización;
- lógica financiera;
- diseño de módulos;
- pruebas;
- seguridad;
- CI/CD;
- ambientes;
- despliegue;
- evolución futura.

Cuando exista una contradicción, aplicar este orden de prioridad:

1. Seguridad y privacidad.
2. Integridad y precisión financiera.
3. Reglas de dominio del contexto maestro.
4. Decisiones arquitectónicas aprobadas.
5. Requisitos funcionales.
6. Conveniencia técnica.

---

# 2. Decisiones base

| Área | Decisión |
|---|---|
| Hosting | Vercel |
| Base de datos | Supabase PostgreSQL |
| Backend as a Service | Supabase |
| Repositorio | GitHub |
| CI/CD | GitHub Actions |
| Framework | Next.js |
| Lenguaje | TypeScript |
| Arquitectura | Monolito modular |

Las decisiones anteriores solo deben modificarse mediante una decisión arquitectónica documentada.

---

# 3. Stack tecnológico oficial

## 3.1 Aplicación

- **Next.js 16.x**
- **App Router**
- **React**
- **TypeScript `strict`**

La referencia inicial será una versión estable y soportada de Next.js 16.x.

No acoplar reglas de negocio a APIs experimentales del framework.

---

## 3.2 UI

- **Tailwind CSS**
- **shadcn/ui**
- **Radix UI**
- **Lucide Icons**

El sistema visual completo se definirá en un documento independiente.

---

## 3.3 Animaciones

Librería principal:

- **Motion**

Usar Motion para:

- transiciones;
- microinteracciones;
- layout animations;
- modales;
- drawers;
- barras de progreso;
- cambios visuales de métricas;
- entrada y salida de elementos.

No instalar inicialmente GSAP, Three.js, Lottie u otras librerías salvo necesidad real.

---

## 3.4 Gráficas

- **Recharts**

Casos iniciales:

- ingresos vs gastos;
- gastos por categoría;
- tendencias;
- presupuestos;
- comparaciones;
- evolución temporal.

---

## 3.5 Formularios y validación

- **React Hook Form**
- **Zod**

Zod será la validación estructural principal tanto en cliente como en servidor cuando sea posible.

---

## 3.6 Fechas

- **date-fns**

Zona horaria inicial:

`America/Bogota`

Diferenciar siempre:

- fecha financiera;
- timestamp técnico;
- zona horaria del usuario.

---

## 3.7 Dinero

Persistencia recomendada:

- PostgreSQL `NUMERIC`.

Reglas:

- no usar `float` para cálculos financieros críticos;
- centralizar operaciones monetarias;
- redondear principalmente en presentación;
- usar `Intl.NumberFormat` para mostrar valores;
- definir en el modelo de datos la precisión exacta y política de redondeo.

---

# 4. Backend

FinWise no tendrá inicialmente un backend independiente como NestJS, Express o Fastify.

Next.js actuará como framework full-stack mediante:

- Server Components;
- Server Actions;
- Route Handlers;
- servicios de aplicación;
- servicios de dominio;
- repositorios;
- módulos `server-only`.

Esto reduce complejidad sin convertir componentes React en servicios de negocio.

---

# 5. Arquitectura general

```text
┌──────────────────────────────────────────────┐
│                   USUARIO                    │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                 PRESENTATION                 │
│                                              │
│ Next.js / React                              │
│ shadcn/ui / Tailwind                         │
│ Motion / Recharts                            │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                 APPLICATION                  │
│                                              │
│ Casos de uso                                 │
│ Server Actions                               │
│ Route Handlers                               │
│ Orquestación                                 │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                    DOMAIN                    │
│                                              │
│ Reglas financieras                          │
│ Cálculos                                    │
│ Invariantes                                 │
│ Políticas de negocio                        │
└──────────────────────┬───────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────┐
│                INFRASTRUCTURE                │
│                                              │
│ Repositories                                 │
│ Supabase clients                             │
│ Auth                                         │
│ PostgreSQL                                   │
│ Storage                                      │
└──────────────────────────────────────────────┘
```

---

# 6. Estilo arquitectónico

Se adopta:

> **Monolito modular con separación explícita entre presentación, aplicación, dominio e infraestructura.**

No utilizar microservicios en la primera etapa.

Una separación futura deberá justificarse por necesidades reales como:

- escalabilidad independiente;
- cargas asíncronas;
- seguridad;
- límites operativos;
- integraciones complejas;
- equipos independientes.

---

# 7. Reglas por capa

## 7.1 Presentation

Responsabilidades:

- páginas;
- layouts;
- componentes;
- formularios;
- estados visuales;
- navegación;
- visualización.

No debe contener cálculos financieros críticos.

---

## 7.2 Application

Responsabilidades:

- casos de uso;
- autorización;
- coordinación de repositorios;
- ejecución del dominio;
- manejo de errores de aplicación.

Ejemplos:

- `createTransaction()`
- `updateBudget()`
- `createGoal()`
- `getDashboardSummary()`
- `simulatePurchase()`

---

## 7.3 Domain

Responsabilidades:

- reglas financieras;
- cálculos;
- invariantes;
- políticas de negocio.

Ejemplos:

- `calculateAccountBalance()`
- `calculateLiquidBalance()`
- `calculateAvailableToSpend()`
- `calculateBudgetUsage()`
- `calculateSavingsRate()`
- `calculateGoalRequiredSaving()`
- `calculateMonthlyForecast()`
- `detectRecurringTransactions()`
- `calculateDebtStrategy()`
- `calculateFinancialScore()`

La lógica de dominio no debe depender de:

- React;
- Next.js;
- Supabase;
- Tailwind;
- navegador.

---

## 7.4 Infrastructure

Responsabilidades:

- persistencia;
- consultas Supabase;
- autenticación;
- storage;
- integraciones externas;
- adaptadores.

La infraestructura no decide reglas financieras.

---

# 8. Supabase

Supabase será responsable inicialmente de:

```text
Supabase
├── PostgreSQL
├── Auth
├── Row Level Security
├── Migraciones
├── Tipos generados
└── Storage cuando sea necesario
```

No activar por defecto:

- Realtime;
- Edge Functions;
- soluciones asíncronas adicionales.

Solo incorporarlas cuando exista un caso de uso real.

---

# 9. Acceso a datos

Se utilizarán:

- `@supabase/supabase-js`;
- `@supabase/ssr`;
- tipos TypeScript generados desde Supabase;
- repositorios propios.

No se utilizará Prisma inicialmente.

Motivos:

1. Supabase ya proporciona acceso tipado a PostgreSQL.
2. RLS será central en la seguridad.
3. Evitamos duplicar modelos.
4. Evitamos sistemas paralelos de migraciones.
5. Reducimos complejidad.

`@supabase/ssr` debe quedar encapsulado en utilidades propias para reducir impacto de cambios de API.

Estructura:

```text
src/lib/supabase/
├── client.ts
├── server.ts
└── types.ts
```

---

# 10. Autenticación

Sistema:

- **Supabase Auth**

Primera etapa:

- email;
- contraseña;
- recuperación de contraseña.

Segunda etapa:

- Google OAuth.

Las sesiones SSR se manejarán mediante cookies.

No implementar autenticación propia.

No almacenar contraseñas dentro de tablas del dominio.

---

# 11. Autorización

La autorización tendrá dos niveles.

## Aplicación

Los casos de uso deben validar el usuario autenticado y ownership.

## Base de datos

Las tablas privadas tendrán **Row Level Security**.

Regla conceptual:

```text
row.user_id == authenticated_user.id
```

Nunca confiar en un `userId` enviado desde el frontend.

---

# 12. Service Role

La `service_role`:

- nunca debe llegar al navegador;
- nunca debe estar en Git;
- no debe utilizarse para operaciones normales de usuario;
- solo debe emplearse en procesos administrativos controlados.

Al bypassar RLS, cualquier uso requiere autorización explícita en servidor.

---

# 13. Estrategia de lectura y escritura

## Server Components

Preferencia para:

- lecturas iniciales;
- dashboard;
- reportes;
- páginas autenticadas.

## Server Actions

Preferencia para mutaciones originadas en la aplicación:

- crear transacción;
- editar presupuesto;
- registrar meta;
- registrar contribución.

## Route Handlers

Usar para:

- webhooks;
- callbacks;
- integraciones;
- exportaciones;
- API externa;
- contratos HTTP explícitos.

No crear una API REST interna completa por defecto si Server Actions resuelven el caso.

---

# 14. Caché

Los datos financieros autenticados son privados.

Regla:

> **Nunca usar caché compartida entre usuarios para información financiera personal.**

Toda caché debe considerar:

- identidad;
- sensibilidad;
- consistencia;
- invalidación.

Usarla principalmente para:

- contenido público;
- configuración estática;
- catálogos no sensibles;
- resultados explícitamente segmentados.

---

# 15. Estructura del repositorio

```text
finwise/
│
├── contexto/
│   ├── FINWISE_CONTEXTO_MAESTRO.md
│   └── arquitectura/
│       ├── ARQUITECTURA_TECNICA.md
│       └── MODELO_DATOS_Y_SEGURIDAD.md
│
├── docs/
│   ├── adr/
│   ├── design/
│   └── database/
│
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   ├── (app)/
│   │   ├── api/
│   │   ├── layout.tsx
│   │   └── globals.css
│   │
│   ├── components/
│   │   ├── ui/
│   │   ├── layout/
│   │   └── shared/
│   │
│   ├── features/
│   │   ├── accounts/
│   │   ├── transactions/
│   │   ├── budgets/
│   │   ├── goals/
│   │   ├── recurring/
│   │   ├── subscriptions/
│   │   ├── debts/
│   │   └── dashboard/
│   │
│   ├── domain/
│   │   ├── money/
│   │   ├── budgets/
│   │   ├── forecasting/
│   │   ├── goals/
│   │   ├── debts/
│   │   └── recurring/
│   │
│   ├── application/
│   │   └── services/
│   │
│   ├── repositories/
│   ├── schemas/
│   ├── lib/
│   │   ├── supabase/
│   │   ├── money/
│   │   ├── dates/
│   │   └── utils/
│   │
│   └── types/
│
├── supabase/
│   ├── migrations/
│   ├── seed.sql
│   └── config.toml
│
├── tests/
│   ├── unit/
│   └── integration/
│
├── e2e/
├── .github/
│   └── workflows/
├── public/
├── package.json
└── README.md
```

No crear carpetas vacías anticipadamente. Crear módulos cuando exista código real.

---

# 16. Base de datos

Motor:

- **PostgreSQL administrado por Supabase**

Principios:

- claves primarias estables;
- claves foráneas explícitas;
- constraints;
- índices basados en consultas reales;
- timestamps;
- soft-delete solo cuando corresponda;
- RLS para datos privados;
- migraciones versionadas.

El esquema definitivo se definirá en `MODELO_DATOS_Y_SEGURIDAD.md`.

---

# 17. Migraciones

Ubicación:

```text
supabase/migrations/
```

No modificar producción manualmente como práctica normal.

Flujo:

```text
Cambio de esquema
      ↓
Migración local
      ↓
Pruebas
      ↓
Pull Request
      ↓
CI
      ↓
Staging
      ↓
Producción
```

Comando de despliegue:

```text
supabase db push
```

Para cambios destructivos utilizar:

```text
EXPAND
  ↓
MIGRATE
  ↓
CONTRACT
```

---

# 18. Ambientes

## Local

- Supabase local;
- datos ficticios;
- desarrollo;
- pruebas.

## Staging

- integración;
- migraciones;
- demostraciones;
- smoke tests.

## Production

- usuarios reales;
- datos reales;
- dominio oficial.

Nunca desarrollar contra producción.

---

# 19. Variables de entorno

Ejemplos:

```text
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

SUPABASE_SERVICE_ROLE_KEY

VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

Mantener:

```text
.env.example
```

No versionar secretos reales.

---

# 20. Git

Repositorio:

- GitHub.

Ramas iniciales sugeridas:

```text
main
develop
feature/*
fix/*
```

`main`

- producción.

`develop`

- integración y staging.

`feature/*`

- desarrollo de funcionalidades.

`fix/*`

- correcciones.

Para producción usar siempre Pull Request y controles de CI.

---

# 21. CI/CD

Proveedor:

- **GitHub Actions**

Objetivos:

1. verificar calidad;
2. probar lógica;
3. probar migraciones;
4. validar build;
5. desplegar staging;
6. desplegar producción.

---

# 22. Pipeline de Pull Request

```text
Pull Request
     ↓
Checkout
     ↓
Install
     ↓
Lint
     ↓
Typecheck
     ↓
Unit tests
     ↓
Supabase local
     ↓
Migration tests
     ↓
Integration tests
     ↓
Next.js build
     ↓
Playwright cuando corresponda
```

---

# 23. Pipeline de Staging

```text
develop
   ↓
Quality checks
   ↓
Migraciones → Supabase Staging
   ↓
Vercel build
   ↓
Vercel deployment
   ↓
Smoke tests
```

---

# 24. Pipeline de Production

```text
main
  ↓
Quality checks
  ↓
Migraciones compatibles
  ↓
vercel pull
  ↓
vercel build --prod
  ↓
vercel deploy --prebuilt --prod
  ↓
Smoke tests
```

GitHub Actions será la autoridad principal del pipeline.

---

# 25. Vercel

Vercel será responsable de:

- hosting;
- ejecución de Next.js;
- previews;
- configuración de ambientes;
- despliegues.

Flujo desde CI:

```text
vercel pull
vercel build
vercel deploy --prebuilt
```

---

# 26. Testing

Stack:

- **Vitest**
- **React Testing Library**
- **Playwright**

## Unitarias

Prioridad:

- dinero;
- saldo;
- dinero disponible;
- presupuestos;
- forecast;
- metas;
- recurrencias;
- deudas;
- simulaciones.

La lógica financiera debe probarse sin navegador y sin Supabase.

## Integración

Cubrir:

- repositorios;
- migraciones;
- RLS;
- Auth + datos;
- Server Actions relevantes.

## E2E

Flujos iniciales:

1. registrarse/iniciar sesión;
2. crear cuenta;
3. registrar ingreso;
4. registrar gasto;
5. ver dashboard;
6. calcular dinero disponible;
7. cerrar sesión.

---

# 27. Estado cliente

No usar Redux inicialmente.

Prioridad:

1. Server Components;
2. Server Actions;
3. URL state;
4. React local state.

Agregar **TanStack Query** solo cuando exista una necesidad real de cache/invalidation/optimistic updates.

Agregar **Zustand** únicamente si aparece estado global cliente real.

---

# 28. Seguridad

Principios obligatorios:

- least privilege;
- RLS;
- cookies seguras;
- validación de entrada;
- autorización por recurso;
- secretos fuera de Git;
- no confiar en IDs del cliente;
- no exponer stack traces;
- no registrar datos sensibles innecesarios.

---

# 29. Errores

Categorías:

```text
VALIDATION_ERROR
AUTHENTICATION_ERROR
AUTHORIZATION_ERROR
NOT_FOUND
DOMAIN_ERROR
CONFLICT
RATE_LIMITED
INTERNAL_ERROR
```

La UI muestra mensajes comprensibles.

Los detalles técnicos quedan en logs internos.

---

# 30. Performance

Orden:

```text
correctitud
   ↓
seguridad
   ↓
mantenibilidad
   ↓
medición
   ↓
optimización
```

No introducir inicialmente:

- Redis;
- caché distribuida;
- colas;
- precomputaciones complejas.

Primero optimizar:

- consultas;
- índices;
- paginación;
- Server Components;
- carga diferida.

---

# 31. Calidad de código

Antes de merge:

```text
lint
typecheck
test
build
```

TypeScript:

```text
strict: true
```

Evitar:

- `any`;
- lógica financiera dentro de JSX;
- queries duplicadas;
- dependencias circulares;
- constantes mágicas;
- componentes gigantes.

---

# 32. Package manager

Estándar recomendado:

- **pnpm**

Mantener un único lockfile.

No mezclar npm, yarn y pnpm en el mismo proyecto.

---

# 33. Dependencias

Antes de añadir una dependencia responder:

1. ¿Qué problema resuelve?
2. ¿Ya existe una herramienta que lo resuelva?
3. ¿Puede resolverlo la plataforma?
4. ¿Está mantenida?
5. ¿Afecta bundle?
6. ¿Afecta seguridad?
7. ¿La necesitamos ahora?

---

# 34. Decisiones pospuestas

No adoptar todavía:

- NestJS;
- Prisma;
- Redis;
- microservicios;
- Kafka;
- RabbitMQ;
- GraphQL;
- tRPC;
- Redux;
- Zustand;
- TanStack Query;
- Sentry;
- Supabase Realtime;
- Supabase Edge Functions;
- integraciones bancarias;
- IA productiva.

No están prohibidas: requieren necesidad real y ADR.

---

# 35. Architecture Decision Records

Ubicación:

```text
docs/adr/
```

Primeros ADR:

```text
ADR-001-nextjs.md
ADR-002-supabase.md
ADR-003-monolito-modular.md
ADR-004-data-access.md
ADR-005-money-representation.md
```

Cada ADR debe incluir:

- contexto;
- decisión;
- alternativas;
- consecuencias;
- estado.

---

# 36. Flujo ejemplo — Crear gasto

```text
Usuario
   ↓
TransactionForm
   ↓
Zod
   ↓
Server Action
   ↓
Application Service
   ↓
Authorization
   ↓
Domain validations
   ↓
Repository
   ↓
Supabase
   ↓
PostgreSQL + RLS
   ↓
Revalidation
   ↓
UI actualizada
```

---

# 37. Flujo ejemplo — Dashboard

```text
Request autenticado
       ↓
Server Component
       ↓
Application Service
       ↓
Repositories
       ↓
Supabase + RLS
       ↓
Domain calculations
       ↓
View Model
       ↓
Dashboard
```

---

# 38. Flujo ejemplo — Dinero disponible

```text
Repositories
    ↓
saldo líquido
obligaciones
metas
deudas
reserva
    ↓
calculateAvailableToSpend()
    ↓
resultado explicable
    ↓
UI
```

La función financiera no consulta Supabase directamente.

---

# 39. Diseño visual

El diseño se definirá en un documento aparte.

Dirección preliminar:

- fintech premium;
- inspiración iOS/macOS;
- glassmorphism moderado;
- soft UI sutil;
- alta legibilidad;
- Motion;
- responsive;
- accesibilidad.

La arquitectura no debe depender del estilo visual.

---

# 40. Definition of Done técnica

Una funcionalidad se considera terminada cuando:

- respeta las capas;
- no duplica lógica;
- valida entradas;
- controla autorización;
- respeta RLS;
- maneja errores;
- incluye pruebas relevantes;
- pasa lint;
- pasa typecheck;
- pasa tests;
- pasa build;
- no expone secretos;
- actualiza documentación cuando cambia arquitectura o dominio.

---

# 41. Resumen ejecutivo

```text
Framework           Next.js 16.x / App Router
Frontend            React
Lenguaje            TypeScript strict

Estilos             Tailwind CSS
UI                  shadcn/ui + Radix UI
Iconos              Lucide
Animaciones         Motion
Gráficas            Recharts

Forms               React Hook Form
Validación          Zod
Fechas              date-fns

Base de datos       Supabase PostgreSQL
Auth                Supabase Auth
Autorización        RLS + Application checks
Data access         supabase-js + @supabase/ssr
ORM adicional       No inicialmente

Backend             Next.js server-side
Arquitectura        Monolito modular

Unit tests          Vitest
Component tests     React Testing Library
E2E                 Playwright

Repositorio         GitHub
CI/CD               GitHub Actions
Hosting             Vercel

Ambientes           Local / Staging / Production
Migraciones         Supabase CLI
Package manager     pnpm
```

---

# 42. Próximo documento requerido

La arquitectura define **cómo construiremos FinWise**.

El siguiente paso debe definir **qué información existirá, cómo se relacionará y cómo se protegerá**.

Crear:

```text
contexto/arquitectura/MODELO_DATOS_Y_SEGURIDAD.md
```

Debe contener:

1. entidades;
2. relaciones;
3. diagrama ER;
4. tablas y columnas;
5. tipos de datos;
6. claves primarias y foráneas;
7. constraints;
8. índices;
9. estrategia monetaria definitiva;
10. soft-delete;
11. auditoría;
12. relación Supabase Auth ↔ Profile;
13. políticas RLS;
14. ownership;
15. datos demo;
16. migraciones iniciales.

Después de aprobar ese documento se debe construir el **Sistema de Diseño FinWise** y posteriormente inicializar el repositorio.

---

# Fin del documento
