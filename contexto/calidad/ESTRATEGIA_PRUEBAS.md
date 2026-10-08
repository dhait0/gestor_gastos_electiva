# FinWise — Estrategia de Pruebas

> Estrategia de calidad del MVP y evolución posterior.

---

# 1. Principio

En FinWise las pruebas más importantes no son las de apariencia.

Son las que protegen:

```text
dinero
+
ownership
+
cálculos
+
flujos críticos
```

---

# 2. Pirámide práctica

```text
Unit
↑ mayor cantidad

Integration
↑ seguridad/datos

E2E
↑ pocos, críticos
```

---

# 3. Unit tests

Herramienta:

```text
Vitest
```

Prioridad máxima:

- cálculos monetarios;
- reglas de dominio;
- schemas complejos;
- transformaciones.

---

# 4. Casos unitarios mínimos

## Balance de activo

```text
opening + inflows - outflows
```

## Tarjeta

```text
opening debt + outflows - inflows
```

## Liquidez

Excluir:

```text
CREDIT_CARD
credit_limit
available_credit
```

## Disponible

```text
liquidez - obligaciones - reserva
```

Casos:

- positivo;
- cero;
- negativo;
- decimal;
- sin movimientos;
- obligación pagada;
- soft deleted transaction;
- transferencias.

---

# 5. React tests

Herramientas:

```text
Vitest
React Testing Library
```

Probar comportamiento, no implementación.

Ejemplos:

- formulario bloquea monto cero;
- error aparece junto al campo;
- CTA pending;
- empty state;
- available card muestra déficit correctamente.

No probar clases Tailwind específicas salvo necesidad.

---

# 6. DB / integración

Objetivo:

validar schema + RLS + constraints.

Ubicación:

```text
supabase/tests/
```

Puede utilizar pgTAP o estrategia equivalente.

---

# 7. Matriz RLS obligatoria

Para cada tabla multiusuario:

## SELECT

```text
A puede leer A
B no puede leer A
anon no puede leer
```

## INSERT

```text
A puede insertar para A
A no puede insertar para B
```

## UPDATE

```text
A puede actualizar A
B no puede actualizar A
```

## DELETE

Cuando exista hard delete permitido.

Para soft delete:

probar UPDATE correspondiente.

---

# 8. Tablas P0

Probar RLS en:

```text
profiles
accounts
categories
transactions
obligations
```

---

# 9. Integridad

Probar:

- category type coincide con transaction;
- ownership cruzado falla;
- amount > 0;
- transfer accounts diferentes;
- moneda compatible;
- budget uniqueness en fase posterior.

---

# 10. Auth integration

Probar:

```text
signup
→ profile created
```

Si falla trigger de profile, detectar antes de production.

---

# 11. E2E

Herramienta:

```text
Playwright
```

No crear cientos de E2E.

---

# 12. E2E-01 — Happy path MVP

```text
registrarse
→ onboarding
→ crear cuenta
→ registrar ingreso
→ registrar gasto
→ registrar obligación
→ configurar reserva
→ verificar disponible
```

Este es el E2E más importante.

---

# 13. E2E-02 — Login

```text
login
→ dashboard
→ logout
→ área privada bloqueada
```

---

# 14. E2E-03 — Gasto actualiza dashboard

```text
disponible inicial
→ gasto
→ disponible nuevo
→ movimiento visible
```

---

# 15. E2E-04 — Seguridad usuario A/B

Idealmente combinar integración DB + E2E mínimo.

```text
A crea dato
B no lo ve
```

---

# 16. E2E-05 — Mobile

Ejecutar viewport móvil:

```text
390x844 aprox.
```

Validar:

- bottom nav;
- quick create;
- sheet;
- form;
- CTA;
- scroll.

---

# 17. Visual regression

No obligatoria para MVP académico.

Puede añadirse después para:

- dashboard;
- light/dark;
- mobile/desktop.

---

# 18. Accesibilidad

Validar:

- labels;
- keyboard;
- focus;
- roles;
- contrast;
- reduced motion.

Playwright puede incorporar verificaciones automáticas, pero revisión manual sigue siendo necesaria.

---

# 19. Performance checks

Antes de release:

- dashboard carga razonablemente;
- charts no bloquean;
- blur no degrada mobile;
- listas paginadas;
- queries tienen índices adecuados.

---

# 20. CI

En PR:

```text
lint
typecheck
unit
component/integration según configuración
build
```

E2E:

- en rama principal;
- o PR cuando infraestructura lo permita.

---

# 21. Test data

Solo datos ficticios.

Nunca utilizar información financiera real de desarrolladores.

---

# 22. Fixtures

Mantener fixtures pequeños y explícitos.

Ejemplo:

```text
User A
User B
Account Cash A
Account Credit A
Income A
Expense A
Obligation A
```

---

# 23. Regresión financiera

Cada bug que afecte un cálculo debe producir:

```text
test que falla
→ fix
→ test queda permanente
```

---

# 24. Criterio de release

No liberar si falla:

- cálculo disponible;
- RLS;
- auth;
- build;
- E2E principal.

Errores cosméticos menores pueden documentarse según prioridad.
