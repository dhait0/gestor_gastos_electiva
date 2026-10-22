# Estado real y reglas de continuidad

Fuente: ZIP del repositorio fechado internamente 2026-10-13, auditoría estática del 21-10-2026 y declaración del propietario.

**Confirmado por código:** Next.js/TS, Supabase SSR, flujos de auth/onboarding, cuentas, categorías, movimientos, obligaciones, dashboard, cinco migraciones de tablas propias, pruebas y GitHub Actions configurado. **Declarado por propietario:** despliegue en Vercel, conexión Supabase y GitHub Actions completado. **Pendiente de comprobar:** SHA de producción, logs CI, migraciones aplicadas, ejecución local E2E/RLS y consistencia de cálculos.

No convertir código presente en 'terminado'. No volver a crear la infraestructura; abrir brechas verificables y cerrar por microtareas. Ver `../LUKIVA_CONTEXTO_MAESTRO.md` y `../../AGENTS.md`.

Riesgos iniciales: `opening_balance` quizá omitido, mezcla de monedas, SQL FK compuesta SET NULL, navegación móvil deshabilitada, roles/admin inexistentes, marca FinWise visible.
