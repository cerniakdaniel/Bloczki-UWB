function validateDiagram(blocks, connections) {
  const errors = [];
  if (!blocks.length)
    return { isValid: false, errors: ["Diagram jest pusty."] };

  const blockMap = new Map(blocks.map((b) => [b.id, b]));
  const outEdges = new Map();
  const inEdges = new Map();

  for (const b of blocks) {
    outEdges.set(b.id, []);
    inEdges.set(b.id, []);
  }
  for (const c of connections) {
    if (!blockMap.has(c.from_block_id) || !blockMap.has(c.to_block_id))
      continue;
    outEdges.get(c.from_block_id).push({ to: c.to_block_id, label: c.label });
    inEdges.get(c.to_block_id).push({ from: c.from_block_id, label: c.label });
  }

  const startBlocks = blocks.filter((b) => b.type === "START");
  const stopBlocks = blocks.filter((b) => b.type === "STOP");

  if (startBlocks.length === 0) errors.push("Brak bloku START.");
  if (startBlocks.length > 1) errors.push("Więcej niż jeden blok START.");
  if (stopBlocks.length === 0) errors.push("Brak bloku STOP.");

  for (const b of blocks) {
    if (b.type !== "START" && inEdges.get(b.id).length === 0)
      errors.push(`Blok "${b.content || b.type}" nie ma wejścia.`);
    if (b.type !== "STOP" && outEdges.get(b.id).length === 0)
      errors.push(`Blok "${b.content || b.type}" nie ma wyjścia.`);
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = { validateDiagram };
