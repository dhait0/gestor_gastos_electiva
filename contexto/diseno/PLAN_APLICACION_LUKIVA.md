# Plan de migración visual a Lukiva — gradual y sin romper producción

## Decisión de producto
Lukiva se adopta **desde ya como identidad visible de trabajo**; la disponibilidad legal/dominio aún no está certificada. El código puede mantener `finwise` como namespace/nombre histórico internamente hasta que una migración técnica controlada lo justifique.

## Componentes y orden
1. **D01 tokens:** establecer `brand-primary #315CF5`, `brand-mint #20BDA5`, `brand-warm #FFC777`, `surface #F5F7FE`, `ink #162039`; contrastar con el tema existente y AA accesibilidad (no aplicar colores a estados críticos sin evaluar semántica).
2. **D02 copys visibles:** sustituir etiquetas públicas FinWise por Lukiva (login/registro/onboarding/sidebar/footer, textos de ayuda) y retirar etiquetas internas como «MVP académico» de cara al usuario. No alterar textos legales o IDs de terceros de forma irreflexiva.
3. **D03 PWA/SEO:** `metadata`, manifest `name` y `short_name`, títulos, OG, favicon/iconos después de crear archivos gráficos aprobados; validar assets móviles y desktop.
4. **E-F:** aplicar sistema visual a dashboards, gráficos, tablas, estados vacíos, botones y navegación. No desplegar enlaces a pantallas inexistentes.
5. **G-P:** construir cada módulo nuevo directamente en Lukiva; migrar pantalla antigua cuando se toque.

## Qué NO renombrar automáticamente
- Nombre `finwise` de package, rutas de callback, IDs Supabase, tablas, migrations, env vars, workflow, slug en Vercel, nombre GitHub y dominios. Estos cambios podrían generar fallos y necesitan un ticket independiente.

## QA
Lista de textos visibles antiguos (`rg -ni finwise src public`), revisión humana para distinguir copy vs identificador interno, smoke test por pantalla, responsive 360/768/1440, accesibilidad y dark mode, PWA install, unit/tests/build/CI. Rollback por commit/PR y assets versionados.

## Identidad
Manual detallado: `LUKIVA_IDENTIDAD_PROPUESTA.md`. Mensaje principal: «Tu dinero, a tu ritmo». Tono joven cercano y seguro, nunca burlón frente a deuda o gasto.
