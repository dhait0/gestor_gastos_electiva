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
    selectors: ['[data-tour="nav-cuentas"]', '[data-tour="mobile-mas"]'],
    title: "1. Tus cuentas",
    description:
      "Empieza aquí: crea una cuenta por cada lugar donde tienes dinero (efectivo, banco, billetera digital) y por cada tarjeta de crédito. El saldo inicial es lo que tiene hoy; desde ahí Lukiva lo actualiza con cada movimiento. En móvil, está dentro de «Más».",
    side: "right",
  },
  {
    id: "categorias",
    selectors: ['[data-tour="nav-categorias"]', '[data-tour="mobile-mas"]'],
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
    selectors: ['[data-tour="nav-alertas"]', '[data-tour="mobile-mas"]'],
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
    summary: "Tu perfil y tu reserva de seguridad.",
    tips: ["La reserva de seguridad se descuenta de tu dinero disponible."],
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
