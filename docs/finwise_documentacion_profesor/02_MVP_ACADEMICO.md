# FinWise — MVP académico

Este documento resume la actividad **“Del problema al MVP”** y define una primera versión pequeña, terminada, comprobable y viable.

## Paso 1 de 5 — Problema en una frase

> **Estudiantes universitarios y jóvenes profesionales tienen dificultad para saber cuánto dinero pueden gastar sin comprometer sus gastos necesarios y metas, porque sus ingresos, gastos y obligaciones no se interpretan en conjunto.**

La frase describe a quién le ocurre el problema, qué le ocurre y por qué resulta relevante, sin mencionar tecnología ni la solución.

## Paso 2 de 5 — Usuario, meta y obstáculo

### Usuario

> **Estudiante universitario o joven profesional que administra personalmente sus ingresos y gastos.**

### Meta

> **Saber cuánto puede gastar en el periodo actual sin descuidar sus obligaciones y metas de ahorro.**

### Obstáculo

> **El saldo que ve en sus cuentas no refleja lo que realmente tiene disponible, porque debe considerar gastos, compromisos y reservas antes de tomar una decisión de compra.**

## Paso 3 de 5 — Funciones y MoSCoW

Para esta primera demo se aplica una regla estricta: **máximo tres Must**.

### Must

1. Registrar manualmente ingresos y gastos.
2. Mostrar un resumen financiero básico con saldo líquido, ingresos y gastos del periodo.
3. Calcular y mostrar el dinero disponible para gastar después de descontar compromisos configurados.

### Should

- editar y eliminar transacciones;
- categorizar movimientos;
- presupuesto mensual básico;
- alerta cuando el disponible sea bajo o negativo;
- autenticación cuando la demo pase a múltiples usuarios.

### Could

- múltiples cuentas;
- metas de ahorro;
- gráficas por categoría;
- proyección de fin de mes;
- detección de movimientos recurrentes;
- inicio de sesión con Google.

### Won't for this MVP

- integración bancaria;
- ejecución de pagos;
- almacenamiento de credenciales bancarias;
- administración avanzada de deudas;
- Financial Score;
- simulador financiero;
- importación CSV;
- asistente con IA;
- aplicación móvil.

## Función principal del MVP

El Must diferencial es **calcular el dinero disponible para gastar**.

Para la primera demo:

```text
dineroDisponibleMVP =
  saldoLiquido
  - obligacionesPendientes
  - reservaSeguridad
```

El objetivo es dejar claro que **saldo** y **dinero disponible** no significan lo mismo.

## Paso 4 de 5 — Historia principal

> **Como estudiante universitario o joven profesional que administra sus finanzas, quiero saber cuánto dinero puedo gastar realmente, para tomar decisiones de compra sin comprometer mis obligaciones del periodo.**

### Criterios de aceptación

Se cumple cuando:

1. el usuario registra al menos un ingreso y un gasto y el saldo líquido se actualiza;
2. el usuario define obligaciones pendientes y una reserva de seguridad y estas se descuentan del saldo líquido;
3. el dinero disponible se actualiza cuando cambian los datos que afectan su cálculo;
4. un resultado negativo se muestra como advertencia y no como dinero utilizable;
5. los montos se muestran en COP con formato consistente;
6. la interfaz diferencia claramente entre saldo líquido y dinero disponible.

### Ejemplo

```text
Saldo líquido:             $1.800.000
Obligaciones pendientes:     $600.000
Reserva de seguridad:        $200.000
-------------------------------------
Dinero disponible:         $1.000.000
```

## Paso 5 de 5 — Prueba de viabilidad

- ¿Se explica en una frase? **Sí.**
- ¿Puede probarlo un usuario en un dispositivo? **Sí.**
- ¿Evita pagos y datos financieros altamente sensibles? **Sí.**
- ¿Es razonable construirlo con el stack definido y apoyo de IA? **Sí.**

**Resultado: 4/4.**

## Checklist

- [x] El problema cabe en una frase y no menciona la solución.
- [x] Usuario, meta y obstáculo están definidos.
- [x] Las funciones se priorizaron con MoSCoW.
- [x] Solo existen tres Must.
- [x] Hay una historia principal con criterios comprobables.
- [x] El alcance pasa la prueba de viabilidad.
