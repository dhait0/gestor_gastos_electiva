# ADR-007 — Migraciones versionadas con Supabase CLI

**Estado:** Accepted

---

# Contexto

Cambios manuales de schema en producción generan deriva y dificultan reproducibilidad.

---

# Decisión

Todo cambio estructural de base de datos debe estar versionado en:

```text
supabase/migrations/
```

y aplicarse mediante Supabase CLI/pipeline controlado.

---

# Una migración funcional debe considerar

- tabla/columna;
- constraints;
- indexes;
- grants;
- RLS;
- policies;
- functions/triggers;
- tests relevantes.

---

# Producción

No realizar cambios manuales rutinarios desde dashboard.

Si existe una emergencia:

- documentar;
- reconciliar inmediatamente en migración.

---

# Cambios destructivos

Preferir:

```text
Expand
→ Migrate
→ Contract
```

Ejemplo:

1. agregar nueva columna;
2. migrar datos/código;
3. dejar de usar antigua;
4. eliminar en versión posterior.

---

# Seeds

Solo datos ficticios.

No mezclar seed demo con migraciones de schema salvo necesidad explícita.
