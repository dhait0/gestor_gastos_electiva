# FinWise — Requisitos resumidos

## 1. Requisitos funcionales principales

### Para el MVP académico

- registrar ingresos;
- registrar gastos;
- calcular saldo líquido;
- registrar obligaciones pendientes;
- configurar una reserva de seguridad;
- calcular dinero disponible para gastar;
- mostrar un resumen financiero;
- mostrar una advertencia si el disponible es negativo.

### Para la evolución del proyecto

- autenticación y administración de usuarios;
- cuentas financieras;
- categorías;
- edición y eliminación de transacciones;
- presupuestos mensuales;
- dashboard y gráficas;
- metas de ahorro;
- alertas;
- proyección de fin de mes;
- detección de movimientos recurrentes;
- suscripciones;
- deudas y estrategias de pago;
- simulaciones financieras.

## 2. Requisitos no funcionales

### Seguridad

- cada usuario solo puede consultar sus propios datos;
- las entradas deben validarse;
- no se deben almacenar contraseñas en texto plano;
- no se deben registrar secretos o datos financieros sensibles en logs.

### Precisión

- los cálculos monetarios no deben usar `float` para operaciones críticas;
- se debe mantener formato monetario consistente;
- la moneda inicial del proyecto es COP.

### Usabilidad

- la interfaz debe ser clara y comprensible sin instrucciones extensas;
- debe diferenciar saldo, gasto y dinero disponible;
- los errores deben mostrarse con mensajes comprensibles;
- las pantallas deben contemplar estados vacíos.

### Compatibilidad

- aplicación web para navegadores modernos;
- diseño responsive, priorizando inicialmente escritorio.

### Mantenibilidad

- arquitectura modular;
- validaciones centralizadas;
- lógica financiera separada de la interfaz;
- pruebas para reglas financieras importantes.

## 3. Regla financiera principal

Para el MVP:

```text
dineroDisponibleMVP =
  saldoLiquido
  - obligacionesPendientes
  - reservaSeguridad
```

En versiones posteriores el cálculo podrá incorporar metas comprometidas y pagos de deuda pendientes.

## 4. Definition of Done resumida

Una función se considera terminada cuando:

- funciona de extremo a extremo;
- tiene una interfaz usable;
- valida entradas;
- maneja errores;
- guarda la información correctamente;
- respeta permisos y seguridad;
- no rompe el build;
- tiene pruebas cuando contiene lógica financiera relevante.
