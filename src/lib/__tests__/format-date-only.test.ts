import { afterEach, describe, expect, it } from "vitest";
import { formatDateOnly } from "../utils";

const TZ_ORIGINAL = process.env.TZ;

afterEach(() => {
  if (TZ_ORIGINAL === undefined) delete process.env.TZ;
  else process.env.TZ = TZ_ORIGINAL;
});

describe("formatDateOnly (fechas YYYY-MM-DD sin desfase de zona horaria)", () => {
  it("en Colombia (UTC-5) muestra el mismo día guardado, no el anterior", () => {
    process.env.TZ = "America/Bogota";
    // Regresión: new Date("2026-11-30") mostraba el 29 en esta zona.
    expect(new Date("2026-11-30").getDate()).toBe(29);
    expect(formatDateOnly("2026-11-30", { day: "numeric" })).toBe("30");
  });

  it("no cambia el día en zonas con desfase positivo", () => {
    process.env.TZ = "Asia/Tokyo";
    expect(formatDateOnly("2026-11-30", { day: "numeric" })).toBe("30");
  });

  it("respeta cambio de mes y año", () => {
    process.env.TZ = "America/Bogota";
    expect(formatDateOnly("2027-01-01", { day: "numeric", month: "numeric", year: "numeric" })).toBe("1/1/2027");
  });

  it("acepta timestamps ISO tomando solo la fecha", () => {
    process.env.TZ = "America/Bogota";
    expect(formatDateOnly("2026-11-17T00:00:00Z", { day: "numeric" })).toBe("17");
  });
});
