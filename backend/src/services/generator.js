function generatePseudocode(blocks, connections) {
  const blockMap = new Map(blocks.map((b) => [b.id, b]));
  const outEdges = new Map();
  for (const b of blocks) outEdges.set(b.id, []);
  for (const c of connections) {
    if (!blockMap.has(c.from_block_id) || !blockMap.has(c.to_block_id))
      continue;
    outEdges.get(c.from_block_id).push({ to: c.to_block_id, label: c.label });
  }

  const start = blocks.find((b) => b.type === "START");
  if (!start) throw new Error("Brak bloku START");

  const lines = [];
  const visited = new Set();

  function pad(indent) {
    return "  ".repeat(indent);
  }
  function getNext(id) {
    return outEdges.get(id) || [];
  }

  function traverse(id, indent) {
    if (!id || visited.has(id)) return;
    visited.add(id);
    const block = blockMap.get(id);
    if (!block) return;
    const p = pad(indent);

    switch (block.type) {
      case "START": {
        lines.push("POCZĄTEK");
        const n = getNext(id);
        if (n.length) traverse(n[0].to, indent);
        break;
      }
      case "STOP": {
        lines.push("KONIEC");
        break;
      }
      case "OPERATION": {
        lines.push(p + (block.content || "operacja"));
        const n = getNext(id);
        if (n.length) traverse(n[0].to, indent);
        break;
      }
      case "INPUT": {
        const content = block.content || "";
        const contentLines = content
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (contentLines.length === 0) {
          lines.push(p + "wczytaj");
        } else {
          for (const line of contentLines) {
            const val = line.replace(/^(wczytaj|read)\s*/i, "");
            lines.push(p + `wczytaj ${val}`);
          }
        }
        const n = getNext(id);
        if (n.length) traverse(n[0].to, indent);
        break;
      }
      case "OUTPUT": {
        const content = block.content || "";
        const contentLines = content
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (contentLines.length === 0) {
          lines.push(p + "wypisz");
        } else {
          for (const line of contentLines) {
            const val = line.replace(/^(wypisz|write)\s*/i, "");
            lines.push(p + `wypisz ${val}`);
          }
        }
        const n = getNext(id);
        if (n.length) traverse(n[0].to, indent);
        break;
      }
      default: {
        const n = getNext(id);
        if (n.length) traverse(n[0].to, indent);
        break;
      }
    }
  }

  traverse(start.id, 0);
  return lines.join("\n");
}

module.exports = { generatePseudocode };
