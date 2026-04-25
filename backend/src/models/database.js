const Datastore = require("@seald-io/nedb");
const path = require("path");
const fs = require("fs");

const DATA_DIR = path.join(__dirname, "../../../data");
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const diagrams = new Datastore({
  filename: path.join(DATA_DIR, "diagrams.db"),
  autoload: true,
});

module.exports = { diagrams };
