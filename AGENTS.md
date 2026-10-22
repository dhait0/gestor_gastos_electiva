# AGENTS.md — Lukiva (antes FinWise)

> Documento operativo vigente para Kilo, Claude y otros agentes. Sustituye las instrucciones raíz anteriores sin borrar su registro histórico en `contexto/historico/AGENTS_FINWISE_ORIGINAL.md`.

## 1. Identidad y estado de partida

**Producto:** Lukiva. Nombre anterior: FinWise (histórico). **Misión:** ayudar al usuario a registrar, entender, planificar y decidir cuánto puede gastar, considerando saldos, obligaciones, reservas, presupuestos, metas, deudas, recurrencias y alertas. Personalidad: juvenil, cercana, equilibrada y confiable.

**NO reiniciar el proyecto.** Es una app Next.js + TypeScript, Supabase Auth/PostgreSQL/RLS, GitHub Actions y despliegue en Vercel ya existente según el usuario. El ZIP examinado es un snapshot del **13-10-2026**; contrastar rama, SHA, CI, esquema remoto y despliegue antes de afirmar estados actuales. No asumir acceso a producción.

**Alcance:** implementar progresivamente el producto completo, incluidas las **14 entidades financieras previstas** (13 propias + `auth.users`), UX premium cercana y el nuevo módulo de roles, permisos y administración. El MVP se **termina y verifica primero**, sin restringir el alcance final a él.

## 2. Orden de autoridad documental

1. Instrucción explícita actual del propietario y seguridad de datos/producción.
2. Código, migraciones y tests efectivos para describir el comportamiento **actual** (si discrepan del diseño, reportar brecha, no cambiar silenciosamente los requisitos).
3. `contexto/LUKIVA_CONTEXTO_MAESTRO.md`: visión, alcance y decisiones de producto.
4. `contexto/planificacion/01_PROGRAMA_MAESTRO_LUKIVA.md`, `03_TAREAS_ATOMICAS.md` y `04_REGISTRO_AVANCE.md`: orden, detalle y seguimiento.
5. Documentación especializada: arquitectura/ADR, producto, diseño, calidad, desarrollo.
6. `contexto/historico/` y `planificacion/historico_finwise/`: referencias, **no órdenes ejecutables**.

Si hay conflicto: indicar ambos hechos, explicar impacto y pedir decisión solo si realmente bloquea la microtarea. No inventar hechos sobre GitHub, Vercel, Supabase ni marcas.

## 3. Inicio obligatorio de cada sesión de Kilo

Leer **solo**: este archivo; `contexto/INICIAR_CON_KILO.md`; `contexto/planificacion/04_REGISTRO_AVANCE.md`; la siguiente microtarea y fuentes puntuales que cita. Investigar código relevante antes de modificar. **Una microtarea por iteración**; no ejecutar la siguiente sin autorización.

Ruta: inspeccionar → definir prueba/criterio → implementar cambio mínimo → verificar → registrar evidencia y archivos → STOP.

Mantener el modo económico del agente original: búsquedas selectivas y lectura incremental; análisis profundo para seguridad, RLS, dinero, migraciones o riesgo de pérdida de datos.

## 4. Continuidad de infraestructura

- **No** regenerar `src/`, `supabase/`, configuración CI, Auth o proyecto Vercel.
- No cambiar por estética IDs Supabase, URL productiva, nombre del repositorio, nombres de base de datos, cookies, rutas públicas ni historial de migraciones.
- No ejecutar reset, truncado, migraciones destructivas o exposición de claves sobre producción. Usar base de desarrollo/aislada y migraciones aditivas; documentar rollback.
- Mantener `.env` fuera de commits y respuestas. No usar service-role key en navegador.
- Mantener `CLAUDE.md` como referencia corta a `AGENTS.md`.

## 5. Stack y arquitectura existentes

Next.js 16 App Router, React 19, TS strict, Tailwind CSS 4, Radix/shadcn, Lucide, Motion, Recharts, React Hook Form, Zod, date-fns, decimal.js; Supabase SSR/Auth/PostgreSQL/RLS/CLI; Vitest, Playwright, ESLint; pnpm, GitHub Actions, Vercel. Arquitectura monolito modular: presentación → aplicación → dominio → infraestructura → base de datos. Server Components para lecturas y Server Actions para mutaciones cuando corresponda. No incorporar Prisma, Drizzle, NestJS, Redux, nuevas APIs o proveedores sin justificación y autorización.

## 6. Regla financiera y seguridad

Usar `decimal.js` y precisión de BD definida, no `number` flotante para cálculos monetarios de dominio. Mantener saldo inicial exactamente una vez; no sumar monedas diferentes sin política explícita; transferencias no alteran patrimonio agregado; obligaciones/reservas no generan doble descuento. Asegurar ownership en todas las FK y RLS/acciones servidor; nunca confiar en roles enviados desde cliente. Un administrador **no** tiene acceso general a transacciones privadas por defecto. Los permisos se verifican en servidor y en BD. Crear test positivo/negativo para permisos y cada regla crítica.

## 7. Migración gradual de marca

**Nombre visible objetivo: Lukiva**, eslogan de trabajo: “Tu dinero, a tu ritmo.” Paleta propuesta: azul `#315CF5`, menta `#20BDA5`, amarillo `#FFC777`, fondo `#F5F7FE`, texto `#162039`; conservar Manrope/Geist si están disponibles. Logo y registro de marca **pendientes de validación jurídica**, no presentar disponibilidad como confirmada. Empezar tras el checkpoint técnico inicial por copy, tokens, logo temporal, metadata/manifest; luego navegación y vistas. El código y rutas internos pueden retener `finwise` por compatibilidad hasta tarea específica aprobada. No hacer buscar/reemplazar masivo.

## 8. Secuencia y estado

Fases A-P en `contexto/planificacion/01_PROGRAMA_MAESTRO_LUKIVA.md`: A línea base, B cálculos, C MVP+seguridad, D branding, E UX, F dashboard, G presupuestos, H metas, I recurrencias, J suscripciones, K deudas, L alertas, M RBAC, N admin, O inteligencia financiera, P cierre. `03_TAREAS_ATOMICAS.md` da granularidad; seguir los IDs y dependencias, con enfoque vertical (migración → dominio → UI → tests). **Estado inicial: NO VERIFICADO salvo evidencia comprobable**.

## 9. Validación y definición de terminado

Usar los scripts existentes: `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`; pruebas de Supabase/RLS y Playwright solo contra entornos adecuados. Documentar comandos, resultado o por qué no se ejecutaron. Para toda tarea: criterios de aceptación verificables, pruebas del cambio, revisión móvil/accesibilidad si afecta UI, revisión de permisos si toca datos. No marcar DONE sin evidencia. Si falta acceso a Vercel/Supabase, escribir “pendiente de comprobación remota”, no suponer.

## 10. Formato final obligatorio

```
Microtarea: <ID>
Objetivo y resultado:
Archivos modificados:
Pruebas / evidencia (PASÓ, FALLÓ o NO EJECUTADO):
Riesgos, decisiones y acciones manuales:
Registro actualizado: sí/no
Siguiente microtarea sugerida: <ID>
STOP
```

Este documento puede revisarse por cambios controlados, nunca ignorando código o documentación previa.
