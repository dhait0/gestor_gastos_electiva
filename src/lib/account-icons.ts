import {
  Banknote,
  Briefcase,
  Car,
  Coins,
  CreditCard,
  Gift,
  GraduationCap,
  HeartPulse,
  House,
  Landmark,
  MoreHorizontal,
  PiggyBank,
  Plane,
  ShoppingCart,
  Smartphone,
  Store,
  Wallet,
  type LucideIcon,
} from "lucide-react";

/** Iconos que se pueden elegir para una cuenta. `value` es lo que se guarda en `accounts.icon`. */
export const ACCOUNT_ICONS: { value: string; label: string; Icon: LucideIcon }[] = [
  { value: "wallet", label: "Billetera", Icon: Wallet },
  { value: "banknote", label: "Efectivo", Icon: Banknote },
  { value: "coins", label: "Monedas", Icon: Coins },
  { value: "landmark", label: "Banco", Icon: Landmark },
  { value: "piggy-bank", label: "Ahorros", Icon: PiggyBank },
  { value: "credit-card", label: "Tarjeta", Icon: CreditCard },
  { value: "smartphone", label: "Billetera digital", Icon: Smartphone },
  { value: "briefcase", label: "Trabajo", Icon: Briefcase },
  { value: "house", label: "Hogar", Icon: House },
  { value: "car", label: "Vehículo", Icon: Car },
  { value: "shopping-cart", label: "Compras", Icon: ShoppingCart },
  { value: "store", label: "Negocio", Icon: Store },
  { value: "plane", label: "Viajes", Icon: Plane },
  { value: "graduation-cap", label: "Estudios", Icon: GraduationCap },
  { value: "heart-pulse", label: "Salud", Icon: HeartPulse },
  { value: "gift", label: "Regalos", Icon: Gift },
];

const BY_VALUE: Record<string, LucideIcon> = Object.fromEntries(ACCOUNT_ICONS.map((icon) => [icon.value, icon.Icon]));

const BY_TYPE: Record<string, LucideIcon> = {
  CASH: Wallet,
  CHECKING: Landmark,
  SAVINGS: PiggyBank,
  CREDIT_CARD: CreditCard,
  DIGITAL_WALLET: Smartphone,
};

/** Icono elegido por la persona; si no hay (o es un texto antiguo que no está en la lista), el del tipo de cuenta. */
export function getAccountIcon(icon: string | null | undefined, type: string): LucideIcon {
  return (icon ? BY_VALUE[icon] : undefined) ?? BY_TYPE[type] ?? MoreHorizontal;
}

/** Iconos (emoji) que se pueden elegir para una categoría. */
export const CATEGORY_ICONS: { value: string; label: string }[] = [
  { value: "🍽️", label: "Comida" },
  { value: "🛒", label: "Mercado" },
  { value: "☕", label: "Café" },
  { value: "🚌", label: "Transporte" },
  { value: "🚗", label: "Carro" },
  { value: "⛽", label: "Gasolina" },
  { value: "🏠", label: "Hogar" },
  { value: "💡", label: "Servicios" },
  { value: "📱", label: "Celular" },
  { value: "🎬", label: "Entretenimiento" },
  { value: "🎮", label: "Juegos" },
  { value: "👕", label: "Ropa" },
  { value: "💊", label: "Salud" },
  { value: "🏋️", label: "Deporte" },
  { value: "📚", label: "Educación" },
  { value: "✈️", label: "Viajes" },
  { value: "🎁", label: "Regalos" },
  { value: "🐶", label: "Mascotas" },
  { value: "👶", label: "Hijos" },
  { value: "🧾", label: "Impuestos" },
  { value: "💳", label: "Deudas" },
  { value: "💰", label: "Ingresos" },
  { value: "💼", label: "Salario" },
  { value: "📈", label: "Inversiones" },
  { value: "🔁", label: "Suscripciones" },
  { value: "🛠️", label: "Mantenimiento" },
];
