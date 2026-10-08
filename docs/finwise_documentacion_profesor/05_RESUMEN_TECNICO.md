# FinWise — Resumen técnico

## 1. Stack propuesto

### Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

### Backend

- Route Handlers o Server Actions de Next.js

### Base de datos

- PostgreSQL
- Prisma como ORM

### Autenticación

- Supabase Auth como opción preferida
- posibilidad de email/contraseña y Google OAuth

### Visualización

- Recharts para gráficas

### Despliegue

- Vercel para la aplicación
- Supabase o servicio PostgreSQL administrado para datos

## 2. Arquitectura

Se propone una arquitectura modular:

```text
Interfaz
   ↓
API / acciones del servidor
   ↓
Servicios de dominio
   ↓
Acceso a datos / ORM
   ↓
PostgreSQL
```

La lógica financiera no debe vivir directamente en componentes de interfaz.

## 3. Datos principales

Las entidades previstas para la evolución del sistema incluyen:

- usuario;
- cuenta financiera;
- transacción;
- categoría;
- presupuesto;
- meta;
- alerta;
- movimiento recurrente;
- suscripción;
- deuda.

Para la primera demo solo se necesita implementar el subconjunto mínimo que soporte transacciones, compromisos y cálculo de dinero disponible.

## 4. Criterios técnicos importantes

- TypeScript estricto;
- validación de entradas;
- autorización por usuario;
- precisión monetaria;
- lógica financiera en servicios de dominio;
- pruebas unitarias para los cálculos;
- variables de entorno para secretos;
- no almacenar credenciales bancarias.

## 5. Orden recomendado de construcción del MVP

1. modelo mínimo de datos;
2. registro de ingresos y gastos;
3. cálculo de saldo líquido;
4. registro de obligaciones y reserva;
5. cálculo de dinero disponible;
6. resumen visual;
7. manejo de errores y estados vacíos;
8. pruebas del cálculo;
9. demo con datos ficticios.
