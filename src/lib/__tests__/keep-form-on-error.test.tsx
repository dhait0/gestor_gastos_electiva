import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useActionState } from "react";
import { preventFormReset, resetFormFields } from "../keep-form-on-error";

afterEach(cleanup);

function Demo({ fail, onCall, protect = true }: { fail: boolean; onCall: (data: FormData) => void; protect?: boolean }) {
  const [state, formAction, isPending] = useActionState(async (_prev: { error?: string }, data: FormData) => {
    onCall(data);
    return fail ? { error: "falló" } : {};
  }, {});

  return (
    <form action={formAction} onReset={protect ? preventFormReset : undefined} aria-label="demo">
      <input name="email" aria-label="correo" />
      <input name="nota" aria-label="nota" defaultValue="" />
      <button type="submit" disabled={isPending}>Enviar</button>
      {state.error && <p role="alert">{state.error}</p>}
    </form>
  );
}

describe("preventFormReset (UC-46)", () => {
  it("sigue enviando los valores del formulario a la acción", async () => {
    const onCall = vi.fn();
    render(<Demo fail={false} onCall={onCall} />);
    await userEvent.type(screen.getByLabelText("correo"), "a@b.co");
    await userEvent.type(screen.getByLabelText("nota"), "hola");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    await waitFor(() => expect(onCall).toHaveBeenCalledTimes(1));
    const data = onCall.mock.calls[0][0] as FormData;
    expect(data.get("email")).toBe("a@b.co");
    expect(data.get("nota")).toBe("hola");
  });

  it("si la acción falla, el usuario conserva lo que escribió", async () => {
    render(<Demo fail onCall={() => {}} />);
    await userEvent.type(screen.getByLabelText("correo"), "a@b.co");
    await userEvent.type(screen.getByLabelText("nota"), "texto largo que no quiero perder");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("falló");
    expect(screen.getByLabelText("correo")).toHaveValue("a@b.co");
    expect(screen.getByLabelText("nota")).toHaveValue("texto largo que no quiero perder");
  });

  it("sin la protección React sí vacía los campos (el defecto que se corrige)", async () => {
    render(<Demo fail onCall={() => {}} protect={false} />);
    await userEvent.type(screen.getByLabelText("correo"), "a@b.co");
    await userEvent.click(screen.getByRole("button", { name: "Enviar" }));
    await screen.findByRole("alert");
    expect(screen.getByLabelText("correo")).toHaveValue("");
  });

  it("cancela el evento reset", () => {
    const event = { preventDefault: vi.fn() } as unknown as Parameters<typeof preventFormReset>[0];
    preventFormReset(event);
    expect(event.preventDefault).toHaveBeenCalled();
  });
});

describe("resetFormFields", () => {
  it("limpia a propósito los campos visibles y respeta los ocultos", () => {
    document.body.innerHTML = `<form><input type="hidden" name="id" value="123"><input name="a" value="x"><input name="b" value="y" ><textarea name="c">z</textarea></form>`;
    const form = document.querySelector("form")!;
    (form.elements.namedItem("a") as HTMLInputElement).defaultValue = "";
    (form.elements.namedItem("b") as HTMLInputElement).defaultValue = "base";
    (form.elements.namedItem("c") as HTMLTextAreaElement).value = "editado";
    (form.elements.namedItem("a") as HTMLInputElement).value = "escrito";
    resetFormFields(form);
    expect((form.elements.namedItem("a") as HTMLInputElement).value).toBe("");
    expect((form.elements.namedItem("b") as HTMLInputElement).value).toBe("base");
    expect((form.elements.namedItem("id") as HTMLInputElement).value).toBe("123");
    expect(() => resetFormFields(null)).not.toThrow();
  });
});
