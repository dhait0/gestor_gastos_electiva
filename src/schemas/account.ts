import { z } from "zod";
import { CURRENCY_CODES, TIMEZONE_VALUES } from "@/lib/profile-options";

export const profileSettingsSchema = z.object({
  displayName: z.string().trim().min(1, "El nombre es obligatorio").max(100, "El nombre es demasiado largo"),
  currencyCode: z.enum(CURRENCY_CODES as [string, ...string[]], { message: "Moneda no disponible" }),
  timezone: z.enum(TIMEZONE_VALUES as [string, ...string[]], { message: "Zona horaria no disponible" }),
  safetyReserve: z.coerce.number({ message: "Escribe un número" }).min(0, "La reserva no puede ser negativa").max(1_000_000_000_000, "El valor es demasiado grande"),
});

export const changeEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("Correo inválido").max(254, "El correo es demasiado largo"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Escribe tu contraseña actual"),
    password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres").max(128, "La contraseña es demasiado larga"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  })
  .refine((data) => data.password !== data.currentPassword, {
    message: "La nueva contraseña debe ser distinta de la actual",
    path: ["password"],
  });
