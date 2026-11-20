/**
 * Contenido de la ayuda de Lukiva (panel "?" y recorrido guiado).
 *
 * Es solo datos, sin React ni driver.js, para poder probarlo y mantener los
 * textos en un único lugar. Los `selectors` apuntan a atributos `data-tour`
 * del layout; el recorrido usa el primero que esté visible (en escritorio
 * existe la barra lateral y en móvil solo la barra inferior).
 */

export interface TourStep {
  id: string;
  /** Candidatos en orden de preferencia; el recorrido usa el primero visible. */
  selectors: string[];
  title: string;
  description: string;
  side?: "top" | "right" | "bottom" | "left";
  /** En móvil el elemento vive dentro del menú lateral: el recorrido lo abre para mostrarlo. */
  inMobileMenu?: boolean;
}

/** Recorrido guiado. Los pasos sin ningún elemento visible se omiten. */
export const TOUR_STEPS: TourStep[] = [
  {
    id: "bienvenida",
    selectors: [],
    title: "Bienvenido a Lukiva",
    description:
      "En un minuto te muestro cómo se usa. El orden recomendado es: crea tus cuentas, registra tus movimientos, planifica y revisa. Puedes salir cuando quieras con la X o la tecla Esc.",
  },
  {
    id: "cuentas",
    selectors: ['[data-tour="nav-cuentas"]'],
    inMobileMenu: true,
    title: "1. Tus cuentas",
    description:
      "Empieza aquí: crea una cuenta por cada lugar donde tienes dinero (efectivo, banco, billetera digital) y por cada tarjeta de crédito. El saldo inicial es lo que tiene hoy; desde ahí Lukiva lo actualiza con cada movimiento.",
    side: "right",
  },
  {
    id: "categorias",
    selectors: ['[data-tour="nav-categorias"]'],
    inMobileMenu: true,
    title: "2. Tus categorías",
    description:
      "Las categorías ordenan en qué entra y en qué se va tu dinero (Alimentación, Transporte, Salario…). Ya trae unas por defecto; puedes editarlas, crear nuevas o archivar las que no uses.",
    side: "right",
  },
  {
    id: "crear",
    // En escritorio el botón «Nueva transacción» solo existe en el Dashboard; en las demás pantallas se señala «Movimientos».
    selectors: ['[data-tour="nueva-transaccion"]', '[data-tour="mobile-crear"]', '[data-tour="nav-transacciones"]'],
    title: "3. Registra un movimiento",
    description:
      "Cada vez que ganes o gastes algo, regístralo con su cuenta y su categoría (con «Nueva transacción» o «Crear», o desde Movimientos). Si pasas dinero entre tus propias cuentas usa «Transferir»: no cuenta como ingreso ni como gasto.",
    side: "bottom",
  },
  {
    id: "movimientos",
    selectors: ['[data-tour="nav-transacciones"]', '[data-tour="mobile-movimientos"]'],
    title: "Tu historial",
    description:
      "En Movimientos ves todo lo que has registrado y puedes buscar y filtrar por tipo, cuenta, categoría o fechas. Si algo quedó mal, ábrelo y edítalo.",
    side: "right",
  },
  {
    id: "presupuestos",
    selectors: ['[data-tour="nav-presupuestos"]', '[data-tour="mobile-presupuestos"]'],
    title: "4. Planifica",
    description:
      "Define cuánto quieres gastar al mes por categoría y Lukiva te avisa cuando te acercas al límite. En Planificación también están Metas de ahorro, Recurrentes, Suscripciones, Obligaciones y Deudas.",
    side: "right",
  },
  {
    id: "dashboard",
    selectors: ['[data-tour="disponible"]', '[data-tour="nav-dashboard"]', '[data-tour="mobile-inicio"]'],
    title: "5. Revisa tu dinero disponible",
    description:
      "Este es el número clave: lo que realmente puedes gastar sin tocar tus compromisos. Se calcula como saldo líquido − obligaciones pendientes − reserva de seguridad. Las tarjetas de crédito no suman al saldo: se muestran como deuda.",
    side: "bottom",
  },
  {
    id: "inteligencia",
    selectors: ['[data-tour="nav-alertas"]'],
    inMobileMenu: true,
    title: "Alertas y análisis",
    description:
      "Alertas te avisa de presupuestos excedidos u obligaciones próximas. Análisis proyecta cómo cerrarías el mes y el Simulador te dice si te alcanza para una compra a cuotas.",
    side: "right",
  },
  {
    id: "ayuda",
    selectors: ['[data-tour="ayuda"]'],
    title: "¿Dudas? Aquí estoy",
    description:
      "Este botón «?» está en todas las pantallas: explica la sección donde estás, el significado de cada número y repite este recorrido cuando quieras.",
    side: "left",
  },
];

export interface PageTour {
  /** Nombre de la pantalla, el mismo que se muestra en el panel de ayuda. */
  name: string;
  steps: TourStep[];
}

const TITLE = ["main h1"];
const NEW_LINK = ['main a[href*="/nuev"]'];

/** Primer paso de cada recorrido por pantalla: señala el título para que quede claro dónde estás. */
function here(name: string, description: string): TourStep {
  return { id: "aqui", selectors: TITLE, title: `Estás en: ${name}`, description, side: "bottom" };
}

/**
 * Recorridos por pantalla. La clave es el prefijo de la ruta (gana el más largo).
 * Los selectores pueden ser CSS cualquiera; los pasos sin elemento visible se omiten.
 */
export const PAGE_TOURS: Record<string, PageTour> = {
  "/dashboard": {
    name: "Dashboard",
    steps: [
      here("Dashboard", "Tu panorama general: cuánto tienes, cuánto debes y en qué se va tu dinero."),
      { id: "disponible", selectors: ['[data-tour="disponible"]'], title: "Dinero disponible", description: "Lo que puedes gastar sin tocar tus compromisos ni tu reserva. Si sale negativo, tus compromisos superan tu dinero.", side: "bottom" },
      { id: "nueva", selectors: ['[data-tour="nueva-transaccion"]'], title: "Registrar rápido", description: "Desde aquí registras un gasto o un ingreso sin pasar por el menú.", side: "bottom" },
      { id: "recientes", selectors: ['[data-tour="dash-recientes"]'], title: "Movimientos recientes", description: "Lo último que registraste. El icono y el color indican el tipo: gasto (sale), ingreso (entra) o transferencia (solo cambia de cuenta).", side: "top" },
    ],
  },
  "/cuentas": {
    name: "Cuentas",
    steps: [
      here("Cuentas", "Aquí viven los lugares donde tienes dinero (efectivo, bancos, billeteras) y tus tarjetas de crédito."),
      { id: "nueva", selectors: ['[data-tour="cuentas-nueva"]'], title: "Crear una cuenta", description: "Crea una cuenta por cada lugar donde tengas dinero. Eliges un icono de la lista, sin escribir nada.", side: "bottom" },
      { id: "tarjeta", selectors: ['[data-tour="cuenta-card"]'], title: "Cada cuenta", description: "Muestra su saldo actual (o la deuda, si es una tarjeta de crédito) y su tipo.", side: "bottom" },
      { id: "menu", selectors: ['[data-tour="cuenta-menu"]'], title: "Editar, archivar o desarchivar", description: "El menú ⋯ permite cambiar los datos de la cuenta, archivarla (se oculta de tus saldos pero conserva su historial) o recuperarla si está archivada.", side: "left" },
    ],
  },
  "/cuentas/nueva": {
    name: "Nueva cuenta",
    steps: [
      here("Nueva cuenta", "Completa estos datos para crear la cuenta. Lo único obligatorio es el nombre y el tipo."),
      { id: "nombre", selectors: ["#name"], title: "Nombre", description: "Cómo la reconocerás en las listas, por ejemplo «Bancolombia» o «Efectivo».", side: "bottom" },
      { id: "saldo", selectors: ["#opening_balance"], title: "Saldo inicial", description: "Lo que tiene hoy. Cuenta una sola vez; en una tarjeta de crédito es lo que debes. Puede ser negativo si tienes sobregiro.", side: "bottom" },
      { id: "icono", selectors: ["main fieldset"], title: "Icono", description: "Elige uno de la lista; se verá en tus cuentas. Es opcional.", side: "top" },
    ],
  },
  "/transacciones": {
    name: "Movimientos",
    steps: [
      here("Movimientos", "El historial de todo lo que entra y sale de tus cuentas."),
      { id: "acciones", selectors: ['[data-tour="tx-acciones"]'], title: "Registrar", description: "Un gasto cuando pagas algo, un ingreso cuando recibes dinero, y una transferencia cuando mueves dinero entre tus propias cuentas.", side: "bottom" },
      { id: "leyenda", selectors: ['[data-tour="tx-leyenda"]'], title: "Cómo leer los iconos", description: "Gasto (flecha roja hacia arriba): sale dinero. Ingreso (flecha verde hacia abajo): entra dinero. Transferencia (flechas cruzadas): solo cambia de cuenta, no es gasto ni ingreso.", side: "bottom" },
      { id: "filtros", selectors: ['[data-tour="tx-filtros"]'], title: "Buscar y filtrar", description: "Filtra por tipo, cuenta, categoría o fechas, o busca por descripción.", side: "bottom" },
      { id: "lista", selectors: ['[data-tour="tx-lista"]'], title: "El historial", description: "Una transferencia aparece como «origen → destino». Abre cualquier fila con el lápiz para corregirla; el saldo se recalcula solo.", side: "top" },
    ],
  },
  "/transacciones/nuevo": {
    name: "Registrar movimiento",
    steps: [
      here("Registrar movimiento", "Aquí registras un gasto o un ingreso."),
      { id: "tipo", selectors: ['[data-tour="tipo-movimiento"]'], title: "¿Qué tipo es?", description: "Gasto si sale dinero, Ingreso si entra, Transferencia si lo mueves entre tus cuentas. Puedes cambiar de tipo aquí sin volver atrás.", side: "bottom" },
      { id: "monto", selectors: ["#amount"], title: "Monto", description: "Cuánto fue, siempre en positivo: el tipo decide si suma o resta.", side: "bottom" },
      { id: "cuenta", selectors: ["#account_id"], title: "Cuenta", description: "De qué cuenta salió o a cuál entró el dinero. Su saldo se actualiza al guardar.", side: "bottom" },
      { id: "fecha", selectors: ["#transaction_date"], title: "Fecha", description: "El día en que ocurrió (puede ser anterior a hoy).", side: "bottom" },
    ],
  },
  "/transacciones/transferir": {
    name: "Transferir entre cuentas",
    steps: [
      here("Transferir entre cuentas", "Para mover dinero entre tus propias cuentas, por ejemplo del banco al efectivo."),
      { id: "tipo", selectors: ['[data-tour="tipo-movimiento"]'], title: "No es gasto ni ingreso", description: "Una transferencia no cambia tu patrimonio: solo cambia el dinero de lugar.", side: "bottom" },
      { id: "origen", selectors: ["#from_account_id"], title: "Cuenta de origen", description: "De donde sale el dinero. Se registra un movimiento de salida en esta cuenta.", side: "bottom" },
      { id: "destino", selectors: ["#to_account_id"], title: "Cuenta de destino", description: "A donde llega. Se registra el movimiento de entrada enlazado al anterior. Deben ser de la misma moneda.", side: "bottom" },
      { id: "monto", selectors: ["#amount"], title: "Monto", description: "Cuánto mueves. Lo mismo sale de una cuenta y entra a la otra.", side: "bottom" },
    ],
  },
  "/categorias": {
    name: "Categorías",
    steps: [
      here("Categorías", "Cómo clasificas en qué entra y en qué se va tu dinero."),
      { id: "nueva", selectors: NEW_LINK, title: "Crear una categoría", description: "Elige si es de gasto o de ingreso y un icono de la lista.", side: "bottom" },
      { id: "menu", selectors: ['main button[aria-label^="Acciones de"]'], title: "Editar o archivar", description: "Desde el menú ⋯ cambias el nombre, el color o el icono, o archivas las que ya no uses.", side: "left" },
    ],
  },
  "/presupuestos": {
    name: "Presupuestos",
    steps: [
      here("Presupuestos", "Un límite mensual por categoría de gasto."),
      { id: "nuevo", selectors: NEW_LINK, title: "Definir un límite", description: "Elige una categoría y cuánto quieres gastar al mes en ella.", side: "bottom" },
      { id: "estado", selectors: ["main section", "main ul"], title: "Cómo vas", description: "Cada barra muestra cuánto llevas del límite: va bien, atención, casi al límite o superado.", side: "top" },
    ],
  },
  "/metas": {
    name: "Metas",
    steps: [
      here("Metas", "Ahorra con un propósito y un plazo."),
      { id: "nueva", selectors: NEW_LINK, title: "Crear una meta", description: "Define cuánto quieres juntar y para cuándo; Lukiva calcula cuánto ahorrar al mes.", side: "bottom" },
      { id: "lista", selectors: ["main section", "main ul"], title: "Tu avance", description: "Registra aportes para ver cuánto llevas. Un aporte no es un movimiento del banco: solo sigue tu avance.", side: "top" },
    ],
  },
  "/recurrentes": {
    name: "Recurrentes",
    steps: [
      here("Recurrentes", "Ingresos y gastos que se repiten, como el arriendo o la nómina."),
      { id: "nuevo", selectors: NEW_LINK, title: "Programar uno", description: "Indica cada cuánto se repite y desde qué fecha.", side: "bottom" },
      { id: "vencidos", selectors: ['[data-tour="recurrente-vencidos"]'], title: "Registrar vencidos", description: "Cuando una recurrente ya venció aparece este botón: crea los movimientos que tocaba hacer. Las marcadas como automáticas se registran solas al abrir esta pantalla. Revisa antes para no duplicar uno que ya registraste a mano.", side: "bottom" },
    ],
  },
  "/suscripciones": {
    name: "Suscripciones",
    steps: [
      here("Suscripciones", "Lo que pagas cada mes o año por servicios."),
      { id: "nueva", selectors: NEW_LINK, title: "Agregar una suscripción", description: "Registra el servicio, su costo y cada cuánto se cobra.", side: "bottom" },
      { id: "lista", selectors: ["main section", "main ul"], title: "Cuánto suman", description: "Ves el total al mes y al año, y la próxima renovación de cada una.", side: "top" },
    ],
  },
  "/obligaciones": {
    name: "Obligaciones",
    steps: [
      here("Obligaciones", "Pagos pendientes con fecha de vencimiento."),
      { id: "nueva", selectors: NEW_LINK, title: "Agregar una obligación", description: "Un recibo, una cuota o cualquier pago que ya sabes que vendrá.", side: "bottom" },
      { id: "lista", selectors: ["main section", "main ul"], title: "Pendientes y pagadas", description: "Las pendientes se descuentan de tu dinero disponible. Márcalas como pagadas cuando las canceles.", side: "top" },
    ],
  },
  "/deudas": {
    name: "Deudas",
    steps: [
      here("Deudas", "Préstamos y créditos: saldo, pago mínimo y avance."),
      { id: "nueva", selectors: NEW_LINK, title: "Registrar una deuda", description: "Indica el saldo, el interés y el pago mínimo.", side: "bottom" },
      { id: "estrategia", selectors: ['main a[href*="estrategia"]'], title: "Estrategia de pago", description: "Compara Avalancha (primero la de más interés) y Bola de nieve (primero la más pequeña).", side: "bottom" },
    ],
  },
  "/alertas": {
    name: "Alertas",
    steps: [
      here("Alertas", "Avisos sobre tu dinero: presupuestos cerca del límite, obligaciones próximas, disponible bajo."),
      { id: "lista", selectors: ["main section", "main ul"], title: "Tus avisos", description: "Márcalos como leídos cuando los atiendas.", side: "top" },
    ],
  },
  "/analisis": {
    name: "Análisis",
    steps: [
      here("Análisis", "Una proyección de cómo cerrarías el mes."),
      { id: "proyeccion", selectors: ["main section", "main ul"], title: "Proyección", description: "Se basa en tu gasto diario promedio: es una estimación, no una certeza.", side: "top" },
    ],
  },
  "/simulador": {
    name: "Simulador de compra",
    steps: [
      here("Simulador de compra", "Antes de comprar a cuotas, mira cuánto costaría y si cabe en tu flujo mensual."),
      { id: "form", selectors: ["main form"], title: "Tu compra", description: "Escribe el valor, las cuotas y el interés. No registra la compra ni crea una deuda: solo simula.", side: "bottom" },
    ],
  },
  "/ajustes": {
    name: "Ajustes",
    steps: [
      here("Ajustes", "Aquí administras tu cuenta: tu perfil, tu correo, tu contraseña y tus sesiones."),
      { id: "perfil", selectors: ["#perfil"], title: "Perfil y preferencias", description: "Tu nombre, la moneda principal, la zona horaria (define qué día es «hoy») y la reserva de seguridad que se descuenta de tu dinero disponible.", side: "bottom" },
      { id: "apariencia", selectors: ["#apariencia"], title: "Apariencia", description: "Elige modo claro, oscuro o automático y el color de la app. Cambia al instante y se recuerda en este dispositivo.", side: "bottom" },
      { id: "atajos", selectors: ["#atajos"], title: "Atajos del iPhone", description: "Crea un token y arma un atajo «Gasto rápido» en la app Atajos: registras un gasto o ingreso desde la pantalla de inicio o con Siri y llega a Lukiva al instante.", side: "top" },
      { id: "correo", selectors: ["#correo"], title: "Correo electrónico", description: "Cambia el correo con el que inicias sesión. Te enviamos un enlace de confirmación y el cambio se aplica cuando lo abres.", side: "top" },
      { id: "contrasena", selectors: ["#contrasena"], title: "Contraseña", description: "Para cambiarla te pedimos la actual, así nadie puede hacerlo si deja tu sesión abierta.", side: "top" },
      { id: "sesiones", selectors: ["#sesiones"], title: "Sesiones", description: "Si usaste Lukiva en un equipo ajeno, cierra la sesión en todos los dispositivos de una vez.", side: "top" },
    ],
  },
};

/**
 * Recorrido de la pantalla actual, o null si no tiene. Solo coincide la ruta exacta: en las
 * pantallas de edición (/cuentas/123/editar) los pasos de la lista no aplicarían.
 */
export function getPageTour(pathname: string): PageTour | null {
  const path = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  return PAGE_TOURS[path] ?? null;
}

/** Pasos del flujo de uso recomendado (se muestran en el panel de ayuda). */
export const FLOW_STEPS: { title: string; description: string; href: string; cta: string }[] = [
  {
    title: "Crea tus cuentas",
    description: "Una por cada lugar con dinero (efectivo, banco, billeteras) y por cada tarjeta de crédito.",
    href: "/cuentas",
    cta: "Ir a Cuentas",
  },
  {
    title: "Registra tus movimientos",
    description: "Ingresos, gastos y transferencias entre tus cuentas, cada uno con su categoría.",
    href: "/transacciones",
    cta: "Ir a Movimientos",
  },
  {
    title: "Planifica",
    description: "Presupuestos por categoría, metas de ahorro, pagos recurrentes, obligaciones y deudas.",
    href: "/presupuestos",
    cta: "Ir a Presupuestos",
  },
  {
    title: "Revisa y decide",
    description: "El Dashboard te dice cuánto puedes gastar; Alertas y Análisis te anticipan lo que viene.",
    href: "/dashboard",
    cta: "Ir al Dashboard",
  },
];

/** Qué significa cada número que ves en la app. */
export const GLOSSARY: { term: string; meaning: string }[] = [
  {
    term: "Saldo líquido",
    meaning: "Lo que tienes en efectivo, cuentas de banco y billeteras digitales. No incluye tarjetas de crédito.",
  },
  {
    term: "Compromisos / obligaciones",
    meaning: "Pagos pendientes que ya sabes que tendrás que hacer (cuotas, recibos…). Se descuentan de lo que puedes gastar.",
  },
  {
    term: "Reserva de seguridad",
    meaning: "Un colchón que decides apartar y no tocar. Se configura en Ajustes y también se descuenta del disponible.",
  },
  {
    term: "Dinero disponible",
    meaning: "Saldo líquido − compromisos − reserva. Es lo que realmente puedes gastar hoy. Si sale negativo, tus compromisos superan tu dinero.",
  },
  {
    term: "Deuda de una tarjeta",
    meaning: "Lo que debes en una tarjeta de crédito. Una compra la aumenta y un pago la reduce. No se suma a tu saldo líquido.",
  },
  {
    term: "Transferencia",
    meaning: "Mover dinero entre tus propias cuentas. No cuenta como ingreso ni como gasto, solo cambia de lugar.",
  },
  {
    term: "Saldo inicial",
    meaning: "Lo que tenía una cuenta cuando la creaste. Cuenta una sola vez; puede ser negativo si tenías sobregiro.",
  },
];

export interface PageHelp {
  title: string;
  summary: string;
  tips: string[];
}

/** Ayuda contextual por sección. La clave es el prefijo de la ruta. */
export const PAGE_HELP: Record<string, PageHelp> = {
  "/dashboard": {
    title: "Dashboard",
    summary: "Tu panorama: cuánto tienes, cuánto debes y en qué se va tu dinero.",
    tips: [
      "«Dinero disponible» es lo que puedes gastar sin tocar compromisos ni reserva.",
      "Cambia el período (este mes, mes anterior, 3 meses, este año) para comparar.",
      "«Gasto por categoría» te muestra dónde se concentra tu gasto.",
    ],
  },
  "/transacciones": {
    title: "Movimientos",
    summary: "El historial de todo lo que entra y sale.",
    tips: [
      "Usa «Registrar ingreso», «Registrar gasto» o «Transferir» según el caso.",
      "Filtra por tipo, cuenta, categoría o fechas para encontrar algo rápido.",
      "Para corregir un movimiento, ábrelo y edítalo; el saldo se recalcula solo.",
    ],
  },
  "/cuentas": {
    title: "Cuentas",
    summary: "Los lugares donde tienes dinero o deudas.",
    tips: [
      "El menú ⋯ de cada cuenta permite editarla, archivarla o, si está archivada, desarchivarla.",
      "Archivar oculta la cuenta de tus saldos pero conserva su historial.",
      "En una tarjeta de crédito el número es tu deuda, no tu dinero.",
    ],
  },
  "/categorias": {
    title: "Categorías",
    summary: "Cómo clasificas tus ingresos y gastos.",
    tips: [
      "Cada categoría es de ingreso o de gasto, no de ambos.",
      "Edita el nombre o el color desde el menú ⋯; archiva las que ya no uses.",
    ],
  },
  "/presupuestos": {
    title: "Presupuestos",
    summary: "Un límite mensual por categoría de gasto.",
    tips: [
      "Verás «Va bien», «Atención», «Casi al límite» o «Superado» según cuánto llevas del límite.",
      "«Copiar mes anterior» repite tus límites sin volver a crearlos.",
      "Las transferencias no cuentan como gasto en un presupuesto.",
    ],
  },
  "/metas": {
    title: "Metas",
    summary: "Ahorra con un propósito y un plazo.",
    tips: [
      "Registra aportes para ver cuánto llevas y cuánto falta.",
      "Un aporte no es un movimiento bancario: es solo el seguimiento de tu avance.",
    ],
  },
  "/recurrentes": {
    title: "Recurrentes",
    summary: "Ingresos y gastos que se repiten (arriendo, nómina…).",
    tips: [
      "Define cada cuánto se repite y desde qué fecha.",
      "«Registrar vencidos» crea los movimientos que ya tocaba hacer; revisa antes para no duplicar uno que ya registraste.",
    ],
  },
  "/suscripciones": {
    title: "Suscripciones",
    summary: "Lo que pagas cada mes o año por servicios (streaming, apps…).",
    tips: ["Mira cuánto suman al mes y al año, y cuál es la próxima renovación."],
  },
  "/obligaciones": {
    title: "Obligaciones",
    summary: "Pagos pendientes con fecha de vencimiento.",
    tips: [
      "Las obligaciones pendientes se descuentan de tu dinero disponible.",
      "Márcalas como pagadas cuando las canceles.",
    ],
  },
  "/deudas": {
    title: "Deudas",
    summary: "Préstamos y créditos: saldo, pago mínimo y avance.",
    tips: [
      "Registra cada abono para que el saldo baje de forma exacta.",
      "«Estrategia de pago» compara Avalancha (primero la de mayor interés) y Bola de nieve (primero la más pequeña).",
    ],
  },
  "/alertas": {
    title: "Alertas",
    summary: "Avisos sobre tu dinero: presupuestos cerca del límite, obligaciones próximas, disponible bajo.",
    tips: ["Márcalas como leídas cuando las atiendas."],
  },
  "/analisis": {
    title: "Análisis",
    summary: "Una proyección de cómo cerrarías el mes.",
    tips: ["Es una estimación basada en tu gasto diario promedio, no una certeza."],
  },
  "/simulador": {
    title: "Simulador de compra",
    summary: "Antes de comprar a cuotas, mira cuánto costaría y si cabe en tu flujo mensual.",
    tips: ["No registra la compra ni crea una deuda: solo simula."],
  },
  "/ajustes": {
    title: "Ajustes",
    summary: "Tu perfil, correo, contraseña y sesiones.",
    tips: [
      "Cambia tu nombre, moneda principal y zona horaria en «Perfil y preferencias».",
      "En «Atajos del iPhone» creas un token para registrar gastos desde la app Atajos o con Siri.",
      "En «Apariencia» eliges modo claro, oscuro o automático y el color de la app.",
      "La moneda principal solo se puede cambiar si todas tus cuentas ya están en la nueva.",
      "El correo nuevo se aplica cuando abres el enlace de confirmación que te enviamos.",
      "La reserva de seguridad se descuenta de tu dinero disponible.",
    ],
  },
};

const DEFAULT_HELP: PageHelp = {
  title: "Lukiva",
  summary: "Registra, entiende y planifica tu dinero para saber cuánto puedes gastar.",
  tips: ["Usa el menú para moverte entre secciones y el botón «?» para volver aquí."],
};

/** Ayuda de la sección actual: la de la ruta más específica que coincida. */
export function getPageHelp(pathname: string): PageHelp {
  const match = Object.keys(PAGE_HELP)
    .filter((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
    .sort((a, b) => b.length - a.length)[0];
  return match ? PAGE_HELP[match] : DEFAULT_HELP;
}
