import axios from "axios";

export async function getCodeChefDifficulty(problemCode) {
  if (!problemCode) return "Unknown";

  try {
    const res = await axios.get(
      `https://www.codechef.com/api/contests/PRACTICE/problems/${problemCode}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0",
          "Accept": "application/json"
        }
      }
    );

    return res.data?.difficulty_rating || "Unknown";
  } catch (err) {
    return "Unknown";
  }
}