import axios from "axios";

export async function getHackerRankDifficulty(slug) {
  if (!slug) return "Unknown";

  try {
    const res = await axios.get(
      `https://www.hackerrank.com/rest/contests/master/challenges/${slug}/`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      }
    );

    return res.data?.model?.difficulty_name || "Unknown";
  } catch (err) {
    return "Unknown";
  }
}