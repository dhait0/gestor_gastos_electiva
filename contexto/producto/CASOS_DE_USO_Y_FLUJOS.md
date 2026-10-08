# FinWise — Casos de Uso y Flujos

> Documento funcional operativo de FinWise.
>
> Ubicación recomendada: `contexto/producto/CASOS_DE_USO_Y_FLUJOS.md`
>
> Estado: **Base funcional aprobada para diseño y backlog**
>
> Fecha de referencia: **7 de octubre de 2026**
>
> Depende de:
> - `contexto/FINWISE_CONTEXTO_MAESTRO.md`
> - `contexto/arquitectura/ARQUITECTURA_TECNICA.md`
> - `contexto/arquitectura/MODELO_DATOS_Y_SEGURIDAD.md`

---

# 1. Propósito

Este documento traduce el contexto funcional, la arquitectura y el modelo de datos de FinWise en flujos concretos de interacción entre usuario y sistema.

Su objetivo es servir como fuente de verdad para:

- diseño UX/UI;
- wireframes;
- backlog;
- historias de usuario;
- criterios de aceptación;
- pruebas funcionales;
- pruebas E2E;
- implementación por módulos;
- validación del MVP.

FinWise debe mantener una correspondencia clara entre:

```text
Problema
   ↓
Caso de uso
   ↓
Flujo
   ↓
Regla de negocio
   ↓
Entidad
   ↓
Interfaz
   ↓
Prueba
```

---

# 2. Alcance del documento

## 2.1 MVP académico

Imprescindibles para la primera demo:

- autenticación básica o sesión demo según etapa;
- onboarding mínimo;
- creación de cuenta financiera;
- registro de ingresos;
- registro de gastos;
- obligaciones pendientes;
- reserva de seguridad;
- resumen financiero;
- dinero disponible.

## 2.2 MVP funcional

Después del MVP académico:

- categorías administrables;
- edición y eliminación de transacciones;
- transferencias;
- presupuestos;
- metas;
- alertas;
- forecast;
- recurrencias.

## 2.3 Evolución posterior

- suscripciones;
- deudas;
- estrategias de pago;
- Financial Score;
- simulador;
- importación;
- reportes;
- IA.

---

# 3. Actores

## 3.1 Usuario no autenticado

Puede:

- registrarse;
- iniciar sesión;
- recuperar contraseña.

No puede acceder a información financiera.

## 3.2 Usuario autenticado

Actor principal.

Puede administrar únicamente sus propios datos financieros.

## 3.3 Sistema FinWise

Responsable de:

- validar;
- persistir;
- calcular;
- proyectar;
- alertar;
- mostrar información;
- proteger datos.

## 3.4 Supabase Auth

Responsable de:

- identidad;
- autenticación;
- sesión;
- recuperación de contraseña;
- OAuth en versiones posteriores.

---

# 4. Reglas transversales

## 4.1 Ownership

Un usuario nunca puede consultar o modificar datos de otro usuario.

## 4.2 Validación

Toda entrada debe validarse en las capas correspondientes:

```text
UI
+
Zod
+
Application/Domain
+
PostgreSQL constraints
```

## 4.3 Precisión monetaria

Los cálculos críticos no deben utilizar `float`.

## 4.4 Seguridad

El frontend nunca constituye la única barrera de autorización.

## 4.5 Feedback

Toda acción debe informar al usuario si:

- está procesando;
- fue exitosa;
- falló;
- requiere corrección.

## 4.6 Estados vacíos

Toda pantalla debe tener un estado vacío útil.

## 4.7 Datos derivados

Saldo, dinero disponible, porcentaje de presupuesto y otras métricas deben recalcularse desde su fuente de verdad.

---

# 5. Convención de casos de uso

Cada caso utiliza:

```text
ID
Nombre
Objetivo
Prioridad
Actor
Precondiciones
Disparador
Flujo principal
Flujos alternativos
Validaciones
Reglas de negocio
Entidades afectadas
Resultado
Criterios de aceptación
```

---

# 6. Mapa general de flujo

```text
Visitante
   ↓
Registro / Login
   ↓
Onboarding
   ↓
Cuenta financiera
   ↓
Ingresos + Gastos
   ↓
Obligaciones + Reserva
   ↓
Saldo líquido
   ↓
Dinero disponible
   ↓
Dashboard
   ↓
Presupuestos / Metas / Alertas / Forecast
```

---

# UC-01 — Registro de usuario

## Objetivo

Permitir a una persona crear una cuenta personal en FinWise.

## Prioridad

MVP.

## Actor

Usuario no autenticado.

## Precondiciones

- No existe sesión activa.
- El email no está registrado con el mismo método de autenticación.

## Disparador

El usuario selecciona:

> Crear cuenta.

## Flujo principal

1. El usuario abre la pantalla de registro.
2. Ingresa nombre visible.
3. Ingresa email.
4. Ingresa contraseña.
5. Confirma contraseña.
6. Acepta las condiciones requeridas.
7. El sistema valida los campos.
8. FinWise solicita el registro a Supabase Auth.
9. Supabase crea la identidad.
10. El trigger crea `profiles`.
11. El sistema inicia sesión o solicita verificación según configuración.
12. El usuario continúa al onboarding.

## Validaciones

- email válido;
- contraseña conforme a política;
- confirmación coincide;
- nombre dentro del límite permitido.

## Flujos alternativos

### Email ya registrado

Mostrar:

> Ya existe una cuenta asociada a este correo.

Ofrecer:

- iniciar sesión;
- recuperar contraseña.

### Error técnico

No crear estado parcial en la aplicación.

Mostrar mensaje genérico y permitir reintento.

## Entidades

```text
auth.users
profiles
```

## Resultado esperado

Usuario creado correctamente con profile inicial.

## Criterios de aceptación

- [ ] Se crea la identidad.
- [ ] Existe exactamente un profile relacionado.
- [ ] No se almacena contraseña en tablas de FinWise.
- [ ] Un fallo del signup se comunica claramente.
- [ ] El usuario puede continuar al onboarding.

---

# UC-02 — Inicio de sesión

## Objetivo

Permitir al usuario autenticarse.

## Prioridad

MVP.

## Actor

Usuario no autenticado.

## Flujo principal

1. Usuario abre login.
2. Ingresa email.
3. Ingresa contraseña.
4. Sistema valida formato.
5. Supabase Auth valida credenciales.
6. Se crea sesión segura.
7. Usuario es dirigido a FinWise.
8. Sistema carga únicamente sus datos.

## Flujos alternativos

### Credenciales inválidas

Mostrar:

> El correo o la contraseña no son correctos.

No indicar cuál de los dos falló.

### Cuenta pendiente de verificación

Mostrar instrucciones correspondientes.

## Resultado esperado

Sesión válida y acceso al entorno privado.

## Criterios

- [ ] Sin sesión no se accede al área privada.
- [ ] Con sesión solo se consultan datos propios.
- [ ] El error no revela información innecesaria.

---

# UC-03 — Recuperar contraseña

## Objetivo

Permitir recuperar acceso a una cuenta basada en email/contraseña.

## Flujo principal

1. Usuario selecciona "Olvidé mi contraseña".
2. Ingresa email.
3. Sistema solicita recuperación a Supabase.
4. Se muestra una respuesta neutral.
5. Usuario recibe enlace si la cuenta es elegible.
6. Define nueva contraseña.
7. Puede iniciar sesión.

## Regla de seguridad

La pantalla no debe confirmar explícitamente si un correo existe cuando ello facilite enumeración de cuentas.

---

# UC-04 — Cerrar sesión

## Objetivo

Finalizar de forma segura la sesión activa.

## Actor

Usuario autenticado.

## Flujo

1. Usuario selecciona cerrar sesión.
2. Sistema invalida sesión.
3. Limpia estado privado del cliente.
4. Redirige a login.

## Criterios

- [ ] Las páginas privadas dejan de ser accesibles.
- [ ] Información financiera anterior no queda visible en UI protegida.

---

# UC-05 — Onboarding inicial

## Objetivo

Configurar la información mínima necesaria para comenzar.

## Prioridad

MVP.

## Precondiciones

Usuario autenticado sin configuración inicial completa.

## Flujo principal

1. Sistema da bienvenida.
2. Solicita moneda base.
3. Usa COP por defecto.
4. Solicita zona horaria o mantiene `America/Bogota`.
5. Permite configurar reserva de seguridad o dejarla en cero.
6. Invita a crear primera cuenta financiera.
7. Usuario completa onboarding.
8. Sistema dirige al dashboard/estado inicial.

## Entidades

```text
profiles
accounts
```

## Resultado

Usuario listo para registrar movimientos.

## Criterios

- [ ] Moneda configurada.
- [ ] Zona horaria configurada.
- [ ] Reserva válida.
- [ ] Usuario entiende que puede cambiarla después.

---

# UC-06 — Crear cuenta financiera

## Objetivo

Representar dónde el usuario tiene dinero o crédito.

## Prioridad

MVP.

## Actor

Usuario autenticado.

## Tipos

```text
CASH
CHECKING
SAVINGS
CREDIT_CARD
DIGITAL_WALLET
OTHER
```

## Flujo principal

1. Usuario selecciona "Nueva cuenta".
2. Ingresa nombre.
3. Selecciona tipo.
4. Ingresa saldo inicial.
5. Selecciona moneda.
6. Opcionalmente escoge icono/color.
7. Si es tarjeta, completa datos específicos permitidos.
8. Confirma.
9. Sistema valida.
10. Se crea `accounts`.
11. Dashboard se actualiza.

## Para tarjeta de crédito

Solicitar opcionalmente:

- límite de crédito;
- día de pago;
- día de corte;
- deuda inicial.

No solicitar:

- número completo de tarjeta;
- CVV;
- PIN.

## Reglas

- una tarjeta no es dinero líquido;
- el crédito disponible no se suma al saldo;
- una cuenta pertenece a un solo usuario.

## Criterios

- [ ] Cuenta creada.
- [ ] Saldo inicial interpretado correctamente.
- [ ] Tarjeta tratada como pasivo.
- [ ] Otro usuario no puede consultar la cuenta.

---

# UC-07 — Editar cuenta

## Objetivo

Actualizar configuración de una cuenta.

## Flujo

1. Usuario abre detalle.
2. Selecciona editar.
3. Modifica campos permitidos.
4. Sistema valida ownership.
5. Guarda.
6. UI actualiza.

## Restricción

No permitir modificar arbitrariamente el saldo actual.

Los cambios financieros se registran mediante transacciones o mecanismos específicos.

---

# UC-08 — Archivar cuenta

## Objetivo

Ocultar una cuenta que ya no se utiliza sin destruir su historial.

## Flujo

1. Usuario selecciona archivar.
2. Sistema informa consecuencias.
3. Usuario confirma.
4. `is_archived = true`.
5. Cuenta deja de aparecer en selecciones normales.
6. Historial permanece.

## Regla

Una cuenta con historial no debe eliminar movimientos.

---

# UC-09 — Registrar ingreso

## Objetivo

Registrar dinero recibido.

## Prioridad

MVP.

## Precondiciones

- usuario autenticado;
- existe cuenta activa;
- existe categoría de ingreso.

## Flujo principal

1. Usuario selecciona "Nueva transacción".
2. Selecciona "Ingreso".
3. Ingresa monto.
4. Selecciona cuenta.
5. Selecciona categoría.
6. Selecciona fecha.
7. Ingresa descripción.
8. Opcionalmente agrega notas.
9. Confirma.
10. Sistema valida.
11. Verifica ownership de cuenta y categoría.
12. Crea:

```text
type = INCOME
direction = INFLOW
```

13. Se recalculan métricas.
14. UI muestra confirmación.

## Entidades

```text
accounts
categories
transactions
```

## Resultado

Ingreso registrado y saldo derivado actualizado.

## Criterios

- [ ] amount > 0.
- [ ] cuenta pertenece al usuario.
- [ ] categoría es `INCOME`.
- [ ] se refleja en ingresos del periodo.
- [ ] aumenta balance de cuenta de activo.
- [ ] actualiza dinero disponible cuando corresponde.

---

# UC-10 — Registrar gasto

## Objetivo

Registrar dinero utilizado.

## Prioridad

MVP.

## Precondiciones

- usuario autenticado;
- existe cuenta activa;
- existe categoría de gasto.

## Flujo principal

1. Usuario selecciona "Nueva transacción".
2. Selecciona "Gasto".
3. Ingresa monto.
4. Selecciona cuenta.
5. Selecciona categoría.
6. Selecciona fecha.
7. Ingresa descripción.
8. Opcionalmente notas.
9. Confirma.
10. Zod valida.
11. Application service obtiene usuario autenticado.
12. Valida ownership.
13. Valida categoría `EXPENSE`.
14. Crea:

```text
type = EXPENSE
direction = OUTFLOW
```

15. Base de datos aplica RLS.
16. Se recalculan:
    - balance;
    - gasto mensual;
    - presupuesto cuando exista;
    - dinero disponible.
17. Dashboard se actualiza.
18. Se muestra confirmación.

## Tarjeta de crédito

Si la cuenta es `CREDIT_CARD`:

- el gasto aumenta deuda;
- no reduce saldo líquido inmediatamente;
- sí cuenta como gasto del periodo.

## Resultado

Gasto persistido correctamente.

## Criterios

- [ ] Gasto visible en historial.
- [ ] Impacta métricas una sola vez.
- [ ] Tarjeta incrementa deuda, no saldo líquido.
- [ ] Usuario B no puede modificarlo.
- [ ] Dinero disponible se recalcula.

---

# UC-11 — Editar transacción

## Objetivo

Corregir un movimiento existente.

## Prioridad

Should del MVP académico / MVP funcional.

## Flujo

1. Usuario abre transacción.
2. Selecciona editar.
3. Sistema carga únicamente campos editables.
4. Usuario modifica.
5. Sistema valida.
6. Verifica ownership.
7. Actualiza.
8. Recalcula métricas dependientes.
9. Muestra confirmación.

## Reglas

Si cambia:

- monto;
- cuenta;
- categoría;
- fecha;
- tipo;

se deben recalcular métricas afectadas.

Una mitad de transferencia no se edita independientemente.

---

# UC-12 — Eliminar transacción

## Objetivo

Retirar lógicamente una transacción sin destruir inmediatamente el registro.

## Flujo

1. Usuario selecciona eliminar.
2. Sistema muestra confirmación.
3. Usuario confirma.
4. Se asigna `deleted_at`.
5. La transacción sale de consultas normales.
6. Métricas se recalculan.

## Regla

Transferencias se eliminan como unidad.

## Criterios

- [ ] No aparece en historial normal.
- [ ] Ya no afecta cálculos.
- [ ] Historial puede conservarse internamente.
- [ ] Otra persona no puede eliminarla.

---

# UC-13 — Transferir entre cuentas

## Objetivo

Mover dinero entre cuentas propias sin crear ingreso ni gasto global.

## Prioridad

MVP funcional.

## Precondiciones

- dos cuentas activas;
- mismo usuario;
- misma moneda en V1.

## Flujo

1. Usuario selecciona "Transferencia".
2. Selecciona cuenta origen.
3. Selecciona cuenta destino.
4. Ingresa monto.
5. Fecha.
6. Confirma.
7. Sistema valida cuentas.
8. Verifica moneda.
9. Genera `transfer_group_id`.
10. Crea de forma atómica:

Origen:

```text
TRANSFER
OUTFLOW
```

Destino:

```text
TRANSFER
INFLOW
```

11. Commit.
12. Actualiza balances.

## Reglas

- no contar como ingreso;
- no contar como gasto;
- ambas filas deben existir o ninguna;
- origen ≠ destino.

## Criterios

- [ ] Dos movimientos vinculados.
- [ ] Net cash flow global no cambia.
- [ ] No hay transferencia parcial.

---

# UC-14 — Crear obligación pendiente

## Objetivo

Permitir al usuario registrar dinero ya comprometido.

## Prioridad

MVP académico.

## Ejemplos

- arriendo;
- servicios;
- matrícula;
- cuota próxima;
- compromiso conocido.

## Flujo

1. Usuario abre "Obligaciones".
2. Selecciona "Nueva obligación".
3. Ingresa nombre.
4. Ingresa monto.
5. Define fecha de vencimiento.
6. Opcionalmente agrega descripción.
7. Confirma.
8. Sistema valida.
9. Crea `obligations` con:

```text
status = PENDING
source = MANUAL
```

10. Dinero disponible se recalcula.

## Resultado

El monto pendiente reduce capacidad de gasto según reglas vigentes.

## Criterios

- [ ] Obligación aparece como pendiente.
- [ ] Impacta dinero disponible.
- [ ] No afecta saldo bancario hasta que exista un movimiento financiero.

---

# UC-15 — Editar obligación

## Objetivo

Actualizar compromiso pendiente.

## Flujo

1. Usuario abre obligación.
2. Edita nombre, monto, fecha o descripción.
3. Sistema valida.
4. Actualiza.
5. Recalcula dinero disponible.

---

# UC-16 — Marcar obligación como pagada

## Objetivo

Indicar que un compromiso dejó de estar pendiente.

## Flujo

1. Usuario abre obligación.
2. Selecciona "Marcar como pagada".
3. Sistema solicita confirmación.
4. Opcionalmente ofrece registrar gasto asociado.
5. Usuario decide.
6. `status = PAID`.
7. `paid_at = now()`.
8. Dinero disponible se recalcula.

## Regla importante

Marcar una obligación como pagada **no crea automáticamente una transacción** salvo acción explícita o flujo integrado.

Esto evita inventar movimientos.

---

# UC-17 — Configurar reserva de seguridad

## Objetivo

Permitir que una parte del saldo no se considere disponible para gasto.

## Prioridad

MVP académico.

## Flujo

1. Usuario abre configuración financiera.
2. Ingresa reserva.
3. Sistema valida `>= 0`.
4. Actualiza:

```text
profiles.safety_reserve
```

5. Recalcula dinero disponible.
6. Muestra impacto.

## Criterios

- [ ] No modifica saldo real.
- [ ] Reduce dinero disponible.
- [ ] Puede ser cero.

---

# UC-18 — Consultar saldo líquido

## Objetivo

Mostrar cuánto dinero líquido existe realmente en cuentas de activo.

## Prioridad

MVP.

## Cálculo conceptual

```text
saldoLiquido =
sum(
  balances of:
  CASH
  CHECKING
  SAVINGS
  DIGITAL_WALLET
)
```

No incluir:

```text
credit_limit
available_credit
```

## Resultado

Valor presentado como saldo, no como capacidad de gasto.

---

# UC-19 — Consultar dinero disponible

## Objetivo

Responder la pregunta principal de FinWise:

> ¿Cuánto puedo gastar realmente sin comprometer mis obligaciones y reservas?

## Prioridad

Must principal del MVP académico.

## Precondiciones

- cuentas configuradas;
- movimientos registrados;
- obligaciones/reserva conocidas cuando apliquen.

## MVP

```text
dineroDisponibleMVP =
saldoLiquido
- obligacionesPendientes
- reservaSeguridad
```

## Versión completa

```text
dineroDisponible =
saldoLiquido
- obligacionesPendientes
- metasAhorroComprometidas
- pagosDeudaPendientes
- reservaSeguridad
```

## Flujo

1. Usuario abre dashboard o vista de disponible.
2. Sistema obtiene cuentas líquidas.
3. Calcula saldo líquido.
4. Obtiene obligaciones pendientes aplicables.
5. Obtiene reserva.
6. En versiones futuras obtiene metas y deudas.
7. Ejecuta servicio de dominio.
8. Produce resultado.
9. Produce desglose explicable.
10. UI muestra monto y contexto.

## Resultado positivo

Ejemplo:

```text
Puedes gastar aproximadamente
$1.000.000
sin comprometer tus obligaciones configuradas.
```

## Resultado negativo

No mostrar como capacidad de gasto.

Mostrar:

```text
Tus compromisos actuales superan tu saldo líquido en $X.
```

## Criterios

- [ ] Saldo y disponible se diferencian.
- [ ] Fórmula correcta.
- [ ] No incluye crédito.
- [ ] Resultado negativo genera advertencia.
- [ ] Usuario puede ver de qué componentes proviene.

---

# UC-20 — Dashboard principal

## Objetivo

Dar una lectura inmediata del estado financiero.

## Prioridad

MVP.

## Flujo

1. Usuario inicia sesión.
2. Sistema carga resumen.
3. Obtiene información autorizada.
4. Ejecuta cálculos de dominio.
5. Construye View Model.
6. Renderiza dashboard.

## MVP académico

Mostrar:

- saldo líquido;
- ingresos del periodo;
- gastos del periodo;
- dinero disponible;
- movimientos recientes.

## MVP funcional

Agregar:

- tasa de ahorro;
- gastos por categoría;
- presupuestos;
- metas;
- alertas;
- forecast.

## Regla

Cada KPI debe diferenciar dato real vs dato estimado.

---

# UC-21 — Consultar movimientos

## Objetivo

Permitir revisar historial financiero.

## Flujo

1. Usuario abre "Transacciones".
2. Sistema muestra página inicial.
3. Ordena:

```text
transaction_date desc
created_at desc
```

4. Usuario puede filtrar.
5. Sistema devuelve únicamente movimientos propios.

## Filtros

- fecha;
- tipo;
- categoría;
- cuenta;
- monto;
- texto;
- recurrencia.

## Criterios

- [ ] Paginación.
- [ ] Filtros combinables.
- [ ] Transferencias distinguibles visualmente.

---

# UC-22 — Administrar categorías

## Objetivo

Permitir adaptar clasificación financiera.

## Prioridad

MVP funcional.

## Operaciones

- crear;
- editar;
- archivar/eliminar lógicamente.

## Reglas

- categoría `INCOME` no se usa para gasto;
- categoría `EXPENSE` no se usa para ingreso;
- no borrar historial;
- no duplicar nombres activos del mismo tipo.

---

# UC-23 — Crear presupuesto

## Objetivo

Definir un límite mensual de gasto por categoría.

## Prioridad

MVP funcional.

## Flujo

1. Usuario abre Presupuestos.
2. Selecciona categoría de gasto.
3. Define mes.
4. Define límite.
5. Confirma.
6. Sistema valida unicidad.
7. Guarda.
8. Calcula gasto consumido.
9. Muestra progreso.

## Fórmula

```text
percentage =
spent / limit * 100
```

## Estados

```text
0-69%   NORMAL
70-89%  WARNING
90-99%  HIGH
>=100%  EXCEEDED
```

## Criterios

- [ ] Solo una configuración por categoría/mes.
- [ ] Transferencias no consumen presupuesto.
- [ ] Transacciones eliminadas no consumen presupuesto.

---

# UC-24 — Editar presupuesto

## Flujo

1. Usuario selecciona presupuesto.
2. Cambia límite.
3. Sistema valida.
4. Actualiza.
5. Recalcula porcentaje.
6. Reevalúa alertas.

---

# UC-25 — Duplicar presupuestos del mes anterior

## Objetivo

Reducir trabajo repetitivo.

## Flujo

1. Usuario selecciona "Copiar mes anterior".
2. Sistema identifica presupuestos anteriores.
3. Muestra previsualización.
4. Usuario selecciona cuáles copiar.
5. Sistema evita duplicados.
6. Crea presupuestos del nuevo mes.

---

# UC-26 — Crear meta financiera

## Objetivo

Definir un objetivo de ahorro.

## Prioridad

MVP funcional.

## Flujo

1. Usuario abre Metas.
2. Selecciona "Nueva meta".
3. Ingresa nombre.
4. Monto objetivo.
5. Monto inicial opcional.
6. Fecha objetivo opcional.
7. Compromiso mensual opcional.
8. Confirma.
9. Sistema valida.
10. Guarda.

## Resultado

Sistema calcula:

- progreso;
- faltante;
- ahorro recomendado.

---

# UC-27 — Registrar aporte a meta

## Objetivo

Registrar dinero destinado a una meta.

## Flujo

1. Usuario abre meta.
2. Selecciona "Agregar aporte".
3. Ingresa monto.
4. Fecha.
5. Notas opcionales.
6. Guarda.
7. Se crea `goal_contributions`.
8. Se recalcula progreso.

## Regla

Un aporte a meta no inventa automáticamente un movimiento bancario.

---

# UC-28 — Pausar o cancelar meta

## Objetivo

Gestionar metas que ya no están activas.

## Resultado

El compromiso de ahorro deja de influir en dinero disponible cuando la política de dominio así lo determine.

---

# UC-29 — Consultar forecast de fin de mes

## Objetivo

Estimar resultado financiero al cierre del periodo.

## Fórmula inicial

```text
gastoDiarioPromedio =
gastosMes / diasTranscurridos

gastoProyectado =
gastoDiarioPromedio * diasTotalesMes
```

## Flujo

1. Sistema obtiene gastos actuales.
2. Determina días transcurridos.
3. Calcula promedio.
4. Proyecta.
5. Considera obligaciones pendientes.
6. Devuelve estimación.
7. UI muestra como estimación.

## Regla

Nunca presentar forecast como certeza.

---

# UC-30 — Detectar recurrencia

## Objetivo

Identificar posibles movimientos repetitivos.

## Criterios iniciales

- descripción similar;
- importe similar;
- categoría similar;
- intervalo similar;
- mínimo tres repeticiones.

## Resultado

Sistema propone una posible recurrencia.

No activar automáticamente sin confirmación.

---

# UC-31 — Confirmar transacción recurrente

## Flujo

1. Usuario revisa sugerencia.
2. Confirma.
3. Sistema crea `recurring_transactions`.
4. Define frecuencia.
5. Define próxima fecha.

---

# UC-32 — Gestionar suscripción

## Objetivo

Controlar pagos recurrentes asociados a servicios.

## Datos

- nombre;
- monto;
- periodicidad;
- próxima fecha;
- categoría;
- costo mensual equivalente;
- costo anual estimado.

---

# UC-33 — Crear deuda

## Objetivo

Registrar un pasivo externo.

## Datos

- nombre;
- tipo;
- saldo;
- tasa;
- pago mínimo;
- fecha/día;
- moneda.

---

# UC-34 — Registrar pago de deuda

## Flujo futuro

1. Usuario selecciona deuda.
2. Registra pago.
3. Distribuye capital/interés.
4. Sistema valida.
5. Crea `debt_payment`.
6. Actualiza saldo de deuda atómicamente.
7. Recalcula métricas.

---

# UC-35 — Consultar estrategia Snowball

Ordenar deudas por menor saldo.

```text
ORDER BY current_balance ASC
```

No ejecutar pagos.

---

# UC-36 — Consultar estrategia Avalanche

Ordenar deudas por mayor tasa.

```text
ORDER BY interest_rate_percent DESC
```

---

# UC-37 — Consultar alertas

## Tipos iniciales

- presupuesto próximo al límite;
- presupuesto excedido;
- obligación próxima;
- dinero disponible bajo;
- dinero disponible negativo;
- forecast negativo;
- meta en riesgo.

## Flujo

1. Usuario abre alertas.
2. Sistema carga propias.
3. Ordena por severidad/fecha.
4. Usuario abre alerta.
5. Sistema puede marcarla leída.

---

# UC-38 — Marcar alerta como leída

```text
is_read = true
read_at = now()
```

---

# UC-39 — Simular compra

## Objetivo

Mostrar impacto de una compra hipotética.

## Flujo

1. Usuario ingresa monto hipotético.
2. Selecciona cuenta/categoría si aplica.
3. Sistema NO persiste transacción.
4. Simula escenario.
5. Calcula saldo, disponible, presupuesto, metas y forecast.
6. Muestra comparación antes/después.

## Regla

Simulación no modifica información real.

---

# UC-40 — Consultar Financial Score

## Objetivo

Mostrar indicador interno de salud financiera.

## Regla

Nunca presentarlo como score bancario oficial.

Debe explicar sus componentes.

---

# UC-41 — Estado vacío: usuario nuevo

## Condición

Usuario no tiene transacciones.

## UI esperada

Mostrar:

> Aún no tienes movimientos. Registra tu primer ingreso o gasto para comenzar a entender tus finanzas.

Acciones:

- crear cuenta si no existe;
- registrar ingreso;
- registrar gasto.

---

# UC-42 — Estado vacío: sin obligaciones

Mostrar:

> No tienes obligaciones pendientes registradas.

CTA:

> Agregar obligación.

---

# UC-43 — Estado vacío: sin presupuestos

Mostrar contexto de utilidad y CTA.

No presentar una pantalla simplemente vacía.

---

# UC-44 — Manejo de error de validación

Los errores de campo deben aparecer junto al campo correspondiente.

No usar únicamente un toast genérico cuando el problema puede corregirse localmente.

---

# UC-45 — Manejo de error de autorización

Si el usuario intenta acceder a un recurso ajeno:

- no mostrar datos;
- responder según política de seguridad;
- no revelar ownership;
- registrar evento técnico cuando corresponda.

---

# UC-46 — Error de persistencia

1. Usuario envía formulario.
2. Falla persistencia.
3. Sistema conserva información razonablemente.
4. Muestra mensaje comprensible.
5. Permite reintento.

No mostrar stack trace.

---

# UC-47 — Loading state

Toda acción de duración perceptible debe tener feedback.

Ejemplos:

- botón loading;
- skeleton;
- pending state.

Prevenir doble submit.

---

# UC-48 — Responsive

Los flujos principales deben funcionar en:

- desktop;
- tablet;
- móvil.

Prioridad inicial:

```text
desktop responsive
```

---

# UC-49 — Accesibilidad de formularios

Todo formulario debe:

- tener labels;
- indicar campos requeridos;
- asociar errores;
- permitir teclado;
- tener focus visible;
- no depender solo del color.

---

# UC-50 — Navegación principal

## MVP funcional

```text
Dashboard
Transacciones
Presupuestos
Metas
Alertas
Configuración
```

Posteriormente:

```text
Suscripciones
Deudas
Reportes
```

---

# 51. Flujo completo del MVP académico

```text
Usuario se registra
        ↓
Onboarding
        ↓
Configura reserva
        ↓
Crea cuenta
        ↓
Registra ingreso
        ↓
Registra gasto
        ↓
Registra obligación pendiente
        ↓
Sistema calcula saldo líquido
        ↓
Sistema calcula dinero disponible
        ↓
Dashboard muestra:
  - saldo
  - ingresos
  - gastos
  - disponible
        ↓
Usuario toma una decisión con mayor contexto
```

---

# 52. Escenario de aceptación principal

## Dado

```text
Saldo líquido:          $1.800.000
Obligaciones:             $600.000
Reserva:                  $200.000
```

## Entonces

```text
Dinero disponible:      $1.000.000
```

La interfaz debe comunicar que es el monto aproximado utilizable sin comprometer las obligaciones y la reserva configuradas.

---

# 53. Escenario de déficit

```text
Saldo líquido:       $500.000
Obligaciones:        $600.000
Reserva:             $100.000
Disponible:         -$200.000
```

UI:

> Tus compromisos actuales superan tu saldo líquido en aproximadamente $200.000.

No mostrar un número negativo como capacidad de gasto.

---

# 54. Escenario de gasto

Inicial:

```text
Saldo líquido:     $1.800.000
Obligaciones:        $600.000
Reserva:             $200.000
Disponible:         $1.000.000
```

Usuario registra gasto de:

```text
$100.000
```

Nuevo estado:

```text
Saldo líquido:     $1.700.000
Disponible:          $900.000
```

---

# 55. Escenario tarjeta de crédito

Inicial:

```text
Saldo líquido: $1.800.000
Deuda tarjeta:   $300.000
```

Compra con tarjeta:

```text
$100.000
```

Resultado:

```text
Deuda tarjeta: $400.000
Saldo líquido: $1.800.000
Gastos mes:    +$100.000
```

---

# 56. Escenario transferencia

Cuenta A:

```text
$1.000.000
```

Cuenta B:

```text
$500.000
```

Transferencia:

```text
$200.000
```

Resultado:

```text
Cuenta A: $800.000
Cuenta B: $700.000
Total:  $1.500.000
```

Ingresos y gastos globales no cambian.

---

# 57. Priorización de implementación

## Fase A — MVP académico

```text
UC-01 Registro
UC-02 Login
UC-04 Logout
UC-05 Onboarding
UC-06 Crear cuenta
UC-09 Registrar ingreso
UC-10 Registrar gasto
UC-14 Crear obligación
UC-17 Reserva
UC-18 Saldo líquido
UC-19 Dinero disponible
UC-20 Dashboard
UC-41 Estados vacíos
UC-44 Validaciones
UC-46 Errores
```

## Fase B — Operación financiera básica

```text
UC-07 Editar cuenta
UC-08 Archivar cuenta
UC-11 Editar transacción
UC-12 Eliminar transacción
UC-13 Transferencias
UC-15 Editar obligación
UC-16 Pagar obligación
UC-21 Historial
UC-22 Categorías
```

## Fase C — Control financiero

```text
UC-23 Presupuestos
UC-24 Editar presupuesto
UC-25 Duplicar presupuestos
UC-26 Metas
UC-27 Aportes
UC-28 Pausar/cancelar meta
UC-29 Forecast
UC-37 Alertas
```

## Fase D — Inteligencia financiera

```text
UC-30 Recurrencias
UC-31 Confirmar recurrencia
UC-32 Suscripciones
UC-33 Deudas
UC-34 Pagos
UC-35 Snowball
UC-36 Avalanche
UC-39 Simulador
UC-40 Financial Score
```

---

# 58. Matriz caso de uso ↔ entidad

| Caso | Entidades principales |
|---|---|
| Registro | auth.users, profiles |
| Onboarding | profiles, accounts |
| Crear cuenta | accounts |
| Ingreso | transactions, accounts, categories |
| Gasto | transactions, accounts, categories |
| Transferencia | transactions, accounts |
| Obligación | obligations |
| Reserva | profiles |
| Disponible | accounts, transactions, obligations, profiles |
| Presupuesto | budgets, categories, transactions |
| Meta | goals |
| Aporte | goal_contributions |
| Recurrencia | recurring_transactions |
| Suscripción | subscriptions |
| Deuda | debts |
| Pago deuda | debt_payments |
| Alerta | alerts |

---

# 59. Matriz E2E

## E2E-01 — Camino principal MVP

```text
Registro
→ onboarding
→ cuenta
→ ingreso
→ gasto
→ obligación
→ dinero disponible
```

## E2E-02 — Aislamiento entre usuarios

```text
Usuario A crea datos
Usuario B inicia sesión
Usuario B intenta acceder
→ no obtiene datos de A
```

## E2E-03 — Gasto

```text
Registrar gasto
→ dashboard cambia
→ historial contiene movimiento
```

## E2E-04 — Edición

```text
Editar gasto
→ dashboard se recalcula
```

## E2E-05 — Eliminación

```text
Eliminar gasto
→ dashboard se recalcula
→ historial normal lo oculta
```

---

# 60. Eventos de UI importantes

El diseño debe contemplar microfeedback en:

- creación de transacción;
- actualización del disponible;
- progreso de presupuesto;
- progreso de meta;
- alerta nueva;
- cambio de filtro;
- apertura/cierre de modal;
- confirmación de operación.

El movimiento debe comunicar estado, no decorar sin propósito.

---

# 61. Reglas de confirmación

Solicitar confirmación para acciones con impacto relevante:

- eliminar transacción;
- archivar cuenta;
- cancelar meta;
- marcar obligación pagada;
- eliminar presupuesto;
- cerrar cuenta.

No pedir confirmación para cada acción trivial.

---

# 62. Optimistic UI

No aplicar optimistic UI indiscriminadamente a información financiera.

Usarla solo cuando:

- la operación es reversible;
- la UI puede reconciliar el error;
- no se presenta un cálculo crítico como confirmado antes de persistir.

Para transacciones, preferir confirmar persistencia antes de presentar el nuevo resultado como definitivo.

---

# 63. Reglas de navegación

Después de guardar correctamente:

- una transacción rápida puede cerrar modal y actualizar dashboard/lista;
- una creación desde pantalla dedicada puede regresar al recurso o mostrar detalle.

No redirigir innecesariamente.

---

# 64. Rutas conceptuales

```text
/dashboard
/transactions
/budgets
/goals
/alerts
/settings
```

Posteriormente:

```text
/subscriptions
/debts
/reports
```

---

# 65. Mobile

Considerar:

- navegación compacta;
- CTA accesible para nueva transacción;
- formularios en sheet/modal adecuado;
- objetivos táctiles suficientes;
- gráficos adaptables;
- tablas transformadas en listas cuando corresponda.

No replicar literalmente el layout desktop.

---

# 66. Desktop

Considerar:

- sidebar;
- dashboard modular;
- paneles;
- tablas;
- filtros persistentes;
- mayor densidad informativa controlada.

---

# 67. Dark mode

No es requisito del primer MVP.

El sistema de diseño debe utilizar tokens que permitan incorporarlo posteriormente.

---

# 68. Explicabilidad

Los cálculos importantes deben poder mostrar su composición.

Ejemplo:

```text
Saldo líquido           $1.800.000
Obligaciones             -600.000
Reserva                   -200.000
---------------------------------
Disponible               $1.000.000
```

La UI puede resumir y ofrecer "Ver detalle".

---

# 69. Hechos vs estimaciones

Etiquetas:

```text
Saldo actual
Dinero disponible
Estimación de cierre
Proyección
```

No presentar una estimación como dato actual.

---

# 70. Definition of Done funcional

Un caso de uso se considera implementado cuando:

- flujo principal funciona;
- flujos alternativos críticos funcionan;
- validaciones existen;
- ownership se controla;
- RLS lo protege;
- errores tienen feedback;
- loading existe;
- estado vacío está cubierto cuando aplica;
- pruebas necesarias pasan;
- UI es usable en viewport objetivo;
- criterios de aceptación son verificables.

---

# 71. Siguiente documento

Después de aprobar estos casos de uso se debe crear:

```text
contexto/diseno/SISTEMA_DISENO_FINWISE.md
```

Dirección visual acordada:

```text
Fintech premium
+
inspiración iOS/macOS
+
glassmorphism moderado
+
soft UI sutil
+
Motion
+
alta legibilidad
+
microinteracciones
```

Ese documento deberá definir:

1. principios visuales;
2. paleta;
3. tokens;
4. tipografía;
5. grid;
6. spacing;
7. radius;
8. glass;
9. sombras;
10. componentes;
11. formularios;
12. navegación;
13. cards;
14. tablas;
15. charts;
16. motion;
17. responsive;
18. dark mode;
19. accesibilidad;
20. anti-patterns.

Luego:

```text
contexto/diseno/WIREFRAMES_Y_PANTALLAS.md
```

y después:

```text
contexto/planificacion/BACKLOG_MVP.md
```

---

# Fin del documento
