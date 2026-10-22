import type { ReviewFile } from "@/lib/github/types";

export interface ReviewContext {
    repository: {
        owner: string;
        name: string;
        fullName: string;
    };

    pullRequest: {
        number: number;
        title: string;
        description: string | null;
        author: string;

        baseBranch: string;
        headBranch: string;

        baseSha: string;
        headSha: string;
    };

    files: ReviewContextFile[];
}

export interface ReviewContextFile {
    path: string;
    status: string;

    additions: number;
    deletions: number;
    changes: number;

    patch: string | null;
    source: string | null;
}

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

export type FindingCategory = "bug" | "security" | "performance" | "maintainability" | "style" | "logic" | "other";

export interface ReviewFinding {
    file: string;

    startLine: number | null;
    endLine: number | null;

    severity: FindingSeverity;
    category: FindingCategory;

    title: string;
    description: string;

    suggestion: string | null;

    confidence: number | null;
}

export interface ReviewResult {
    summary: string;

    findings: ReviewFinding[];
}
