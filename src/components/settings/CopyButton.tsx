"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Copia un texto al portapapeles y lo confirma un momento. */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // El portapapeles puede estar bloqueado: el valor sigue visible para copiarlo a mano.
    }
  };

  return (
    <Button type="button" variant="outline" size="sm" onClick={copy} aria-label={copied ? `${label}: copiado` : `Copiar ${label}`}>
      {copied ? <Check className="mr-1.5 h-4 w-4" aria-hidden="true" /> : <Copy className="mr-1.5 h-4 w-4" aria-hidden="true" />}
      {copied ? "Copiado" : "Copiar"}
    </Button>
  );
}
