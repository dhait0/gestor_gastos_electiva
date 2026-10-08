# FinWise — Política de Eficiencia para Agentes

> Política obligatoria para agentes de programación, asistentes de código y automatizaciones que trabajen sobre FinWise.
>
> Ubicación recomendada: `contexto/desarrollo/POLITICA_EFICIENCIA_AGENTES.md`
>
> Estado: **Aprobado**
>
> Objetivo: obtener el resultado correcto con el menor consumo razonable de tiempo, contexto, herramientas y tokens.

---

# 1. Principio rector

> **FinWise no premia al agente por hacer más trabajo. Lo premia por hacer el mínimo trabajo correcto necesario para cumplir la tarea.**

El esfuerzo debe ser proporcional a:

```text
alcance
+
riesgo
+
incertidumbre
```

No a la capacidad máxima disponible del modelo.

---

# 2. Modo por defecto

Todo agente debe comenzar en:

```text
MODO ECONÓMICO
```

No asumir:

```text
MODO AUTÓNOMO PROFUNDO
```

El agente puede escalar profundidad únicamente cuando exista una razón técnica clara.

---

# 3. Objetivos de esta política

Evitar:

- exploraciones completas del repositorio para tareas pequeñas;
- lectura innecesaria de todos los `.md`;
- razonamientos excesivamente largos;
- bucles de prueba y error;
- refactors no solicitados;
- investigación web innecesaria;
- ejecución repetida de suites completas;
- creación de documentación redundante;
- instalación de dependencias por comodidad;
- activación excesiva de MCP/skills;
- scope creep;
- consumo excesivo de tokens.

---

# 4. Principio de proporcionalidad

| Tipo de tarea | Esfuerzo esperado |
|---|---|
| Cambiar copy | mínimo |
| Ajustar estilo puntual | bajo |
| Corregir bug evidente | bajo |
| Crear componente pequeño | normal |
| Crear formulario | normal |
| Añadir caso de uso | normal |
| Modificar cálculo financiero | alto |
| Cambiar RLS | alto |
| Migración de datos | alto |
| Bug desconocido transversal | alto |
| Cambio arquitectónico | muy alto |

El agente no debe escalar por interés o curiosidad.

---

# 5. NIVEL 1 — Rápido

Usar para:

- copy;
- iconos;
- estilos puntuales;
- pequeñas validaciones;
- cambios documentales pequeños;
- bug localizado;
- configuración simple.

Flujo:

```text
localizar
→ leer lo necesario
→ cambiar
→ verificar de forma específica
→ detener
```

Presupuesto orientativo:

```text
1–5 archivos relevantes
```

No es un límite absoluto, pero superarlo exige una razón.

No hacer por defecto:

- E2E completo;
- auditoría del repositorio;
- investigación web;
- refactor;
- lectura del contexto documental completo;
- nuevas dependencias.

---

# 6. NIVEL 2 — Normal

Es el nivel normal para desarrollo de features.

Usar para:

- formulario;
- Server Action;
- query;
- pantalla;
- componente relevante;
- caso de uso;
- validación;
- CRUD acotado;
- modificación de un módulo.

Lectura:

```text
AGENTS.md
+
documentación específica
+
módulo afectado
+
dependencias directas
```

Presupuesto orientativo:

```text
3–12 archivos relevantes
```

Si necesita explorar decenas de archivos, debe justificar por qué.

---

# 7. NIVEL 3 — Profundo

Usar únicamente cuando la tarea involucre:

- seguridad;
- RLS;
- integridad financiera;
- migraciones;
- pérdida potencial de datos;
- arquitectura;
- bugs no localizados;
- refactors transversales solicitados;
- conflictos complejos de integración.

Puede ampliar investigación y pruebas.

Incluso en este nivel debe evitar trabajo irrelevante.

---

# 8. Regla de escalamiento

Escalar de nivel solo si ocurre al menos una:

```text
no se puede localizar la causa
existen múltiples módulos realmente implicados
hay riesgo de seguridad
hay riesgo financiero
hay riesgo de pérdida de datos
hay una migración
la decisión modifica arquitectura
```

No escalar porque:

```text
"quiero dejarlo mejor"
"ya que estoy aquí"
"podría aprovechar"
```

---

# 9. Regla de detención

> **Cuando la tarea solicitada esté cumplida y verificada, detenerse.**

No continuar buscando:

- mejoras;
- optimizaciones;
- refactors;
- edge cases no relevantes;
- documentación adicional;
- nuevas tareas.

Si se detecta algo fuera de alcance:

```text
mencionarlo
+
no implementarlo
```

---

# 10. Scope creep prohibido

Ejemplo:

```text
Solicitud:
Agregar campo nota al gasto.
```

Correcto:

```text
campo
schema
persistencia
test relacionado
```

Incorrecto:

```text
campo
+
refactor completo
+
nuevo hook
+
nueva librería
+
nuevo patrón
```

salvo que sea imprescindible.

---

# 11. Refactor

No refactorizar código ajeno únicamente por preferencia.

Refactor permitido cuando:

```text
la tarea lo solicita
```

o:

```text
es estrictamente necesario para implementar correctamente la tarea
```

Si es útil pero no necesario:

```text
reportar como pendiente
```

---

# 12. Exploración del repositorio

Está prohibido comenzar cada tarea haciendo una lectura recursiva completa.

Orden:

```text
1. entender solicitud
2. identificar módulo
3. búsqueda exacta o semántica
4. abrir archivos candidatos
5. expandir solo si hace falta
```

---

# 13. Índice semántico primero

Cuando exista indexación de codebase:

```text
usar búsqueda semántica
antes de recorrer manualmente muchas carpetas
```

Objetivo inicial:

```text
encontrar 3–8 candidatos
→ leer únicamente candidatos relevantes
```

El índice localiza. El código real sigue siendo la fuente de verdad.

---

# 14. Contexto documental selectivo

No leer todos los documentos para cada tarea.

## UI

Leer normalmente:

```text
AGENTS.md
SISTEMA_DISENO_FINWISE.md
wireframe/pantalla relevante
componente afectado
```

## Datos / RLS

Leer:

```text
AGENTS.md
MODELO_DATOS_Y_SEGURIDAD.md
ADR RLS si aplica
migración/tablas afectadas
```

## Git

Leer:

```text
AGENTS.md
GESTION_GITHUB_Y_RAMAS.md
```

## Cálculo financiero

Leer:

```text
AGENTS.md
FINWISE_CONTEXTO_MAESTRO.md
regla/caso de uso relevante
código de dominio afectado
```

## Arquitectura

Solo si aplica:

```text
ARQUITECTURA_TECNICA.md
ADRs relacionados
```

---

# 15. `AGENTS.md` es un router

Su función es:

```text
enrutar
```

no:

```text
forzar lectura completa del repositorio
```

---

# 16. Búsqueda exacta vs semántica

Si se conoce el nombre:

```text
AvailableToSpendCard
calculateLiquidBalance
transactionSchema
```

usar búsqueda exacta primero.

Usar búsqueda semántica cuando se conoce el concepto pero no el nombre.

---

# 17. Investigación web

No investigar internet por defecto.

Usar web únicamente cuando:

- API/framework puede haber cambiado;
- documentación oficial es necesaria;
- existe error externo/desconocido;
- una dependencia necesita verificación;
- el usuario pide investigación.

Para una tarea interna:

```text
repositorio > web
```

---

# 18. Fuentes externas

Prioridad:

```text
1. documentación oficial
2. repositorio oficial
3. fuentes secundarias
```

No realizar búsquedas amplias repetitivas si una fuente oficial responde.

---

# 19. Intentos ante errores

Presupuesto por defecto:

```text
máximo 2 intentos sustancialmente similares
```

Si ambos fallan:

```text
detener repetición
→ analizar causa
→ cambiar estrategia
```

Si sigue bloqueado:

```text
reportar bloqueo
```

---

# 20. Regla anti-loop

Prohibido:

```text
ejecutar
fallar
reintentar igual
fallar
reintentar igual
...
```

Debe existir nueva evidencia o hipótesis antes de otro intento.

---

# 21. Recuperación ante fallos de herramientas

Si una herramienta falla durante una tarea:

1. No reiniciar la fase desde cero.
2. No repetir indefinidamente la misma llamada fallida.
3. Inspeccionar primero el estado actual:
   - `git status`
   - `git diff`
   - archivos ya creados o modificados.
4. Identificar el último punto completado correctamente.
5. Continuar únicamente desde la operación pendiente.
6. Conservar todo cambio válido ya realizado.
7. Ante argumentos inválidos, corregir el formato o cambiar de herramienta o estrategia.
8. Realizar como máximo 2 intentos sustancialmente similares.

Si el problema continúa:

- detenerse;
- indicar el archivo u operación pendiente;
- mostrar el error recibido;
- solicitar intervención cuando sea necesario.

Nunca borrar, sobrescribir o rehacer trabajo correcto únicamente para recuperar una ejecución interrumpida.

Flujo obligatorio:

```text
error
→ inspeccionar estado
→ conservar trabajo válido
→ localizar pendiente
→ continuar desde ahí

# 22. Pruebas proporcionales

Cambio pequeño:

```text
test específico
```

Feature normal:

```text
tests del módulo
+
typecheck relevante
```

Antes del PR:

```text
lint
typecheck
test
build
```

No ejecutar todo el E2E después de cada edición pequeña.

---

# 23. E2E

Usar durante implementación cuando:

- flujo crítico;
- bug de integración;
- tarea lo requiere.

Suite completa preferentemente:

- antes del PR;
- release;
- cambio transversal.

---

# 24. Builds

No reconstruir producción repetidamente para copy/CSS.

Usar build cuando:

- feature está lista;
- cambia configuración;
- aparece error de compilación;
- política de entrega lo exige.

---

# 25. Dependencias

Antes de instalar:

```text
¿el stack actual puede resolverlo?
```

Si sí:

```text
no instalar
```

No instalar varias librerías para experimentar.

---

# 26. Skills

No activar todas las skills disponibles.

Usar únicamente:

```text
skill directamente relevante
```

Si dos se solapan:

```text
preferir la más específica
```

---

# 27. MCP

Los MCP agregan herramientas/descripciones al contexto.

> **No activar múltiples servidores MCP por defecto.**

Mantener habilitados únicamente los necesarios.

Evitar cargar simultáneamente servidores grandes de:

```text
GitHub
Slack
Notion
browser
database
monitoring
```

si no hacen falta.

---

# 28. Context servers

Un servidor de contexto debe reducir lectura.

Debe ofrecer:

- búsqueda selectiva;
- resultados breves;
- paths/line ranges;
- top-k configurable;
- índice incremental;
- acceso controlado;
- no inyectar el repo completo.

---

# 29. Resultados de búsqueda

Preferir inicialmente:

```text
5–10 resultados
```

No devolver 50 fragmentos por defecto.

---

# 30. Contexto máximo útil

Preferir:

```text
pocos fragmentos muy relevantes
```

sobre:

```text
muchos fragmentos medianamente relacionados
```

---

# 31. Resúmenes

No volver a resumir documentos completos en cada turno.

Si una regla está localizada:

```text
leer sección
→ usar
```

---

# 32. Documentación generada

No crear automáticamente:

```text
REPORT.md
SUMMARY.md
NOTES.md
CHANGELOG_EXTRA.md
IMPLEMENTATION_REPORT.md
```

Solo lo exigido por la tarea/gobierno.

---

# 33. Respuesta final

Formato recomendado:

```text
Implementado:
- ...

Archivos:
- ...

Validación:
- ...

Pendientes:
- ...
```

No escribir un ensayo del proceso.

---

# 34. Preguntas al usuario

No preguntar por decisiones triviales cubiertas por documentación.

Preguntar cuando:

- falta decisión real;
- alternativas tienen impacto;
- puede perderse trabajo;
- cambia alcance;
- existe riesgo de negocio.

---

# 35. Autonomía

Autonomía significa completar el objetivo, no inventar objetivos nuevos.

---

# 36. Clasificación previa

Antes de trabajar, clasificar internamente:

```text
RÁPIDO
NORMAL
PROFUNDO
```

---

# 37. Tareas rápidas

Objetivo orientativo:

```text
1–3 ciclos de herramientas
```

cuando sea razonablemente posible.

No sacrificar corrección.

---

# 38. Tareas normales

Después de cada hallazgo importante, decidir:

```text
¿ya tengo suficiente contexto?
```

Si sí, dejar de explorar.

---

# 39. Tareas profundas

Dividir:

```text
localizar
→ confirmar causa
→ cambiar
→ probar
```

No hacer auditoría total salvo que la tarea sea una auditoría.

---

# 40. Indexación recomendada

Indexar preferentemente:

```text
src/
supabase/
contexto/
AGENTS.md
```

Excluir:

```text
node_modules/
.next/
coverage/
dist/
build/
.git/
binarios grandes
archivos generados
secretos
```

---

# 41. Prioridad de recuperación

```text
1. nombre exacto / búsqueda textual
2. índice semántico
3. archivo específico
4. documentación relacionada
5. dependencias
6. web/MCP externo si hace falta
```

No comenzar por 6.

---

# 42. Índice incremental

Actualizar únicamente archivos modificados cuando sea posible.

No reindexar todo el repo en cada consulta.

---

# 43. Ramas

La búsqueda debe priorizar el checkout/rama actual.

No asumir que resultados de otra rama son verdad vigente.

---

# 44. Privacidad

No indexar/enviar:

- `.env`;
- secrets;
- keys;
- datos financieros reales;
- credenciales;
- información sensible.

---

# 45. Embeddings

No empezar con el modelo más costoso.

Usar opción equilibrada/local.

Escalar solo si la recuperación es insuficiente.

---

# 46. Métrica práctica

La indexación funciona si reduce:

```text
grep
→ leer
→ grep
→ leer
→ adivinar
→ grep
```

a:

```text
semantic_search
→ candidatos
→ leer
→ actuar
```

---

# 47. Señales de exceso

Detener y reevaluar si:

- tarea pequeña leyó >15 archivos;
- búsquedas similares se repiten;
- módulos fuera de alcance cambian;
- aparecen refactors no solicitados;
- suites completas se repiten;
- MCP innecesarios están activos;
- se sigue trabajando después de cumplir.

---

# 48. Excepciones

Los límites son:

```text
soft limits
```

No deben impedir:

- seguridad;
- integridad financiera;
- preservación de datos;
- migraciones;
- bugs realmente complejos.

Si se exceden:

```text
debe existir una razón técnica
```

---

# 49. Agentes de terceros

Esta política aplica aunque el agente:

- tenga gran contexto;
- sea gratuito;
- permita muchas iteraciones;
- no facture tokens directamente.

El límite relevante es:

```text
eficiencia del proyecto
```

---

# 50. Principio final

> **El mejor agente no es el que más archivos lee ni el que más pasos ejecuta. Es el que identifica rápidamente el contexto correcto, realiza el cambio mínimo correcto y sabe cuándo detenerse.**

---

# Fin del documento
