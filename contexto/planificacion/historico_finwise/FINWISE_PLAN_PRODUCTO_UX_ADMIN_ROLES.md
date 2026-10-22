# FinWise — Plan de evolución integral de producto, UX, diseño, administración y roles

**Fecha:** 21 de octubre de 2026  
**Base documental:** `contexto/FINWISE_CONTEXTO_MAESTRO.md`, `contexto/diseno/SISTEMA_DISENO_FINWISE.md`, `contexto/diseno/WIREFRAMES_Y_PANTALLAS.md`, `contexto/producto/CASOS_DE_USO_Y_FLUJOS.md`, `contexto/arquitectura/MODELO_DATOS_Y_SEGURIDAD.md` y código de `gestor_gastos_electiva-main.zip`.

## 1. Principio y alcance

FinWise es una aplicación de gestión financiera personal orientada a usuarios finales. La planificación debe medir tanto el funcionamiento técnico como la experiencia real. El sistema de diseño del 7 de octubre está aprobado y es la referencia visual: Apple premium + fintech premium + soft luxury; **dinero disponible** es el KPI central. La visión incluye 14 entidades financieras/identidad previamente planteadas; administración y RBAC **son una ampliación solicitada ahora**, no deben presentarse como ya aprobadas ni contarlas automáticamente dentro de las 14.

## 2. Hallazgos comprobados en código (revisión estática)

| Hallazgo | Evidencia | Impacto y acción |
|---|---|---|
| Los tokens de marca sí existen | `src/app/globals.css`: azul `#2563EB`, cian `#06B6D4`, fondos claros/oscuros | No basta con declarar colores: auditar uso, contraste, jerarquía e interfaz renderizada. |
| Existe documentación visual aprobada | `contexto/diseno/SISTEMA_DISENO_FINWISE.md` | Usar como referencia de verdad, no rediseñar con una paleta inventada. |
| Algunas rutas visibles faltan | `src/components/layout/AppLayoutClient.tsx`: Metas y Más marcadas `disabled` | Sustituir bloqueos por funcionalidad real o navegación explícita y honesta. |
| Acción central móvil inactiva | `mobileNav`: Crear es `isAction` y el botón está deshabilitado | Convertirlo en menú funcional de acciones rápidas. |
| Etiqueta interna en UI | Menú lateral: `MVP académico — Fases 7-17 en progreso` | Retirar de interfaz de usuario final. |
| No se observó un módulo administrativo propio | No hay ruta `admin` ni archivos obvios de roles en `src/app` / `src` | Diseñar y construir panel administrativo y control de acceso. |
| Dashboard ya tiene resumen y transacciones recientes | `src/app/(app)/dashboard/page.tsx` | Evolucionar información, visualizaciones, estados vacíos y navegación. |

**Límite de auditoría:** no se ejecutó en navegador ni se efectuó evaluación visual renderizada. La percepción estética final del usuario debe validarse con capturas, sesiones de prueba y móviles reales.

## 3. Dos experiencias claramente separadas

### A. Experiencia del usuario financiero
- Inicio: dinero disponible, saldo, compromisos, alertas y recomendaciones explicables.
- Cuentas y transacciones: consultas, filtros, búsquedas, transferencias, adjuntos solo si aprobados y acciones rápidas.
- Presupuestos, metas, aportes, obligaciones, pagos, recurrencias, suscripciones, deudas y notificaciones.
- Ajustes: perfil, preferencias de moneda, reserva, seguridad, sesión y privacidad.
- Diseño responsive, estados vacíos útiles, skeletons, mensajes claros, accesibilidad y PWA.

### B. Experiencia del administrador de plataforma
- Resumen operativo: usuarios, estados y métricas agregadas no sensibles.
- Usuarios: búsqueda, estado de cuentas, bloqueo/desbloqueo con trazabilidad; no acceso indiscriminado a movimientos privados.
- Roles y permisos: asignaciones aprobadas y protegidas, eventos de auditoría.
- Soporte: gestión de incidencias y operaciones controladas.
- Salud del sistema: eventos de aplicación, errores y observabilidad sin exponer secretos.
- Parámetros generales: configuraciones globales autorizadas.

**Decisión de privacidad que debe quedar explícita:** ser administrador **no** concede por defecto acceso a saldos, movimientos u obligaciones individuales. Cualquier acceso excepcional requiere un propósito, autorización, registro y una política aprobada.

## 4. Roles iniciales propuestos (pendientes de aprobar)

| Rol | Alcance |
|---|---|
| Usuario | Administrar solo sus finanzas y preferencias. |
| Soporte | Consultar metadatos operativos estrictamente necesarios y gestionar solicitudes de soporte; sin leer finanzas. |
| Administrador | Gestión autorizada de usuarios, asignaciones y configuración; sin acceso financiero irrestricto. |
| Superadministrador | Gobierno de roles privilegiados y operación crítica; requiere controles reforzados. |

No almacenar una bandera `is_admin` modificable por el usuario. Implementar RBAC en servidor y base de datos (RLS/policies), nunca confiar solo en ocultar pantallas.

## 5. Extensión de datos para administración y roles (propuesta adicional)

Las 14 entidades previstas se conservan. Añadir previa aprobación:

| Tabla | Finalidad | Relaciones |
|---|---|---|
| `roles` | Catálogo de roles | Vinculada con `user_roles` y opcionalmente `role_permissions`. |
| `permissions` | Acciones permitidas, p. ej. `users.read_metadata` | Vinculada con `role_permissions`. |
| `role_permissions` | Matriz N:M rol-permiso | FK hacia `roles`, `permissions`. |
| `user_roles` | Asignación de roles a usuarios | FK a `auth.users` y `roles`; fecha/asignador. |
| `admin_audit_logs` | Trazabilidad inmutable de operaciones sensibles | Actor, acción, objetivo, momento y metadatos mínimos. |

Opcionales según decisiones: `support_tickets`, `app_settings`. El número total aumentará respecto del modelo financiero inicial; documentarlo explícitamente y actualizar DER, DDL y pruebas.

## 6. Programa priorizado en entregas verticales

### P0 — Cerrar MVP confiable
- Auditoría ejecutada de pruebas; verificar saldo inicial, disponible y RLS.
- Flujo completo: registro → onboarding → cuenta → ingreso/gasto → obligación → dashboard.
- Criterios: montos correctos, errores seguros, separación entre usuarios, móvil usable.

### P1 — Recuperar identidad visual e interacción
- Inventario de pantallas y comparación con el sistema aprobado.
- Tokens aplicados a botones, tarjetas, gráficos, fondos, tipografía y componentes.
- Navegación móvil: botón Crear real; eliminar botones muertos y texto interno.
- Revisión de dashboard: jerarquía, tarjetas, visualización de gastos, vacíos, loading, dark mode.
- Criterios: capturas comparativas desktop/móvil, contrastes accesibles y pruebas de interacción.

### P2 — Funcionalidades financieras completas
- Presupuestos y metas + aportes.
- Recurrencias y suscripciones.
- Deudas y abonos.
- Alertas, visualizaciones, previsiones e inteligencia financiera contempladas por contexto.
- Criterios por feature: migración + RLS + caso de uso + UI + pruebas + estados vacíos.

### P3 — Administración y roles
- Decidir alcance de cada rol y política de privacidad.
- Aprobar DER/DDL adicional y amenazas; implementar asignación segura y seeds.
- Construir rutas separadas `/admin` con layouts, controles del lado servidor y permisos.
- Pantallas: overview, usuarios, roles, auditoría y configuración según aprobación.
- Criterios: usuario común bloqueado tanto por UI como por servidor y RLS, intentos quedan registrados.

### P4 — Pulido para lanzamiento
- Diseño móvil/PWA completo, performance, accesibilidad, seguridad, pruebas end-to-end.
- Pruebas de usuario: 3-5 personas completan flujos esenciales sin asistencia, registrar fricciones.
- Revisión documental y release sin indicadores de prototipo.

**Orden flexible:** P1 puede desarrollarse en paralelo con P0, pero la arquitectura de roles debe aprobarse antes de crear o desplegar accesos administrativos.

## 7. Ejemplos de pruebas de aceptación desde el usuario

1. **Primer uso:** nuevo usuario se registra, completa onboarding, crea una cuenta y ve un estado comprensible, sin textos técnicos.
2. **Registro rápido:** toca Crear en móvil, agrega gasto de $50.000 y el dashboard refleja el resultado correcto.
3. **Identidad visual:** las pantallas usan tokens aprobados, conservan jerarquía y funcionan con tema claro y oscuro.
4. **Navegación:** todos los botones visibles funcionan; ningún enlace de navegación termina en página inexistente.
5. **Privacidad:** usuario A no consulta datos de B usando URLs, APIs o consultas a Supabase.
6. **RBAC:** un usuario común no entra a `/admin`, incluso introduciendo la URL manualmente.
7. **Administrador:** la reasignación de rol autorizada queda auditada; un usuario no puede autoasignarse permisos.
8. **Soporte:** soporte no consulta transacciones privadas sin un mecanismo explícitamente autorizado.

## 8. Entregables de la próxima iteración

1. Inventario visual por pantalla (desktop/móvil) con capturas y diferencia contra diseño aprobado.
2. Wireframes finales de usuario y administrador.
3. Documento RBAC y políticas de privacidad aprobado.
4. DER/DDL extendido, sin romper 14 entidades existentes.
5. Backlog único con prioridad, dueño, criterios de aceptación, pruebas y estado verificable.
6. Primera entrega vertical: navegación móvil funcional + dashboard pulido + recorrido financiero completo.

## 9. Guía para agentes de programación

1. Leer documentos de `contexto/` antes de modificar código.
2. No sustituir paleta ni tipografía aprobadas sin autorización.
3. No eliminar ni redefinir tablas financieras actuales para agregar roles.
4. Crear migraciones incrementales, con RLS y pruebas de privacidad.
5. Trabajar por una experiencia completa: dominio → DB → API/acción → UI → test.
6. Ejecutar y reportar pruebas de manera verificable; no afirmar que algo funciona si no fue probado.
7. Mostrar antes/después de la interfaz y resultados de aceptación por usuario.
