# FinWise — Especificación del proyecto

> **Tagline:** *Entiende tu dinero. Anticipa tus decisiones.*

## Propósito del documento

Este documento consolida la especificación académica de **FinWise** en seis partes:

1. Visión.
2. Roles.
3. Historias de usuario.
4. Requisitos funcionales.
5. Requisitos no funcionales.
6. Fuera de alcance.

El objetivo es que la primera versión del proyecto sea pequeña, clara, comprobable y viable, sin perder la propuesta de valor principal de FinWise: ayudar al usuario a entender cuánto dinero puede gastar realmente sin comprometer sus obligaciones.

---

# 1. Visión

## 1.1 Nombre del proyecto

**FinWise**

## 1.2 Descripción general

FinWise es una aplicación web de gestión financiera personal orientada a transformar registros de ingresos, gastos y compromisos en información útil para la toma de decisiones.

La aplicación no se plantea únicamente como un registro de gastos. Su valor principal está en interpretar la situación financiera del usuario para ayudarle a responder preguntas como:

- ¿Cuánto he gastado este mes?
- ¿Cuánto dinero tengo realmente disponible para gastar?
- ¿Estoy cumpliendo mi presupuesto?
- ¿Cuánto debería ahorrar para una meta?
- ¿Cómo podría terminar el mes si mantengo mi ritmo de gasto?

La filosofía general del producto es:

> **Registrar → Analizar → Predecir → Recomendar**

## 1.3 Problema

Muchas personas conocen el saldo de sus cuentas, pero no necesariamente saben cuánto de ese dinero pueden usar sin afectar gastos necesarios, obligaciones o metas.

La información financiera suele estar distribuida entre aplicaciones bancarias, hojas de cálculo, notas, extractos y otras herramientas. Esto dificulta obtener una visión clara de la situación financiera personal.

### Formulación resumida del problema

> **Estudiantes universitarios y jóvenes profesionales tienen dificultad para saber cuánto dinero pueden gastar sin comprometer sus gastos necesarios y metas, porque sus ingresos, gastos y obligaciones no se interpretan en conjunto.**

Esta formulación describe:

- **A quién le ocurre:** estudiantes universitarios y jóvenes profesionales.
- **Qué problema tienen:** no saben con claridad cuánto pueden gastar.
- **Por qué ocurre:** ingresos, gastos y obligaciones no se interpretan en conjunto.

## 1.4 Usuario objetivo inicial

La primera validación del proyecto se enfoca en:

- estudiantes universitarios;
- jóvenes profesionales;
- personas que administran personalmente sus ingresos y gastos.

En versiones posteriores, FinWise podría ampliarse a trabajadores independientes y otros usuarios interesados en organizar sus finanzas personales.

## 1.5 Propuesta de valor

FinWise busca responder una pregunta central:

> **¿Cuánto puedo gastar realmente sin perjudicar mis compromisos y objetivos financieros?**

En lugar de mostrar únicamente datos aislados, la aplicación pretende convertir movimientos financieros en información comprensible para apoyar decisiones de gasto.

## 1.6 Objetivo general

Diseñar e implementar una aplicación web de gestión financiera personal que permita registrar, centralizar, analizar y proyectar información económica para apoyar decisiones sobre gastos, presupuestos, metas y disponibilidad de dinero.

## 1.7 Alcance de la primera demo

La primera demo académica se concentra en un flujo de extremo a extremo:

1. Registrar ingresos y gastos.
2. Calcular el saldo líquido.
3. Configurar obligaciones pendientes.
4. Configurar una reserva de seguridad.
5. Calcular el dinero disponible.
6. Mostrar un resumen financiero sencillo.

La primera demo debe dejar clara la diferencia entre:

- **Saldo líquido:** dinero resultante de los ingresos y gastos registrados.
- **Dinero disponible:** cantidad aproximada que el usuario puede gastar después de descontar sus compromisos configurados.

## 1.8 Función diferencial del MVP

La función principal del MVP es calcular el dinero disponible para gastar.

La fórmula mínima para la primera demo es:

```text
dineroDisponibleMVP =
  saldoLiquido
  - obligacionesPendientes
  - reservaSeguridad
```

La intención es demostrar que **saldo** y **dinero disponible** no significan lo mismo.

---

# 2. Roles

## 2.1 Rol principal — Usuario de FinWise

### Descripción

Persona que administra directamente sus ingresos y gastos y quiere comprender cuánto dinero puede utilizar sin comprometer sus obligaciones.

### Perfil inicial

Para la primera validación, el rol corresponde principalmente a:

- estudiante universitario;
- joven profesional.

### Meta principal

> **Saber cuánto puede gastar en el periodo actual sin descuidar sus obligaciones y metas de ahorro.**

### Obstáculo principal

> **El saldo que ve en sus cuentas no refleja lo que realmente tiene disponible, porque debe considerar gastos, compromisos y reservas antes de tomar una decisión de compra.**

### Acciones principales dentro del MVP

El usuario podrá:

- registrar ingresos;
- registrar gastos;
- consultar su saldo líquido;
- registrar obligaciones pendientes;
- configurar una reserva de seguridad;
- consultar cuánto dinero tiene disponible para gastar;
- visualizar un resumen financiero;
- recibir una advertencia si su dinero disponible es negativo.

## 2.2 Decisión de alcance sobre roles

Para el MVP académico se utilizará **un solo rol funcional**.

No se incluye un rol de administrador, asesor financiero, banco u otro actor porque no es necesario para demostrar la propuesta de valor principal de la primera versión.

La separación entre múltiples usuarios mediante autenticación podrá incorporarse en una etapa posterior.

---

# 3. Historias de usuario

Las historias de usuario se agrupan bajo la épica **“Control financiero básico”**.

Cada historia utiliza el formato:

> **Como [rol], quiero [necesidad], para [beneficio].**

---

## HU-01 — Registrar un ingreso

**Como** usuario de FinWise,  
**quiero** registrar manualmente un ingreso,  
**para** mantener actualizada la información sobre el dinero que entra durante el periodo.

### Criterios de aceptación

1. Se cumple cuando el usuario puede ingresar un monto mayor que cero.
2. Se cumple cuando el movimiento puede registrarse como tipo **Ingreso**.
3. Se cumple cuando el ingreso queda almacenado correctamente.
4. Se cumple cuando los ingresos del periodo se actualizan después de guardar el movimiento.
5. Se cumple cuando el saldo líquido se recalcula después del registro.
6. Se cumple cuando un dato inválido genera un mensaje comprensible.

---

## HU-02 — Registrar un gasto

**Como** usuario de FinWise,  
**quiero** registrar manualmente un gasto,  
**para** conocer cuánto dinero he utilizado durante el periodo.

### Criterios de aceptación

1. Se cumple cuando el usuario puede ingresar un monto mayor que cero.
2. Se cumple cuando el movimiento puede registrarse como tipo **Gasto**.
3. Se cumple cuando el gasto queda almacenado correctamente.
4. Se cumple cuando los gastos del periodo se actualizan después de guardar el movimiento.
5. Se cumple cuando el saldo líquido se recalcula después del registro.
6. Se cumple cuando un dato inválido genera un mensaje comprensible.

---

## HU-03 — Consultar el resumen financiero

**Como** usuario de FinWise,  
**quiero** visualizar un resumen de mis ingresos, gastos y saldo líquido,  
**para** comprender rápidamente mi situación financiera actual.

### Criterios de aceptación

1. Se cumple cuando la interfaz muestra los ingresos del periodo.
2. Se cumple cuando la interfaz muestra los gastos del periodo.
3. Se cumple cuando la interfaz muestra el saldo líquido.
4. Se cumple cuando los valores cambian después de registrar movimientos.
5. Se cumple cuando los montos se presentan en COP con un formato consistente.
6. Se cumple cuando los estados sin información se muestran de forma comprensible.

---

## HU-04 — Registrar obligaciones pendientes

**Como** usuario de FinWise,  
**quiero** indicar cuánto dinero debo reservar para obligaciones pendientes,  
**para** evitar considerar ese dinero como disponible para gastar.

### Criterios de aceptación

1. Se cumple cuando el usuario puede registrar el valor de sus obligaciones pendientes.
2. Se cumple cuando el valor registrado no puede ser negativo.
3. Se cumple cuando las obligaciones se almacenan correctamente.
4. Se cumple cuando el dinero disponible se recalcula al modificar este valor.
5. Se cumple cuando la interfaz identifica claramente este monto como un compromiso.

---

## HU-05 — Configurar una reserva de seguridad

**Como** usuario de FinWise,  
**quiero** definir una reserva de seguridad,  
**para** conservar una parte de mi saldo fuera del dinero que puedo gastar.

### Criterios de aceptación

1. Se cumple cuando el usuario puede definir un valor de reserva igual o mayor que cero.
2. Se cumple cuando la reserva se almacena correctamente.
3. Se cumple cuando la reserva se descuenta al calcular el dinero disponible.
4. Se cumple cuando modificar la reserva actualiza el resultado mostrado.
5. Se cumple cuando la interfaz diferencia la reserva de los gastos y obligaciones.

---

## HU-06 — Saber cuánto dinero puedo gastar

**Como** estudiante universitario o joven profesional que administra sus finanzas,  
**quiero** saber cuánto dinero puedo gastar realmente,  
**para** tomar decisiones de compra sin comprometer mis obligaciones del periodo.

### Criterios de aceptación

1. Se cumple cuando el usuario registra al menos un ingreso y un gasto y el sistema actualiza el saldo líquido.
2. Se cumple cuando el usuario define obligaciones pendientes y una reserva de seguridad y estos valores se descuentan del saldo líquido.
3. Se cumple cuando el dinero disponible cambia automáticamente después de modificar información que afecte el cálculo.
4. Se cumple cuando un resultado negativo se muestra como una advertencia clara y no como dinero utilizable.
5. Se cumple cuando los valores monetarios se muestran en COP con formato consistente.
6. Se cumple cuando la interfaz diferencia explícitamente entre **saldo líquido** y **dinero disponible**.

### Caso de aceptación de ejemplo

```text
Saldo líquido:              $1.800.000
Obligaciones pendientes:      $600.000
Reserva de seguridad:         $200.000
---------------------------------------
Dinero disponible:          $1.000.000
```

La interfaz debe comunicar que el dinero disponible representa el monto aproximado que puede utilizarse sin tocar los compromisos configurados.

---

## HU-07 — Recibir advertencia por disponible negativo

**Como** usuario de FinWise,  
**quiero** recibir una advertencia cuando mi dinero disponible sea negativo,  
**para** saber que no debería considerar ese resultado como dinero que puedo gastar.

### Criterios de aceptación

1. Se cumple cuando el sistema detecta que el resultado del cálculo es menor que cero.
2. Se cumple cuando la interfaz presenta una advertencia clara.
3. Se cumple cuando el valor negativo no se presenta como dinero utilizable.
4. Se cumple cuando la advertencia desaparece o cambia al corregirse los datos que originaron el resultado.

---

# 4. Requisitos funcionales

Los requisitos funcionales describen **qué debe hacer el sistema**.

## RF-01 — Registrar ingresos

El sistema debe permitir al usuario registrar manualmente ingresos.

### Datos mínimos

- tipo de movimiento;
- monto;
- fecha;
- descripción opcional.

### Validaciones mínimas

- el monto debe ser mayor que cero;
- la fecha debe ser válida.

---

## RF-02 — Registrar gastos

El sistema debe permitir al usuario registrar manualmente gastos.

### Datos mínimos

- tipo de movimiento;
- monto;
- fecha;
- descripción opcional.

### Validaciones mínimas

- el monto debe ser mayor que cero;
- la fecha debe ser válida.

---

## RF-03 — Calcular saldo líquido

El sistema debe calcular el saldo líquido a partir de los movimientos registrados.

Para el MVP académico:

```text
saldoLiquido =
  ingresosRegistrados
  - gastosRegistrados
```

El resultado debe actualizarse cuando cambien los movimientos que intervienen en el cálculo.

---

## RF-04 — Registrar obligaciones pendientes

El sistema debe permitir configurar el valor de las obligaciones pendientes consideradas para el periodo actual.

El valor debe:

- ser igual o mayor que cero;
- quedar almacenado;
- participar en el cálculo del dinero disponible.

---

## RF-05 — Configurar reserva de seguridad

El sistema debe permitir al usuario configurar una reserva de seguridad.

El valor debe:

- ser igual o mayor que cero;
- almacenarse correctamente;
- descontarse del saldo líquido al calcular el dinero disponible.

---

## RF-06 — Calcular dinero disponible

El sistema debe calcular el dinero disponible para gastar mediante la regla:

```text
dineroDisponibleMVP =
  saldoLiquido
  - obligacionesPendientes
  - reservaSeguridad
```

El cálculo debe actualizarse cuando cambie cualquiera de sus componentes.

---

## RF-07 — Mostrar resumen financiero

El sistema debe mostrar como mínimo:

- ingresos del periodo;
- gastos del periodo;
- saldo líquido;
- obligaciones pendientes;
- reserva de seguridad;
- dinero disponible.

La interfaz debe diferenciar visual y conceptualmente el **saldo líquido** del **dinero disponible**.

---

## RF-08 — Mostrar advertencia por disponible negativo

Cuando:

```text
dineroDisponibleMVP < 0
```

el sistema debe mostrar una advertencia clara indicando que el usuario no debe interpretar ese resultado como dinero disponible para gastar.

---

## RF-09 — Actualizar automáticamente los cálculos

Cuando el usuario registre o modifique datos que afecten:

- ingresos;
- gastos;
- obligaciones pendientes;
- reserva de seguridad;

el sistema debe recalcular los indicadores dependientes.

---

## RF-10 — Formatear valores monetarios

El sistema debe mostrar los montos del MVP en pesos colombianos (**COP**) usando un formato consistente, por ejemplo:

```text
$1.250.000
```

---

## RF-11 — Validar entradas

El sistema debe validar los datos antes de almacenarlos.

Como mínimo:

- montos mayores que cero para ingresos y gastos;
- valores no negativos para compromisos y reserva;
- fechas válidas;
- tipos de movimiento válidos.

---

## RF-12 — Manejar estados vacíos

Cuando no existan datos suficientes, el sistema debe mostrar un estado vacío comprensible en lugar de dejar una pantalla sin contenido.

Ejemplo:

> Aún no tienes transacciones. Registra tu primer ingreso o gasto para comenzar a analizar tus finanzas.

---

## RF-13 — Manejar errores

Cuando una operación falle, el sistema debe mostrar un mensaje comprensible para el usuario.

Ejemplo:

> No pudimos guardar la transacción. Inténtalo nuevamente.

Los detalles técnicos no deben mostrarse directamente al usuario final.

---

# 5. Requisitos no funcionales

Los requisitos no funcionales describen **qué tan bien debe funcionar el sistema**.

Las seis categorías consideradas son:

1. rendimiento;
2. seguridad;
3. usabilidad;
4. disponibilidad;
5. escalabilidad;
6. mantenibilidad.

> **Nota académica:** los archivos base del proyecto describen estas cualidades, pero no fijan números concretos para todas ellas. Por eso, cuando aparece un valor cuantitativo en esta sección, se presenta como un **criterio verificable propuesto para la primera demo** y puede ajustarse si el profesor define otro umbral.

---

## RNF-01 — Rendimiento

Las operaciones principales del MVP deben responder con rapidez suficiente para una demostración fluida.

### Criterio verificable propuesto

- El registro de una transacción y la actualización del resumen deberían completarse en **máximo 3 segundos** en condiciones normales de la demo.
- La consulta del resumen financiero debería mostrarse en **máximo 3 segundos** en condiciones normales de uso.
- La lógica del cálculo de dinero disponible no debe requerir procesos perceptiblemente lentos para el usuario.

---

## RNF-02 — Seguridad

La información financiera debe tratarse como información sensible.

El sistema debe:

- validar todas las entradas;
- evitar almacenar contraseñas en texto plano;
- evitar guardar secretos o datos financieros sensibles en logs;
- usar variables de entorno para secretos;
- impedir que un usuario consulte información perteneciente a otro usuario cuando exista autenticación multiusuario.

### Criterios verificables

- **0 contraseñas** almacenadas en texto plano.
- **0 secretos o tokens** incluidos directamente en el repositorio.
- **0 credenciales bancarias** almacenadas en el MVP.
- Cuando exista autenticación, el **100% de las consultas de datos de usuario** debe comprobar la propiedad o autorización correspondiente.

---

## RNF-03 — Precisión monetaria

Aunque la precisión no aparece como una de las seis categorías visuales de la actividad, es una restricción transversal indispensable para FinWise.

El sistema debe:

- evitar `float` en cálculos monetarios críticos;
- mantener un formato monetario consistente;
- usar COP como moneda inicial;
- evitar redondeos intermedios innecesarios.

### Criterios verificables

- El **100% de los cálculos monetarios críticos** debe utilizar una representación segura para dinero.
- Los valores mostrados en el MVP deben usar un formato de moneda consistente.

---

## RNF-04 — Usabilidad

La interfaz debe ser clara y comprensible sin depender de instrucciones extensas.

El sistema debe:

- diferenciar claramente ingreso, gasto, saldo líquido y dinero disponible;
- mostrar errores con mensajes comprensibles;
- manejar estados vacíos;
- priorizar una interfaz sencilla;
- evitar terminología financiera innecesariamente técnica.

### Criterio verificable propuesto

En una prueba de uso, una persona nueva debería poder:

1. registrar un ingreso;
2. registrar un gasto;
3. configurar compromisos;
4. identificar su dinero disponible;

en **menos de 3 minutos**, con una explicación mínima del objetivo de la aplicación.

---

## RNF-05 — Disponibilidad

Los documentos base no establecen un porcentaje obligatorio de disponibilidad para el MVP académico.

Para efectos de una especificación verificable, se propone:

- que la aplicación desplegada esté disponible durante las sesiones de prueba y presentación;
- que una caída del servicio no produzca pérdida silenciosa de datos;
- que los errores de disponibilidad se comuniquen de forma comprensible.

### Criterio verificable propuesto para una versión desplegada

- Objetivo de **99% de disponibilidad mensual**, excluyendo mantenimiento programado.

Este valor puede ajustarse si el profesor establece otro requisito.

---

## RNF-06 — Escalabilidad

El diseño debe permitir que el sistema pueda crecer posteriormente a múltiples cuentas y grandes cantidades de transacciones sin reemplazar su estructura fundamental.

### Criterios verificables

- El modelo de datos debe permitir múltiples cuentas en futuras versiones.
- El sistema debe estar diseñado para manejar miles de transacciones.
- Las consultas deben poder optimizarse mediante índices, agregaciones o caché cuando el volumen crezca.

### Criterio cuantitativo propuesto

La arquitectura debería soportar al menos **10.000 transacciones asociadas a un usuario** sin requerir un rediseño fundamental del modelo de datos.

Este número se utiliza como referencia académica verificable y puede modificarse si se define otro volumen objetivo.

---

## RNF-07 — Mantenibilidad

El proyecto debe conservar una arquitectura modular y evitar mezclar la lógica financiera con los componentes de interfaz.

El sistema debe:

- utilizar TypeScript de forma estricta;
- mantener validaciones centralizadas;
- separar lógica financiera de la interfaz;
- usar módulos y funciones con responsabilidades claras;
- incluir pruebas para las reglas financieras importantes;
- documentar las reglas financieras relevantes.

### Criterios verificables

Antes de considerar una entrega terminada deben pasar correctamente:

```text
lint
typecheck
tests
build
```

Además:

- el **100% de la lógica financiera crítica** debe estar fuera de los componentes de interfaz;
- los cálculos financieros principales deben tener pruebas unitarias.

---

## RNF-08 — Compatibilidad

Aunque no es una de las seis categorías mostradas en la diapositiva, los documentos del proyecto también definen compatibilidad.

El sistema debe:

- funcionar como aplicación web;
- ser compatible con navegadores modernos;
- utilizar un diseño responsive;
- priorizar inicialmente escritorio para la primera demo.

---

## RNF-09 — Accesibilidad básica

La interfaz debe intentar aplicar buenas prácticas como:

- contraste suficiente;
- etiquetas en formularios;
- navegación por teclado;
- botones identificables;
- estados de foco;
- atributos de accesibilidad cuando corresponda.

---

# 6. Fuera de alcance

Esta sección define explícitamente lo que **no se implementará en la primera demo académica**.

El objetivo es evitar que el MVP crezca innecesariamente y asegurar que los tres Must principales queden completos y demostrables.

## 6.1 Funcionalidades que no se implementarán en el MVP

Quedan fuera de la primera versión:

- integración bancaria;
- ejecución de pagos;
- almacenamiento de credenciales bancarias;
- almacenamiento de números completos de tarjetas;
- administración avanzada de deudas;
- Financial Score;
- simulador financiero;
- importación CSV;
- reportes avanzados;
- asistente con inteligencia artificial;
- aplicación móvil;
- suscripciones avanzadas.

## 6.2 Funcionalidades que pueden implementarse después

Estas características aportan valor, pero no son necesarias para demostrar el MVP:

- edición y eliminación de transacciones;
- categorización de movimientos;
- presupuesto mensual;
- autenticación multiusuario;
- múltiples cuentas financieras;
- metas de ahorro;
- gráficas de gastos por categoría;
- proyección de fin de mes;
- detección de movimientos recurrentes;
- inicio de sesión con Google;
- alertas más avanzadas;
- comparación entre meses;
- recomendaciones personalizadas.

## 6.3 Justificación del recorte

El MVP académico debe demostrar de forma completa tres capacidades esenciales:

1. **Registrar manualmente ingresos y gastos.**
2. **Mostrar un resumen financiero básico.**
3. **Calcular y mostrar el dinero disponible para gastar después de descontar compromisos configurados.**

El propósito de esta decisión es evitar:

- confundir “mínimo” con “incompleto”;
- marcar todas las funciones como imprescindibles;
- construir módulos avanzados antes de validar la propuesta de valor;
- introducir bancos, pagos o IA demasiado pronto;
- presentar un proyecto demasiado grande para ser probado de extremo a extremo.

---

# Matriz de trazabilidad resumida

| Historia | Requisitos funcionales relacionados |
|---|---|
| HU-01 Registrar un ingreso | RF-01, RF-03, RF-09, RF-10, RF-11 |
| HU-02 Registrar un gasto | RF-02, RF-03, RF-09, RF-10, RF-11 |
| HU-03 Consultar el resumen financiero | RF-03, RF-07, RF-09, RF-10, RF-12 |
| HU-04 Registrar obligaciones pendientes | RF-04, RF-06, RF-09, RF-11 |
| HU-05 Configurar reserva de seguridad | RF-05, RF-06, RF-09, RF-11 |
| HU-06 Saber cuánto dinero puedo gastar | RF-03, RF-04, RF-05, RF-06, RF-07, RF-09, RF-10 |
| HU-07 Recibir advertencia por disponible negativo | RF-08, RF-09, RF-13 |

---

# Prueba de viabilidad del MVP

## ¿Se explica en una frase?

**Sí.**

> FinWise permite registrar movimientos básicos y estimar cuánto dinero puede gastar una persona sin comprometer obligaciones configuradas.

## ¿Puede probarlo un usuario en un dispositivo?

**Sí.**

La primera demo puede ejecutarse en un navegador de escritorio y mostrar un flujo completo de registro, cálculo y consulta.

## ¿Evita pagos y datos financieros altamente sensibles?

**Sí.**

La primera demo:

- no conecta bancos;
- no ejecuta pagos;
- no solicita credenciales bancarias;
- no almacena números completos de tarjetas;
- debe usar datos ficticios para la presentación.

## ¿Es razonable construirlo con el stack definido?

**Sí.**

El alcance requiere formularios, persistencia de datos, reglas financieras simples y una vista de resumen.

### Resultado

> **4/4 — El MVP académico es viable.**

---

# Checklist final de especificación

Antes de considerar este documento listo para entregar, debe cumplirse:

- [x] La visión explica el problema y para quién se resuelve.
- [x] El rol principal está definido.
- [x] Las historias de usuario indican **como / quiero / para**.
- [x] Las historias principales tienen criterios de aceptación.
- [x] Los requisitos funcionales son claros y están identificados individualmente.
- [x] El cálculo principal de dinero disponible está definido.
- [x] Los requisitos no funcionales cubren rendimiento.
- [x] Los requisitos no funcionales cubren seguridad.
- [x] Los requisitos no funcionales cubren usabilidad.
- [x] Los requisitos no funcionales cubren disponibilidad.
- [x] Los requisitos no funcionales cubren escalabilidad.
- [x] Los requisitos no funcionales cubren mantenibilidad.
- [x] Los requisitos medibles propuestos están identificados como propuestas cuando no provienen directamente de la documentación base.
- [x] El alcance de la primera demo está claramente separado de la evolución futura.
- [x] Lo que queda fuera de alcance está escrito explícitamente.
- [x] Una persona que no asistió a la explicación debería poder entender qué problema resuelve FinWise, qué debe hacer la primera versión y cómo comprobar que funciona.

---

# Resumen final

Los tres pilares principales de la especificación son:

### 1. Historias de usuario

Explican **quién necesita qué y para qué**.

### 2. Requisitos funcionales

Definen **qué debe hacer el sistema**.

### 3. Requisitos no funcionales

Definen **qué tan bien debe hacerlo**, incluyendo rendimiento, seguridad, usabilidad, disponibilidad, escalabilidad y mantenibilidad.

La funcionalidad que conecta estos tres pilares es:

> **Calcular y mostrar cuánto dinero puede gastar realmente el usuario sin comprometer sus obligaciones configuradas.**
