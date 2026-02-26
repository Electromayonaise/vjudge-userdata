import axios from "axios";
import { resolveDifficulty } from "./difficultyProviders/index.js";

export default class VJudgeClient {
    constructor() {
        this.baseURL = "https://vjudge.net/status/data";
        this.headers = {
            "User-Agent": "Mozilla/5.0"
        };
        this.pageSize = 40;
        this.difficultyCache = new Map();
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
                res: 0,
                language: "",
                onlyFollowee: false,
                orderBy: "run_id",
                _: Date.now()
            }
        });

        return {
            submissions: response.data.data,
            total: response.data.recordsFiltered
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
        const { submissions, total } = await this.getUserSubmissions(username, page);

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
            const probNum = sub.probNum; // nombre
            const status = sub.status;

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
                problem: probNum,      // Nombre
                problemId: problemId,  // id interno de Vjudge
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
            hasMore: (page + 1) * this.pageSize < total,
            submissions: enriched,
            metrics,
            raw: submissions
        };
    }
}