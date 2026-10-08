# ADR-004 — Límites server en Next.js

**Estado:** Accepted

---

# Contexto

Next.js ofrece varias formas de ejecutar lógica y acceder a datos.

Sin una convención, la aplicación puede terminar con fetches, mutaciones y reglas de negocio distribuidas arbitrariamente.

---

# Decisión

## Lecturas

Preferir:

```text
Server Components
```

## Mutaciones originadas en la app

Preferir:

```text
Server Actions
```

## Contratos HTTP explícitos

Usar:

```text
Route Handlers
```

para:

- webhooks;
- integraciones;
- API externa;
- endpoints con contrato HTTP real.

---

# Regla de dominio

Las reglas financieras no viven en:

- componentes React;
- Route Handlers;
- código Supabase específico.

Deben vivir en funciones/servicios de dominio.

---

# Client Components

Usar solo cuando la interacción lo requiera.

No marcar páginas completas como client por comodidad.
