const { validateDiagram } = require("../src/services/validator");

const block = (id, type, content = "") => ({ id, type, content });
const conn = (from, to, label = "") => ({
  from_block_id: from,
  to_block_id: to,
  label,
});

describe("Validator", () => {
  test("brak START", () => {
    const r = validateDiagram([block("1", "STOP")], []);
    expect(r.isValid).toBe(false);
    expect(r.errors.some((e) => e.includes("START"))).toBe(true);
  });

  test("brak STOP", () => {
    const r = validateDiagram([block("1", "START")], []);
    expect(r.isValid).toBe(false);
    expect(r.errors.some((e) => e.includes("STOP"))).toBe(true);
  });

  test("dwa START", () => {
    const r = validateDiagram(
      [block("1", "START"), block("2", "START"), block("3", "STOP")],
      [conn("1", "3"), conn("2", "3")],
    );
    expect(r.errors.some((e) => e.includes("jeden blok START"))).toBe(true);
  });

  test("blok bez wyjścia", () => {
    const r = validateDiagram(
      [block("1", "START"), block("2", "OPERATION", "x=1"), block("3", "STOP")],
      [conn("1", "2")],
    );
    expect(r.errors.some((e) => e.includes("wyjścia"))).toBe(true);
  });

  test("warunek bez gałęzi TAK/NIE", () => {
    const r = validateDiagram(
      [block("1", "START"), block("2", "CONDITION", "x>0"), block("3", "STOP")],
      [conn("1", "2"), conn("2", "3", "TAK")],
    );
    expect(r.errors.some((e) => e.includes("TAK i NIE"))).toBe(true);
  });

  test("blok nieosiągalny", () => {
    const r = validateDiagram(
      [block("1", "START"), block("2", "STOP"), block("3", "OPERATION", "x=1")],
      [conn("1", "2")],
    );
    expect(r.errors.some((e) => e.includes("nieosiągalny"))).toBe(true);
  });

  test("poprawny prosty diagram", () => {
    const r = validateDiagram(
      [block("1", "START"), block("2", "OPERATION", "x=1"), block("3", "STOP")],
      [conn("1", "2"), conn("2", "3")],
    );
    expect(r.isValid).toBe(true);
  });

  test("poprawny diagram z warunkiem", () => {
    const blocks = [
      block("s", "START"),
      block("c", "CONDITION", "x>0"),
      block("a", "OUTPUT", "Dodatnia"),
      block("b", "OUTPUT", "Niedodatnia"),
      block("e", "STOP"),
    ];
    const conns = [
      conn("s", "c"),
      conn("c", "a", "TAK"),
      conn("c", "b", "NIE"),
      conn("a", "e"),
      conn("b", "e"),
    ];
    const r = validateDiagram(blocks, conns);
    expect(r.isValid).toBe(true);
  });

  test("wykrycie cyklu bez STOP", () => {
    const blocks = [
      block("s", "START"),
      block("a", "OPERATION", "x=1"),
      block("e", "STOP"),
    ];
    const conns = [conn("s", "a"), conn("a", "a"), conn("a", "e")];
    const r = validateDiagram(blocks, conns);
    expect(r).toHaveProperty("isValid");
  });
});
