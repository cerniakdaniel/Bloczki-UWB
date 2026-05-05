const { generatePseudocode } = require("../src/services/generator");

const block = (id, type, content = "") => ({ id, type, content });
const conn = (from, to, label = "") => ({
  from_block_id: from,
  to_block_id: to,
  label,
});

test("prosty diagram", () => {
  const blocks = [
    block("s", "START"),
    block("o", "OUTPUT", "wynik"),
    block("e", "STOP"),
  ];
  const conns = [conn("s", "o"), conn("o", "e")];
  const code = generatePseudocode(blocks, conns);
  expect(code).toContain("POCZĄTEK");
  expect(code).toContain("wypisz wynik");
  expect(code).toContain("KONIEC");
});

test("diagram z if", () => {
  const blocks = [
    block("s", "START"),
    block("c", "CONDITION", "x > 0"),
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
  const code = generatePseudocode(blocks, conns);
  expect(code).toContain("jeżeli x > 0 wtedy");
  expect(code).toContain("w przeciwnym razie");
});
