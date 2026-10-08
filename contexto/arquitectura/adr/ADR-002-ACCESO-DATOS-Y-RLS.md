# ADR-002 — Acceso a datos y Row Level Security

**Estado:** Accepted

---

# Contexto

FinWise almacena información financiera privada.

La autorización no puede depender exclusivamente del frontend o de filtros enviados por el cliente.

---

# Decisión

Usar Supabase RLS como barrera obligatoria de ownership.

Todas las tablas financieras multiusuario deben:

- tener `user_id`;
- tener RLS habilitado;
- tener policies explícitas;
- indexar `user_id`;
- validar ownership también en relaciones críticas.

---

# Patrón

Ejemplo conceptual:

```sql
USING ((select auth.uid()) = user_id)
```

INSERT/UPDATE deben usar `WITH CHECK` según corresponda.

---

# Service role

`service_role`:

```text
server-only
```

No usar para operaciones normales de usuario.

---

# Relaciones

Cuando aporte integridad adicional:

```text
(child_fk, user_id)
→
(parent_id, user_id)
```

para impedir asociaciones cross-user.

---

# Consecuencias

Incluso si existe un bug en la aplicación, la base de datos sigue protegiendo datos de otros usuarios.

---

# Testing obligatorio

Cada tabla debe probar:

```text
A puede acceder a A
B no puede acceder a A
anon no puede acceder
A no puede escribir para B
```
