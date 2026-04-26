const express = require("express");
const cors = require("cors");
const diagramsRouter = require("./routes/diagrams");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/diagrams", diagramsRouter);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Błąd serwera." });
});

app.listen(PORT, () =>
  console.log(`Backend działa na http://localhost:${PORT}`),
);
module.exports = app;
