const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../models/database");

const find = (store, q) =>
  new Promise((res, rej) => store.find(q, (e, d) => (e ? rej(e) : res(d))));
const findOne = (store, q) =>
  new Promise((res, rej) => store.findOne(q, (e, d) => (e ? rej(e) : res(d))));
const insert = (store, doc) =>
  new Promise((res, rej) => store.insert(doc, (e, d) => (e ? rej(e) : res(d))));
const update = (store, q, u) =>
  new Promise((res, rej) =>
    store.update(q, u, {}, (e) => (e ? rej(e) : res())),
  );
const remove = (store, q) =>
  new Promise((res, rej) =>
    store.remove(q, { multi: true }, (e) => (e ? rej(e) : res())),
  );

router.post("/", async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: "Nazwa jest wymagana." });
  const now = new Date().toISOString();
  const doc = await insert(db.diagrams, {
    id: uuidv4(),
    name,
    created_at: now,
    updated_at: now,
  });
  res.status(201).json(doc);
});

router.get("/", async (req, res) => {
  const all = await find(db.diagrams, {});
  all.sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  res.json(all);
});

router.get("/:id", async (req, res) => {
  const diagram = await findOne(db.diagrams, { id: req.params.id });
  if (!diagram)
    return res.status(404).json({ error: "Nie znaleziono diagramu." });
  const blks = await find(db.blocks, { diagram_id: req.params.id });
  const conns = await find(db.connections, { diagram_id: req.params.id });
  res.json({ ...diagram, blocks: blks, connections: conns });
});

router.put("/:id", async (req, res) => {
  const { name, blocks = [], connections = [] } = req.body;
  const diagram = await findOne(db.diagrams, { id: req.params.id });
  if (!diagram)
    return res.status(404).json({ error: "Nie znaleziono diagramu." });
  const now = new Date().toISOString();
  await update(
    db.diagrams,
    { id: req.params.id },
    { $set: { name: name || diagram.name, updated_at: now } },
  );
  await remove(db.blocks, { diagram_id: req.params.id });
  await remove(db.connections, { diagram_id: req.params.id });
  for (const b of blocks)
    await insert(db.blocks, {
      id: b.id || uuidv4(),
      diagram_id: req.params.id,
      type: b.type,
      content: b.content || "",
      position_x: b.position_x || 0,
      position_y: b.position_y || 0,
    });
  for (const c of connections)
    await insert(db.connections, {
      id: c.id || uuidv4(),
      diagram_id: req.params.id,
      from_block_id: c.from_block_id,
      to_block_id: c.to_block_id,
      label: c.label || "",
    });
  res.json({ success: true, updated_at: now });
});

router.delete("/:id", async (req, res) => {
  await remove(db.diagrams, { id: req.params.id });
  await remove(db.blocks, { diagram_id: req.params.id });
  await remove(db.connections, { diagram_id: req.params.id });
  res.json({ success: true });
});

router.patch("/:id", async (req, res) => {
  const { name } = req.body;
  const diagram = await findOne(db.diagrams, { id: req.params.id });
  if (!diagram)
    return res.status(404).json({ error: "Nie znaleziono diagramu." });
  const now = new Date().toISOString();
  await update(
    db.diagrams,
    { id: req.params.id },
    { $set: { name, updated_at: now } },
  );
  res.json({ success: true });
});

const { validateDiagram } = require("../services/validator");

router.post("/:id/validate", async (req, res) => {
  const blks = await find(db.blocks, { diagram_id: req.params.id });
  const conns = await find(db.connections, { diagram_id: req.params.id });
  const result = validateDiagram(blks, conns);
  await insert(db.validations, {
    id: uuidv4(),
    diagram_id: req.params.id,
    is_valid: result.isValid,
    errors: result.errors,
    created_at: new Date().toISOString(),
  });
  res.json(result);
});

const { generatePseudocode } = require("../services/generator");

router.post("/:id/generate", async (req, res) => {
  const blks = await find(db.blocks, { diagram_id: req.params.id });
  const conns = await find(db.connections, { diagram_id: req.params.id });
  const validation = validateDiagram(blks, conns);
  if (!validation.isValid)
    return res
      .status(422)
      .json({ error: "Diagram jest niepoprawny.", errors: validation.errors });
  try {
    const pseudocode = generatePseudocode(blks, conns);
    res.json({ pseudocode });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
