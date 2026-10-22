# Extensión arquitectónica: roles, administración y privacidad

**Alcance aprobado como nueva dirección del producto:** administrar la plataforma y cuentas de usuario, no administrar fondos ajenos.

## Roles propuestos para diseño (validar en M01)
- `user`: solo sus datos privados financieros.
- `support`: operaciones de soporte restringidas y auditadas; por defecto sin transacciones privadas.
- `admin`: administración de acceso/configuración y métricas globales minimizadas; no acceso irrestricto a cuentas/movimientos personales.

## Propuesta de tablas complementarias (fuera de las 14 financieras)
`roles`, `permissions`, `user_roles`, `role_permissions`, `admin_audit_logs` (y, solo si los casos de uso lo requieren, sesiones de soporte/solicitudes de acceso). **No aplicar aún este DDL:** validar cardinalidad, root-admin bootstrap y políticas de separación.

## Controles imprescindibles
- Permisos verificados en servidor y RLS; nunca en `localStorage`, UI o metadatos editables por usuario.
- Principio de mínimo privilegio; denegación predeterminada.
- Auditoría de otorgamiento/revocación de roles con actor, objetivo, acción, fecha y contexto, sin exponer datos sensibles.
- Alta de primer admin por procedimiento seguro, con verificación independiente; no asumir que email particular basta.
- Tests explícitos: usuario no accede a `/admin`, soporte no escala a admin, admin no lee transacciones privadas por defecto, RLS impide acceso directo cruzado.

## Compatibilidad
No alterar las 14 entidades ni las migraciones actuales al inicio. Crear extensiones aditivas solo tras pruebas en staging/local. Documentar si se requiere alguna tabla adicional y el motivo de producto.
