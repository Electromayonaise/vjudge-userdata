import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import VJudgeClient from "./vjudgeClient.js";

const app = express();
const PORT = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/user/:username", async (req, res) => {
  try {
    const { username } = req.params;
    const page = parseInt(req.query.page) || 0;
    const pageSize = parseInt(req.query.pageSize) || 20;

    const vjudge = new VJudgeClient(pageSize);

    const data = await vjudge.getUserPageData(username, page);

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error fetching data" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});