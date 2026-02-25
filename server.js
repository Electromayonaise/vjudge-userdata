import express from "express";
import cors from "cors";
import VJudgeClient from "./vjudgeClient.js";

const app = express();
const PORT = 3000;
const vjudge = new VJudgeClient();

// Cache simple en memoria
const cache = new Map();
const CACHE_DURATION = 60 * 1000; // 1 minuto

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

app.get("/api/user/:username", async (req, res) => {
  const { username } = req.params;

  if (!username) {
    return res.status(400).json({
      error: "Username is required"
    });
  }

  try {
    const cached = cache.get(username);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return res.json({
        ...cached.data,
        cached: true
      });
    }

    const stats = await vjudge.getUserDashboard(username);

    const result = {
      ...stats,
      cached: false
    };

    cache.set(username, {
      data: result,
      timestamp: Date.now()
    });

    res.json(result);

  } catch (error) {
    console.error("BACKEND ERROR:", error.message);

    res.status(500).json({
      error: "Internal server error",
      message: error.message
    });
  }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});