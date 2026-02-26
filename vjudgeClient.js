import axios from "axios";
import { resolveDifficulty } from "./difficultyProviders/index.js";

export default class VJudgeClient {
  constructor(pageSize = 20) {
    this.baseURL = "https://vjudge.net/status/data";
    this.headers = {
      "User-Agent": "Mozilla/5.0"
    };

    this.MAX_PAGE_SIZE = 100;

    // límite real de VJudge
    this.VJUDGE_LIMIT = 20;

    // normalizamos el pageSize
    this.pageSize = Math.min(
      Math.max(parseInt(pageSize) || 20, 1),
      this.MAX_PAGE_SIZE
    );

    this.difficultyCache = new Map();
  }

  async getUserSubmissions(username, page = 0) {
    const requestedSize = this.pageSize;

    const startGlobal = page * requestedSize;
    const endGlobal = startGlobal + requestedSize;

    const firstPage = Math.floor(startGlobal / this.VJUDGE_LIMIT);
    const lastPage = Math.floor((endGlobal - 1) / this.VJUDGE_LIMIT);

    const requests = [];

    for (let p = firstPage; p <= lastPage; p++) {
      const start = p * this.VJUDGE_LIMIT;

      requests.push(
        axios.get(this.baseURL, {
          headers: this.headers,
          params: {
            draw: p + 1,
            start: start,
            length: this.VJUDGE_LIMIT,
            un: username,
            OJId: "All",
            probNum: "",
            res: 0,
            language: "",
            onlyFollowee: false,
            orderBy: "run_id",
            _: Date.now()
          }
        })
      );
    }

    // 🔥 requests en paralelo
    const responses = await Promise.all(requests);

    let total = 0;
    let allSubmissions = [];

    for (const response of responses) {
      total = response.data.recordsFiltered;
      allSubmissions = allSubmissions.concat(response.data.data);
    }

    const offsetInsideFirst = startGlobal % this.VJUDGE_LIMIT;

    const sliced = allSubmissions.slice(
      offsetInsideFirst,
      offsetInsideFirst + requestedSize
    );

    return {
      submissions: sliced,
      total
    };
  }

  async getProblemDifficulty(oj, problemId, probNum) {
    const cacheKey = `${oj}-${problemId}`;

    if (this.difficultyCache.has(cacheKey)) {
      return this.difficultyCache.get(cacheKey);
    }

    let difficulty = "Unknown";

    try {
      difficulty = await resolveDifficulty(oj, probNum);
    } catch (err) {
      console.log("Difficulty fetch error:", err.message);
    }

    this.difficultyCache.set(cacheKey, difficulty);
    return difficulty;
  }

  async getUserPageData(username, page = 0) {
    const { submissions, total } = await this.getUserSubmissions(
      username,
      page
    );

    let acceptedCount = 0;
    let uniqueAcceptedProblems = new Set();
    const enriched = [];

    for (const sub of submissions) {
      const { oj, problemId, probNum, status } = sub;

      if (status === "Accepted") {
        acceptedCount++;
        uniqueAcceptedProblems.add(`${oj}-${problemId}`);
      }

      const difficulty = await this.getProblemDifficulty(
        oj,
        problemId,
        probNum
      );

      enriched.push({
        oj,
        problem: probNum,
        problemId,
        status,
        difficulty
      });
    }

    return {
      page,
      pageSize: this.pageSize,
      totalRecords: total,
      totalPages: Math.ceil(total / this.pageSize),
      hasMore: (page + 1) * this.pageSize < total,
      submissions: enriched,
      metrics: {
        totalSubmissions: submissions.length,
        accepted: acceptedCount,
        uniqueSolved: uniqueAcceptedProblems.size,
        acceptanceRate:
          submissions.length === 0
            ? 0
            : ((acceptedCount / submissions.length) * 100).toFixed(2)
      },
      raw: submissions
    };
  }
}