# FinWise — Índice de Documentación

> Mapa maestro de la documentación del proyecto.
>
> Estado: **Base documental lista para implementación**

---

# 1. Propósito

Este archivo indica qué documento consultar según el tipo de decisión que se esté tomando.

La documentación de FinWise se organiza para evitar que reglas de producto, arquitectura, datos, diseño e implementación queden mezcladas.

---

# 2. Estructura final recomendada

```text
contexto/
├── INDICE_DOCUMENTACION.md
├── FINWISE_CONTEXTO_MAESTRO.md
│
├── arquitectura/
│   ├── ARQUITECTURA_TECNICA.md
│   ├── MODELO_DATOS_Y_SEGURIDAD.md
│   └── adr/
│       ├── README.md
│       ├── ADR-001-STACK-Y-MONOLITO-MODULAR.md
│       ├── ADR-002-ACCESO-DATOS-Y-RLS.md
│       ├── ADR-003-PRECISION-MONETARIA.md
│       ├── ADR-004-LIMITES-SERVER-NEXTJS.md
│       ├── ADR-005-MOBILE-FIRST-Y-PWA.md
│       ├── ADR-006-CI-CD-VERCEL-GITHUB.md
│       └── ADR-007-MIGRACIONES-SUPABASE.md
│
├── producto/
│   └── CASOS_DE_USO_Y_FLUJOS.md
│
├── diseno/
│   ├── SISTEMA_DISENO_FINWISE.md
│   └── WIREFRAMES_Y_PANTALLAS.md
│
├── planificacion/
│   ├── BACKLOG_MVP.md
│   └── PLAN_IMPLEMENTACION_MVP.md
│
├── desarrollo/
│   └── CONVENCIONES_DESARROLLO.md
│
└── calidad/
    └── ESTRATEGIA_PRUEBAS.md
```

---

# 3. Orden de lectura recomendado

## Para entender FinWise

1. `FINWISE_CONTEXTO_MAESTRO.md`
2. `CASOS_DE_USO_Y_FLUJOS.md`

## Para implementar backend/datos

1. `ARQUITECTURA_TECNICA.md`
2. `MODELO_DATOS_Y_SEGURIDAD.md`
3. ADRs correspondientes
4. `CONVENCIONES_DESARROLLO.md`

## Para implementar UI

1. `SISTEMA_DISENO_FINWISE.md`
2. `WIREFRAMES_Y_PANTALLAS.md`
3. `CASOS_DE_USO_Y_FLUJOS.md`

## Para planificar trabajo

1. `BACKLOG_MVP.md`
2. `PLAN_IMPLEMENTACION_MVP.md`

## Para probar

1. `ESTRATEGIA_PRUEBAS.md`
2. criterios de aceptación del backlog;
3. reglas del modelo de datos;
4. casos de uso.

---

# 4. Jerarquía de autoridad

Cuando dos documentos parezcan entrar en conflicto:

```text
Seguridad / privacidad
↓
Integridad financiera
↓
FINWISE_CONTEXTO_MAESTRO
↓
MODELO_DATOS_Y_SEGURIDAD
↓
ARQUITECTURA_TECNICA + ADRs
↓
CASOS_DE_USO_Y_FLUJOS
↓
SISTEMA_DISENO_FINWISE
↓
WIREFRAMES_Y_PANTALLAS
↓
BACKLOG_MVP / PLAN_IMPLEMENTACION
↓
preferencia del desarrollador o agente
```

---

# 5. Qué documento modificar según el cambio

| Cambio | Documento principal |
|---|---|
| Nueva capacidad del producto | FINWISE_CONTEXTO_MAESTRO |
| Nueva regla financiera | FINWISE_CONTEXTO_MAESTRO / MODELO_DATOS |
| Cambio de tabla o relación | MODELO_DATOS_Y_SEGURIDAD |
| Cambio tecnológico importante | ADR + ARQUITECTURA_TECNICA |
| Nuevo flujo de usuario | CASOS_DE_USO_Y_FLUJOS |
| Cambio visual global | SISTEMA_DISENO_FINWISE |
| Cambio de layout/pantalla | WIREFRAMES_Y_PANTALLAS |
| Cambio de prioridad | BACKLOG_MVP |
| Cambio de secuencia técnica | PLAN_IMPLEMENTACION_MVP |
| Convención de código | CONVENCIONES_DESARROLLO |
| Cambio de cobertura/prueba | ESTRATEGIA_PRUEBAS |

---

# 6. Regla documental

No duplicar una regla completa en cinco documentos.

Preferir:

```text
definir una vez
+
referenciar desde los demás
```

---

# 7. Estado actual

La fase documental base se considera completa cuando estén presentes todos los archivos de este índice.

El siguiente paso después de esta fase es:

```text
Inicializar repositorio
↓
Configurar Next.js
↓
Configurar Supabase local/remoto
↓
Crear migraciones base
↓
Auth
↓
Primer vertical slice del MVP
```
