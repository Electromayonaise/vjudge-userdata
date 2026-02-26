import axios from "axios";

let cache = null;

export async function getAtCoderDifficulty(probNum) {
  if (!cache) {
    const res = await axios.get(
      "https://kenkoooo.com/atcoder/resources/problem-models.json"
    );
    cache = res.data;
  }

  return cache[probNum]?.difficulty || "Unknown";
}