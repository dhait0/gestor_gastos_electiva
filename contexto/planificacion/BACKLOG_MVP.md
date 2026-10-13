# FinWise — Backlog MVP

> Backlog funcional y técnico del MVP.
>
> Objetivo: convertir los casos de uso, arquitectura, modelo de datos y wireframes en trabajo ejecutable.

---

# 1. Regla de alcance

FinWise tiene dos niveles de MVP.

## MVP académico — obligatorio

Debe demostrar:

```text
1. Registro manual de ingresos y gastos
2. Resumen financiero básico
3. Cálculo de dinero disponible después de compromisos
```

## MVP funcional — siguiente nivel

Añade:

- transferencias;
- edición/eliminación;
- presupuestos;
- metas;
- alertas;
- forecast.

No bloquear la entrega académica intentando terminar primero todo el MVP funcional.

---

# 2. Prioridades

```text
P0 = obligatorio para MVP académico
P1 = importante después del P0
P2 = evolución
```

---

# 3. Épica E0 — Fundación técnica

## E0-H01 — Inicializar repositorio

**Prioridad:** P0

Como desarrollador quiero una base reproducible para que el proyecto pueda ejecutarse localmente y desplegarse.

### Criterios de aceptación

- [x] Next.js con App Router.
- [x] TypeScript strict.
- [x] pnpm.
- [x] Tailwind.
- [x] shadcn/ui configurado.
- [x] ESLint/configuración de calidad.
- [x] estructura inicial.
- [x] `.env.example`.
- [x] README de arranque.
- [x] proyecto compila.

---

## E0-H02 — Configurar temas y tokens

- [ ] variables CSS.
- [ ] light/dark/system.
- [ ] Manrope.
- [ ] Geist.
- [ ] primary `#2563EB`.
- [ ] accent cyan.
- [ ] radius/tokens.
- [ ] no flash de tema incorrecto.

---

## E0-H03 — Configurar Supabase

- [ ] Supabase CLI.
- [ ] proyecto local.
- [ ] variables públicas/servidor.
- [ ] clientes browser/server separados.
- [ ] tipos generados.
- [ ] conectividad validada.

---

# 4. Épica E1 — Identidad y sesión

## E1-H01 — Registro

Como visitante quiero crear una cuenta para usar FinWise.

### Criterios

- [ ] nombre.
- [ ] email.
- [ ] contraseña.
- [ ] validación.
- [ ] usuario en `auth.users`.
- [ ] profile creado.
- [ ] error seguro.
- [ ] redirección onboarding.

### Pruebas

- unit schema;
- integración profile trigger;
- E2E registro.

---

## E1-H02 — Login

- [ ] login email/password.
- [ ] errores neutrales.
- [ ] sesión segura.
- [ ] redirección app.
- [ ] usuario no autenticado no accede a app.

---

## E1-H03 — Logout

- [ ] cierre de sesión.
- [ ] estado privado no visible después.
- [ ] retorno a login.

---

## E1-H04 — Recuperación de contraseña

Prioridad P1 si no es exigida en la primera demo.

---

# 5. Épica E2 — Onboarding

## E2-H01 — Preferencias financieras iniciales

- [ ] moneda COP default.
- [ ] timezone America/Bogota default.
- [ ] reserva de seguridad >= 0.
- [ ] persistencia profile.

## E2-H02 — Primera cuenta

- [ ] nombre.
- [ ] tipo.
- [ ] saldo inicial.
- [ ] moneda.
- [ ] creación segura.
- [ ] ownership.

## E2-H03 — Finalización

- [ ] usuario llega a dashboard.
- [ ] estado vacío útil si omitió cuenta.

---

# 6. Épica E3 — Cuentas

## E3-H01 — Crear cuenta

P0.

Tipos iniciales:

```text
CASH
CHECKING
SAVINGS
CREDIT_CARD
DIGITAL_WALLET
OTHER
```

### Criterios

- [ ] usuario solo crea para sí mismo.
- [ ] saldo inicial exacto.
- [ ] tarjetas no se suman a liquidez.
- [ ] RLS.

---

## E3-H02 — Listar cuentas

P0.

- [ ] cuentas de activo separadas de crédito.
- [ ] balance derivado.
- [ ] loading/empty/error.

---

## E3-H03 — Editar cuenta

P1.

No editar balance derivado directamente.

---

## E3-H04 — Archivar cuenta

P1.

Historial debe permanecer.

---

# 7. Épica E4 — Categorías

## E4-H01 — Categorías iniciales

P0 técnico.

Crear categorías por usuario para:

```text
INCOME
EXPENSE
```

Ejemplos:

Income:

- Nómina
- Ventas
- Freelance
- Otros ingresos

Expense:

- Alimentación
- Transporte
- Vivienda
- Servicios
- Salud
- Educación
- Entretenimiento
- Otros gastos

---

## E4-H02 — Administrar categorías

P1.

---

# 8. Épica E5 — Transacciones

## E5-H01 — Registrar ingreso

P0.

### Criterios

- [ ] amount > 0.
- [ ] account ownership.
- [ ] category INCOME.
- [ ] type INCOME.
- [ ] direction INFLOW.
- [ ] saldo derivado actualiza.
- [ ] dashboard actualiza.

---

## E5-H02 — Registrar gasto

P0.

### Criterios

- [ ] amount > 0.
- [ ] category EXPENSE.
- [ ] type EXPENSE.
- [ ] direction OUTFLOW.
- [ ] gasto del periodo actualiza.
- [ ] dinero disponible actualiza.
- [ ] tarjeta de crédito aumenta deuda, no reduce liquidez.

---

## E5-H03 — Listar movimientos

P0.

- [ ] orden por transaction_date desc.
- [ ] 4–5 recientes en dashboard.
- [ ] lista completa en movimientos.
- [ ] paginación.

---

## E5-H04 — Detalle movimiento

P1.

---

## E5-H05 — Editar movimiento

P1.

- [ ] recalcula métricas.
- [ ] ownership.
- [ ] validación.

---

## E5-H06 — Eliminar movimiento

P1.

Soft delete.

---

## E5-H07 — Transferencia

P1.

- [ ] dos registros.
- [ ] mismo group id.
- [ ] operación atómica.
- [ ] no afecta ingresos/gastos globales.
- [ ] misma moneda V1.

---

# 9. Épica E6 — Obligaciones

## E6-H01 — Crear obligación

P0.

### Criterios

- [ ] nombre.
- [ ] monto > 0.
- [ ] due_date.
- [ ] status PENDING.
- [ ] source MANUAL.
- [ ] reduce dinero disponible.
- [ ] no cambia saldo bancario.

---

## E6-H02 — Listar obligaciones

P0.

- [ ] total pendiente.
- [ ] próximas por fecha.
- [ ] empty state.

---

## E6-H03 — Editar obligación

P1.

---

## E6-H04 — Marcar pagada

P1.

- [ ] status PAID.
- [ ] paid_at.
- [ ] no crea gasto automáticamente.
- [ ] recalcula disponible.

---

# 10. Épica E7 — Reserva de seguridad

## E7-H01 — Configurar reserva

P0.

- [ ] >= 0.
- [ ] profile.
- [ ] preview de impacto.
- [ ] recalcula disponible.

---

# 11. Épica E8 — Motor financiero MVP

## E8-H01 — Calcular balance de cuenta

P0.

Crear función de dominio pura:

```text
calculateAccountBalance()
```

---

## E8-H02 — Calcular saldo líquido

P0.

```text
calculateLiquidBalance()
```

No incluir crédito.

---

## E8-H03 — Calcular ingresos del periodo

P0.

---

## E8-H04 — Calcular gastos del periodo

P0.

Transferencias excluidas.

---

## E8-H05 — Calcular obligaciones pendientes

P0.

---

## E8-H06 — Calcular dinero disponible

P0.

MVP:

```text
saldoLiquido
- obligacionesPendientes
- reservaSeguridad
```

### Casos mínimos

```text
positivo
cero
negativo
sin obligaciones
sin reserva
```

---

## E8-H07 — Breakdown explicable

P0.

Debe devolver:

```text
saldoLiquido
obligaciones
reserva
disponible
```

No solo un número final.

---

# 12. Épica E9 — Dashboard

## E9-H01 — View model

P0.

Combinar:

- dinero disponible;
- saldo líquido;
- ingresos;
- gastos;
- movimientos recientes.

---

## E9-H02 — AvailableToSpendCard

P0.

- [ ] monto protagonista.
- [ ] desglose.
- [ ] estado positivo/atención/riesgo.
- [ ] mobile.
- [ ] desktop.
- [ ] light/dark.
- [ ] reduced motion.

---

## E9-H03 — KPIs ingresos/gastos

P0.

Trend solo con datos comparables.

---

## E9-H04 — Chart flujo

P1 para demo académica; puede incluirse si tiempo permite.

---

## E9-H05 — Movimientos recientes

P0.

---

# 13. Épica E10 — Navegación y experiencia móvil

## E10-H01 — AppShell

P0.

---

## E10-H02 — Bottom navigation

P0.

```text
Inicio
Movimientos
+
Metas
Más
```

Si Metas no existe aún, adaptar sin simular.

---

## E10-H03 — Quick Create

P0.

Acciones:

```text
Gasto
Ingreso
Transferencia
Obligación
```

En MVP académico:

Ingreso/Gasto/Obligación obligatorios.

---

## E10-H04 — Sidebar desktop

P0.

Glass + colapsable.

---

## E10-H05 — PWA básica

P0.

- [x] manifest.
- [x] icons.
- [x] standalone.
- [x] safe areas.
- [x] theme colors.

---

# 14. Épica E11 — Calidad y seguridad

## E11-H01 — RLS

P0.

Todas las tablas de usuario.

---

## E11-H02 — Pruebas multiusuario

P0.

User A:

- crea;
- lee;
- actualiza propios.

User B:

- no puede acceder a A.

Anon:

- no accede.

---

## E11-H03 — Unit tests de dominio

P0.

Especialmente:

- balances;
- liquidez;
- disponible;
- tarjeta crédito.

---

## E11-H04 — E2E principal

P0.

```text
registro
→ onboarding
→ cuenta
→ ingreso
→ gasto
→ obligación
→ disponible
```

---

# 15. Épica E12 — CI/CD

## E12-H01 — CI pull request

P0.

Ejecutar:

```text
install
lint
typecheck
unit tests
build
```

---

## E12-H02 — Deploy staging

P1.

---

## E12-H03 — Deploy production

P0/P1 según entrega.

---

# 16. MVP funcional posterior

Una vez completado P0:

```text
transferencias
editar/eliminar
presupuestos
metas
alertas
forecast
recurrencias
```

---

# 17. Fuera del MVP

No implementar inicialmente:

```text
IA productiva
sincronización bancaria
open banking
OCR
inversiones
crypto
multiusuario familiar
GraphQL
microservicios
Redis
Kafka
NestJS separado
Realtime sin caso de uso
Edge Functions sin necesidad
```

---

# 18. Criterio de corte

Si existe riesgo de no terminar la entrega académica:

mantener:

```text
Auth
Cuenta
Ingreso
Gasto
Obligación
Reserva
Disponible
Dashboard
```

y posponer el resto.

---

# 19. Definition of Done de historia

Una historia está terminada cuando:

- [x] funciona flujo principal;
- [x] validaciones;
- [x] seguridad/ownership;
- [x] loading;
- [x] error;
- [x] empty si aplica;
- [x] mobile;
- [x] desktop cuando corresponde;
- [x] light/dark;
- [x] accesibilidad;
- [x] pruebas relevantes;
- [x] sin errores TypeScript;
- [x] build pasa;
- [x] documentación actualizada si cambia decisión.
