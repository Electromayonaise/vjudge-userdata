import { getCodeforcesDifficulty } from "./codeforces.js";
import { getAtCoderDifficulty } from "./atcoder.js";
import { getLeetCodeDifficulty } from "./leetcode.js";
import { getDMOJDifficulty } from "./dmoj.js";
import { getCSESDifficulty } from "./cses.js";
import { getHackerRankDifficulty } from "./hackerrank.js";
import { getCodeChefDifficulty } from "./codechef.js";
import { categorizeDifficulty } from "./difficultyNormalizer.js";

export async function resolveDifficulty(oj, problemMeta) {
  const { probNum, slug } = problemMeta || {};
  let rawDifficulty = "Unknown";

  switch (oj) {
    case "CodeForces":
      rawDifficulty = await getCodeforcesDifficulty(probNum);
      break;

    case "AtCoder":
      rawDifficulty = await getAtCoderDifficulty(probNum);
      break;

    case "LeetCode":
      rawDifficulty = await getLeetCodeDifficulty(slug || probNum);
      break;

    case "DMOJ":
      rawDifficulty = await getDMOJDifficulty(probNum);
      break;

    case "CSES":
      rawDifficulty = getCSESDifficulty(probNum);
      break;

    case "HackerRank":
      rawDifficulty = await getHackerRankDifficulty(slug || probNum);
      break;

    case "CodeChef":
      rawDifficulty = await getCodeChefDifficulty(probNum);
      break;

    default:
      rawDifficulty = "Unknown";
  }

  return categorizeDifficulty(oj, rawDifficulty);
}