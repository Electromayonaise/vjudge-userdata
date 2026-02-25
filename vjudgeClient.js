import axios from "axios";

class VJudgeClient {
  constructor() {
    this.baseURL = "https://vjudge.net";
  }

  async getUserSubmissions(username, page = 0, length = 100) {
    const response = await axios.get(`${this.baseURL}/status/data`, {
      params: {
        draw: 1,
        start: page * length,
        length,
        un: username,
        OJId: "All",
        probNum: "",
        res: 0,
        language: "",
        onlyFollowee: false,
        _: Date.now()
      },
      headers: {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json"
      }
    });

    return response.data.data;
  }

  // -------------------------------
  // PLATFORM DIFFICULTY FETCHERS
  // -------------------------------

  async getCodeforcesDifficulty(probNum) {
    try {
      const contestId = parseInt(probNum.match(/\d+/)?.[0]);
      const index = probNum.replace(contestId, "");

      const res = await axios.get(
        "https://codeforces.com/api/problemset.problems"
      );

      const problems = res.data.result.problems;
      const found = problems.find(
        p => p.contestId === contestId && p.index === index
      );

      return found?.rating || "Unknown";
    } catch {
      return "Integration error";
    }
  }

  async getLeetCodeDifficulty(slug) {
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

      return res.data.data.question.difficulty;
    } catch {
      return "Integration error";
    }
  }

  async getAtCoderDifficulty() {
    return "Integration pending";
  }

  async getCSESDifficulty() {
    return "Integration pending";
  }

  // -------------------------------
  // MAIN DASHBOARD LOGIC
  // -------------------------------

  async getUserDashboard(username) {
    const submissions = await this.getUserSubmissions(username);

    const accepted = submissions.filter(s => s.status === "Accepted");

    // Eliminar duplicados (último AC por problema)
    const uniqueProblems = {};
    accepted.forEach(sub => {
      const key = `${sub.oj}_${sub.probNum}`;
      if (!uniqueProblems[key] || sub.time > uniqueProblems[key].time) {
        uniqueProblems[key] = sub;
      }
    });

    const uniqueAccepted = Object.values(uniqueProblems);

    // Obtener dificultades
    const difficultyData = [];

    for (const sub of uniqueAccepted) {
      let difficulty;

      switch (sub.oj) {
        case "CodeForces":
          difficulty = await this.getCodeforcesDifficulty(sub.probNum);
          break;
        case "LeetCode":
          difficulty = await this.getLeetCodeDifficulty(sub.probNum);
          break;
        case "AtCoder":
          difficulty = await this.getAtCoderDifficulty();
          break;
        case "CSES":
          difficulty = await this.getCSESDifficulty();
          break;
        default:
          difficulty = "Integration pending";
      }

      difficultyData.push({
        platform: sub.oj,
        problem: sub.probNum,
        difficulty
      });
    }

    // -------------------------------
    // CALCULATED METRICS
    // -------------------------------

    const platforms = {};
    uniqueAccepted.forEach(sub => {
      platforms[sub.oj] = (platforms[sub.oj] || 0) + 1;
    });

    const firstSolve = new Date(
      Math.min(...uniqueAccepted.map(s => s.time))
    ).toLocaleString();

    const lastSolve = new Date(
      Math.max(...uniqueAccepted.map(s => s.time))
    ).toLocaleString();

    const languages = {};
    uniqueAccepted.forEach(sub => {
      languages[sub.language] = (languages[sub.language] || 0) + 1;
    });

    return {
      rawSubmissions: {
        username,
        totalAccepted: uniqueAccepted.length,
        submissions: uniqueAccepted.map(sub => ({
          platform: sub.oj,
          problem: sub.probNum,
          language: sub.language,
          runtime: sub.runtime,
          date: new Date(sub.time).toLocaleString()
        }))
      },
      difficultyData,
      calculatedMetrics: {
        totalUniqueSolved: uniqueAccepted.length,
        problemsByPlatform: platforms,
        firstSolve,
        lastSolve,
        languagesUsed: languages
      }
    };
  }
}

export default VJudgeClient;