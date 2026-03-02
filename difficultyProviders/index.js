import { getCodeforcesDifficulty } from "./codeforces.js";
import { getAtCoderDifficulty } from "./atcoder.js";
import { getLeetCodeDifficulty } from "./leetcode.js";
import { getDMOJDifficulty } from "./dmoj.js";
import { getCSESDifficulty } from "./cses.js";
import { getHackerRankDifficulty } from "./hackerrank.js";
import { getCodeChefDifficulty } from "./codechef.js";

export async function resolveDifficulty(oj, problemMeta) {
  const { probNum, slug } = problemMeta || {};

  switch (oj) {
    case "CodeForces":
      return await getCodeforcesDifficulty(probNum);

    case "AtCoder":
      return await getAtCoderDifficulty(probNum);

    case "LeetCode":
      return await getLeetCodeDifficulty(slug || probNum);

    case "DMOJ":
      return await getDMOJDifficulty(probNum);

    case "CSES":
      return getCSESDifficulty(probNum);

    case "HackerRank":
      return await getHackerRankDifficulty(slug || probNum);

    case "CodeChef":
      return await getCodeChefDifficulty(probNum);

    default:
      return "Unknown";
  }
}