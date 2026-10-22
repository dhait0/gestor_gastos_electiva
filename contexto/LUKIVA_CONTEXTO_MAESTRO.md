# LUKIVA — Contexto maestro vigente

**Estado:** fuente de verdad de producto y continuidad · **Versión:** 2026-10-21 · **Nombre anterior:** FinWise

## Visión
Lukiva es una aplicación de finanzas personales de experiencia juvenil, cercana y equilibrada: registra ingresos/gastos, ofrece claridad sobre dinero líquido y disponible, ayuda a planificar presupuestos, metas, pagos y suscripciones y a anticipar compromisos. Pregunta central: **¿Cuánto puedo gastar sin comprometer mis obligaciones, reservas y objetivos?** Eslogan de trabajo: *Tu dinero, a tu ritmo.*

## Punto de partida comprobado y no comprobado
- El repositorio entregado por el propietario es una **copia** con fecha interna 2026-10-13. Contiene Next.js App Router/TypeScript, Supabase SSR, rutas de login/registro/onboarding, cuentas, categorías, transacciones, obligaciones, dashboard, migraciones, pruebas y workflow CI. El código existe; su funcionalidad real debe probarse.
- El propietario confirma una primera versión **ya publicada en Vercel**, conectada a **Supabase** y con **GitHub Actions completado**. No se dispone aquí de auditoría de los sistemas vivos; verificar commit, deployments, schema remoto y CI antes de cualquier cambio operativo.
- En la copia hay cinco tablas propias creadas por migraciones: `profiles`, `accounts`, `categories`, `transactions`, `obligations`. `auth.users` pertenece a Supabase. Las otras ocho entidades financieras están planificadas, pero sin CREATE TABLE encontrado.
- Posible brecha crítica: comprobar si `opening_balance` se refleja correctamente en saldos. Revisar multi-moneda, neutralidad de transferencias, RLS de FK compuestas y pruebas.
- La UI inicial es funcional pero incompleta como producto: navegación móvil con enlaces inactivos, acabado visual dispar y ausencia de administración/roles propios. Son brechas por cerrar, no motivo para borrar el trabajo.

## Alcance integral aprobado de diseño
**14 entidades financieras previstas:** `auth.users`, `profiles`, `accounts`, `categories`, `transactions`, `obligations`, `budgets`, `goals`, `goal_contributions`, `recurring_transactions`, `subscriptions`, `debts`, `debt_payments`, `alerts`. Son parte del diseño del producto completo; **no todas están implementadas**.

**Administración y RBAC (ampliación):** `roles`, `permissions`, `user_roles`, `role_permissions`, `admin_audit_logs` como propuesta inicial sujeta a validación técnica de tablas y políticas. El panel admin podrá manejar usuarios, autorizaciones, métricas operativas agregadas y auditoría; no permitirá leer finanzas privadas sin fundamento, autorización y control explícitos.

**Experiencias objetivo:** onboarding, registro, login, recuperación, dashboard, cuentas, movimientos/transferencias, categorías, obligaciones, presupuestos, metas/aportes, recurrencias, suscripciones, deudas/pagos, alertas, ajustes, accesibilidad, PWA, panel admin y finalmente reportes, proyecciones, simulador y recomendaciones basadas en cálculos trazables. Los casos y reglas detallados se encuentran en `producto/CASOS_DE_USO_Y_FLUJOS.md`, documentación de arquitectura y decisiones ADR. Cualquier funcionalidad nueva debe incorporarse como requisito y test antes del código.

## Sistema de diseño Lukiva
Nombre público **Lukiva** (FinWise histórico). Estilo fintech cercano y responsable, mobile-first. Tokens **propuestos**: primario `#315CF5`, menta `#20BDA5`, amarillo `#FFC777`, superficie `#F5F7FE`, tinta `#162039`. Tipografías Manrope/Geist ya adoptadas en la base si existen. Contraste accesible y estados de carga, vacío y error. `diseno/LUKIVA_IDENTIDAD_PROPUESTA.md` y `diseno/PLAN_APLICACION_LUKIVA.md` guían los cambios. `diseno/SISTEMA_DISENO_FINWISE.md` se conserva como especificación histórica/insumo hasta completar la migración, no como marca visible final. La disponibilidad registral/comercial de Lukiva no está confirmada.

## Reglas permanentes de implementación
1. **Continuar, no reiniciar**: preservar funcionalidad existente, datos y despliegues; verificar antes de corregir.
2. **MVP primero, producto entero después**: cerrar los recorridos actuales con cálculos y seguridad comprobados, luego ampliar todos los módulos.
3. **Incrementos pequeños**: una microtarea por ejecución de Kilo, evidencia antes de STOP.
4. **Migraciones solo aditivas y aisladas**: no aplicar SQL demostrativo de exposición como una recreación de BD; revisar migraciones históricas, RLS, índices, FK e impacto.
5. **Precisión y privacidad**: decimal.js, moneda explícita, `auth.uid()`/políticas por propietario, permisos de admin en servidor; ninguna clave sensible en navegador.
6. **Identidad desde las primeras fases**: una vez verificada la línea base, comenzar Lukiva por UI/metadata, no renombrar IDs técnicos ciegamente.
7. **Testing verificable**: lint, typecheck, tests, build, E2E y RLS según tarea. No confundir tests declarados con tests pasados.

## Referencias activas
- `../AGENTS.md`, `INICIAR_CON_KILO.md`, `planificacion/01_PROGRAMA_MAESTRO_LUKIVA.md`, `planificacion/03_TAREAS_ATOMICAS.md`, `planificacion/04_REGISTRO_AVANCE.md`.
- `arquitectura/ARQUITECTURA_TECNICA.md`, `arquitectura/MODELO_DATOS_Y_SEGURIDAD.md`, `arquitectura/AMPLIACION_ADMIN_RBAC.md` y ADR.
- `producto/CASOS_DE_USO_Y_FLUJOS.md`, `calidad/ESTRATEGIA_PRUEBAS.md`, `desarrollo/CONVENCIONES_DESARROLLO.md`, `diseno/PLAN_APLICACION_LUKIVA.md`.

## Criterio de completitud
Lukiva estará completa cuando los flujos definidos tengan implementación verificable, políticas seguras, pruebas, UI consistente, operación administrativa auditada y release validado. Una tabla creada o pantalla dibujada **no** equivale a funcionalidad terminada.
