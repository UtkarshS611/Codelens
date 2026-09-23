export interface PullRequestData {
    action: string;

    installationId: number;

    repository: {
        owner: string;
        name: string;
        fullName: string;
    };

    pullRequest: {
        number: number;
        title: string;
        body: string | null;
        state: string;
        author: string;

        baseBranch: string;
        headBranch: string;

        baseSha: string;
        headSha: string;
    };
}

export interface ReviewFile {
    path: string;
    previousPath?: string;

    status: string;

    additions: number;
    deletions: number;
    changes: number;

    patch: string | null;

    source: string | null;
}