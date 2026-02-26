export function getCSESDifficulty(problemId) {
  if (!problemId) return "Unknown";

  if (problemId.includes("introductory"))
    return 800;

  if (problemId.includes("sorting"))
    return 1200;

  if (problemId.includes("graph"))
    return 1600;

  return 1000;
}