const Datastore = require('@seald-io/nedb');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '../../../data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

const diagrams    = new Datastore({ filename: path.join(DATA_DIR, 'diagrams.db'),    autoload: true });
const blocks      = new Datastore({ filename: path.join(DATA_DIR, 'blocks.db'),      autoload: true });
const connections = new Datastore({ filename: path.join(DATA_DIR, 'connections.db'), autoload: true });
const validations = new Datastore({ filename: path.join(DATA_DIR, 'validations.db'), autoload: true });
const exports_h   = new Datastore({ filename: path.join(DATA_DIR, 'exports.db'),     autoload: true });

module.exports = { diagrams, blocks, connections, validations, exports_h };
