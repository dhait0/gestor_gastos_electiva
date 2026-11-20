/** Opciones que la persona puede elegir en su perfil (Ajustes). */
export const CURRENCIES = [
  { code: "COP", label: "Peso colombiano (COP)" },
  { code: "USD", label: "Dólar estadounidense (USD)" },
  { code: "EUR", label: "Euro (EUR)" },
] as const;

export const TIMEZONES = [
  { value: "America/Bogota", label: "Bogotá (GMT-5)" },
  { value: "America/Lima", label: "Lima (GMT-5)" },
  { value: "America/Mexico_City", label: "Ciudad de México (GMT-6)" },
  { value: "America/Caracas", label: "Caracas (GMT-4)" },
  { value: "America/Santiago", label: "Santiago (GMT-4)" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires (GMT-3)" },
  { value: "America/New_York", label: "Nueva York (GMT-5)" },
  { value: "Europe/Madrid", label: "Madrid (GMT+1)" },
] as const;

export const CURRENCY_CODES = CURRENCIES.map((c) => c.code);
export const TIMEZONE_VALUES = TIMEZONES.map((t) => t.value);
