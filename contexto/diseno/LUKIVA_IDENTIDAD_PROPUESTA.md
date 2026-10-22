# LUKIVA — Manual de identidad y plan de integración (propuesta v1)

**Estado:** propuesta de branding, sin cambios al repositorio.  
**Fecha:** 21 de octubre de 2026.  
**Origen:** evolución del proyecto FinWise; se conservan sus requisitos funcionales, arquitectura financiera y documentación como fuente de verdad.

## 1. Estrategia de marca

- **Nombre:** Lukiva (escritura oficial: `Lukiva`, minúsculas solo en logotipos exploratorios).
- **Pronunciación:** lu-KI-va.
- **Categoría:** aplicación de finanzas personales; no se presenta como banco, billetera custodial ni asesor financiero regulado.
- **Posicionamiento:** *La forma clara y cercana de entender tu dinero y planear lo que viene.*
- **Promesa:** ayudarte a visualizar lo que tienes, lo que debes y lo que realmente puedes usar.
- **Arquetipo de comunicación:** compañero competente: amable y motivador sin trivializar las deudas ni las decisiones económicas.
- **Audiencia inicial:** estudiantes universitarios y jóvenes adultos; diseño suficientemente maduro para otros grupos de edad.
- **Lema recomendado:** **Tu dinero, a tu ritmo.**
- **Alternativas:** «Toma el control de lo que viene»; «Más claridad para tus planes».
- **Evitar:** prometer ahorros garantizados, inversiones o consejos automáticos personalizados que el sistema no proporciona.

## 2. Identidad verbal

**Voz:** clara, cálida, precisa, no culpabilizante, expresiva con moderación.

| Situación | Mensaje recomendado | Evitar |
|---|---|---|
| Inicio | «Hola, este es tu panorama de hoy» | «Panel de control financiero» |
| KPI | «Dinero disponible» | «Liquidez neta consolidada» |
| Registrar | «Agregar movimiento» | «Ejecutar operación contable» |
| Presupuesto | «Te quedan $120.000 en alimentación» | «¡Estás gastando demasiado!» |
| Obligación | «Tienes un pago próximo el 28 de octubre» | «¡Alerta! Estás en peligro» |
| Éxito | «Listo, guardamos tu gasto» | «Transacción OK 200» |
| Error | «No pudimos guardar el movimiento. Inténtalo de nuevo» | «Error del servidor» |
| Privacidad | «Solo tú puedes consultar tus movimientos» (si la política lo garantiza) | Promesas absolutas sin respaldo |

Regla UX: en importes, plazos, advertencias y deudas se antepone precisión a ingenio o humor. Nunca ocultar fecha de corte ni unidad monetaria.

## 3. Sistema visual (propuesto)

La identidad original se basa en un estilo premium fintech. Evolucionarla de forma incremental y documentar la sustitución de tokens, en lugar de cambiar arbitrariamente las pantallas.

| Token | Claro | Oscuro | Uso |
|---|---|---|---|
| `brand.primary` | `#315CF5` | `#83A3FF` | CTA, navegación activa |
| `brand.deep` | `#1E348C` | `#B9C8FF` | Títulos de marca |
| `brand.mint` | `#20BDA5` | `#51DBC2` | Logros, acentos secundarios |
| `brand.sunny` | `#FFC777` | `#FFC777` | Detalle emocional, ilustración |
| `surface.page` | `#F5F7FE` | `#0D1426` | Fondo global |
| `surface.card` | `#FFFFFF` | `#162139` | Tarjetas |
| `text.primary` | `#162039` | `#F4F7FF` | Contenido |
| `text.muted` | `#58657D` | `#B5C0D4` | Ayudas, metadatos |
| `semantic.success` | `#158467` | `#56D0A8` | Positivo |
| `semantic.warning` | `#A76610` | `#F4BE6A` | Avisos |
| `semantic.danger` | `#C53F58` | `#FF8095` | Error / riesgo |

**Importante:** pares preliminares: validar WCAG AA según combinaciones reales. No usar `brand.sunny` como texto pequeño sobre blanco.

**Tipografía:** Manrope (títulos) + Geist (interfaz y cifras), tal como ya están configuradas en el repositorio. Priorizar números tabulares; evitar cambiar tipografías sin un beneficio demostrado.  
**Forma:** radios 12–20 px, tarjetas limpias, sombras suaves; evitar glassmorphism sobre datos densos.  
**Iconos:** familia consistente, trazos redondeados; no reemplazar símbolos financieros importantes con metáforas ambiguas.  
**Movimiento:** 140–240 ms, microinteracciones con propósito; respetar `prefers-reduced-motion`.

### Concepto de logotipo (no arte final)

- **Wordmark:** `lukiva` en minúsculas con un punto sobre la «i» como pequeño acento menta.
- **Isotipo:** una «L» de dos trazos suaves con un camino ascendente sutil, dentro de un cuadrado redondeado. Debe funcionar a 24 × 24 px y en monocromo.
- **Sensación:** energía tranquila, progreso y simplicidad; no billetes, monedas gigantes ni flechas bursátiles prometiendo rentabilidad.
- **Variantes previstas:** horizontal, apilada, isotipo, monocromática, claro/oscuro, favicon/PWA.
- **Verificación pendiente:** diseño original, legibilidad, pruebas de escalado, similitud visual con terceros, exportación SVG/PNG.

## 4. Propuesta visual de pantallas

1. **Landing:** hero «Tu dinero, a tu ritmo», captura auténtica de dashboard, CTA «Crear mi cuenta», explicación de beneficios sin exagerar.
2. **Autenticación:** formulario limpio, ilustración muy contenida, mensajes claros y recuperación de acceso.
3. **Onboarding:** pregunta sobre moneda, cuenta inicial y reserva de seguridad, mostrando progreso y posibilidad de revisar.
4. **Dashboard:** jerarquía `dinero disponible` → `saldo total` → `próximos compromisos` → `últimos movimientos`; acciones rápidas «Ingreso», «Gasto», «Transferencia».
5. **Transacciones:** filtros por período, categoría y cuenta, búsqueda, estados vacíos útiles y confirmaciones accesibles.
6. **Planificación:** presupuestos y metas con progreso comprensible; obligaciones y suscripciones diferenciadas.
7. **Deudas:** saldo, pagos y próximos vencimientos; no presentar proyecciones como certezas.
8. **Admin:** identidad visual compartida, layout independiente, métricas de uso no sensibles; RBAC y trazabilidad. Administrador no ve por defecto movimientos individuales.

## 5. Integración sin cambiar el repositorio todavía

### Situación actual constatada

- `src/app/globals.css` contiene tokens `--color-finn-*`, paleta azul/cian y temas claro/oscuro.
- Tipografías configuradas: Manrope y Geist.
- La documentación `contexto/diseno/SISTEMA_DISENO_FINWISE.md` es fuente de identidad visual aprobada anterior.
- Hay pantallas funcionales; se mantienen rutas, módulos y lógica de negocio.

### Fase A — inventario (sin cambios)

- Listar referencias de texto `FinWise`, `Finwise`, `finn-*`, títulos, descripciones, email templates, metadata, manifest PWA, favicons, Open Graph y documentación.
- Tomar capturas desktop / móvil claro y oscuro de todas las rutas relevantes.
- Localizar componentes que aplican colores codificados en vez de tokens; contrastar con documento de diseño.
- Registrar todos los assets de marca y textos visibles para el usuario.

### Fase B — aprobación de identidad

- Validar nombre registral, dominio, handles y similitud fonética.
- Aprobar lema, paleta, tipografía, iconografía y guías de contenido.
- Crear logotipo real, su versión oscura y favicon.
- Aprobar diez pantallas clave en Figma o prototipos antes de implementar.

### Fase C — futura implementación controlada

1. Crear rama `brand/lukiva` (después de aprobación; **no creada aquí**).
2. Definir tokens semánticos neutros (`--brand-*`) en lugar de romper de inmediato usos `--color-finn-*`; agregar alias temporales de compatibilidad.
3. Reemplazar textos visibles, metadatos, manifest, iconos, pantallas de acceso y componentes compartidos; no cambiar rutas públicas o nombres de tablas sin necesidad.
4. Progresar por pantalla, con snapshots e inspección visual; mantener la lógica financiera intacta.
5. Actualizar documentación `contexto/` mediante un ADR de cambio de marca conservando trazabilidad al nombre anterior.
6. Cambiar nombres de repositorio, URL o dominios al final, con redirecciones si aplica; jamás tocar identificadores de Supabase, URLs de callback o secretos sin plan probado.
7. Comprobar build, lint, pruebas de usuario, accesibilidad, PWA, flujo de auth, continuidad de sesión, emails y responsive.
8. Liberar tras aprobación y pruebas; contar con rollback a branding anterior sin afectar datos.

### Mapa de impacto propuesto

| Área | Modificación futura | Se mantiene |
|---|---|---|
| `src/app/globals.css` | Tokens y temas nuevos | Variables shadcn, accesibilidad |
| Layouts y componentes comunes | Logotipo, navegación, mensajes | rutas funcionales, permisos |
| Metadata / manifest / SEO | Nombre, descripción e iconos | URLs hasta migración controlada |
| Emails de Auth | Remitente visible, copy, logo | funcionamiento de verificación y seguridad |
| Admin | Estilo Lukiva consistente | límites de acceso a datos privados |
| Supabase PostgreSQL | **Sin cambio por renaming** | tablas, PK/FK, RLS, datos |
| Tests | Tests visuales, contenido de UI | casos de negocio y seguridad |
| `contexto/` | ADR y nuevo manual visual | requisitos, casos de uso y planes previos |

## 6. Riesgos de nombre y diligencia debida

**Evaluación preliminar al 21 de octubre de 2026:** las búsquedas generales por `Lukiva` no ofrecieron una coincidencia exacta clara dentro del sector financiero. Eso **no prueba** disponibilidad en registros de marca, dominios, redes ni tiendas. Hay signos comercialmente cercanos como `Lukka` (software financiero) y `Luciva` (software de salud); no se ha establecido conflicto jurídico, solo un motivo para una búsqueda fonética y por clases.

**Estado de verificación:**

- Registro nominativo en Colombia: **pendiente**, usar SIPI/SIC.
- Análisis fonético/figurativo (Lukiva, Luciva, Lukka, Luquiva, Lukiba, Lukiva Finance): **pendiente**.
- Clases a estudiar con asesoría de clasificación: **9** (software/apps), **42** (SaaS/software), y **36** únicamente si los servicios ofrecidos encajan en servicios financieros de esa clase. No asumir clase 36 solo por tratar de finanzas.
- `lukiva.com`, `.app`, `.com.co`: **sin verificación registral WHOIS/RDAP en tiempo real**.
- Google Play / App Store / handles sociales: **sin verificación concluyente**.

**Fuentes oficiales útiles:**
- SIC marcas: https://sedeelectronica.sic.gov.co/temas/propiedad-industrial/marcas
- SIPI: https://sipi.sic.gov.co/
- Consulta oficial de antecedentes: https://www.minjusticia.gov.co/programas-co/LegalApp/Paginas/Forms/DispForm.aspx?ID=812
- Búsqueda internacional (WIPO): https://branddb.wipo.int/

**Decisión recomendada:** aprobar Lukiva como *nombre de trabajo* y mantener el nombre anterior en producción hasta cerrar diligencia debida y la revisión de identidad.

## 7. Pruebas de aceptación del rebranding

- Todas las pantallas muestran un nombre coherente; sin textos internos de MVP en UI final.
- Login, registro, onboarding, dashboard, movimientos, obligaciones y configuración funcionan igual que antes.
- La paleta cumple contraste y lectura en claro/oscuro; sin problemas móviles ni botones inactivos.
- El dashboard enfatiza correctamente dinero disponible y muestra importes consistentes.
- La administración no permite elevar privilegios ni acceder a finanzas ajenas por un cambio visual.
- El manifest instala con nombre e iconos correctos; emails y links de restablecimiento siguen funcionando.
- Tests E2E, accesibilidad y capturas aprobadas; rollback documentado.

## 8. Prompt para otra IA diseñadora

> Diseña la identidad visual de **Lukiva**, aplicación de gestión financiera personal juvenil pero profesional. Usa el posicionamiento, los textos, la paleta y la jerarquía de pantallas de este manual. Propón 3 opciones de isotipo basadas en una `L` con recorrido suave, variantes claro/oscuro, una mini guía de componentes y un prototipo de dashboard móvil + escritorio. No alteres requisitos financieros, reglas de seguridad, base de datos, navegación ni promesas de producto. No implementes en el repositorio. Entrega propuestas visuales para aprobación y documenta cambios sugeridos. No presentes la marca como legalmente disponible.
