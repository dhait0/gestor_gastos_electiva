# FinWise — Wireframes y Pantallas

> Arquitectura de información, wireframes funcionales y especificación de pantallas de FinWise.
>
> Ubicación recomendada: `contexto/diseno/WIREFRAMES_Y_PANTALLAS.md`
>
> Estado: **Base aprobada para backlog e implementación**
>
> Fecha de referencia: **7 de octubre de 2026**
>
> Depende de:
> - `contexto/FINWISE_CONTEXTO_MAESTRO.md`
> - `contexto/arquitectura/ARQUITECTURA_TECNICA.md`
> - `contexto/arquitectura/MODELO_DATOS_Y_SEGURIDAD.md`
> - `contexto/producto/CASOS_DE_USO_Y_FLUJOS.md`
> - `contexto/diseno/SISTEMA_DISENO_FINWISE.md`

---

# 1. Propósito

Este documento convierte los casos de uso y el sistema de diseño de FinWise en una estructura concreta de pantallas.

Define:

- arquitectura de información;
- navegación;
- jerarquía visual;
- wireframes mobile;
- wireframes desktop;
- acciones principales;
- comportamiento responsive;
- estados vacíos;
- estados de carga;
- estados de error;
- relaciones entre pantallas;
- componentes reutilizables;
- comportamiento de formularios;
- prioridades del MVP.

Este documento no reemplaza el sistema de diseño.

El sistema visual, los tokens, colores, tipografías, glass, motion y accesibilidad se rigen por:

```text
SISTEMA_DISENO_FINWISE.md
```

---

# 2. Principio de diseño de pantallas

FinWise debe responder primero:

> **¿Cuánto dinero puedo gastar realmente sin comprometer mis obligaciones, reservas y objetivos?**

Por lo tanto, la interfaz no debe comenzar mostrando una colección de gráficos.

Debe comenzar mostrando una respuesta.

Jerarquía de producto:

```text
Disponible
↓
Contexto
↓
Evolución
↓
Acciones
↓
Detalle
```

---

# 3. Mobile tiene prioridad

Regla oficial:

> **La experiencia móvil es igual o más importante que desktop.**

Las pantallas se diseñan primero para móvil.

Desktop no será una ampliación automática.

Mobile debe sentirse cercano a una app nativa mediante:

- bottom navigation;
- quick create central;
- bottom sheets;
- safe areas;
- press feedback;
- navegación táctil;
- formularios optimizados;
- contenido de una sola columna;
- transiciones direccionales discretas;
- PWA standalone.

---

# 4. Arquitectura de información — Mobile

Navegación primaria:

```text
Inicio
Movimientos
+
Metas
Más
```

Representación:

```text
┌────────────────────────────────┐
│                                │
│        CONTENIDO ACTUAL        │
│                                │
│                                │
│                                │
│                                │
│                                │
│ ╭────────────────────────────╮ │
│ │ Inicio Movim.  +  Metas Más│ │
│ ╰────────────────────────────╯ │
└────────────────────────────────┘
```

---

# 5. Navegación móvil — alcance MVP

Durante el MVP académico:

```text
Inicio            activo
Movimientos       activo
+                 activo
Metas             según alcance
Más               activo
```

Si `Metas` aún no está implementado:

- no simular funcionalidad;
- puede ocultarse temporalmente;
- o sustituirse temporalmente por una sección disponible.

No presentar módulos ficticios.

---

# 6. Arquitectura de "Más"

```text
Más
├── Cuentas
├── Obligaciones
├── Presupuestos
├── Alertas
├── Configuración
│   ├── Reserva
│   ├── Moneda
│   ├── Zona horaria
│   └── Tema
├── Perfil
└── Cerrar sesión
```

Versiones posteriores:

```text
Suscripciones
Deudas
Reportes
Financial Score
```

---

# 7. Arquitectura de información — Desktop

```text
Sidebar
├── Inicio
├── Movimientos
├── Presupuestos
├── Metas
├── Alertas
└── Configuración
```

Módulos secundarios pueden incorporarse al crecer el producto.

Estructura:

```text
╭───────────────╮   ┌───────────────────────────────────────────┐
│ FinWise       │   │ Header                                    │
│               │   │                                           │
│ Inicio        │   │ Main content                              │
│ Movimientos   │   │                                           │
│ Presupuestos  │   │                                           │
│ Metas         │   │                                           │
│ Alertas       │   │                                           │
│               │   │                                           │
│ Configuración │   │                                           │
╰───────────────╯   └───────────────────────────────────────────┘
```

---

# 8. Sitemap funcional

```text
/
├── /login
├── /signup
├── /forgot-password
├── /onboarding
│
└── /app
    ├── /dashboard
    ├── /transactions
    │   └── /[id]
    ├── /accounts
    ├── /obligations
    ├── /budgets
    ├── /goals
    ├── /alerts
    └── /settings
```

Las rutas definitivas pueden simplificarse durante implementación.

---

# 9. Flujo principal MVP

```text
Registro
↓
Onboarding
↓
Crear cuenta
↓
Dashboard inicial
↓
Registrar ingreso
↓
Registrar gasto
↓
Registrar obligación
↓
Configurar reserva
↓
Consultar dinero disponible
```

---

# 10. Pantallas prioritarias

## P0 — MVP académico

```text
Login
Registro
Onboarding
Dashboard
Quick Create
Nuevo ingreso
Nuevo gasto
Nueva obligación
Movimientos
Cuentas
Configuración / reserva
```

## P1

```text
Detalle transacción
Editar transacción
Transferencia
Obligaciones
Presupuestos
Metas
Alertas
```

## P2

```text
Forecast
Deudas
Suscripciones
Financial Score
Simulador
Reportes
```

---

# 11. Mobile — Splash / Launch

## Objetivo

Dar continuidad visual al abrir la PWA.

Wireframe:

```text
┌────────────────────────────┐
│                            │
│                            │
│           ◈                │
│         FinWise            │
│                            │
│                            │
│                            │
└────────────────────────────┘
```

Reglas:

- duración mínima;
- no retrasar carga;
- usar símbolo de marca;
- adaptar light/dark;
- no usar animación larga.

---

# 12. Mobile — Login

Wireframe:

```text
┌────────────────────────────┐
│                            │
│          FinWise           │
│                            │
│ Bienvenido de nuevo        │
│                            │
│ Correo                     │
│ [________________________] │
│                            │
│ Contraseña                 │
│ [______________________ ◉] │
│                            │
│ ¿Olvidaste tu contraseña?  │
│                            │
│ [      Iniciar sesión    ] │
│                            │
│ ¿No tienes cuenta?         │
│ Crear cuenta               │
│                            │
└────────────────────────────┘
```

Acción principal:

```text
Iniciar sesión
```

Acción secundaria:

```text
Crear cuenta
```

No sobrecargar con ilustraciones.

---

# 13. Desktop — Login

Layout recomendado:

```text
┌──────────────────────────────────────────────────────────┐
│                                                          │
│   FinWise                     ┌────────────────────────┐  │
│                               │ Bienvenido de nuevo    │  │
│   Claridad para tomar         │                        │  │
│   mejores decisiones.         │ Email                  │  │
│                               │ Password               │  │
│   [visual ambiental sutil]    │                        │  │
│                               │ [ Iniciar sesión ]     │  │
│                               │                        │  │
│                               │ Crear cuenta           │  │
│                               └────────────────────────┘  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

El panel visual no debe competir con el formulario.

---

# 14. Registro

Misma estructura base del login.

Campos:

```text
Nombre
Email
Contraseña
Confirmación
```

CTA:

```text
Crear cuenta
```

Mostrar requisitos de contraseña de forma progresiva.

---

# 15. Recuperar contraseña

Pantalla simple.

```text
Recupera tu acceso

Correo
[________________________]

[ Enviar enlace ]

Volver a iniciar sesión
```

Después:

```text
Revisa tu correo
```

Respuesta neutral respecto a existencia de cuenta.

---

# 16. Onboarding — filosofía

El onboarding debe ser corto.

No convertirlo en un cuestionario financiero largo.

Objetivo:

```text
configurar lo mínimo
+
llevar al primer valor
```

---

# 17. Onboarding — estructura

Recomendación:

```text
Paso 1 — Bienvenida
Paso 2 — Preferencias
Paso 3 — Primera cuenta
Paso 4 — Listo
```

Indicador discreto:

```text
1 ● ○ ○ ○ 4
```

---

# 18. Onboarding 1 — Bienvenida

```text
┌────────────────────────────┐
│                            │
│            ◈               │
│                            │
│ Bienvenido a FinWise       │
│                            │
│ Entiende cuánto puedes     │
│ gastar realmente sin       │
│ comprometer lo importante. │
│                            │
│ [       Comenzar         ] │
│                            │
└────────────────────────────┘
```

---

# 19. Onboarding 2 — Preferencias

Campos:

```text
Moneda
COP — Peso colombiano

Zona horaria
America/Bogota

Reserva de seguridad
$ 0
```

Explicación de reserva:

> Dinero que prefieres no considerar disponible para gastar.

CTA:

```text
Continuar
```

---

# 20. Onboarding 3 — Primera cuenta

```text
Crea tu primera cuenta

Nombre
[ Cuenta principal ]

Tipo
[ Ahorros           v ]

Saldo inicial
[ $ 0                 ]

[ Crear cuenta y continuar ]
```

Opcional:

```text
Omitir por ahora
```

Pero el dashboard vacío debe guiar inmediatamente a crearla.

---

# 21. Onboarding 4 — Final

```text
Todo listo

Ya puedes empezar a registrar
tus movimientos.

[ Ir a FinWise ]
```

No celebrar excesivamente.

---

# 22. Mobile — Dashboard

Decisiones aprobadas:

```text
Header compacto con marca
+
saludo moderado
+
hero de disponible
+
ingresos/gastos
+
chart
+
insights
+
movimientos recientes
```

---

# 23. Dashboard móvil — wireframe principal

```text
┌────────────────────────────┐
│ FinWise              🔔 ◉  │
│                            │
│ Buenos días, Genesis       │
│                            │
│ ╭────────────────────────╮ │
│ │ Disponible             │ │
│ │                        │ │
│ │ $2.150.000             │ │
│ │ +$120.000 este mes     │ │
│ │                        │ │
│ │ Saldo       $4.850.000 │ │
│ │ Compromisos -2.200.000 │ │
│ │ Reserva       -500.000 │ │
│ │                        │ │
│ │ ● Situación estable    │ │
│ ╰────────────────────────╯ │
│                            │
│ ╭──────────╮ ╭──────────╮ │
│ │ Ingresos │ │ Gastos   │ │
│ │ $5.2M    │ │ $2.9M    │ │
│ │ +12% 〰  │ │ -3% 〰   │ │
│ ╰──────────╯ ╰──────────╯ │
│                            │
│ Flujo del mes              │
│ ╭────────────────────────╮ │
│ │       chart            │ │
│ │  ╭──╮    ╭────╮       │ │
│ │──╯  ╰────╯    ╰──     │ │
│ ╰────────────────────────╯ │
│                            │
│ FinWise Insight            │
│ ╭────────────────────────╮ │
│ │ Tus gastos en comida   │ │
│ │ subieron esta semana.  │ │
│ │ Ver detalle →          │ │
│ ╰────────────────────────╯ │
│                            │
│ Movimientos      Ver todos │
│ 🍔 Almuerzo       -$25.000 │
│ ↑ Nómina       +$2.500.000 │
│ 🚕 Transporte     -$18.000 │
│ 🛒 Mercado       -$125.000 │
│                            │
│       contenido inferior   │
│                            │
│ ╭────────────────────────╮ │
│ │Inicio Movim. + Metas Más│ │
│ ╰────────────────────────╯ │
└────────────────────────────┘
```

---

# 24. Dashboard hero — reglas

Altura:

aproximadamente 35–40 % del primer viewport visible, sin impedir ver el siguiente bloque.

Contenido:

```text
Disponible
Monto
Variación contextual
Saldo
Compromisos
Reserva
Estado
```

La variación mensual se muestra solo si:

- existe periodo comparable;
- el dato tiene significado.

No inventar comparaciones en usuarios nuevos.

---

# 25. Dashboard — estado financiero adaptativo

El layout permanece estable.

Cambian de forma sutil:

- estado;
- icono;
- texto;
- semántica.

Ejemplo saludable:

```text
● Situación estable
```

Ejemplo atención:

```text
△ Revisa tus compromisos
```

Ejemplo riesgo:

```text
! Tus compromisos superan tu saldo líquido
```

No cambiar toda la card a rojo.

---

# 26. Dashboard — Ingresos / Gastos

Dos metric cards.

No exceder dos cards por fila en móvil.

Cada una:

```text
label
amount
trend
sparkline
```

No usar porcentaje cuando no hay suficiente historial.

---

# 27. Dashboard — chart

Default:

```text
Mes
```

Control opcional:

```text
Semana | Mes | Año
```

Mostrar:

- evolución;
- ingresos;
- gastos;
- balance cuando corresponda.

No saturar con ejes completos.

---

# 28. Dashboard — Insights

Máximo:

```text
1–2 insights importantes
```

en pantalla principal.

No convertir dashboard en feed de recomendaciones.

Prioridad:

```text
riesgo
↓
compromiso próximo
↓
presupuesto
↓
tendencia
```

---

# 29. Dashboard — movimientos recientes

Patrón:

```text
lista vertical
+
Ver todos
```

Mostrar:

```text
4–5 movimientos máximo
```

Cada fila:

```text
icon/category
description
date/account secondary
amount
```

---

# 30. Quick Create

Se abre mediante botón central `+`.

Patrón aprobado:

```text
Gasto destacado
+
resto compacto
```

Wireframe:

```text
╭────────────────────────────╮
│            ───             │
│                            │
│ ¿Qué quieres registrar?    │
│                            │
│ ╭────────────────────────╮ │
│ │ ↓  Registrar gasto     │ │
│ ╰────────────────────────╯ │
│                            │
│ ↑ Ingreso      ⇄ Transfer. │
│                            │
│ ◷ Obligación               │
│                            │
╰────────────────────────────╯
```

Gasto debe sobresalir de forma elegante.

---

# 31. Quick Create — interacción

Al tocar:

```text
+
```

1. bottom nav permanece contextual;
2. aparece scrim;
3. sheet entra con spring;
4. focus visual en opciones;
5. swipe down cierra.

Reduced motion:

usar fade + desplazamiento mínimo.

---

# 32. Nuevo gasto — decisión principal

Se usará:

```text
una sola pantalla
+
monto protagonista equilibrado
+
campos compactos
+
botón fijo inferior
```

---

# 33. Nuevo gasto — wireframe

```text
┌────────────────────────────┐
│ ‹  Nuevo movimiento        │
│                            │
│ ╭────────────────────────╮ │
│ │ Gasto │Ingreso│Transfer.│ │
│ ╰────────────────────────╯ │
│                            │
│ ¿Cuánto gastaste?          │
│                            │
│        $ 25.000            │
│                            │
│ Categoría                  │
│ 🍔 Alimentación          › │
│                            │
│ Cuenta                     │
│ ◉ Nequi                  › │
│ Disponible: $850.000       │
│                            │
│ Fecha                      │
│ Hoy                      › │
│                            │
│ Nota                       │
│ Almuerzo                 › │
│                            │
│ Más detalles             v │
│                            │
│                            │
│ ────────────────────────── │
│ [     Registrar gasto    ] │
└────────────────────────────┘
```

El CTA queda fijo sobre safe area.

---

# 34. Selector de tipo de movimiento

Aunque se entre por `Gasto`, mostrar:

```text
Gasto | Ingreso | Transferencia
```

como segmented control discreto.

Permite corregir selección sin volver atrás.

No debe competir con el monto.

---

# 35. Monto

Prioridad visual alta, pero equilibrada.

Reglas:

- focus inicial;
- teclado numérico;
- currency formatting;
- tabular-nums;
- cursor visible;
- sin input box pesado.

Ejemplo:

```text
$ 25.000
```

---

# 36. Categoría — selección

Patrón:

```text
frecuentes
+
ver todas
```

Bottom sheet:

```text
╭────────────────────────────╮
│ Categoría                  │
│ [ Buscar...              ] │
│                            │
│ Frecuentes                 │
│                            │
│ 🍔 Comida     🚕 Transporte│
│ 🛒 Mercado    🎬 Ocio      │
│                            │
│ Todas                      │
│ 🏠 Vivienda                │
│ ⚕ Salud                    │
│ ...                        │
╰────────────────────────────╯
```

Los iconos reales deben usar el sistema de iconografía, no emojis.

---

# 37. Cuenta — selección

Mostrar saldo de forma secundaria:

```text
Nequi
Disponible: $850.000
```

Al seleccionar:

```text
Cuenta
[icon] Nequi
        $850.000
```

No mostrar número de tarjeta.

---

# 38. Fecha

Campo visible y compacto.

Default:

```text
Hoy
```

Acceso a date picker.

Mostrar fecha explícita después de cambiarla.

---

# 39. Nota

Visible siempre, pero de baja jerarquía.

Ejemplo:

```text
Nota
Almuerzo
```

No hacerla requerida.

---

# 40. Más detalles

Accordion opcional.

Puede contener:

```text
fecha/hora adicional
notas ampliadas
recurrencia futura
comprobante futuro
```

No llenar el flujo principal con opciones avanzadas.

---

# 41. Registrar gasto

CTA mobile:

```text
fixed bottom
```

Estado normal:

```text
Registrar gasto
```

Pending:

```text
Registrando...
```

No cambiar el layout durante pending.

---

# 42. Resultado de registro

Comportamiento contextual:

```text
desde Dashboard
→ volver Dashboard

desde Movimientos
→ volver Movimientos
```

Feedback:

```text
✓ Gasto registrado
```

Después:

- dashboard recalcula;
- disponible actualiza;
- monto puede usar digit morph.

No abrir obligatoriamente una pantalla de éxito.

---

# 43. Nuevo ingreso

Comparte estructura con gasto.

Diferencias:

```text
¿Cuánto recibiste?
Categoría de ingreso
Cuenta destino
Fecha
Nota
```

CTA:

```text
Registrar ingreso
```

No duplicar componente completo.

---

# 44. Nueva transferencia

Wireframe:

```text
┌────────────────────────────┐
│ ‹  Transferencia           │
│                            │
│ Monto                      │
│       $ 200.000            │
│                            │
│ Desde                      │
│ Cuenta principal         › │
│ $1.000.000                 │
│                            │
│ Hacia                      │
│ Nequi                    › │
│ $500.000                   │
│                            │
│ Fecha                      │
│ Hoy                      › │
│                            │
│ [      Transferir        ] │
└────────────────────────────┘
```

Validaciones:

- cuentas distintas;
- misma moneda en V1;
- amount > 0.

---

# 45. Nueva obligación

Wireframe:

```text
┌────────────────────────────┐
│ ‹  Nueva obligación        │
│                            │
│ Nombre                     │
│ [ Arriendo               ] │
│                            │
│ Monto                      │
│ [ $ 900.000              ] │
│                            │
│ Vencimiento                │
│ [ 15 oct 2026            ] │
│                            │
│ Nota                       │
│ [                        ] │
│                            │
│ [   Guardar obligación   ] │
└────────────────────────────┘
```

Mostrar explicación:

> Las obligaciones pendientes reducen tu dinero disponible.

---

# 46. Movimientos — mobile

Wireframe:

```text
┌────────────────────────────┐
│ Movimientos           🔍   │
│                            │
│ [ Todos | Gastos | Ingr. ] │
│                            │
│ Octubre                    │
│                            │
│ Hoy                        │
│ 🍔 Almuerzo       -$25.000 │
│   Alimentación · Nequi     │
│                            │
│ 🚕 Transporte     -$18.000 │
│   Transporte · Nequi       │
│                            │
│ Ayer                       │
│ ↑ Nómina        +$2.500.000│
│   Ingresos · Bancolombia   │
│                            │
│ ...                        │
│                            │
│ ╭────────────────────────╮ │
│ │Inicio Movim. + Metas Más│ │
│ ╰────────────────────────╯ │
└────────────────────────────┘
```

---

# 47. Movimientos — filtros

Acceso mediante:

```text
Buscar
Filtros
```

Sheet de filtros:

```text
Periodo
Tipo
Cuenta
Categoría
Rango de monto
```

CTA:

```text
Aplicar filtros
```

Secundaria:

```text
Limpiar
```

---

# 48. Movimiento — row

Estructura:

```text
[icon] descripción            monto
       categoría · cuenta
       fecha/hora secundaria
```

Amount:

- ingreso puede llevar indicador positivo;
- gasto con signo negativo;
- no depender solo del color.

---

# 49. Detalle de transacción

Wireframe:

```text
┌────────────────────────────┐
│ ‹  Detalle             ⋯   │
│                            │
│ 🍔                         │
│ Almuerzo                   │
│                            │
│ -$25.000                   │
│                            │
│ Categoría                  │
│ Alimentación               │
│                            │
│ Cuenta                     │
│ Nequi                      │
│                            │
│ Fecha                      │
│ 7 oct 2026                 │
│                            │
│ Nota                       │
│ Almuerzo oficina           │
│                            │
│ [        Editar          ] │
└────────────────────────────┘
```

Menú `⋯`:

```text
Editar
Eliminar
```

Eliminar requiere confirmación.

---

# 50. Editar transacción

Reutiliza formulario de creación.

Título:

```text
Editar gasto
```

CTA:

```text
Guardar cambios
```

Si cambia un dato que afecta métricas, recalcular al persistir.

---

# 51. Confirmar eliminación

Mobile:

bottom sheet de confirmación.

```text
Eliminar movimiento

Este movimiento dejará de afectar
tus saldos y cálculos.

[ Eliminar ]
[ Cancelar ]
```

No usar copy alarmista.

---

# 52. Cuentas — mobile

Wireframe:

```text
┌────────────────────────────┐
│ Cuentas                 +  │
│                            │
│ Saldo líquido              │
│ $4.850.000                 │
│                            │
│ ╭────────────────────────╮ │
│ │ Cuenta principal       │ │
│ │ Ahorros                │ │
│ │ $3.500.000             │ │
│ ╰────────────────────────╯ │
│                            │
│ ╭────────────────────────╮ │
│ │ Nequi                  │ │
│ │ Wallet                 │ │
│ │ $850.000               │ │
│ ╰────────────────────────╯ │
│                            │
│ Tarjetas                   │
│ ╭────────────────────────╮ │
│ │ Visa                    │ │
│ │ Deuda: $500.000        │ │
│ │ Cupo disp.: $1.500.000 │ │
│ ╰────────────────────────╯ │
└────────────────────────────┘
```

Tarjetas separadas visualmente de liquidez.

---

# 53. Crear cuenta

Formulario:

```text
Nombre
Tipo
Saldo inicial
Moneda
```

Si tarjeta:

```text
Deuda inicial
Límite
Día de corte
Día de pago
```

No solicitar información sensible de tarjeta.

---

# 54. Detalle de cuenta

Mostrar:

```text
Nombre
Tipo
Balance/deuda
Movimientos recientes
Configuración
```

Acciones:

```text
Editar
Archivar
```

No permitir editar balance actual directamente.

---

# 55. Obligaciones — mobile

Wireframe:

```text
┌────────────────────────────┐
│ Obligaciones            +  │
│                            │
│ Pendiente                  │
│ $1.350.000                 │
│                            │
│ Próximas                   │
│                            │
│ 🏠 Arriendo      $900.000  │
│    vence 15 oct            │
│                            │
│ 💡 Energía       $180.000  │
│    vence 18 oct            │
│                            │
│ 📱 Internet      $120.000  │
│    vence 22 oct            │
│                            │
└────────────────────────────┘
```

Orden default:

```text
due_date ASC
```

---

# 56. Detalle obligación

Mostrar:

```text
Nombre
Monto
Fecha
Estado
Descripción
```

CTA principal:

```text
Marcar como pagada
```

Secundarias:

```text
Editar
Eliminar / cancelar
```

---

# 57. Marcar obligación pagada

Sheet:

```text
¿La obligación ya fue pagada?

Puedes marcarla como pagada sin
crear un movimiento.

[ Marcar como pagada ]

Registrar gasto asociado
Cancelar
```

No crear transacción automáticamente.

---

# 58. Configuración — mobile

Wireframe:

```text
┌────────────────────────────┐
│ Configuración              │
│                            │
│ Finanzas                   │
│ Moneda                 COP │
│ Reserva        $500.000  › │
│ Zona horaria       Bogotá  │
│                            │
│ Apariencia                 │
│ Tema                 System│
│                            │
│ Cuenta                     │
│ Perfil                  ›  │
│ Seguridad               ›  │
│                            │
│ Cerrar sesión              │
└────────────────────────────┘
```

---

# 59. Reserva de seguridad

Pantalla simple.

```text
Reserva de seguridad

Dinero que FinWise no tendrá
en cuenta como disponible para gastar.

$ 500.000

Impacto actual

Saldo líquido      $4.850.000
Reserva              -500.000

[ Guardar ]
```

Puede mostrar preview del impacto antes de persistir.

---

# 60. Alertas — mobile

Wireframe:

```text
┌────────────────────────────┐
│ Alertas                    │
│                            │
│ Hoy                        │
│ ╭────────────────────────╮ │
│ │ △ Presupuesto          │ │
│ │ Alimentación está      │ │
│ │ cerca del límite.      │ │
│ │ Ver detalle →          │ │
│ ╰────────────────────────╯ │
│                            │
│ ╭────────────────────────╮ │
│ │ ◷ Obligación           │ │
│ │ Arriendo vence pronto. │ │
│ ╰────────────────────────╯ │
└────────────────────────────┘
```

---

# 61. Presupuestos — mobile

Wireframe:

```text
┌────────────────────────────┐
│ Presupuestos           +   │
│ Octubre                    │
│                            │
│ Alimentación               │
│ $425.000 / $500.000        │
│ █████████████████░░        │
│ 85%                        │
│                            │
│ Transporte                 │
│ $180.000 / $350.000        │
│ █████████░░░░░░░░░        │
│ 51%                        │
│                            │
└────────────────────────────┘
```

Color semántico suave.

---

# 62. Crear presupuesto

```text
Categoría
Mes
Límite
```

CTA:

```text
Crear presupuesto
```

No mostrar gastos como campo editable.

---

# 63. Metas — mobile

Wireframe:

```text
┌────────────────────────────┐
│ Metas                   +  │
│                            │
│ ╭────────────────────────╮ │
│ │ Fondo de emergencia    │ │
│ │ $2.500.000 / $5.000.000│ │
│ │ ██████████░░░░░░░░░░  │ │
│ │ 50%                    │ │
│ │ Sep 2027               │ │
│ ╰────────────────────────╯ │
│                            │
│ ╭────────────────────────╮ │
│ │ Viaje                  │ │
│ │ $800.000 / $3.000.000  │ │
│ │ █████░░░░░░░░░░░░░░░  │ │
│ ╰────────────────────────╯ │
└────────────────────────────┘
```

---

# 64. Detalle de meta

Mostrar:

```text
progreso
monto objetivo
monto actual
faltante
fecha
compromiso mensual
aportes
```

CTA:

```text
Agregar aporte
```

Secundarias:

```text
Editar
Pausar
Cancelar
```

---

# 65. Desktop — App Shell

Wireframe:

```text
┌─────────────────────────────────────────────────────────────────────┐
│                                                                     │
│ ╭────────────────╮  ┌────────────────────────────────────────────┐ │
│ │ FinWise        │  │ Header                                     │ │
│ │                │  │                                            │ │
│ │ Inicio         │  │                                            │ │
│ │ Movimientos    │  │                                            │ │
│ │ Presupuestos   │  │              MAIN CONTENT                  │ │
│ │ Metas          │  │                                            │ │
│ │ Alertas        │  │                                            │ │
│ │                │  │                                            │ │
│ │ Configuración  │  │                                            │ │
│ ╰────────────────╯  └────────────────────────────────────────────┘ │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

Sidebar flotante con margen.

---

# 66. Desktop — Dashboard

Wireframe:

```text
┌───────────────────────────────────────────────────────────────────┐
│ Buenos días, Genesis                    + Nueva transacción   🔔 ◉ │
│ Tu panorama financiero                                           │
│                                                                   │
│ ╭────────────────────────────────╮ ╭────────────╮ ╭────────────╮ │
│ │ Disponible                     │ │ Ingresos   │ │ Gastos     │ │
│ │ $2.150.000                     │ │ $5.2M      │ │ $2.9M      │ │
│ │ +$120.000 este mes             │ │ +12%       │ │ -3%        │ │
│ │                                │ ╰────────────╯ ╰────────────╯ │
│ │ Saldo             $4.850.000   │                                │
│ │ Compromisos      -$2.200.000   │ ╭────────────────────────────╮ │
│ │ Reserva            -$500.000   │ │ Próximos compromisos       │ │
│ ╰────────────────────────────────╯ ╰────────────────────────────╯ │
│                                                                   │
│ ╭────────────────────────────────────────╮ ╭────────────────────╮ │
│ │ Flujo mensual                          │ │ Presupuestos       │ │
│ │                                        │ │                    │ │
│ │              CHART                     │ │ progress           │ │
│ │                                        │ │                    │ │
│ ╰────────────────────────────────────────╯ ╰────────────────────╯ │
│                                                                   │
│ ╭────────────────────────────────────────╮ ╭────────────────────╮ │
│ │ Movimientos recientes                  │ │ FinWise Insights   │ │
│ │                                        │ │                    │ │
│ ╰────────────────────────────────────────╯ ╰────────────────────╯ │
└───────────────────────────────────────────────────────────────────┘
```

---

# 67. Desktop — hero disponible

Ocupa mayor ancho que KPI secundarios.

Regla aproximada:

```text
hero: 50–60%
secondary metrics: resto
```

Debe ser la primera lectura.

---

# 68. Desktop — movimientos

Tabla recomendada:

```text
Fecha | Descripción | Categoría | Cuenta | Tipo | Monto | ...
```

Header:

```text
Movimientos
[Buscar] [Filtros] [+ Nueva transacción]
```

No mostrar columnas irrelevantes.

---

# 69. Desktop — transaction modal

Para creación rápida:

```text
Modal / drawer
```

No navegar a página distinta salvo flujo complejo.

Layout:

```text
Tipo segmented
Monto
Categoría
Cuenta
Fecha
Nota
Más detalles
CTA
```

---

# 70. Desktop — Cuentas

Grid 2–3 columnas según ancho.

Separar:

```text
Liquidez
Crédito
```

No mezclar crédito disponible con saldo.

---

# 71. Desktop — Obligaciones

Layout recomendado:

```text
Summary cards
+
table/list
```

Summary:

```text
Pendiente total
Próximo vencimiento
Cantidad pendiente
```

Tabla:

```text
Nombre
Vencimiento
Monto
Estado
Acciones
```

---

# 72. Desktop — Presupuestos

Layout:

```text
Header
↓
month selector
↓
budget cards/grid
↓
category analysis
```

No necesitar tabla si cards comunican mejor el progreso.

---

# 73. Desktop — Metas

Grid de cards.

Cada card:

```text
nombre
monto actual / objetivo
progress
fecha
compromiso mensual
```

---

# 74. Desktop — Configuración

Preferir navegación secundaria lateral dentro del contenido:

```text
Perfil
Finanzas
Apariencia
Seguridad
```

No crear una página gigante con todos los ajustes.

---

# 75. Desktop sidebar colapsada

Cuando colapsa:

```text
logo symbol
icons
tooltip on hover/focus
```

No perder navegación accesible.

Estado persistible opcional.

---

# 76. Header behavior

Mobile:

```text
marca + saludo / título + acciones
```

Desktop:

```text
page title + context + primary CTA + utilities
```

No repetir nombre de página varias veces.

---

# 77. Search

Global search no es MVP.

Búsqueda inicial limitada a:

```text
Movimientos
```

Podrá evolucionar posteriormente.

---

# 78. Empty — Dashboard sin cuenta

```text
Aún no tienes una cuenta

Crea tu primera cuenta para que
FinWise pueda calcular tus saldos.

[ Crear cuenta ]
```

No mostrar tarjetas llenas de ceros innecesarios.

---

# 79. Empty — Cuenta sin movimientos

```text
Tu cuenta está lista

Registra un ingreso o gasto para
empezar a construir tu panorama.

[ Registrar movimiento ]
```

---

# 80. Empty — Movimientos

```text
Aún no tienes movimientos

Registra tu primer ingreso o gasto.

[ Registrar movimiento ]
```

---

# 81. Empty — Obligaciones

```text
No tienes obligaciones pendientes

Agrega compromisos para que FinWise
los considere al calcular tu disponible.

[ Agregar obligación ]
```

---

# 82. Empty — Presupuestos

```text
Controla tus límites mensuales

Crea un presupuesto para una categoría
y sigue su avance durante el mes.

[ Crear presupuesto ]
```

---

# 83. Empty — Metas

```text
Convierte tus objetivos en un plan

Crea una meta y sigue tu progreso.

[ Crear meta ]
```

---

# 84. Error state

Patrón:

```text
No pudimos cargar esta información.

[ Reintentar ]
```

Si existe información parcial, conservarla cuando sea seguro.

---

# 85. Loading — Dashboard

Usar skeletons de:

- hero;
- metric cards;
- chart;
- list.

No mostrar una pantalla completamente vacía con spinner.

---

# 86. Loading — lists

Skeleton de 3–5 filas.

No animar demasiados elementos.

---

# 87. Saving state

Button pending.

Ejemplo:

```text
Registrando...
```

Disabled durante envío.

No permitir doble submit.

---

# 88. Responsive — transición mobile → tablet

Tablet puede:

- mantener bottom navigation;
- usar 2 columnas en dashboard;
- ampliar chart;
- mantener sheets.

No introducir sidebar demasiado pronto.

---

# 89. Responsive — transición tablet → desktop

A partir del espacio adecuado:

```text
bottom nav → sidebar
sheets → dialogs
lists → tables
single column → grid
```

La transición debe depender de usabilidad, no solo dispositivo.

---

# 90. Navegación y scroll mobile

Bottom nav:

```text
position fixed
```

El contenido debe incluir padding inferior suficiente.

No permitir que la última fila quede detrás de la navegación.

---

# 91. Keyboard mobile

Cuando aparece teclado:

- CTA debe seguir accesible cuando sea razonable;
- bottom nav puede ocultarse temporalmente;
- no producir saltos de layout bruscos;
- inputs deben desplazarse a zona visible.

---

# 92. Bottom sheets — tamaño

Quick Create:

```text
content height
```

Selectors:

```text
aprox. 50–75vh
```

Form complejo:

preferir full-screen page o large sheet.

---

# 93. Microinteracciones clave

Usar Motion en:

```text
sidebar collapse
bottom sheet
segmented control
button press
hero number update
progress
chart reveal
card reveal
theme transitions
```

No animar filas continuamente.

---

# 94. Transición de pantalla mobile

Base:

```text
fade
+
translate 6px
```

Cuando existe relación padre → detalle:

pequeña dirección lateral puede ayudar.

Ejemplo:

```text
Movimientos → Detalle
```

No imitar navegación nativa de forma excesiva.

---

# 95. Detalle → regreso

Mantener:

- filtros;
- scroll position;
- periodo seleccionado;

cuando el usuario vuelve.

---

# 96. Estado del Dashboard

Filtros de periodo deben persistir durante sesión cuando sea útil.

Default:

```text
mes actual
```

---

# 97. Period selector

Patrón:

```text
Este mes  v
```

Más limpio que controles largos en mobile.

Charts internos pueden usar segmented controls.

---

# 98. Alertas en Dashboard

Solo mostrar las más relevantes.

No mostrar todas.

CTA:

```text
Ver alertas
```

---

# 99. FinWise Insight — criterios

Un insight debe responder:

```text
qué ocurrió
+
por qué importa
+
qué puede revisar el usuario
```

No debe emitir juicios.

---

# 100. Card de disponible negativo

Ejemplo:

```text
Disponible
$0 para gastar

Déficit de $200.000

Tus compromisos actuales superan
tu saldo líquido.
```

Internamente la fórmula puede ser negativa.

La UI no debe decir:

```text
Puedes gastar -$200.000
```

---

# 101. Tarjeta de crédito

En account cards:

```text
Deuda actual
Límite
Crédito disponible
```

Separar visualmente:

```text
credit available
≠
cash available
```

---

# 102. Transferencias

En movimientos mostrar:

```text
Transferencia
Cuenta A → Cuenta B
```

No clasificarlas como gasto/ingreso.

---

# 103. Form validation

Inline.

Ejemplo:

```text
Monto
$0
El monto debe ser mayor que cero.
```

No esperar al toast.

---

# 104. Error persistencia

Conservar formulario cuando sea posible.

Mensaje:

```text
No pudimos guardar el movimiento.
Inténtalo nuevamente.
```

CTA:

```text
Reintentar
```

---

# 105. Unauthorized / missing resource

No mostrar ownership.

Pantalla:

```text
No encontramos este contenido.
```

o navegación segura.

---

# 106. Confirmaciones

Usar solo cuando haya impacto.

Confirmar:

- eliminar;
- archivar;
- cancelar;
- cerrar obligación;
- cambios destructivos.

No confirmar cada alta normal.

---

# 107. Accessibility — wireframes

Cada screen debe contemplar:

- orden de focus;
- labels;
- aria labels de icon buttons;
- encabezados jerárquicos;
- navegación por teclado;
- contraste;
- touch targets;
- reduced motion.

---

# 108. Charts — fallback textual

Ejemplo:

```text
Gastos del mes
$2.900.000
12% menos que septiembre
```

debe ser comprensible aun sin interpretar la gráfica.

---

# 109. PWA standalone

En PWA:

- respetar safe areas;
- header no debe asumir barra de navegador;
- evitar dobles barras de navegación;
- considerar instalación;
- app icon coherente.

---

# 110. Pantallas fuera de alcance inicial

No diseñar en profundidad todavía:

```text
Bank sync
AI assistant
Advanced reports
Tax module
Multi-user finance
Investment portfolio
Crypto
OCR receipts
Open banking
```

---

# 111. Component mapping

## AppShell

Usado en:

```text
todas las pantallas privadas
```

## AvailableToSpendCard

```text
dashboard
simulador futuro
```

## TransactionForm

```text
nuevo gasto
nuevo ingreso
editar movimiento
```

## AccountSelector

```text
transactions
transfers
```

## CategorySelector

```text
transactions
budgets
```

## BottomSheet

```text
quick create
selectors
confirmations
```

---

# 112. Flujo E2E visual principal

```text
Login
↓
Onboarding
↓
Crear cuenta
↓
Dashboard empty/initial
↓
+
↓
Ingreso
↓
Dashboard actualizado
↓
+
↓
Gasto
↓
Disponible actualizado
↓
+
↓
Obligación
↓
Disponible recalculado
```

Debe funcionar fluidamente en mobile.

---

# 113. Flujo de gasto mobile

```text
Dashboard
↓
+
↓
Quick Create
↓
Gasto
↓
Monto
↓
Categoría
↓
Cuenta
↓
Fecha/nota
↓
Registrar
↓
Persistencia
↓
Dashboard
↓
Digit morph de disponible
↓
Toast
```

---

# 114. Flujo de gasto desktop

```text
Dashboard
↓
Nueva transacción
↓
Modal
↓
Gasto
↓
Completar
↓
Guardar
↓
Modal cierra
↓
Dashboard actualiza
↓
Toast
```

---

# 115. Flujo movimientos mobile

```text
Movimientos
↓
Buscar / filtrar
↓
Seleccionar movimiento
↓
Detalle
↓
Editar
↓
Guardar
↓
Detalle actualizado
```

---

# 116. Flujo obligación

```text
Más
↓
Obligaciones
↓
+
↓
Crear
↓
Guardar
↓
Disponible recalculado
```

---

# 117. Diseño de la primera demo

La demo académica ideal debe permitir mostrar:

```text
1. Login
2. Dashboard
3. Disponible
4. Registro de gasto
5. Actualización animada
6. Registro de obligación
7. Nuevo cálculo de disponible
8. Historial
```

Con pocos pasos se demuestra la diferenciación del producto.

---

# 118. Prioridad visual para implementación

Orden:

```text
1. Login
2. Onboarding
3. AppShell
4. MobileBottomNav
5. DesktopSidebar
6. Dashboard
7. AvailableToSpendCard
8. QuickCreate
9. TransactionForm
10. TransactionList/Table
11. Accounts
12. Obligations
13. Settings
14. Charts
15. Budgets
16. Goals
17. Alerts
```

---

# 119. Design QA — Dashboard

Verificar:

- [ ] disponible visible sin scroll excesivo;
- [ ] no confunde saldo/disponible;
- [ ] funciona con montos largos;
- [ ] estado negativo legible;
- [ ] dark mode;
- [ ] mobile 390 px;
- [ ] desktop 1280 px;
- [ ] reduced motion;
- [ ] skeleton;
- [ ] empty state.

---

# 120. Design QA — Formularios

Verificar:

- [ ] teclado móvil;
- [ ] CTA accesible;
- [ ] validación inline;
- [ ] formateo monetario;
- [ ] selector cuenta;
- [ ] selector categoría;
- [ ] dark;
- [ ] error server;
- [ ] pending;
- [ ] safe area.

---

# 121. Design QA — Bottom Navigation

Verificar:

- [ ] safe area;
- [ ] contraste;
- [ ] estado activo;
- [ ] `+` usable con pulgar;
- [ ] no tapa contenido;
- [ ] landscape razonable;
- [ ] PWA standalone;
- [ ] reduced transparency fallback.

---

# 122. Regla para agentes de UI

Antes de crear una pantalla:

```text
1. localizar caso de uso;
2. localizar este wireframe;
3. leer SISTEMA_DISENO_FINWISE.md;
4. implementar mobile;
5. implementar desktop;
6. cubrir estados;
7. validar dark;
8. validar accesibilidad.
```

No rediseñar la arquitectura de pantalla por preferencia estética sin justificarlo.

---

# 123. Libertad permitida al agente

Puede decidir:

- micro-spacing;
- distribución interna menor;
- exactitud de iconos;
- copy secundaria;
- responsive fino;
- pequeñas mejoras de composición.

No puede cambiar sin decisión explícita:

- navegación principal;
- protagonismo de dinero disponible;
- bottom nav;
- quick create;
- dirección visual;
- paleta;
- mobile-first;
- jerarquía financiera.

---

# 124. Wireframe vs UI final

Estos wireframes definen:

```text
estructura
+
jerarquía
+
flujo
+
comportamiento
```

No obligan a reproducir exactamente los bordes ASCII.

La implementación final debe aplicar:

```text
SISTEMA_DISENO_FINWISE.md
```

---

# 125. Siguiente documento

Después de este documento corresponde crear:

```text
contexto/planificacion/BACKLOG_MVP.md
```

Ese documento debe transformar:

```text
casos de uso
+
modelo de datos
+
wireframes
+
arquitectura
```

en trabajo implementable.

Debe incluir:

- épicas;
- historias;
- tareas técnicas;
- orden;
- dependencias;
- criterios de aceptación;
- Definition of Done;
- pruebas;
- alcance del MVP;
- qué NO implementar todavía.

Después del backlog:

```text
ADRs iniciales
↓
Inicialización del repositorio
↓
Supabase local
↓
Primera migración
↓
Auth
↓
Primer vertical slice
```

---

# Fin del documento
