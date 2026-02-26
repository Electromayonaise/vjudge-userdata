import axios from "axios";

let cache = null;

export async function getCodeforcesDifficulty(probNum) {
  if (!cache) {
    const res = await axios.get(
      "https://codeforces.com/api/problemset.problems"
    );
    cache = res.data.result.problems;
  }

  const contestId = parseInt(probNum.match(/\d+/)?.[0]);
  const index = probNum.replace(contestId, "");

  const found = cache.find(
    p => p.contestId === contestId && p.index === index
  );

  return found?.rating || "Unknown";
}