import axios from "axios";
import { resolveDifficulty } from "./difficultyProviders/index.js";

export default class VJudgeClient {
  constructor(pageSize = 20) {
    this.baseURL = "https://vjudge.net/status/data";
    this.headers = {
      "User-Agent": "Mozilla/5.0"
    };

    this.MAX_PAGE_SIZE = 100;
    this.VJUDGE_LIMIT = 20;

    this.pageSize = Math.min(
      Math.max(parseInt(pageSize) || 20, 1),
      this.MAX_PAGE_SIZE
    );

    this.difficultyCache = new Map();
    this.contestCache = new Map();
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

  async getProblemDifficulty(oj, problemId, probNum, slug) {
    const cacheKey = `${oj}-${problemId}`;

    if (this.difficultyCache.has(cacheKey)) {
      return this.difficultyCache.get(cacheKey);
    }

    let difficultyObject = {
      raw: "Unknown",
      normalized: "Unknown"
    };

    try {
      const result = await resolveDifficulty(oj, {
        probNum,
        slug
      });

      // Aseguramos formato correcto
      if (result && typeof result === "object") {
        difficultyObject = result;
      } else {
        difficultyObject = {
          raw: result,
          normalized: result
        };
      }

    } catch (err) {
      console.log("Difficulty fetch error:", err.message);
    }

    this.difficultyCache.set(cacheKey, difficultyObject);
    return difficultyObject;
  }

  async getContestName(contestId) {
    if (!contestId) return null;

    if (this.contestCache.has(contestId)) {
      return this.contestCache.get(contestId);
    }

    try {
      const response = await axios.get(
        `https://vjudge.net/contest/rank/single/${contestId}`,
        { headers: this.headers }
      );

      const title = response.data?.title || null;

      this.contestCache.set(contestId, title);
      return title;
    } catch (err) {
      console.log("Contest fetch error:", err.message);
      this.contestCache.set(contestId, null);
      return null;
    }
  }

  async getUserPageData(username, page = 0) {
    const { submissions, total } = await this.getUserSubmissions(
      username,
      page
    );

    let acceptedCount = 0;
    let uniqueAcceptedProblems = new Set();

    const uniqueContests = new Set();
    const uniqueProblems = new Set();

    for (const sub of submissions) {
      if (sub.status === "Accepted") {
        acceptedCount++;
        uniqueAcceptedProblems.add(`${sub.oj}-${sub.problemId}`);
      }

      if (sub.contestId) uniqueContests.add(sub.contestId);

      uniqueProblems.add(
        `${sub.oj}|||${sub.problemId}|||${sub.probNum}`
      );
    }

    await Promise.all(
      [...uniqueContests].map(id => this.getContestName(id))
    );

    await Promise.all(
      [...uniqueProblems].map(key => {
        const [oj, problemId, probNum] = key.split("|||");
        const slug = probNum;

        return this.getProblemDifficulty(
          oj,
          problemId,
          probNum,
          slug
        );
      })
    );

    const enriched = submissions.map(sub => {
      const diff =
        this.difficultyCache.get(`${sub.oj}-${sub.problemId}`) ||
        { raw: "Unknown", normalized: "Unknown" };

      return {
        oj: sub.oj,
        problem: sub.probNum,
        problemId: sub.problemId,
        slug: sub.probNum,
        contestId: sub.contestId,
        contestNum: sub.contestNum,
        contestName: this.contestCache.get(sub.contestId) || null,
        status: sub.status,
        rawDifficulty: diff.raw,
        normalizedDifficulty: diff.normalized
      };
    });

    const hasMore = submissions.length === this.pageSize;

    return {
      page,
      pageSize: this.pageSize,
      totalRecords: total,
      totalPages: Math.ceil(total / this.pageSize),
      hasMore,
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