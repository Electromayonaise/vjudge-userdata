import { getCodeforcesDifficulty } from "./codeforces.js";
import { getAtCoderDifficulty } from "./atcoder.js";
import { getLeetCodeDifficulty } from "./leetcode.js";
import { getDMOJDifficulty } from "./dmoj.js";
import { getCSESDifficulty } from "./cses.js";

export async function resolveDifficulty(oj, probNum) {
  switch (oj) {
    case "CodeForces":
      return await getCodeforcesDifficulty(probNum);

    case "AtCoder":
      return await getAtCoderDifficulty(probNum);

    case "LeetCode":
      return await getLeetCodeDifficulty(probNum);

    case "DMOJ":
      return await getDMOJDifficulty(probNum);

    case "CSES":
      return getCSESDifficulty(probNum);

    default:
      return "Unknown";
  }
}