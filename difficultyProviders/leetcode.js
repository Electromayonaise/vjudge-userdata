import axios from "axios";

export async function getLeetCodeDifficulty(slug) {
  try {
    const res = await axios.post("https://leetcode.com/graphql", {
      query: `
        query getQuestionDetail($titleSlug: String!) {
          question(titleSlug: $titleSlug) {
            difficulty
          }
        }
      `,
      variables: { titleSlug: slug }
    });

    return res.data.data.question.difficulty || "Unknown";
  } catch {
    return "Unknown";
  }
}