import mongoose from "mongoose";

import { PullRequest } from "@/lib/db/models/PullRequest";

interface UpsertPullRequestParams {
    githubId: number;

    repositoryId: mongoose.Types.ObjectId;

    number: number;

    title: string;

    description: string | null;

    author: {
        username: string;
        githubId?: number;
    };

    baseBranch: string;
    headBranch: string;

    baseSha: string;
    headSha: string;
}

export async function findOrCreatePullRequest(
    params: UpsertPullRequestParams
) {
    const pullRequest = await PullRequest.findOneAndUpdate(
        {
            repositoryId: params.repositoryId,
            number: params.number,
        },
        {
            $set: {
                githubId: params.githubId,
                title: params.title,
                description: params.description,
                author: params.author,
                baseBranch: params.baseBranch,
                headBranch: params.headBranch,
                baseSha: params.baseSha,
                headSha: params.headSha,
            },

            $setOnInsert: {
                repositoryId: params.repositoryId,
                number: params.number,
                status: "pending",
            },
        },
        {
            returnDocument: "after",
            upsert: true,
            setDefaultsOnInsert: true,
        }
    );

    return pullRequest;
}