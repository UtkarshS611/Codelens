import mongoose from "mongoose";

import {
    Review,
    type ReviewStatus,
    type IReviewFinding,
} from "@/lib/db/models/Review";

interface CreateReviewParams {
    pullRequestId: mongoose.Types.ObjectId;
    commitSha: string;
}

export async function createReview(
    params: CreateReviewParams
) {
    const review = await Review.create({
        pullRequestId: params.pullRequestId,
        commitSha: params.commitSha,
        status: "queued",
        findings: [],
    });
    return review;
}

interface UpdateReviewParams {
    status?: ReviewStatus;
    summary?: string;
    findings?: IReviewFinding[];
    model?: string;
    tokensUsed?: number;
    processingTimeMs?: number;
    completedAt?: Date;
}

export async function updateReview(
    reviewId: mongoose.Types.ObjectId,
    params: UpdateReviewParams
) {
    const review = await Review.findByIdAndUpdate(
        reviewId,
        {
            $set: params,
        },
        {
            returnDocument: "after",
        }
    );

    return review;
}