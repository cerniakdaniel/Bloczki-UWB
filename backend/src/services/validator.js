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

  for (const b of blocks) {
    if (b.type === "CONDITION") {
      const outs = outEdges.get(b.id);
      const labels = outs.map((e) => e.label.toUpperCase());
      const hasTak = labels.some((l) => ["TAK", "YES", "TRUE"].includes(l));
      const hasNie = labels.some((l) => ["NIE", "NO", "FALSE"].includes(l));
      if (outs.length !== 2 || !hasTak || !hasNie)
        errors.push(`Warunek "${b.content}" musi mieć gałęzie TAK i NIE.`);
    }
    if (b.type === "LOOP_WHILE" || b.type === "LOOP_FOR") {
      if (outEdges.get(b.id).length < 2)
        errors.push(`Pętla "${b.content}" musi mieć gałąź ciała i wyjście.`);
    }
  }

  if (startBlocks.length === 1) {
    const startId = startBlocks[0].id;
    const reachable = new Set();
    const dfs = (id) => {
      if (reachable.has(id)) return;
      reachable.add(id);
      for (const e of outEdges.get(id) || []) dfs(e.to);
    };
    dfs(startId);

    for (const b of blocks) {
      if (!reachable.has(b.id))
        errors.push(`Blok "${b.content || b.type}" jest nieosiągalny z START.`);
    }

    const stopIds = new Set(stopBlocks.map((b) => b.id));
    const canReachStop = new Set();
    const dfsStop = (id, visited) => {
      if (canReachStop.has(id)) return true;
      if (visited.has(id)) return false;
      if (stopIds.has(id)) {
        canReachStop.add(id);
        return true;
      }
      visited.add(id);
      let reaches = false;
      for (const e of outEdges.get(id) || []) {
        if (dfsStop(e.to, new Set(visited))) reaches = true;
      }
      if (reaches) canReachStop.add(id);
      return reaches;
    };
    for (const b of blocks) {
      if (reachable.has(b.id) && b.type !== "STOP") {
        if (!dfsStop(b.id, new Set()))
          errors.push(
            `Blok "${b.content || b.type}" jest w cyklu bez wyjścia do STOP.`,
          );
      }
    }
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = { validateDiagram };
