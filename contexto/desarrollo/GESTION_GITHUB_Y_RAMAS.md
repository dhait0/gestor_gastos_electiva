# FinWise — Gestión de GitHub, Ramas e Integración

> Política oficial de trabajo colaborativo del repositorio FinWise.
>
> Ubicación recomendada: `contexto/desarrollo/GESTION_GITHUB_Y_RAMAS.md`
>
> Estado: **Aprobado**
>
> Objetivo principal: proteger `staging` y `main` cuando varias personas y agentes trabajan simultáneamente.

---

# 1. Propósito

Este documento define cómo se debe trabajar con Git y GitHub en FinWise.

Es obligatorio para:

- desarrolladores;
- revisores;
- responsables de producción;
- agentes de programación;
- automatizaciones que creen o modifiquen código.

Su objetivo principal es impedir que una rama de trabajo elimine, revierta o sobrescriba accidentalmente cambios que ya fueron integrados por otros colaboradores.

---

# 2. Regla de oro

> **Las ramas protegidas nunca se modifican para adaptarse a una rama nueva. La rama nueva debe adaptarse al estado actual de la rama protegida.**

En FinWise:

```text
main
staging
```

son ramas protegidas.

Si `staging` cambió mientras una persona trabajaba:

```text
NO se modifica staging
NO se revierte staging
NO se resetea staging
NO se fuerza staging
```

La rama nueva debe:

```text
1. obtener el staging más reciente;
2. incorporar esos cambios en su propia rama;
3. resolver allí los conflictos;
4. adaptar su implementación al estado actual;
5. ejecutar nuevamente las validaciones;
6. subir la rama actualizada;
7. solo entonces podrá entrar a staging.
```

---

# 3. Ramas permanentes

## 3.1 `main`

Representa:

```text
PRODUCCIÓN
```

Reglas:

- contiene únicamente código aprobado para producción;
- está conectada al despliegue de producción en Vercel;
- no recibe trabajo normal directamente;
- no acepta push directo;
- no acepta force push;
- no se elimina;
- los releases normales llegan únicamente desde `staging`;
- solo la persona responsable de producción puede autorizar/fusionar el paso a `main`.

---

## 3.2 `staging`

Representa:

```text
INTEGRACIÓN + PRUEBAS
```

Reglas:

- concentra el trabajo ya integrado de los diferentes colaboradores;
- se utiliza localmente para realizar pruebas integradas;
- no se despliega obligatoriamente a un ambiente remoto;
- es la base normal para crear nuevas ramas;
- no acepta push directo;
- no acepta force push;
- no se elimina;
- toda integración se realiza mediante Pull Request.

---

# 4. Flujo principal

```text
                        VERCEL
                     PRODUCCIÓN
                         ▲
                         │
                       main
                         ▲
                         │
                 Pull Request release
                         │
                      staging
                 integración/pruebas
                  ▲      ▲      ▲
                  │      │      │
                 PR     PR     PR
                  │      │      │
          funcionalidad correccion refactorizacion
```

---

# 5. De dónde debe nacer una rama

Todas las ramas normales deben nacer del `staging` más reciente.

Antes de crear una rama:

```bash
git switch staging
git fetch origin
git pull --ff-only origin staging
```

Después:

```bash
git switch -c funcionalidad/nombre-corto
```

Ejemplo:

```bash
git switch -c funcionalidad/registro-gastos
```

Esto reduce la probabilidad de comenzar trabajo sobre una versión antigua del proyecto.

---

# 6. Tipos de ramas

Usar nombres en español.

Formato:

```text
tipo/descripcion-corta
```

Permitidos:

```text
funcionalidad/
correccion/
urgencia/
refactorizacion/
mantenimiento/
documentacion/
pruebas/
sincronizacion/
```

Ejemplos:

```text
funcionalidad/registro-gastos
funcionalidad/dashboard-movil
correccion/calculo-disponible
correccion/formato-moneda
refactorizacion/motor-financiero
mantenimiento/actualizar-dependencias
documentacion/modelo-datos
pruebas/rls-transacciones
urgencia/error-login
sincronizacion/urgencia-login
```

---

# 7. Convención de nombres

Los nombres deben:

- estar en minúsculas;
- usar guiones;
- evitar espacios;
- evitar acentos y caracteres especiales;
- explicar claramente el objetivo.

Correcto:

```text
funcionalidad/nueva-obligacion
```

Evitar:

```text
mi-rama
cambios
prueba2
genesis-final
rama-nueva
arreglo
```

---

# 8. Una rama = un objetivo

Una rama debe resolver una unidad de trabajo coherente.

No mezclar en una misma rama:

```text
dashboard
+
auth
+
modelo de datos
+
actualización de dependencias
```

salvo que formen parte inseparable del mismo cambio.

Esto reduce conflictos y facilita revisión.

---

# 9. Trabajo normal en una rama

Ejemplo:

```bash
git switch funcionalidad/registro-gastos

# trabajar

git status
git add .
git commit -m "feat: add expense registration flow"
git push -u origin funcionalidad/registro-gastos
```

Los commits intermedios pueden ser frecuentes.

La limpieza final del historial hacia `staging` se realizará mediante Squash and Merge.

---

# 10. Antes de abrir o finalizar un Pull Request hacia staging

La rama debe incorporar el `staging` actual.

Primero:

```bash
git fetch origin
```

Confirmar que se está en la rama propia:

```bash
git branch --show-current
```

Debe mostrar, por ejemplo:

```text
funcionalidad/registro-gastos
```

Luego:

```bash
git merge origin/staging
```

IMPORTANTE:

> Este comando se ejecuta estando en la rama de trabajo, no estando en `staging`.

---

# 11. Qué ocurre al traer staging a la rama

Supongamos que la rama fue creada cuando `staging` tenía:

```text
A ─ B ─ C
```

La persona comenzó:

```text
A ─ B ─ C
         \
          D ─ E
```

Mientras trabajaba, otros PR entraron a `staging`:

```text
A ─ B ─ C ─ F ─ G ─ H   staging
         \
          D ─ E           funcionalidad
```

Antes de integrar, la rama debe incorporar:

```text
F
G
H
```

El objetivo es que la rama nueva demuestre compatibilidad con el estado integrado actual.

---

# 12. Conflictos

Si aparecen conflictos al ejecutar:

```bash
git merge origin/staging
```

los conflictos deben resolverse en la rama nueva.

Ejemplo:

```text
rama actual:
funcionalidad/registro-gastos
```

Se corrigen los archivos conflictivos ahí.

Después:

```bash
git add .
git commit
git push
```

---

# 13. Regla crítica sobre conflictos

Está prohibido resolver un conflicto cambiando `staging` para que coincida con la feature.

Incorrecto:

```text
"mi rama no encaja con staging,
entonces voy a quitar de staging lo que me molesta"
```

Correcto:

```text
"staging representa el estado integrado actual,
por lo tanto adaptaré mi rama"
```

---

# 14. Si staging contiene cambios de otros desarrolladores

Esos cambios deben asumirse como parte válida del proyecto.

La rama nueva debe conservarlos salvo que exista una decisión explícita y revisada para modificarlos.

Un agente NO puede concluir:

```text
"este código no lo necesito,
por lo tanto lo elimino durante el merge"
```

sin comprobar su origen y propósito.

---

# 15. Acciones prohibidas para agentes y desarrolladores

Sobre `main` y `staging` queda prohibido:

```bash
git push --force
git push -f
git reset --hard <commit-antiguo>
git rebase
git commit
```

cuando estas operaciones pretendan reescribir directamente la rama protegida.

También queda prohibido:

- borrar las ramas;
- revertir cambios ajenos únicamente para resolver un conflicto propio;
- reemplazar `staging` por el contenido de una feature;
- copiar toda una rama encima de `staging`;
- usar `--force-with-lease` sobre `staging` o `main`;
- deshabilitar temporalmente protecciones para facilitar un merge;
- hacer push directo para "resolver rápido";
- fusionar ignorando checks fallidos;
- modificar producción manualmente para que coincida con una rama.

---

# 16. Si un agente detecta un conflicto complejo

Debe:

```text
1. detener la integración;
2. identificar qué cambió en staging;
3. conservar los cambios ya integrados;
4. adaptar su rama;
5. ejecutar pruebas;
6. explicar cualquier modificación significativa.
```

Si existe ambigüedad de negocio:

```text
NO debe decidir eliminando trabajo ajeno.
```

Debe solicitar revisión humana.

---

# 17. Pull Request hacia staging

Flujo:

```text
rama de trabajo
      ↓
Pull Request
      ↓
staging
```

Requisitos obligatorios:

- rama actualizada con `staging`;
- sin conflictos pendientes;
- checks aprobados;
- mínimo 1 aprobación;
- la aprobación debe venir de otra persona;
- conversaciones de revisión resueltas.

---

# 18. Aprobación obligatoria

Todo Pull Request hacia `staging` requiere:

```text
mínimo 1 aprobación
```

de una persona diferente al autor del cambio.

Un autor no puede ser la única persona que valide su propio trabajo.

Si se agregan cambios importantes después de la aprobación, el PR debe volver a revisarse.

---

# 19. Checks obligatorios

Antes de hacer merge hacia `staging`, GitHub Actions debe ejecutar al menos:

```text
lint
typecheck
test
build
```

---

# 20. Qué significa cada check

## `lint`

Busca:

- errores de estilo;
- patrones problemáticos;
- reglas de código incumplidas.

## `typecheck`

Comprueba TypeScript.

Debe detectar errores como:

```text
tipo incorrecto
prop inexistente
contrato incompatible
```

## `test`

Ejecuta pruebas automatizadas.

Inicialmente:

```text
unit tests
```

Posteriormente puede incluir:

```text
integration
```

## `build`

Comprueba que Next.js puede generar correctamente la aplicación.

Un código que no compila no puede entrar a `staging`.

---

# 21. Checks futuros

Cuando estén disponibles:

```text
integration
e2e
security
```

podrán convertirse también en obligatorios.

Especialmente antes de releases importantes.

---

# 22. Rama obligatoriamente actualizada

Antes del merge, la rama debe estar actualizada con el `staging` más reciente.

Si otro PR entra a `staging` mientras un PR está abierto:

```text
la rama vuelve a quedar desactualizada
```

Debe repetir:

```bash
git fetch origin
git merge origin/staging
```

desde la rama de trabajo.

Luego:

```text
resolver conflictos
ejecutar pruebas
hacer push
esperar checks
```

---

# 23. No se reutilizan checks antiguos

Si la rama cambia después de traer el nuevo `staging`, deben ejecutarse nuevamente los checks sobre el nuevo estado.

No basta con decir:

```text
"antes estaba verde"
```

La versión actual es la que debe aprobarse.

---

# 24. Squash and Merge hacia staging

Los PR normales hacia `staging` utilizarán:

```text
Squash and Merge
```

Esto convierte varios commits de trabajo:

```text
feat: start form
fix: input
fix: validation
test: add test
fix: last issue
```

en un único commit integrado:

```text
feat: add expense registration flow
```

---

# 25. Razón del Squash

Permite:

- mantener `staging` más limpio;
- identificar fácilmente qué funcionalidad entró;
- evitar cientos de commits intermedios;
- conservar el Pull Request como historial de revisión.

---

# 26. Después del merge hacia staging

La rama de trabajo se elimina.

Ejemplo:

```text
funcionalidad/registro-gastos
```

después de integrarse:

```text
→ eliminar
```

Nunca eliminar:

```text
main
staging
```

---

# 27. Pruebas integradas en staging

`staging` representa el estado conjunto del próximo producto.

Para probar localmente:

```bash
git switch staging
git fetch origin
git pull --ff-only origin staging
pnpm install
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm dev
```

Según el proyecto, también ejecutar:

```text
integration
e2e
```

cuando estén configurados.

---

# 28. Staging no es producción

Puede contener:

- nuevas funcionalidades;
- correcciones;
- cambios ya aprobados individualmente;

pero todavía requiere validación integrada antes del release.

---

# 29. Release hacia producción

El flujo normal de producción es exclusivamente:

```text
staging
   ↓
Pull Request
   ↓
main
   ↓
Vercel
```

No se permite:

```text
funcionalidad/* → main
correccion/* → main
refactorizacion/* → main
documentacion/* → main
```

---

# 30. Autorización de producción

El Pull Request:

```text
staging → main
```

solo puede ser autorizado/fusionado por:

> **la persona responsable de producción definida por el proyecto.**

Otros desarrolladores pueden:

- revisar;
- comentar;
- probar;

pero no tomar unilateralmente la decisión de publicar producción.

---

# 31. Merge de staging hacia main

Para releases normales utilizar:

```text
Merge Commit
```

No usar Squash para convertir todo `staging` en un único commit de release.

Esto mantiene la relación histórica entre las ramas y deja explícito el evento de liberación.

Ejemplo conceptual:

```text
Release: staging → main
```

---

# 32. Release checklist

Antes de `staging → main`:

- [ ] staging actualizado;
- [ ] pruebas locales integradas;
- [ ] lint correcto;
- [ ] typecheck correcto;
- [ ] tests correctos;
- [ ] build correcto;
- [ ] migraciones revisadas;
- [ ] variables de producción revisadas;
- [ ] cambios críticos revisados;
- [ ] no hay conflictos;
- [ ] responsable de producción aprueba;
- [ ] PR listo.

---

# 33. Congelación corta de staging durante release

Mientras el PR:

```text
staging → main
```

está en validación final, se recomienda no integrar nuevas funcionalidades a `staging`.

Objetivo:

```text
probar exactamente lo mismo que se va a publicar
```

Después del release se reanuda la integración normal.

---

# 34. Vercel

La rama de producción es:

```text
main
```

Flujo:

```text
main actualizado
      ↓
Vercel
      ↓
Producción
```

`staging` se prueba localmente en el flujo inicial.

No existe obligación de desplegar cada feature ni `staging` a Vercel.

---

# 35. Hotfix / urgencia de producción

Existe una única excepción al flujo normal hacia `main`:

```text
urgencia/*
```

Se utiliza únicamente para errores críticos de producción.

No debe utilizarse para saltarse `staging` por comodidad.

---

# 36. Crear una urgencia

La rama nace desde `main`, no desde `staging`.

```bash
git switch main
git fetch origin
git pull --ff-only origin main
git switch -c urgencia/corregir-login
```

Se realiza únicamente el cambio imprescindible.

---

# 37. Integrar urgencia a producción

Flujo:

```text
main
  \
   urgencia/corregir-login
          ↓
          PR
          ↓
         main
          ↓
        Vercel
```

También requiere:

- checks;
- revisión;
- autorización del responsable de producción.

---

# 38. Sincronizar el hotfix con staging

Después de corregir producción, el mismo arreglo debe regresar a `staging`.

Nunca modificar `staging` directamente.

Crear:

```bash
git switch staging
git fetch origin
git pull --ff-only origin staging
git switch -c sincronizacion/urgencia-login
```

Luego incorporar `main`:

```bash
git merge origin/main
```

Cualquier conflicto se resuelve en:

```text
sincronizacion/urgencia-login
```

Después:

```bash
git add .
git commit
git push -u origin sincronizacion/urgencia-login
```

Y finalmente:

```text
Pull Request
sincronizacion/urgencia-login
→ staging
```

---

# 39. Regla del hotfix

Incluso en una urgencia:

```text
staging sigue protegido
main sigue protegido
```

La urgencia no justifica:

```text
force push
push directo
reset de ramas
```

---

# 40. Configuración recomendada en GitHub — staging

Usar Rulesets o Branch Protection según la configuración disponible del repositorio.

Para `staging`:

```text
✅ Require a pull request before merging
✅ Require at least 1 approval
✅ Dismiss stale approvals when new commits are pushed
✅ Require approval of the most recent reviewable push
✅ Require status checks before merging
✅ Require branches to be up to date before merging
✅ Require conversation resolution
✅ Block force pushes
✅ Block deletion
✅ Do not allow bypassing protections
```

Required checks:

```text
lint
typecheck
test
build
```

---

# 41. Configuración recomendada en GitHub — main

Para `main`:

```text
✅ Require a pull request before merging
✅ Require review
✅ Require status checks before merging
✅ Require conversation resolution
✅ Block force pushes
✅ Block deletion
✅ Do not allow bypassing protections
```

Adicionalmente:

```text
solo responsable de producción
puede autorizar/fusionar release
```

El flujo normal de PR debe ser:

```text
staging → main
```

---

# 42. Revisión de cambios recientes

Si después de una aprobación se realiza un nuevo push:

```text
la aprobación anterior no debe considerarse suficiente
```

La nueva versión debe revisarse.

Esto evita:

```text
aprobar A
↓
autor agrega B
↓
B entra sin revisión
```

---

# 43. Pull Request — información mínima

Todo PR debe explicar:

```text
Qué cambia
Por qué cambia
Cómo probarlo
Qué riesgos tiene
Qué módulos toca
Si incluye migración
```

---

# 44. Plantilla recomendada del Pull Request

```markdown
## Cambio

Descripción breve.

## Motivo

Por qué se necesita.

## Cómo probar

1.
2.
3.

## Riesgos

- Ninguno / detallar.

## Migraciones

- No / Sí: detallar.

## Checklist

- [ ] Rama actualizada con staging
- [ ] Sin conflictos
- [ ] Lint
- [ ] Typecheck
- [ ] Tests
- [ ] Build
- [ ] Mobile revisado si aplica
- [ ] Desktop revisado si aplica
- [ ] Dark mode revisado si aplica
- [ ] Migraciones indicadas
- [ ] Documentación actualizada si cambió una decisión
```

---

# 45. Revisión de código

El revisor debe comprobar más que si "compila".

Debe evaluar:

- impacto sobre código existente;
- si elimina comportamiento ajeno;
- seguridad;
- integridad financiera;
- compatibilidad con documentación;
- tests;
- diseño cuando corresponda.

---

# 46. Agentes de programación

Todo agente debe leer antes de modificar el repositorio:

```text
FINWISE_CONTEXTO_MAESTRO.md
CONVENCIONES_DESARROLLO.md
GESTION_GITHUB_Y_RAMAS.md
```

y los documentos específicos del módulo.

---

# 47. Instrucción obligatoria para agentes

Un agente que trabaja en una rama NO tiene autoridad para:

- modificar directamente `staging`;
- modificar directamente `main`;
- reescribir historial protegido;
- eliminar cambios integrados para resolver conflictos;
- fusionar a producción;
- desactivar reglas de GitHub.

---

# 48. Antes de comenzar trabajo de un agente

Debe confirmar:

```text
1. rama actual;
2. objetivo de la rama;
3. base actualizada desde staging;
4. archivos/módulos que modificará.
```

Si no está en una rama de trabajo adecuada, debe crearla antes de editar código.

---

# 49. Antes de entregar trabajo de un agente

Debe:

```text
1. actualizarse con staging;
2. resolver conflictos en su rama;
3. ejecutar checks;
4. revisar diff;
5. explicar cambios;
6. dejar listo el PR.
```

---

# 50. Revisar el diff antes del Pull Request

Obligatorio revisar:

```bash
git status
git diff origin/staging...HEAD
```

El objetivo es detectar:

- archivos eliminados accidentalmente;
- cambios ajenos;
- configuraciones modificadas;
- secretos;
- artefactos innecesarios.

---

# 51. Eliminaciones inesperadas

Si el diff muestra muchos archivos eliminados o modificados que no pertenecen al objetivo de la rama:

```text
DETENER
```

No abrir merge hasta entender el motivo.

Esta es una señal típica de integración incorrecta.

---

# 52. Archivos sensibles

Nunca subir:

```text
.env
.env.local
tokens
service role keys
passwords
credenciales
```

Usar:

```text
.env.example
```

sin valores reales.

---

# 53. Migraciones de base de datos

Si una rama contiene migración:

el PR debe indicarlo expresamente.

Antes del merge:

- revisar orden;
- revisar compatibilidad;
- revisar RLS;
- revisar datos existentes;
- revisar estrategia de despliegue.

Nunca "arreglar" producción manualmente y omitir la migración versionada.

---

# 54. Cambios documentales

Los `.md` también siguen el mismo proceso:

```text
documentacion/*
→ PR
→ staging
```

No modificar `staging` directamente porque "solo es documentación".

---

# 55. Correcciones pequeñas

Una corrección pequeña sigue usando:

```text
correccion/*
```

Ejemplo:

```text
correccion/texto-dashboard
```

No es motivo suficiente para saltarse el Pull Request.

---

# 56. Pull Request en Draft

Si el trabajo todavía no está listo, usar:

```text
Draft Pull Request
```

Permite:

- revisión temprana;
- discusión;
- visibilidad.

Pero no debe fusionarse mientras sea Draft.

---

# 57. Dependencia entre ramas

Evitar crear una feature sobre otra feature no integrada.

Preferir:

```text
cada rama nace de staging
```

Si existe dependencia inevitable, documentarla en el PR.

Cuando la dependencia entre a `staging`, actualizar la segunda rama desde `staging`.

---

# 58. Qué hacer si dos ramas modifican lo mismo

No intentar decidir automáticamente cuál "gana".

La rama que se integra después debe:

1. traer `staging`;
2. revisar la versión ya integrada;
3. mantener el comportamiento válido;
4. adaptar su cambio;
5. probar ambas funcionalidades.

---

# 59. No usar estrategia "ours" o "theirs" indiscriminadamente

Durante conflictos, evitar decisiones masivas como:

```text
aceptar todo lo mío
```

o:

```text
aceptar todo lo de staging
```

sin revisar cada conflicto.

Un conflicto puede contener lógica válida de ambos lados.

---

# 60. Revertir un cambio ya integrado

Si un cambio en `staging` debe revertirse por una decisión legítima:

NO hacerlo dentro de una feature no relacionada.

Crear:

```text
correccion/revertir-nombre
```

y explicar en su PR:

- qué se revierte;
- por qué;
- impacto.

---

# 61. Flujo de una funcionalidad completa

```text
1. actualizar staging
2. crear funcionalidad/*
3. desarrollar
4. commit/push
5. traer staging actualizado
6. resolver conflictos en funcionalidad/*
7. ejecutar checks
8. revisar diff
9. abrir PR hacia staging
10. obtener 1 aprobación externa
11. checks verdes
12. Squash and Merge
13. eliminar rama
```

---

# 62. Flujo de producción completo

```text
1. validar staging localmente
2. congelar staging durante validación final
3. abrir PR staging → main
4. revisar release checklist
5. responsable de producción aprueba
6. Merge Commit
7. main actualiza
8. Vercel despliega producción
9. smoke test
10. reabrir integración normal en staging
```

---

# 63. Smoke test después de producción

Después del deploy a Vercel, validar al menos:

- aplicación abre;
- login funciona;
- dashboard carga;
- rutas privadas funcionan;
- API/Supabase responden;
- no existen errores críticos visibles.

En fases posteriores:

```text
smoke E2E automatizado
```

---

# 64. Si producción falla después del release

No editar `main` directamente.

Opciones:

## Si el error es crítico

Crear:

```text
urgencia/*
```

desde `main`.

## Si el error no es crítico

Crear:

```text
correccion/*
```

desde `staging`, seguir flujo normal y publicar en el próximo release.

---

# 65. Responsabilidad del autor de una rama

El autor es responsable de:

- mantener su rama actualizada;
- resolver sus conflictos;
- no dañar cambios ya integrados;
- mantener alcance coherente;
- agregar/actualizar pruebas;
- documentar migraciones;
- revisar su propio diff antes del PR.

---

# 66. Responsabilidad del revisor

El revisor es responsable de:

- revisar lógica;
- revisar impacto;
- comprobar que no se eliminaron cambios ajenos;
- validar pruebas;
- revisar seguridad;
- solicitar cambios cuando sea necesario.

Una aprobación no debe ser automática.

---

# 67. Responsabilidad del encargado de producción

La persona responsable de producción controla:

```text
staging → main
```

Debe confirmar:

- estabilidad de staging;
- checks;
- migraciones;
- variables;
- riesgos;
- ventana de release cuando aplique.

Solo esta persona decide el merge normal a producción.

---

# 68. GitHub Actions recomendado

Workflow inicial:

```text
Pull Request hacia staging/main
        ↓
pnpm install
        ↓
lint
        ↓
typecheck
        ↓
test
        ↓
build
```

Si cualquier paso falla:

```text
merge bloqueado
```

---

# 69. Regla de dependencias

Si `pnpm-lock.yaml` cambia, el PR debe explicar por qué.

Evitar instalar dependencias accidentalmente o sin justificación.

---

# 70. Regla de archivos generados

No subir archivos generados que no formen parte del repositorio.

Ejemplos a evitar:

```text
.next/
node_modules/
coverage/
.env.local
logs
temporales
```

El `.gitignore` debe protegerlos.

---

# 71. Regla de commits

Los commits pueden usar convención:

```text
feat:
fix:
refactor:
test:
docs:
chore:
```

Aunque las ramas estén en español.

Ejemplos:

```text
feat: add obligation form
fix: preserve staging changes in dashboard merge
test: add available-to-spend cases
docs: update github workflow policy
```

---

# 72. Commit antes de actualizar con staging

Antes de ejecutar:

```bash
git merge origin/staging
```

la rama debe estar en un estado limpio.

Validar:

```bash
git status
```

No mezclar cambios sin commit con una resolución de conflictos compleja.

---

# 73. Si hay cambios locales sin terminar

Opciones seguras:

```text
commit temporal
```

o, si la persona sabe usarlo correctamente:

```text
git stash
```

Después recuperar cambios.

Los agentes deben preferir commit claro antes de operaciones de integración.

---

# 74. `git pull` en ramas de trabajo

En ramas de trabajo, preferir operaciones explícitas:

```bash
git fetch origin
git merge origin/staging
```

Esto hace visible qué rama se está incorporando.

Evitar comandos automáticos ambiguos cuando se resuelven integraciones críticas.

---

# 75. Qué NO significa "actualizar la rama"

Actualizar una rama NO significa:

```text
copiar archivos de staging manualmente
descargar ZIP de staging
sobrescribir carpetas
borrar y volver a copiar proyecto
```

Debe realizarse con Git para conservar historial y conflictos correctamente.

---

# 76. Rama local staging dañada

Si alguien modificó `staging` localmente por error y NO hizo push:

no intentar conservar esos cambios sobre `staging`.

Primero crear una rama de rescate si el trabajo importa:

```bash
git switch -c correccion/rescatar-cambios
```

Después restaurar `staging` local desde remoto de forma controlada.

Nunca hacer esto automáticamente si existe riesgo de perder trabajo.

---

# 77. Agentes y comandos destructivos

Un agente no debe ejecutar sin autorización humana explícita:

```bash
git reset --hard
git clean -fd
git push --force
git push --force-with-lease
git branch -D
```

cuando exista posibilidad de perder trabajo.

---

# 78. Regla de resolución humana

Solicitar intervención humana cuando:

- hay conflicto de negocio;
- dos implementaciones válidas son incompatibles;
- la migración puede destruir datos;
- un diff elimina trabajo amplio;
- no está claro qué comportamiento debe prevalecer;
- una operación Git puede perder trabajo.

---

# 79. Flujo resumido para agentes

```text
ANTES
-----
leer documentación
actualizar staging
crear rama

DURANTE
-------
trabajar solo en rama
commits frecuentes
no tocar ramas protegidas

ANTES DEL PR
------------
fetch
merge origin/staging
resolver en rama propia
tests
diff

PR
--
staging
1 aprobación externa
checks verdes
Squash

RELEASE
-------
staging → main
solo responsable producción
Merge Commit
Vercel
```

---

# 80. Diagrama final

```text
                       ┌───────────────────┐
                       │      VERCEL       │
                       │    PRODUCCIÓN     │
                       └─────────▲─────────┘
                                 │
                              main
                                 ▲
                                 │
                     PR + autorización
                   responsable producción
                                 │
                              staging
                    integración + pruebas
                  ┌──────────────┼──────────────┐
                  ▲              ▲              ▲
                  │              │              │
                 PR             PR             PR
                  │              │              │
        funcionalidad/*  correccion/*  refactorizacion/*
                  ▲              ▲              ▲
                  │              │              │
                trabajo en ramas independientes
```

---

# 81. Principio final

> **El trabajo nuevo debe demostrar que es compatible con el proyecto actual. El proyecto actual no debe sacrificarse para acomodar el trabajo nuevo.**

En términos de Git:

```text
la rama nueva se adapta a staging
```

nunca:

```text
staging se adapta a la rama nueva
```

---

# Fin del documento
