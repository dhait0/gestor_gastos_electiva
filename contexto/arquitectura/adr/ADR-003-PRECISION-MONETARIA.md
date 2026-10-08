# ADR-003 — Precisión monetaria

**Estado:** Accepted

---

# Contexto

JavaScript `number` utiliza coma flotante binaria y puede producir errores de precisión.

FinWise realiza cálculos financieros que deben ser reproducibles.

---

# Decisión

Base de datos:

```text
numeric(20,4)
```

Dominio TypeScript:

```text
decimal.js
```

Límites server/client:

preferir:

```text
decimal strings
```

---

# No usar para cálculos críticos

```text
real
double precision
JavaScript float arithmetic
```

---

# Presentación

El formateo visual:

```text
$1.250.000
```

no define el valor de dominio.

Parsing y formatting deben estar separados.

---

# Multimoneda

No sumar monedas diferentes sin una política de FX formal.

El MVP opera principalmente con COP, aunque las entidades mantienen `currency_code`.
