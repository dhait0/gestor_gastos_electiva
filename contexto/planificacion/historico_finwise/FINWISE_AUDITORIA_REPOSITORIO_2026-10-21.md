# FinWise - Auditoría inicial del repositorio

**Fecha:** 21 de octubre de 2026  
**Fuente técnica:** `gestor_gastos_electiva-main.zip` (snapshot fechado internamente el 13 de octubre de 2026).  
**Fuente de requisitos:** `contexto/` incluida en el mismo repositorio; contrastada con `FINWISE_PLAN_MAESTRO_IMPLEMENTACION.md`.  
**Naturaleza de la revisión:** estática. No se instalaron dependencias ni se ejecutaron pruebas, Supabase ni la aplicación. Los estados indican evidencia de código, no aceptación funcional.

## 1. Conclusión

El proyecto ya contiene una implementación sustancial del núcleo MVP: rutas Next.js, acciones de servidor, lógica financiera, componentes visuales, migraciones y suites de prueba. No conviene reconstruir estos módulos. Primero deben validarse los cálculos, migraciones, aislamiento de usuarios y recorrido E2E. Después se continúa con los módulos del modelo integral.

## 2. Inventario confirmado

| Área | Evidencia encontrada | Estado |
|---|---|---|
| Stack | Next.js 16.4, React 19.3, TypeScript, Supabase SSR, Tailwind, Zod, decimal.js | Código configurado; build pendiente |
| Autenticación | `/login`, `/registro`, callback y acciones de contraseña | Implementado en código; integración pendiente |
| Onboarding | Ruta y acciones para perfil/primera cuenta | Implementado en código; probar recorrido |
| Cuentas | Rutas y server actions de creación, lectura, edición y archivo | Implementado en código; probar reglas |
| Categorías | Rutas y acciones de creación, lectura, edición y archivo | Implementado en código; probar reglas |
| Movimientos | Acciones para alta, consulta, edición, borrado lógico y transferencia | Implementado en código; probar consistencia |
| Obligaciones | Rutas y acciones CRUD, marcar pago, archivar | Implementado en código; probar impacto financiero |
| Dashboard | Ruta, acción `getFinancialSummaryAction` y cálculos de dominio | Implementado en código; **revisión prioritaria** |
| Base de datos | Cinco migraciones: helpers/tipos, perfiles, cuentas/categorías, transacciones, obligaciones | Cinco tablas propias creadas en SQL; aplicar y verificar |
| Seguridad | Políticas RLS en las migraciones; pruebas para dos usuarios | Diseñado; ejecución y cobertura pendientes |
| Calidad | Vitest, Playwright, ESLint, TypeScript y CI de GitHub Actions | Configurado; resultados no verificados |
| Diseño y PWA | Componentes UI, manifest e iconos | Archivos presentes; experiencia no verificada |

## 3. Diferencia respecto del modelo integral de 14 entidades

**Con migración de creación encontrada:** `auth.users` (administrada por Supabase), `profiles`, `accounts`, `categories`, `transactions`, `obligations`.

**Previstas, sin migración `CREATE TABLE` encontrada:** `budgets`, `goals`, `goal_contributions`, `recurring_transactions`, `subscriptions`, `debts`, `debt_payments`, `alerts`.

Nota: los enums de varias entidades futuras aparecen en `20261008192402_base_helpers_types.sql`; esto **no** significa que sus tablas estén creadas.

## 4. Hallazgos que deben resolverse antes de ampliar la aplicación

### H-01 - El saldo líquido parece omitir saldos iniciales (prioridad crítica)

`accounts` tiene `opening_balance numeric(20,4)`; sin embargo, `getFinancialSummaryAction` selecciona únicamente `id, type` y `calculateLiquidBalance` suma los importes de `transactions` desde cero. Si una cuenta inicia con $1.000.000 y no tiene movimientos, el dashboard calcularía $0 en vez de $1.000.000, salvo que el saldo inicial se duplique como transacción en otro flujo. **Confirmar la regla de negocio de onboarding y corregir el cálculo sin duplicar movimientos.**

### H-02 - La agregación monetaria necesita política de moneda (prioridad alta)

El resumen agrega transacciones y obligaciones sin convertir monedas. Debe definirse, conforme al contexto original, si el MVP admite solamente una moneda efectiva o cómo se tratará la coexistencia de monedas. No sumar directamente COP y USD.

### H-03 - Pruebas de integración pendientes (prioridad alta)

Existen `src/domain/__tests__/transactions.test.ts`, `supabase/tests/rls.test.ts` y `e2e/mvp-critical-flow.spec.ts`, pero no hay resultados de ejecución en el ZIP. Las pruebas RLS requieren Supabase local; las E2E requieren app y base operativas. Revisar la seguridad y el cleanup de las pruebas contra bases desechables exclusivamente.

### H-04 - Esquema de 14 entidades aún no desplegado (prioridad alta para plan completo)

La aplicación mantiene cinco tablas propias implementadas en migraciones. El DDL completo creado previamente es un **borrador de diseño**, no debe aplicarse encima de las migraciones actuales sin reconciliar nombres, enums, restricciones y dependencias. Extender mediante migraciones incrementales y reversibles.

### H-05 - Riesgo de consistencia de claves foráneas en borradores (prioridad alta)

En la migración actual, `transactions.category_id` usa una FK compuesta `(category_id, user_id)` con `ON DELETE SET NULL`. PostgreSQL puede intentar poner a NULL ambas columnas de la referencia compuesta, incluida `user_id` (`NOT NULL`). Verificar comportamiento esperado antes de usar eliminación física de categorías; es preferible archivado o una restricción explícita que preserve el propietario. No modificar sin prueba.

## 5. Próxima secuencia de trabajo

| Orden | Tarea | Prueba de salida |
|---|---|---|
| 1 | Levantar entorno local con variables de ejemplo adecuadas | Next.js y Supabase inician sin errores |
| 2 | Ejecutar `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build` | Evidencias por comando, no suposiciones |
| 3 | Aplicar migraciones a una base Supabase local desechable | Migraciones sin errores y cinco tablas presentes |
| 4 | Probar onboarding y saldo inicial | El saldo inicial se refleja exactamente una vez |
| 5 | Validar ingresos, gastos, transferencias, obligaciones y disponible | Cálculos precisos y transferencias neutrales en el total |
| 6 | Validar RLS con usuarios A y B, y E2E principal | Ninguna lectura/escritura cruzada; recorrido completo |
| 7 | Congelar checkpoint MVP verificado | Evidencia de pruebas + demo estable |
| 8 | Implementar presupuestos y metas, después recurrencias, suscripciones, deudas, pagos y alertas | Migración + lógica + UI + pruebas para cada historia |
| 9 | Completar inteligencia y experiencias integrales definidas en `contexto/` | Casos de uso trazados y aprobados |

## 6. Instrucción para agentes de desarrollo

Trabaja sobre este repositorio, **no recrees el proyecto**. Consulta primero `contexto/FINWISE_CONTEXTO_MAESTRO.md`, `contexto/arquitectura/MODELO_DATOS_Y_SEGURIDAD.md`, `contexto/producto/CASOS_DE_USO_Y_FLUJOS.md`, `contexto/calidad/ESTRATEGIA_PRUEBAS.md`, `contexto/planificacion/PLAN_EJECUCION_KILO.md`, `AGENTS.md` y las ADR aplicables. Para cada historia: identificar implementación actual, gap, prueba reproducible, cambio mínimo, verificación y actualización de estado. Prioridad inicial: validar y corregir la coherencia de `opening_balance` con cálculo de saldos, sin intervenir producción.

## 7. Límites del diagnóstico

No existe evidencia verificada de que el ZIP represente la rama actual del remoto o el estado desplegado; su estructura indica un snapshot del 13 de octubre de 2026. No se ejecutaron instalaciones ni consultas a instancias remotas. Ninguna acción modificó el código de origen entregado.
