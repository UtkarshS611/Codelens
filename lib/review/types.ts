import type { PullRequestData, ReviewFile } from "@/lib/github/types";

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