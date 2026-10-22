# 02 — Protocolo Kilo (obligatorio para cada microtarea)

## Primer mensaje para Kilo (copiar y pegar)

> Estás trabajando en un repositorio **existente y desplegado**, antes llamado FinWise, ahora con nombre de producto Lukiva. Lee primero `AGENTS.md`, `CLAUDE.md`, `contexto/README.md`, `contexto/planificacion/00_ESTADO_REAL_Y_REGLAS.md`, `01_PROGRAMA_MAESTRO_LUKIVA.md`, `03_TAREAS_ATOMICAS.md`, `04_REGISTRO_AVANCE.md`, además del ADR/caso de uso pertinente. No reconstruyas el proyecto, no crees un nuevo Supabase, no apliques migraciones en producción y no cambies más de **una microtarea** por sesión. Primero localiza el código existente y propón cambio mínimo. Implementa solo el ID solicitado. Corre verificaciones pertinentes; si faltan credenciales o entorno, informa qué no pudo verificarse sin inventar éxito. Actualiza `04_REGISTRO_AVANCE.md`. Devuelve diff resumido, tests y próximo ID. **Detente** hasta recibir autorización para el siguiente ID.

## Formato de pedido por tarea

> Ejecuta **[ID]** de `contexto/planificacion/03_TAREAS_ATOMICAS.md`. Respeta alcance, precondiciones y criterios de salida. No trabajes en otras tareas ni renombres identificadores internos. Usa ramas/PR según `contexto/desarrollo/GESTION_GITHUB_Y_RAMAS.md`. Si requiere decidir política de acceso, moneda o semántica, documenta la decisión y detente antes de codificar un supuesto.

## Ciclo de trabajo
1. Leer archivos pertinentes (no toda la documentación recursivamente si no hace falta).
2. Verificar estado del repo/commit y buscar reutilización.
3. Escribir antes o junto con la modificación prueba de aceptación/regresión.
4. Cambio atómico; si hay base, nueva migración compatible + RLS + test.
5. Ejecutar checks; guardar output clave.
6. Actualizar registro y matriz; no reescribir archivos históricos.
7. Resumen + STOP.

## No hacer
- Aplicar SQL de ejemplo de la exposición como migración monolítica.
- Exponer `service_role` a cliente o dar permisos admin por un dato editable por el usuario.
- Utilizar el administrador para visualizar transacciones privadas ajenas sin autorización explícita.
- Renombrar carpeta Git/repo/proyecto Vercel/Supabase por estética; esos son cambios de infraestructura que se autorizan por separado.
- Marcar `Terminado` sin evidencia de pruebas reproducibles.
