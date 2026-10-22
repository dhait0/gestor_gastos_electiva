# FinWise — Plan de Implementación MVP

> Secuencia técnica recomendada para construir FinWise sin sobrearquitectura.

---

# 1. Principio

No construir "capas completas" aisladas durante semanas.

Preferir:

```text
vertical slices
```

Cada slice debe atravesar:

```text
UI
→ Application
→ Domain
→ Repository
→ Supabase/Postgres
→ Tests
```

---

# 2. Fase 0 — Bootstrap

Entregable:

```text
aplicación Next.js ejecutando
+
CI mínima
+
estructura base
```

Tareas:

1. crear repositorio;
2. Next.js + TypeScript;
3. pnpm;
4. Tailwind;
5. shadcn/ui;
6. Motion;
7. Recharts;
8. Zod;
9. React Hook Form;
10. decimal.js;
11. Supabase packages;
12. Vitest;
13. RTL;
14. Playwright;
15. env example;
16. GitHub Actions inicial.

No crear todavía decenas de componentes.

---

# 3. Estructura inicial recomendada

```text
src/
├── app/
├── components/
│   ├── ui/
│   └── finwise/
├── modules/
│   ├── auth/
│   ├── accounts/
│   ├── transactions/
│   ├── obligations/
│   └── dashboard/
├── lib/
│   ├── supabase/
│   ├── validation/
│   └── money/
└── styles/

supabase/
├── migrations/
├── seed.sql
└── tests/
```

Cada módulo puede evolucionar a:

```text
domain/
application/
infrastructure/
presentation/
```

cuando la complejidad real lo justifique.

---

# 4. Fase 1 — Sistema visual mínimo

Antes del dashboard:

- tokens;
- fonts;
- theme;
- Button;
- Input;
- MoneyInput;
- Card;
- AppShell base;
- responsive foundations.

No construir el design system completo antes de tener un flujo.

---

# 5. Fase 2 — Supabase base

Crear primeras migraciones:

```text
profiles
accounts
categories
transactions
obligations
```

Agregar:

- constraints;
- indexes;
- grants;
- RLS;
- policies;
- trigger profile;
- seed categorías.

Generar tipos TypeScript.

---

# 6. Fase 3 — Auth vertical slice

Implementar:

```text
signup
login
logout
protected route
profile
```

Tests:

- signup;
- login;
- route protection;
- profile creation.

Resultado:

usuario puede entrar a un entorno privado real.

---

# 7. Fase 4 — Onboarding + cuenta

Slice:

```text
nuevo usuario
→ onboarding
→ primera cuenta
→ dashboard vacío
```

Crear:

- profile settings;
- account repository;
- create account use case;
- account list;
- RLS tests.

---

# 8. Fase 5 — Primer ingreso

Slice:

```text
+
→ ingreso
→ persistir
→ balance derivado
→ dashboard
```

Este slice valida por primera vez:

- transaction model;
- categorías;
- money precision;
- domain calculation;
- refresh/revalidation;
- mobile flow.

---

# 9. Fase 6 — Primer gasto

Slice:

```text
+
→ gasto
→ persistir
→ gasto periodo
→ balance
→ dashboard
```

Agregar prueba de tarjeta de crédito aunque UI de tarjeta todavía sea simple.

---

# 10. Fase 7 — Dinero disponible

Implementar funciones puras:

```text
calculateAccountBalance
calculateLiquidBalance
calculatePendingObligations
calculateAvailableToSpend
```

Después:

```text
Dashboard ViewModel
```

Debe mostrar breakdown explicable.

---

# 11. Fase 8 — Obligaciones

Slice:

```text
crear obligación
→ pendiente
→ recalcular disponible
```

Luego:

```text
lista
detalle
```

Marcar pagada puede quedar en P1 si la demo académica no lo exige.

---

# 12. Fase 9 — Reserva de seguridad

Implementar:

```text
settings
→ safety reserve
→ preview
→ save
→ dashboard recalculated
```

---

# 13. Fase 10 — Dashboard MVP completo

Debe contener:

```text
AvailableToSpendCard
Saldo líquido
Ingresos
Gastos
Movimientos recientes
```

Chart puede entrar después si pone en riesgo P0.

---

# 14. Fase 11 — Movimientos

Implementar:

- lista;
- paginación;
- filtros básicos;
- detalle.

P1:

- editar;
- eliminar;
- transferir.

---

# 15. Fase 12 — PWA y polish mobile

Agregar/verificar:

- manifest;
- iconos;
- standalone;
- safe area;
- bottom nav;
- Quick Create;
- teclado;
- CTA fijo;
- reduced motion;
- performance de blur.

---

# 16. Fase 13 — Seguridad

Antes de production/demo final:

- revisar RLS tabla por tabla;
- ejecutar tests A/B/anon;
- revisar service role;
- revisar exposición de env;
- revisar logging;
- revisar errores;
- verificar que no se filtran IDs ajenos.

---

# 17. Fase 14 — E2E

E2E principal:

```text
signup
→ onboarding
→ account
→ income
→ expense
→ obligation
→ available-to-spend
```

E2E seguridad:

```text
A crea dato
B no puede acceder
```

---

# 18. Fase 15 — Deployment

Pipeline:

```text
PR
→ CI
→ merge
→ migration
→ Vercel build
→ deploy
→ smoke test
```

Mantener staging/prod separados cuando sea posible.

---

# 19. Orden de ramas/features sugerido

```text
feat/bootstrap
feat/theme
feat/supabase-base
feat/auth
feat/onboarding
feat/accounts
feat/income
feat/expense
feat/available-to-spend
feat/obligations
feat/settings-reserve
feat/dashboard
feat/transactions-list
feat/pwa
test/e2e-mvp
```

No es obligatorio usar una rama por cada línea si el equipo es pequeño.

---

# 20. Primer vertical slice recomendado

El primer slice que demuestra producto real:

```text
Login
↓
Cuenta
↓
Registrar gasto
↓
Persistir
↓
Recalcular
↓
Mostrar nuevo disponible
```

Si esto funciona correctamente, arquitectura, dominio, datos y UI ya están conectados.

---

# 21. Qué no hacer al comenzar

No iniciar con:

- dashboard falso lleno de charts;
- 40 componentes UI;
- microservicios;
- módulo AI;
- presupuestos antes de transacciones;
- metas antes del cálculo de saldo;
- sincronización bancaria;
- abstracciones genéricas sin uso real.

---

# 22. Punto de salida de MVP académico

MVP académico terminado cuando:

- usuario puede autenticarse;
- crear cuenta;
- registrar ingreso;
- registrar gasto;
- registrar obligación;
- configurar reserva;
- consultar resumen;
- consultar dinero disponible;
- seguridad multiusuario validada;
- flujo mobile utilizable;
- CI/build pasan.
