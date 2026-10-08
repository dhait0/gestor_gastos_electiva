# ADR-005 — Mobile-first y PWA

**Estado:** Accepted

---

# Contexto

FinWise será utilizado frecuentemente para registrar gastos, consultar disponible y revisar movimientos desde teléfono.

La experiencia móvil es tan importante como desktop.

---

# Decisión

Diseñar FinWise:

```text
mobile-first
```

y habilitar PWA desde el MVP.

---

# PWA mínima

- manifest;
- app icons;
- maskable icon;
- apple touch icon;
- `display: standalone`;
- safe areas;
- theme colors.

---

# Navegación

Mobile:

```text
Inicio
Movimientos
+
Metas
Más
```

Desktop:

```text
sidebar glass colapsable
```

---

# Offline

No ofrecer escritura financiera offline en MVP.

Cachear únicamente recursos estáticos/app shell con prudencia.

---

# Consecuencia

Cada feature debe verificarse en mobile antes de considerarse completa.
