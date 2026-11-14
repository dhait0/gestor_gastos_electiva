import { describe, it, expect, vi, afterEach } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AppError from "@/app/(app)/error";
import Loading from "@/app/(app)/loading";
import NotFound from "@/app/not-found";

afterEach(cleanup);

describe("error de la app (UC-46)", () => {
  it("muestra un mensaje claro, sin detalles internos, y permite reintentar", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const reset = vi.fn();
    const error = Object.assign(new Error("password authentication failed for user postgres at 10.0.0.5"), { digest: "abc123" });

    render(<AppError error={error} reset={reset} />);

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Algo salió mal" })).toBeInTheDocument();
    // El mensaje técnico nunca llega al usuario; solo el código de referencia
    expect(screen.queryByText(/postgres|10\.0\.0\.5|password authentication/i)).toBeNull();
    expect(screen.getByText(/abc123/)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Reintentar" }));
    expect(reset).toHaveBeenCalledTimes(1);
  });

  it("ofrece una salida al inicio", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<AppError error={new Error("x")} reset={() => {}} />);
    expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute("href", "/dashboard");
  });

  it("registra solo el digest en consola, no el mensaje del error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    render(<AppError error={Object.assign(new Error("secreto interno"), { digest: "d-1" })} reset={() => {}} />);
    expect(spy).toHaveBeenCalledWith("[app-error]", "d-1");
    expect(JSON.stringify(spy.mock.calls)).not.toContain("secreto interno");
  });
});

describe("estado de carga (UC-47)", () => {
  it("se anuncia a tecnologías de apoyo como ocupado", () => {
    render(<Loading />);
    const status = screen.getByRole("status");
    expect(status).toHaveAttribute("aria-busy", "true");
    expect(screen.getByText("Cargando…")).toBeInTheDocument();
  });
});

describe("404", () => {
  it("está en español y ofrece volver al inicio", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { name: "No encontramos esa página" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Ir al inicio" })).toHaveAttribute("href", "/dashboard");
  });
});
