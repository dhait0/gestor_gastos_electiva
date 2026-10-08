# ADR-006 — CI/CD con GitHub Actions y Vercel

**Estado:** Accepted

---

# Contexto

FinWise requiere despliegues repetibles y verificación automática.

---

# Decisión

GitHub Actions será la autoridad principal de CI.

Vercel será plataforma de despliegue.

---

# CI mínimo en Pull Request

```text
pnpm install
lint
typecheck
unit tests
build
```

---

# Deployment conceptual

```text
vercel pull
vercel build
vercel deploy --prebuilt
```

cuando el pipeline controlado lo requiera.

---

# Entornos

```text
Local
Staging
Production
```

Variables y Supabase deben corresponder al entorno.

---

# Regla

No desplegar producción desde el equipo local como flujo normal del proyecto.

---

# Migraciones

El despliegue de código no debe asumir que la base ya fue modificada manualmente.

Las migraciones forman parte del proceso controlado.
