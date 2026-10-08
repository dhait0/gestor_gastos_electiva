# FinWise — Sistema de Diseño

> Sistema visual, de interacción y experiencia de FinWise.
>
> Ubicación recomendada: `contexto/diseno/SISTEMA_DISENO_FINWISE.md`
>
> Estado: **Aprobado como sistema de diseño base**
>
> Fecha de referencia: **7 de octubre de 2026**
>
> Depende de:
> - `contexto/FINWISE_CONTEXTO_MAESTRO.md`
> - `contexto/arquitectura/ARQUITECTURA_TECNICA.md`
> - `contexto/arquitectura/MODELO_DATOS_Y_SEGURIDAD.md`
> - `contexto/producto/CASOS_DE_USO_Y_FLUJOS.md`

---

# 1. Propósito

Este documento define la identidad visual y de interacción de **FinWise**.

Su objetivo es evitar que cada pantalla, módulo o agente de desarrollo tome decisiones visuales independientes.

Es la fuente de verdad para:

- estilo visual;
- color;
- tipografía;
- spacing;
- radius;
- sombras;
- glassmorphism;
- soft UI;
- navegación;
- componentes;
- charts;
- motion;
- responsive;
- mobile;
- PWA;
- accesibilidad;
- dark mode;
- estados;
- feedback;
- reglas para agentes de diseño y código.

Toda nueva pantalla debe reutilizar este sistema antes de introducir una variante visual.

---

# 2. Dirección visual

FinWise utilizará:

```text
Apple premium
+
Fintech premium
+
Soft luxury
+
Glassmorphism moderado
+
Soft UI sutil
+
Motion funcional
```

Distribución conceptual:

```text
Apple premium       60%
Fintech premium     25%
Soft luxury         15%
```

FinWise debe sentirse:

- limpio;
- refinado;
- confiable;
- moderno;
- ligero;
- táctil;
- fluido;
- financiero;
- premium;
- sencillo de comprender.

No debe sentirse:

- infantil;
- cripto;
- gaming;
- excesivamente futurista;
- neón;
- recargado;
- genérico de IA;
- como una plantilla SaaS sin identidad;
- como un dashboard bancario corporativo rígido.

---

# 3. Principio central

> **FinWise debe reducir la ansiedad financiera mediante claridad visual.**

La interfaz debe ayudar a responder:

- ¿Cuánto tengo?
- ¿Cuánto puedo gastar realmente?
- ¿En qué estoy gastando?
- ¿Qué compromisos tengo?
- ¿Estoy mejorando o empeorando?
- ¿Qué debo atender ahora?

---

# 4. Jerarquía financiera

FinWise diferencia:

```text
Saldo
≠
Dinero disponible
```

El principal KPI será:

> **Dinero disponible**

Jerarquía:

```text
1. Dinero disponible
2. Saldo líquido
3. Gastos / ingresos del periodo
4. Compromisos
5. Presupuestos
6. Metas
7. Tendencias / forecast
8. Insights
```

---

# 5. Identidad de marca

Nombre oficial:

```text
FinWise
```

Logo:

```text
Símbolo + wordmark FinWise
```

El símbolo debe funcionar de forma independiente como:

- app icon;
- favicon;
- avatar;
- loading mark;
- ícono PWA.

Características:

- simple;
- reconocible;
- legible a 16–32 px;
- sin detalles finos;
- funcional en light y dark;
- sin depender de texto.

Dirección:

```text
flujo
+
crecimiento
+
claridad
+
control
```

Evitar clichés como:

- `$`;
- monedas;
- billetes;
- cerditos;
- gráficos obvios;
- candados como símbolo principal.

---

# 6. App icon / PWA icon

Preparar:

```text
192x192
512x512
maskable
apple-touch-icon
favicon
```

Debe:

- usar el símbolo de marca;
- funcionar con máscara;
- evitar texto;
- mantener legibilidad en iOS y Android.

---

# 7. Iconografía

Sistema principal:

```text
Lucide
```

Complementar con iconos propios solo cuando:

- Lucide no represente bien el concepto;
- sea una acción o identidad exclusiva de FinWise;
- aporte claridad real.

Reglas:

- stroke consistente;
- no mezclar familias;
- tamaño UI común: 16–20 px;
- navegación: 18–22 px;
- no usar iconos sin función;
- acciones ambiguas deben tener texto.

---

# 8. Paleta principal

## Primary

Color principal:

```text
#2563EB
```

Escala:

```text
blue-50   #EFF6FF
blue-100  #DBEAFE
blue-200  #BFDBFE
blue-300  #93C5FD
blue-400  #60A5FA
blue-500  #3B82F6
blue-600  #2563EB
blue-700  #1D4ED8
blue-800  #1E40AF
blue-900  #1E3A8A
blue-950  #172554
```

---

# 9. Acento cyan

Principal:

```text
#06B6D4
```

Escala útil:

```text
cyan-50   #ECFEFF
cyan-100  #CFFAFE
cyan-300  #67E8F9
cyan-400  #22D3EE
cyan-500  #06B6D4
cyan-600  #0891B2
cyan-700  #0E7490
```

Uso:

- highlights;
- charts;
- indicadores;
- estados activos;
- detalles de marca;
- gradientes especiales.

No usar como color dominante de toda la app.

---

# 10. Gradiente de marca

Uso restringido:

```css
linear-gradient(
  135deg,
  #2563EB 0%,
  #3B82F6 48%,
  #06B6D4 100%
)
```

Permitido en:

- card protagonista;
- CTA excepcional;
- estados especiales;
- elementos de marca.

No usar en todos los botones.

---

# 11. Colores semánticos

Success:

```text
#16A34A
```

Warning:

```text
#D97706
```

Danger:

```text
#DC2626
```

Info:

```text
#2563EB
```

Fondos suaves:

```text
success-bg  #F0FDF4
warning-bg  #FFFBEB
danger-bg   #FEF2F2
```

Siempre combinar:

```text
color
+
icono
+
texto
```

---

# 12. Light theme

```text
background          #F4F7FB
surface             #FFFFFF
surface-secondary   #F8FAFC
text-primary        #0F172A
text-secondary      #475569
text-tertiary       #64748B
border              rgba(15,23,42,.08)
divider             rgba(15,23,42,.06)
```

Fondo ambiental:

```css
background:
  radial-gradient(
    circle at 10% 5%,
    rgba(37,99,235,.06),
    transparent 34%
  ),
  radial-gradient(
    circle at 90% 10%,
    rgba(6,182,212,.035),
    transparent 28%
  ),
  #F4F7FB;
```

Regla:

> Se debe percibir profundidad, no blobs.

---

# 13. Dark theme

Usar azul-negro profundo.

```text
background          #0B1220
surface             #111827
surface-elevated    #172033
surface-subtle      #0F172A
text-primary        #F8FAFC
text-secondary      #CBD5E1
text-tertiary       #94A3B8
border              rgba(255,255,255,.08)
divider             rgba(255,255,255,.06)
```

No usar negro puro como fondo principal.

Fondo ambiental:

```css
background:
  radial-gradient(
    circle at 12% 0%,
    rgba(37,99,235,.12),
    transparent 30%
  ),
  radial-gradient(
    circle at 88% 8%,
    rgba(6,182,212,.06),
    transparent 24%
  ),
  #0B1220;
```

---

# 14. Tipografía

Headings:

```text
Manrope
```

UI y datos:

```text
Geist
```

Usos de Manrope:

- títulos;
- onboarding;
- hero text;
- empty states destacados.

Usos de Geist:

- navegación;
- botones;
- tablas;
- formularios;
- métricas;
- datos financieros.

---

# 15. Números financieros

Utilizar:

```css
font-variant-numeric: tabular-nums;
```

Esto evita saltos visuales al cambiar valores.

---

# 16. Escala tipográfica

```text
xs      12 / 16
sm      14 / 20
base    16 / 24
lg      18 / 28
xl      20 / 30
2xl     24 / 32
3xl     30 / 38
4xl     36 / 44
5xl     48 / 56
```

Hero KPI:

```text
36–48 px desktop
32–40 px mobile
```

Pesos:

```text
400 regular
500 medium
600 semibold
700 bold
```

Evitar abuso de 800/900.

---

# 17. Spacing

Base 4 px:

```text
1   4px
2   8px
3   12px
4   16px
5   20px
6   24px
8   32px
10  40px
12  48px
16  64px
20  80px
```

Reglas:

- controles internos: 8–16 px;
- elementos relacionados: 8–12 px;
- bloques: 20–32 px;
- secciones principales: 32–48 px.

---

# 18. Radius

Desktop:

```text
input          12px
button         14px
small-card     16px
card           20px
large-card     24px
modal          24px
popover        16px
```

Mobile:

```text
input          14px
button         16px
card           22px
large-card     26px
sheet-top      28px
```

Mobile será ligeramente más redondeado que desktop.

---

# 19. Shadows

Soft:

```css
0 1px 2px rgba(15,23,42,.04),
0 6px 18px rgba(15,23,42,.05)
```

Elevated:

```css
0 10px 30px rgba(15,23,42,.08)
```

Floating:

```css
0 18px 50px rgba(15,23,42,.12)
```

Dark mode debe apoyarse más en border/luminancia y menos en sombra.

---

# 20. Glassmorphism

Nivel oficial:

```text
2 — Premium moderado
```

No usar glass en todas las superficies.

Light:

```css
background: rgba(255,255,255,.68);
backdrop-filter: blur(20px) saturate(140%);
-webkit-backdrop-filter: blur(20px) saturate(140%);
border: 1px solid rgba(255,255,255,.66);
box-shadow:
  0 10px 30px rgba(15,23,42,.07),
  inset 0 1px 0 rgba(255,255,255,.6);
```

Dark:

```css
background: rgba(17,24,39,.64);
backdrop-filter: blur(22px) saturate(135%);
-webkit-backdrop-filter: blur(22px) saturate(135%);
border: 1px solid rgba(255,255,255,.08);
box-shadow:
  0 18px 42px rgba(0,0,0,.22),
  inset 0 1px 0 rgba(255,255,255,.04);
```

Se permite un tinte azul muy sutil.

---

# 21. Dónde usar glass

Permitido:

- sidebar flotante;
- bottom navigation;
- modal/sheet especial;
- card protagonista;
- command palette;
- overlays;
- paneles flotantes.

Evitar:

- todas las cards;
- todas las tablas;
- todos los inputs;
- todas las filas.

---

# 22. Soft UI

Usar profundidad soft, no neumorfismo clásico.

Permitido:

- switches;
- segmented controls;
- botones secundarios;
- cards importantes;
- progress;
- selectores compactos.

Evitar:

- bajo contraste;
- superficies "grabadas";
- sombras internas fuertes;
- controles que parezcan disabled.

---

# 23. Desktop layout

Densidad:

```text
Balanced
```

Estructura:

```text
floating sidebar
+
main content
```

Ancho máximo aproximado:

```text
1440px
```

No expandir contenido indefinidamente en monitores grandes.

---

# 24. Sidebar desktop

Tipo:

```text
Floating glass + collapsible
```

Expandida:

```text
248–272px
```

Colapsada:

```text
72–80px
```

Margen exterior:

```text
16–20px
```

Radius:

```text
22–24px
```

Navegación:

```text
FinWise
────────────
Dashboard
Transacciones
Presupuestos
Metas
Alertas
────────────
Configuración
Perfil
```

Posteriormente:

```text
Suscripciones
Deudas
Reportes
```

---

# 25. Mobile como experiencia principal

Regla oficial:

> **Mobile es igual o más importante que desktop.**

FinWise no será desktop encogido.

Toda feature principal debe revisarse en:

```text
mobile
+
desktop
```

antes de considerarse terminada.

---

# 26. Breakpoints

Estrategia mobile-first:

```text
sm   640px
md   768px
lg   1024px
xl   1280px
2xl  1536px
```

Los componentes también deben responder al espacio disponible, no solo a breakpoints.

---

# 27. Safe areas

Aplicar:

```css
padding-bottom: env(safe-area-inset-bottom);
padding-top: env(safe-area-inset-top);
```

Especialmente en:

- bottom navigation;
- sheets;
- fullscreen mobile views.

---

# 28. Bottom navigation móvil

Tipo:

```text
Floating glass
```

Estructura:

```text
Inicio
Movimientos
+
Metas
Más
```

Debe:

- flotar ligeramente;
- respetar safe area;
- permitir uso con una mano;
- no tapar contenido;
- mantener contraste.

---

# 29. Botón central `+`

Función:

```text
Quick Create
```

Puede usar:

- primary blue;
- gradiente de marca moderado;
- sombra suave;
- micro spring.

Debe destacar sin sentirse ajeno al sistema.

---

# 30. Quick Create Sheet

Al tocar `+`:

```text
¿Qué quieres registrar?

Gasto
Ingreso
Transferencia
Obligación
```

`Gasto` va primero y ligeramente priorizado por frecuencia.

La prioridad se expresa con:

- posición;
- icono;
- peso visual leve.

No con un bloque exagerado.

---

# 31. Mobile interaction model

Debe sentirse cercana a app nativa mediante:

- bottom sheets;
- safe areas;
- touch feedback;
- press states;
- scroll natural;
- controles amplios;
- navegación clara;
- gestures limitados;
- transiciones direccionales suaves.

---

# 32. Gestos

V1:

Permitido:

- swipe para cerrar sheets;
- drag handle;
- scroll natural.

No usar inicialmente:

```text
swipe to delete
swipe to edit
```

sobre movimientos financieros.

---

# 33. PWA

FinWise será PWA desde el MVP.

Debe incluir:

```text
web app manifest
app icons
maskable icon
apple-touch-icon
standalone display
theme colors
safe areas
installable behavior
```

Modo:

```text
display: standalone
```

La app también debe funcionar perfectamente como web normal.

---

# 34. PWA offline

No prometer operación financiera completa offline en MVP.

Se puede cachear con prudencia:

- app shell;
- assets;
- recursos estáticos.

No cachear indiscriminadamente datos financieros sensibles.

La escritura offline requiere diseño específico futuro.

---

# 35. Card protagonista — Dinero disponible

Es el componente más importante del dashboard.

Debe mostrar:

```text
Disponible
$X

Saldo
Compromisos
Reserva

Estado / insight breve
```

Ejemplo:

```text
╭──────────────────────────────╮
│ Disponible                   │
│                              │
│ $2.150.000                   │
│                              │
│ Saldo             $4.850.000 │
│ Compromisos      -$2.200.000 │
│ Reserva            -$500.000 │
│                              │
│ ● Situación estable           │
╰──────────────────────────────╯
```

Estilo:

```text
glass
+
gradient ambiental
+
soft depth
+
primary/cyan accents
```

El número debe conservar máximo contraste.

---

# 36. Dashboard móvil

Patrón:

```text
Header
   ↓
Available-to-spend hero
   ↓
Ingresos / Gastos
   ↓
Chart
   ↓
Alertas / Insights
   ↓
Movimientos recientes
```

No mostrar demasiados KPIs pequeños en una sola fila.

---

# 37. Dashboard desktop

Patrón:

```text
Header
↓
Available-to-spend hero + secondary KPIs
↓
Cash flow chart + budget / commitments
↓
Recent activity + insights
```

Mantener densidad equilibrada.

---

# 38. KPIs

KPIs secundarios:

- saldo líquido;
- ingresos;
- gastos;
- ahorro;
- compromisos.

Cada KPI:

```text
label
value
context/trend
```

Evitar iconos gigantes decorativos.

---

# 39. Registro rápido de gasto

En mobile usar una sola pantalla visual:

```text
¿Cuánto gastaste?

$ 25.000

Categoría    Alimentación
Cuenta       Nequi
Fecha        Hoy
Nota         Almuerzo

Registrar gasto
```

El monto recibe el primer foco.

---

# 40. Formularios

Reglas:

- labels visibles;
- errores inline;
- helper text solo si aporta;
- focus visible;
- autocomplete correcto;
- placeholder no sustituye label.

Alturas:

```text
44–48px desktop
48–52px mobile
```

---

# 41. Inputs monetarios

Deben:

- formatear sin dificultar edición;
- soportar COP;
- mantener precisión;
- mostrar moneda claramente;
- evitar confusión entre `.` y `,`.

La lógica interna no debe depender del string visual.

---

# 42. Buttons

Primary:

```text
#2563EB
```

Hover:

- ligera elevación;
- cambio sutil de luminancia.

Press:

```text
scale ≈ 0.98
```

CTA especial:

usar gradiente azul→cyan solo en acciones protagonistas.

Variantes mínimas:

```text
primary
secondary
outline
ghost
destructive
link
```

---

# 43. Cards

Standard:

- surface sólida;
- border sutil;
- shadow mínima;
- radius 20 px.

Elevated:

- más profundidad;
- para contexto importante.

Glass:

- solo elementos especiales.

Interactive:

- hover;
- focus;
- press.

No hacer todas las cards flotantes.

---

# 44. Modals y sheets

Desktop:

```text
dialog / modal
```

Mobile:

preferir:

```text
bottom sheet
```

cuando tenga sentido.

Los formularios largos pueden usar pantalla completa móvil.

---

# 45. Charts

Dirección:

```text
Apple Health minimalism
+
Fintech detail on interaction
```

Por defecto:

- limpio;
- pocos labels;
- curva suave;
- área degradada sutil.

En interacción:

- tooltip;
- punto activo;
- detalle exacto.

---

# 46. Line / area charts

Preferencia:

```text
smooth line
+
subtle gradient area
```

No abusar de draw animations.

---

# 47. Ingresos vs gastos

Patrón:

```text
metric + sparkline
metric + sparkline
+
chart comparison
```

Ejemplo:

```text
Ingresos
$5.200.000
+12%
sparkline

Gastos
$2.900.000
-3%
sparkline
```

---

# 48. Chart colors

```text
Primary     #2563EB
Cyan        #06B6D4
Success     #16A34A
Warning     #D97706
Danger      #DC2626
Slate       #64748B
```

No usar demasiados colores simultáneamente.

Para muchas categorías:

- limitar Top N;
- agrupar resto;
- mantener paleta coherente.

---

# 49. Tooltips

Tooltips de charts:

- flotantes;
- compactos;
- glass ligero;
- tabular-nums;
- fecha clara;
- alto contraste.

---

# 50. Alertas e insights

Usar una mezcla de:

```text
semantic alert cards
+
FinWise Insights
```

Alert card:

```text
Presupuesto casi al límite

Has utilizado
$425.000 de $500.000

Ver presupuesto
```

Insight:

```text
FinWise Insight

Tus gastos en restaurantes
subieron 18% esta semana.

Ver detalle →
```

---

# 51. Voz de producto

Dirección:

```text
cercana
+
corta
+
elegante
+
clara
```

Ejemplo:

> Tu presupuesto de alimentación está casi al límite.

Debajo:

> Has utilizado $425.000 de $500.000.

Evitar lenguaje alarmista o infantil.

---

# 52. Emojis

Uso mínimo.

Permitidos principalmente en:

- onboarding;
- estados vacíos puntuales;
- comunicaciones ligeras.

No usar como sistema principal de iconografía.

---

# 53. Motion — filosofía

> **La animación debe explicar el cambio de estado.**

Usar movimiento para:

- continuidad;
- orientación;
- feedback;
- jerarquía;
- cambios de datos.

---

# 54. Motion — timing

```text
micro interaction    140–180ms
hover                150–180ms
small reveal         180–240ms
page content         220–300ms
modal/sheet          240–340ms
sidebar              spring
counter              350–500ms
chart reveal         450–650ms
```

Nunca retrasar una operación por animación decorativa.

---

# 55. Easing

CSS:

```text
cubic-bezier(.2,.8,.2,1)
```

Usar springs suaves para:

- sheets;
- sidebar;
- switches;
- layout changes.

Evitar bounce exagerado.

---

# 56. Page transitions

Base:

```text
opacity 0 → 1
translateY 6px → 0
```

Duración:

```text
220–280ms
```

Mobile puede usar pequeños cambios direccionales cuando expliquen navegación.

---

# 57. Card reveal

```text
opacity
+
translateY 6–8px
```

Stagger:

```text
40–60ms
```

No aplicar stagger a listas largas.

---

# 58. Press feedback

Controles:

```text
scale 1 → 0.98
```

Cards:

```text
scale 1 → 0.995
```

Debe sentirse, no llamar la atención.

---

# 59. Animación de números

Preferencia:

```text
digit morph
```

Fallback:

```text
counter animation
```

Reglas:

- `tabular-nums`;
- animar solo al cambiar;
- no reiniciar en cada render;
- respetar reduced motion.

---

# 60. Progress bars

Animación suave al cargar/cambiar.

Estados:

```text
normal
warning
high
exceeded
```

Siempre color + texto.

---

# 61. Skeletons y loading

Skeleton:

- suave;
- shimmer mínimo.

Loading de acciones:

- botón pending;
- spinner pequeño;
- prevención de doble submit.

Evitar spinner central para toda la app salvo necesidad.

---

# 62. Toasts

Usar para:

- confirmación;
- error global;
- acción completada.

No usar para errores de campo.

Tono:

```text
Transacción registrada
```

---

# 63. Estados obligatorios

Todo módulo de datos debe contemplar:

```text
loading
empty
success
warning
error
disabled
partial data
no permission
retry
```

---

# 64. Empty states

Deben:

- explicar;
- orientar;
- ofrecer próxima acción.

Ejemplo:

> Aún no tienes movimientos.

> Registra tu primer ingreso o gasto para empezar a entender tus finanzas.

---

# 65. Tables desktop

Reglas:

- headers discretos;
- filas cómodas;
- montos a la derecha;
- tabular-nums;
- hover sutil;
- acciones secundarias discretas.

---

# 66. Lists mobile

No convertir tablas en mini-tablas horizontales.

Transformar cada registro en:

```text
Icono + descripción
Categoría / fecha
Monto
```

---

# 67. Segmented controls

Adecuados para:

```text
Ingreso | Gasto | Transferencia
```

y:

```text
Semana | Mes | Año
```

Usar soft UI sutil + indicador animado.

---

# 68. Switches

Estilo inspirado en iOS:

- spring suave;
- estados claros;
- accesibles;
- no depender solo del color.

---

# 69. Focus

Todo elemento interactivo debe mostrar focus visible.

Referencia:

```text
2px primary ring
+
offset
```

No eliminar outline sin reemplazo.

---

# 70. Accesibilidad

Objetivo mínimo:

```text
WCAG AA
```

Buscar AAA donde sea razonable en:

- montos críticos;
- texto financiero principal;
- estados de riesgo;
- contenido esencial.

---

# 71. Reduced Motion

Respetar:

```css
@media (prefers-reduced-motion: reduce)
```

Reducir o eliminar:

- springs;
- counters;
- chart animations;
- page movement;
- stagger.

---

# 72. Glass y accesibilidad

Glass nunca puede reducir el contraste por debajo de lo necesario.

Si ocurre:

- aumentar opacidad;
- reducir transparencia;
- cambiar surface.

Legibilidad gana sobre estética.

---

# 73. Rendimiento de blur

En dispositivos modestos:

- reducir blur;
- reducir saturate;
- usar surfaces más sólidas.

El sistema debe degradar visualmente con elegancia.

---

# 74. Touch targets

Mínimo:

```text
44x44px
```

Preferido mobile:

```text
48x48px
```

No juntar acciones críticas demasiado.

---

# 75. Dark mode

Opciones:

```text
Light
Dark
System
```

Default:

```text
System
```

Persistir elección.

Evitar flash del tema incorrecto.

---

# 76. Light / dark parity

Todo nuevo componente debe diseñarse en:

```text
light
+
dark
```

No aceptar colores hardcoded que solo funcionen en un tema.

---

# 77. Design tokens

Centralizar mediante:

```text
CSS variables
+
Tailwind theme
```

No repetir hex arbitrarios dentro de componentes.

Tokens conceptuales:

```css
--background
--foreground

--surface
--surface-elevated
--surface-glass

--primary
--primary-foreground
--accent

--success
--warning
--danger

--border
--divider

--shadow-soft
--shadow-elevated
--shadow-floating

--radius-sm
--radius-md
--radius-lg
--radius-xl

--motion-fast
--motion-normal
--motion-slow
```

---

# 78. shadcn/ui

shadcn/ui será base, no resultado final.

Regla:

> No dejar componentes con apariencia default si contradicen FinWise.

Personalizar mediante:

- tokens;
- variants;
- radius;
- spacing;
- Motion;
- typography.

No copiar el componente por pantalla para cambiarlo.

---

# 79. Radix UI

Usar primitivas accesibles cuando shadcn las encapsule o sean necesarias.

No reemplazar comportamiento accesible probado por soluciones visuales ad hoc.

---

# 80. Motion

Librería principal:

```text
Motion
```

Crear presets compartidos:

```text
fadeIn
pageEnter
cardEnter
sheetSpring
modalScale
staggerContainer
press
```

No definir un lenguaje de animación diferente por pantalla.

---

# 81. Recharts

Envolver en componentes FinWise:

```text
CashFlowChart
CategorySpendingChart
BudgetProgressChart
SavingsTrendChart
Sparkline
```

No configurar estilos completamente nuevos en cada página.

---

# 82. ui-ux-pro-max

Puede utilizarse como asistente de diseño.

Orden de autoridad:

```text
FinWise context
        ↓
FinWise design system
        ↓
ui-ux-pro-max recommendations
        ↓
agent preference
```

Si una recomendación contradice este documento, prevalece FinWise.

---

# 83. Prompt base para ui-ux-pro-max

```text
Diseña esta experiencia para FinWise.

Antes de proponer UI:
1. Lee FINWISE_CONTEXTO_MAESTRO.md.
2. Lee ARQUITECTURA_TECNICA.md cuando sea relevante.
3. Lee CASOS_DE_USO_Y_FLUJOS.md.
4. Lee SISTEMA_DISENO_FINWISE.md.

Respeta:
- Apple premium;
- fintech premium;
- light + dark;
- primary #2563EB;
- cyan solo como acento;
- glassmorphism moderado;
- soft UI sutil;
- Manrope para headings;
- Geist para UI y números;
- mobile igual o más importante que desktop;
- bottom navigation glass móvil;
- sidebar glass flotante desktop;
- Motion funcional;
- accesibilidad;
- alta legibilidad.

Evita:
- dashboard SaaS genérico;
- gradientes morado/rosa;
- exceso de glass;
- glow;
- neumorfismo extremo;
- animaciones decorativas constantes;
- low contrast;
- interfaces demasiado densas.
```

---

# 84. Orden de diseño de una pantalla

1. identificar caso de uso;
2. identificar acción principal;
3. identificar dato principal;
4. definir empty;
5. definir loading;
6. definir error;
7. diseñar mobile;
8. diseñar desktop;
9. validar dark;
10. validar accesibilidad;
11. agregar Motion;
12. revisar performance.

---

# 85. Anti-patterns

No utilizar:

- gradientes morado/rosa genéricos;
- blobs intensos;
- glows grandes;
- glass en todo;
- cards dentro de cards sin necesidad;
- neumorfismo extremo;
- texto gris demasiado claro;
- sidebar excesiva;
- loops de animación;
- iconos 3D;
- exceso de badges;
- emojis como sistema de iconos;
- sombras fuertes;
- borders gruesos;
- charts saturados;
- donut para todo;
- botones de gradiente por todas partes.

---

# 86. Diseño financiero responsable

No utilizar visuales que:

- oculten riesgo;
- minimicen deuda;
- hagan parecer crédito como efectivo;
- presenten forecast como certeza;
- celebren gasto excesivo;
- manipulen emocionalmente.

Claridad financiera > engagement.

---

# 87. Mobile MVP screens

Diseñar primero:

```text
Splash / launch
Login
Registro
Onboarding
Dashboard
Quick Create
Nuevo gasto
Nuevo ingreso
Nueva obligación
Movimientos
Detalle movimiento
Más / configuración
```

---

# 88. Desktop MVP screens

Diseñar:

```text
Login
Registro
Onboarding
Dashboard
Transactions
Transaction form/modal
Obligations
Settings
```

---

# 89. Navegación mobile

```text
Inicio
Movimientos
+
Metas
Más
```

Mientras Metas no esté implementado en el MVP académico, no presentar un módulo falso como funcional.

---

# 90. Menú "Más"

Puede contener:

```text
Presupuestos
Obligaciones
Alertas
Cuentas
Configuración
Tema
Perfil
Cerrar sesión
```

Evoluciona según módulos disponibles.

---

# 91. Header mobile

Debe ser minimalista.

Puede incluir:

- greeting/context;
- avatar;
- notificaciones.

No consumir demasiado alto.

---

# 92. Header desktop

Puede incluir:

- título;
- periodo;
- CTA contextual;
- nueva transacción;
- perfil/notificaciones.

No duplicar la sidebar.

---

# 93. Nueva transacción desktop

CTA visible:

```text
+ Nueva transacción
```

Puede abrir modal/drawer.

El FAB se reserva principalmente para móvil.

---

# 94. Mobile bottom sheet

Debe incluir:

- drag handle;
- top radius 28 px;
- safe area;
- light/dark;
- blur si rendimiento lo permite;
- cierre por swipe;
- cierre accesible;
- focus management.

---

# 95. Semantic financial status

Estados:

```text
Healthy
Attention
Risk
Information
```

Representar mediante:

```text
icon
+
label
+
semantic color
```

---

# 96. Negative / positive values

No pintar automáticamente todo valor negativo en rojo.

Ejemplo:

```text
-$500.000 obligaciones
```

puede ser texto secundario dentro de un desglose.

Usar danger cuando exista riesgo real.

No pintar todo ingreso de verde brillante.

---

# 97. Formato monetario

COP:

```text
$1.250.000
```

Añadir `COP` cuando pueda existir ambigüedad.

En multimoneda futura mostrar código.

---

# 98. Data hierarchy

Ejemplo:

```text
Disponible
$2.150.000
+$120.000
vs mes anterior
```

Label → value → context.

---

# 99. Gutters

Mobile:

```text
16px mínimo
20px preferido
```

Desktop:

```text
24–32px
```

---

# 100. Accessibility checklist

Antes de aprobar una pantalla:

- [ ] contraste;
- [ ] focus;
- [ ] labels;
- [ ] teclado;
- [ ] touch targets;
- [ ] reduced motion;
- [ ] screen reader labels;
- [ ] chart alternative;
- [ ] errores no dependen de color;
- [ ] orden lógico;
- [ ] dark mode.

---

# 101. Chart accessibility

Todo chart importante debe tener:

- título;
- descripción;
- valores clave en texto;
- tooltip;
- resumen cuando aplique.

---

# 102. Performance visual

> Fluidez primero, efectos después.

Si blur o animation degrada:

- scroll;
- input latency;
- sheets;
- interacciones;

reducir el efecto.

---

# 103. Progressive enhancement visual

Base:

```text
surface sólida
+
border
+
shadow suave
```

Mejora:

```text
backdrop blur
+
transparency
+
motion avanzada
```

FinWise debe seguir viéndose bien sin efectos avanzados.

---

# 104. Design QA

Revisar al menos:

```text
390px mobile
768px tablet
1280px desktop
1440px desktop
```

en:

```text
light
dark
```

Mobile:

- safe area;
- bottom nav;
- teclado;
- forms;
- sheets;
- scroll;
- texto ampliado;
- touch targets.

Desktop:

- sidebar expandida;
- sidebar colapsada;
- tablas;
- filtros;
- teclado.

---

# 105. Definition of Done visual

Una pantalla está terminada cuando:

- respeta tokens;
- funciona light/dark;
- funciona mobile/desktop;
- soporta estados;
- no usa colores arbitrarios;
- reutiliza componentes;
- Motion tiene propósito;
- reduced motion funciona;
- cumple accesibilidad;
- mobile no es afterthought;
- performance es fluida;
- el dato principal es evidente.

---

# 106. Prioridad de implementación visual

```text
1. Tokens
2. Fonts
3. Theme light/dark
4. Base surfaces
5. Buttons / inputs
6. Sidebar desktop
7. Bottom nav mobile
8. Modal / sheet
9. Cards
10. Available hero
11. Forms
12. Charts
13. Tables/lists
14. Alerts
15. Motion presets
16. PWA polish
```

---

# 107. Componentes base

```text
AppShell
DesktopSidebar
MobileBottomNav
MobileQuickCreate
PageHeader

FinWiseCard
GlassCard
MetricCard
AvailableToSpendCard

Button
Input
MoneyInput
Select
DatePicker
SegmentedControl
Switch
Progress

Dialog
BottomSheet
Popover
Dropdown

TransactionList
TransactionTable
TransactionRow

FinancialAlert
FinWiseInsight
EmptyState
ErrorState
Skeleton

CashFlowChart
SpendingChart
BudgetProgress
Sparkline
```

Preferir extender shadcn antes de crear primitivas nuevas.

---

# 108. Tokens de motion

```text
--motion-instant: 120ms
--motion-fast:    160ms
--motion-normal:  240ms
--motion-slow:    320ms
--motion-data:    500ms
```

---

# 109. Tokens de radius

```text
--radius-input:   12px
--radius-button:  14px
--radius-card:    20px
--radius-large:   24px
--radius-sheet:   28px
```

Mobile puede elevar algunos valores.

---

# 110. Tokens de glass

```text
--glass-bg
--glass-border
--glass-blur
--glass-saturation
--glass-shadow
```

No hardcodear glass en múltiples archivos.

---

# 111. Dashboard desktop conceptual

```text
╭──────────────╮  ┌──────────────────────────────────────────────┐
│ FinWise      │  │ Buenos días                                 │
│              │  │                                              │
│ Inicio       │  │ ╭──────────────────────────────────────────╮ │
│ Movimientos  │  │ │ Disponible                               │ │
│ Presupuesto  │  │ │ $2.150.000                               │ │
│ Metas        │  │ ╰──────────────────────────────────────────╯ │
│ Alertas      │  │                                              │
│              │  │ ╭──────────╮ ╭──────────╮ ╭──────────────╮ │
│              │  │ │ Saldo    │ │ Ingresos │ │ Gastos       │ │
│ Config       │  │ ╰──────────╯ ╰──────────╯ ╰──────────────╯ │
╰──────────────╯  │                                              │
                  │ ╭────────────────────╮ ╭─────────────────╮ │
                  │ │ Flujo mensual      │ │ Compromisos     │ │
                  │ ╰────────────────────╯ ╰─────────────────╯ │
                  │                                              │
                  │ ╭────────────────────╮ ╭─────────────────╮ │
                  │ │ Movimientos        │ │ Insights        │ │
                  │ ╰────────────────────╯ ╰─────────────────╯ │
                  └──────────────────────────────────────────────┘
```

---

# 112. Dashboard mobile conceptual

```text
┌────────────────────────────┐
│ FinWise               ◉    │
│                            │
│ ╭────────────────────────╮ │
│ │ Disponible             │ │
│ │ $2.150.000             │ │
│ │                        │ │
│ │ Saldo       $4.850.000 │ │
│ │ Compromisos  -2.200.000│ │
│ │ Reserva        -500.000│ │
│ ╰────────────────────────╯ │
│                            │
│ Ingresos       Gastos      │
│ $5.2M          $2.9M       │
│                            │
│ ╭────────────────────────╮ │
│ │ Cash flow chart        │ │
│ ╰────────────────────────╯ │
│                            │
│ Insight                    │
│ Tus gastos...              │
│                            │
│ Movimientos recientes      │
│ ...                        │
│                            │
│ ╭────────────────────────╮ │
│ │ Inicio  Mov. + Metas ⋯ │ │
│ ╰────────────────────────╯ │
└────────────────────────────┘
```

---

# 113. Regla para UI generada por IA

Todo agente debe:

1. leer este sistema;
2. reutilizar tokens;
3. revisar mobile;
4. revisar dark;
5. reutilizar componentes;
6. mantener la marca;
7. no instalar librerías sin necesidad;
8. no cambiar la paleta;
9. explicar cualquier excepción.

---

# 114. Excepciones

Una excepción visual debe existir únicamente si:

- resuelve un problema real;
- mejora accesibilidad;
- mejora legibilidad;
- existe requisito del dominio;
- el componente estándar no es suficiente.

Las excepciones significativas deben documentarse.

---

# 115. Próximo documento

Una vez aprobado este sistema de diseño, crear:

```text
contexto/diseno/WIREFRAMES_Y_PANTALLAS.md
```

Ese documento definirá:

```text
1. Mobile information architecture
2. Desktop information architecture
3. Login / signup
4. Onboarding
5. Dashboard
6. Quick Create
7. Nueva transacción
8. Movimientos
9. Obligaciones
10. Configuración
11. Presupuestos
12. Metas
13. Alertas
```

Luego:

```text
contexto/planificacion/BACKLOG_MVP.md
```

y posteriormente se puede inicializar el repositorio y construir el primer vertical slice.

---

# Fin del documento
