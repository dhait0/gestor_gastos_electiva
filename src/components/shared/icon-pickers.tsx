"use client";

import { ACCOUNT_ICONS, CATEGORY_ICONS } from "@/lib/account-icons";
import { IconPicker } from "./IconPicker";

export function AccountIconPicker({ defaultValue, disabled }: { defaultValue?: string | null; disabled?: boolean }) {
  return (
    <IconPicker
      name="icon"
      legend="Icono (opcional)"
      defaultValue={defaultValue}
      disabled={disabled}
      options={ACCOUNT_ICONS.map(({ value, label, Icon }) => ({ value, label, node: <Icon className="h-5 w-5" aria-hidden="true" /> }))}
    />
  );
}

export function CategoryIconPicker({ defaultValue, disabled }: { defaultValue?: string | null; disabled?: boolean }) {
  return (
    <IconPicker
      name="icon"
      legend="Icono (opcional)"
      defaultValue={defaultValue}
      disabled={disabled}
      options={CATEGORY_ICONS.map(({ value, label }) => ({ value, label, node: <span aria-hidden="true">{value}</span> }))}
    />
  );
}
