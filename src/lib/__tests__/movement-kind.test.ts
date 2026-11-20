import { describe, expect, it } from "vitest";
import { describeMovement } from "../movement-kind";
import { ACCOUNT_ICONS, getAccountIcon } from "../account-icons";

describe("describeMovement", () => {
  it("un ingreso entra y suma; un gasto sale y resta", () => {
    expect(describeMovement("INCOME")).toMatchObject({ tone: "income", label: "Ingreso", sign: "+" });
    expect(describeMovement("EXPENSE")).toMatchObject({ tone: "expense", label: "Gasto", sign: "-" });
  });

  it("una transferencia no suma ni resta y dice hacia dónde va", () => {
    expect(describeMovement("TRANSFER", "OUTFLOW")).toMatchObject({ tone: "transfer", label: "Transferencia", sign: "", detail: "Sale hacia otra cuenta" });
    expect(describeMovement("TRANSFER", "INFLOW").detail).toBe("Entra desde otra cuenta");
  });

  it("cada tipo tiene un icono distinto", () => {
    const icons = new Set(["INCOME", "EXPENSE", "TRANSFER"].map((type) => describeMovement(type).Icon));
    expect(icons.size).toBe(3);
  });
});

describe("getAccountIcon", () => {
  it("usa el icono elegido y, si no hay o es un texto antiguo, el del tipo de cuenta", () => {
    const wallet = ACCOUNT_ICONS.find((icon) => icon.value === "wallet")!.Icon;
    expect(getAccountIcon("wallet", "SAVINGS")).toBe(wallet);
    expect(getAccountIcon(null, "CASH")).toBe(getAccountIcon("wallet", "OTHER"));
    expect(getAccountIcon("algo-que-no-existe", "CASH")).toBe(getAccountIcon(null, "CASH"));
  });

  it("los valores de la lista son únicos", () => {
    const values = ACCOUNT_ICONS.map((icon) => icon.value);
    expect(new Set(values).size).toBe(values.length);
  });
});
