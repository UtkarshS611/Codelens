import type {
    PullRequestData,
    ReviewFile
} from "@/lib/github/types";

import type {
    ReviewContext,
    ReviewContextFile,
} from "@/lib/review/types";

export function buildReviewContext(
    pr: PullRequestData,
    files: ReviewFile[]
): ReviewContext {
    const reviewFiles: ReviewContextFile[] =
        files.map((file) => ({
            path: file.path,
            status: file.status,

            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes,

            patch: file.patch,
            source: file.source,
        }));

    return {
        repository: {
            owner: pr.repository.owner,
            name: pr.repository.name,
            fullName: pr.repository.fullName,
        },

        pullRequest: {
            number: pr.pullRequest.number,
            title: pr.pullRequest.title,
            description: pr.pullRequest.body,
            author: pr.pullRequest.author,

            baseBranch: pr.pullRequest.baseBranch,
            headBranch: pr.pullRequest.headBranch,

            baseSha: pr.pullRequest.baseSha,
            headSha: pr.pullRequest.headSha,
        },

        files: reviewFiles,
    };
}