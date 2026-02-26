import axios from "axios";

export default class VJudgeClient {
  constructor() {
    this.baseURL = "https://vjudge.net/status/data";
    this.headers = {
      "User-Agent": "Mozilla/5.0"
    };
    this.pageSize = 20;
  }

  async getUserSubmissions(username, page = 0) {
    const start = page * this.pageSize;

    const response = await axios.get(this.baseURL, {
      headers: this.headers,
      params: {
        draw: page + 1,
        start: start,
        length: this.pageSize,
        un: username,
        OJId: "All",
        probNum: "",
        res: 0, // 🔥 ALL submissions
        language: "",
        onlyFollowee: false,
        orderBy: "run_id",
        _: Date.now()
      }
    });

    console.log("DEBUG PAGINATION:", {
      page,
      start,
      count: response.data.data.length
    });

    return response.data.data;
  }

  async getProblemDifficulty(oj, problemId) {
    return "Unknown";
  }

  async getUserPageData(username, page = 0) {
    const submissions = await this.getUserSubmissions(username, page);

    if (!submissions || submissions.length === 0) {
      return {
        page,
        pageSize: this.pageSize,
        hasMore: false,
        submissions: [],
        metrics: {
          totalSubmissions: 0,
          accepted: 0,
          uniqueSolved: 0,
          acceptanceRate: 0
        },
        raw: []
      };
    }

    let acceptedCount = 0;
    let uniqueAcceptedProblems = new Set();

    const enriched = [];

    for (const sub of submissions) {
      const oj = sub.oj;
      const problemId = sub.problemId;
      const status = sub.status;

      if (status === "Accepted") {
        acceptedCount++;
        uniqueAcceptedProblems.add(`${oj}-${problemId}`);
      }

      const difficulty = await this.getProblemDifficulty(oj, problemId);

      enriched.push({
        oj,
        problemId,
        status,
        difficulty
      });
    }

    const metrics = {
      totalSubmissions: submissions.length,
      accepted: acceptedCount,
      uniqueSolved: uniqueAcceptedProblems.size,
      acceptanceRate:
        submissions.length === 0
          ? 0
          : ((acceptedCount / submissions.length) * 100).toFixed(2)
    };

    return {
      page,
      pageSize: this.pageSize,
      hasMore: submissions.length === this.pageSize,
      submissions: enriched,
      metrics,
      raw: submissions
    };
  }
}