import type { PullRequestData } from "./types";

export function parsePullRequest(
    payload: any
): PullRequestData {
    const pullRequest = payload.pull_request;
    const repository = payload.repository;

    return {
        action: payload.action,

        installationId: payload.installation.id,

        repository: {
            owner: repository.owner.login,
            name: repository.name,
            fullName: repository.full_name,
        },

        pullRequest: {
            number: pullRequest.number,
            title: pullRequest.title,
            body: pullRequest.body,
            state: pullRequest.state,
            author: pullRequest.user.login,

            baseBranch: pullRequest.base.ref,
            headBranch: pullRequest.head.ref,

            baseSha: pullRequest.base.sha,
            headSha: pullRequest.head.sha,
        },
    };
}