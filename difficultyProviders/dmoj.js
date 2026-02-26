import axios from "axios";

export async function getDMOJDifficulty(problemId) {
  try {
    const res = await axios.get(
      `https://dmoj.ca/api/problem/${problemId}`
    );

    return res.data.points || "Unknown";
  } catch {
    return "Unknown";
  }
}