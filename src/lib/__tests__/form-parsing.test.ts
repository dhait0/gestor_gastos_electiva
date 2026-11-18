import { describe, expect, it } from "vitest";
import { readCheckbox, readOptional } from "../form-parsing";

const form = (entries: Record<string, string>) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries(entries)) fd.set(k, v);
  return fd;
};

describe("readCheckbox", () => {
  it("marcado ('on') es true", () => expect(readCheckbox(form({ a: "on" }), "a")).toBe(true));
  it("desmarcado (ausente) es false, no null", () => expect(readCheckbox(form({}), "a")).toBe(false));
  it("acepta 'true' y rechaza otros valores", () => {
    expect(readCheckbox(form({ a: "true" }), "a")).toBe(true);
    expect(readCheckbox(form({ a: "false" }), "a")).toBe(false);
  });
});

describe("readOptional", () => {
  it("devuelve el valor si hay texto", () => expect(readOptional(form({ a: "700000" }), "a")).toBe("700000"));
  it("vacío o solo espacios es undefined (no 0)", () => {
    expect(readOptional(form({ a: "" }), "a")).toBeUndefined();
    expect(readOptional(form({ a: "   " }), "a")).toBeUndefined();
  });
  it("campo ausente es undefined", () => expect(readOptional(form({}), "a")).toBeUndefined());
  it("conserva el cero explícito", () => expect(readOptional(form({ a: "0" }), "a")).toBe("0"));
});
