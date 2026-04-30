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
        const contentLines = (block.content || "")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (!contentLines.length) {
          lines.push(p + "wczytaj");
        } else {
          for (const line of contentLines)
            lines.push(
              p + `wczytaj ${line.replace(/^(wczytaj|read)\s*/i, "")}`,
            );
        }
        const n = getNext(id);
        if (n.length) traverse(n[0].to, indent);
        break;
      }
      case "OUTPUT": {
        const contentLines = (block.content || "")
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        if (!contentLines.length) {
          lines.push(p + "wypisz");
        } else {
          for (const line of contentLines)
            lines.push(p + `wypisz ${line.replace(/^(wypisz|write)\s*/i, "")}`);
        }
        const n = getNext(id);
        if (n.length) traverse(n[0].to, indent);
        break;
      }
      case "CONDITION": {
        lines.push(p + `jeżeli ${block.content || "warunek"} wtedy`);
        const outs = getNext(id);
        const tak = outs.find((e) =>
          ["TAK", "YES", "TRUE", "T"].includes((e.label || "").toUpperCase()),
        );
        const nie = outs.find((e) =>
          ["NIE", "NO", "FALSE", "N"].includes((e.label || "").toUpperCase()),
        );
        if (tak) traverse(tak.to, indent + 1);
        lines.push(p + "w przeciwnym razie");
        if (nie) traverse(nie.to, indent + 1);
        lines.push(p + "koniec jeżeli");
        const after = findMergePoint(tak?.to, nie?.to, outEdges);
        if (after) {
          visited.delete(after);
          traverse(after, indent);
        }
        break;
      }
      case "LOOP_WHILE": {
        lines.push(p + `dopóki ${block.content || "warunek"} wykonuj`);
        const outs = getNext(id);
        const body =
          outs.find((e) =>
            ["TAK", "YES", "TRUE", "T"].includes((e.label || "").toUpperCase()),
          ) || outs[0];
        const exit = outs.find((e) => e !== body);
        if (body) traverse(body.to, indent + 1);
        lines.push(p + "koniec pętli");
        if (exit) {
          visited.delete(exit.to);
          traverse(exit.to, indent);
        }
        break;
      }
      case "LOOP_FOR": {
        lines.push(p + `dla ${block.content || "i"} wykonuj`);
        const outs = getNext(id);
        const body = outs[0];
        const exit = outs[1];
        if (body) traverse(body.to, indent + 1);
        lines.push(p + "koniec pętli");
        if (exit) {
          visited.delete(exit.to);
          traverse(exit.to, indent);
        }
        break;
      }
      default: {
        const n = getNext(id);
        if (n.length) traverse(n[0].to, indent);
        break;
      }
    }
  }

  function findMergePoint(aId, bId, outEdges) {
    if (!aId || !bId) return null;
    const reachA = new Set();
    const queue = [aId];
    while (queue.length) {
      const cur = queue.shift();
      if (reachA.has(cur)) continue;
      reachA.add(cur);
      for (const e of outEdges.get(cur) || []) queue.push(e.to);
    }
    const queueB = [bId];
    const visitedB = new Set();
    while (queueB.length) {
      const cur = queueB.shift();
      if (visitedB.has(cur)) continue;
      visitedB.add(cur);
      if (reachA.has(cur)) return cur;
      for (const e of outEdges.get(cur) || []) queueB.push(e.to);
    }
    return null;
  }

  traverse(start.id, 0);
  return lines.join("\n");
}

module.exports = { generatePseudocode };
