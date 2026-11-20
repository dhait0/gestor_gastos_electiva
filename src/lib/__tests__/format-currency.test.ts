import { describe, expect, it } from "vitest";
import { formatCurrency } from "../utils";

describe("formatCurrency", () => {
  it("no muestra signo menos en un cero negativo ni en valores que se redondean a cero", () => {
    expect(formatCurrency(-0)).not.toContain("-");
    expect(formatCurrency(-0.4)).not.toContain("-");
    expect(formatCurrency(0)).toBe(formatCurrency(-0));
  });

  it("conserva el signo de los negativos reales", () => {
    expect(formatCurrency(-1500)).toContain("-");
    expect(formatCurrency(-1500)).toContain("1.500");
  });
});
