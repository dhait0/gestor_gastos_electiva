# FinWise — Convenciones de Desarrollo

> Reglas para mantener consistencia técnica durante la implementación.

---

# 1. Principio

El código debe optimizarse para:

```text
claridad
+
seguridad
+
testabilidad
+
mantenibilidad
```

No para demostrar complejidad arquitectónica.

---

# 2. TypeScript

Usar:

```text
strict = true
```

Evitar:

```text
any
```

salvo integración externa documentada.

Preferir:

- tipos explícitos en límites;
- inferencia dentro de funciones;
- discriminated unions;
- `unknown` antes que `any`.

---

# 3. Naming

Variables/funciones:

```text
camelCase
```

Componentes/tipos:

```text
PascalCase
```

Constantes globales:

```text
UPPER_SNAKE_CASE
```

Archivos de componente:

```text
AvailableToSpendCard.tsx
```

Funciones de dominio:

```text
calculateAvailableToSpend.ts
```

---

# 4. Idioma

Código:

```text
English
```

UI:

```text
Spanish
```

Documentación del proyecto:

```text
Spanish
```

Ejemplo:

```ts
calculateLiquidBalance()
```

No:

```ts
calcularSaldoLiquido()
```

---

# 5. Dinero

Nunca usar `number` para operaciones monetarias críticas.

Usar:

```text
decimal.js
```

DB:

```text
numeric(20,4)
```

Boundary:

preferir decimal string.

---

# 6. Fechas

Usar:

```text
date-fns
```

Tipos:

```text
date
```

para fecha financiera.

```text
timestamptz
```

para eventos técnicos.

No inferir fecha financiera desde `created_at`.

---

# 7. Validación

Schemas:

```text
Zod
```

Mantener schemas cerca del módulo.

Validación de UI no sustituye:

- domain rules;
- DB constraints;
- RLS.

---

# 8. Componentes React

Preferir:

```text
Server Component
```

por defecto.

Usar:

```text
"use client"
```

solo cuando se necesite:

- state;
- effects;
- browser API;
- interactive Motion;
- forms client-side.

No convertir árboles completos a client component por comodidad.

---

# 9. Fetching

Lecturas:

preferir Server Components.

Mutaciones de app:

preferir Server Actions.

HTTP explícito/integración:

Route Handlers.

---

# 10. Domain

El dominio no debe importar:

```text
next/*
react
@supabase/*
```

Debe poder probarse con Vitest sin framework.

---

# 11. Repositories

La capa de aplicación depende de interfaces cuando exista valor real.

Evitar crear repository interfaces vacías solo por patrón.

Introducirlas especialmente para:

- accounts;
- transactions;
- obligations;
- dashboard queries complejas.

---

# 12. Supabase

Nunca usar service role en cliente.

Operaciones de usuario normal:

usar sesión del usuario + RLS.

Agregar filtro explícito `user_id` cuando mejore intención/performance, sin confiar en él como única seguridad.

---

# 13. SQL

Toda tabla multiusuario:

- `user_id`;
- RLS;
- index `user_id`;
- constraints;
- ownership.

No crear tabla y "agregar seguridad luego".

---

# 14. Soft delete

Entidades históricas:

```text
deleted_at
```

Las queries normales deben excluirlas por defecto.

---

# 15. Imports

Preferir alias:

```text
@/...
```

Evitar rutas:

```text
../../../../
```

---

# 16. UI

No usar hex directamente en componentes si existe token.

No inventar:

- radius;
- shadows;
- spacing;
- colors.

Consultar `SISTEMA_DISENO_FINWISE.md`.

---

# 17. Motion

Crear presets compartidos.

No definir spring completamente distinta en cada archivo.

Respetar reduced motion.

---

# 18. Errores

No exponer:

- stack traces;
- SQL;
- claves;
- detalles internos.

UI:

mensaje comprensible.

Logs:

contexto técnico suficiente sin datos sensibles.

---

# 19. Logging

No registrar:

- contraseñas;
- tokens;
- información financiera completa innecesaria.

Preferir IDs internos y contexto mínimo.

---

# 20. Commits

Formato recomendado:

```text
feat:
fix:
refactor:
test:
docs:
chore:
```

Ejemplos:

```text
feat: add expense registration flow
fix: exclude transfers from monthly expenses
test: add rls isolation tests for transactions
```

---

# 21. Pull Requests

Cada PR debe:

- tener alcance pequeño;
- explicar qué cambia;
- indicar pruebas;
- mencionar migraciones;
- adjuntar evidencia visual si cambia UI.

Evitar PRs enormes de múltiples módulos sin necesidad.

---

# 22. Dependencias

Antes de instalar una dependencia:

1. confirmar necesidad;
2. revisar si stack actual resuelve;
3. evaluar peso/mantenimiento;
4. evitar paquetes duplicados.

No instalar librería para una función trivial.

---

# 23. Tests

Naming:

```text
*.test.ts
*.test.tsx
*.spec.ts
```

Playwright:

```text
tests/e2e/*.spec.ts
```

---

# 24. Comentarios

Comentar:

```text
por qué
```

No comentar lo obvio.

Preferir nombres claros a comentarios explicativos innecesarios.

---

# 25. TODO

No dejar TODO indefinido.

Formato:

```text
TODO(finwise): razón concreta
```

Idealmente con issue asociado.

---

# 26. Definition of Done técnica

- [ ] lint.
- [ ] typecheck.
- [ ] tests.
- [ ] build.
- [ ] seguridad.
- [ ] responsive.
- [ ] dark.
- [ ] accesibilidad relevante.
- [ ] documentación si cambia una decisión.
