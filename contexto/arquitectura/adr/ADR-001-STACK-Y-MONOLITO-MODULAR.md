# ADR-001 — Stack y monolito modular

**Estado:** Accepted

---

# Contexto

FinWise requiere:

- web responsive;
- mobile-first;
- autenticación;
- base de datos relacional;
- lógica financiera;
- despliegue simple;
- velocidad de desarrollo académica;
- posibilidad de crecer sin sobrearquitectura.

Se evaluó conceptualmente separar frontend y backend desde el inicio.

---

# Decisión

Usar:

```text
Next.js App Router
React
TypeScript
Supabase PostgreSQL
Supabase Auth
Vercel
```

Arquitectura:

```text
monolito modular
```

No crear backend NestJS separado inicialmente.

---

# Razones

- menor complejidad operativa;
- integración natural con Vercel;
- Server Components/Actions cubren el MVP;
- Supabase resuelve identidad + Postgres + RLS;
- despliegue simple;
- permite separar dominio internamente.

---

# Consecuencias positivas

- menos repositorios/servicios;
- desarrollo rápido;
- una sola aplicación desplegable;
- posibilidad de extraer servicios después.

---

# Riesgos

- acoplar lógica a Next.js;
- usar Supabase directamente desde UI sin límites.

Mitigación:

```text
Presentation
→ Application
→ Domain
→ Infrastructure
```

---

# No decidido para siempre

Si aparecen necesidades reales de:

- procesamiento pesado;
- múltiples clientes;
- integraciones complejas;
- colas;
- escalamiento independiente;

se podrá extraer backend o servicios mediante nuevo ADR.
