"use client";

import { useActionState } from "react";
import { deleteUserAction } from "./actions";

export default function DeleteUserButton({ id }: { id: string }) {
  const [state, formAction] = useActionState(deleteUserAction, { error: undefined });

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        onClick={(e) => {
          if (!confirm("¿Eliminar este usuario? Esta acción no se puede deshacer.")) {
            e.preventDefault();
          }
        }}
        className="rounded-lg border border-destructive/40 px-3 py-1 text-xs font-medium text-destructive transition hover:bg-destructive/10"
      >
        Eliminar
      </button>
      {state?.error && <p className="mt-1 text-xs text-destructive">{state.error}</p>}
    </form>
  );
}
