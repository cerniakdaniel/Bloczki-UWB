const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const db = require("../models/database");

const find = (store, q) =>
  new Promise((res, rej) => store.find(q, (e, d) => (e ? rej(e) : res(d))));
const insert = (store, doc) =>
  new Promise((res, rej) => store.insert(doc, (e, d) => (e ? rej(e) : res(d))));

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

module.exports = router;
