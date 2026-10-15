
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

import { githubApp } from "@/lib/github/app";
import { parsePullRequest } from "@/lib/github/parsePullRequest";
import { getPullRequestFiles } from "@/lib/github/getPullRequestFiles";

import { buildReviewContext } from "@/lib/review/buildReviewContext";
import { aiReviewer } from "@/lib/review/aiReviewer";
import { publishReview } from "@/lib/review/publishReview";

import { connectDB } from "@/lib/db/mongoose";
import { Review } from "@/lib/db/models/Review";

import { findOrCreateRepository } from "@/lib/db/services/repositoryService";
import { findOrCreatePullRequest } from "@/lib/db/services/pullRequestService";
import {
    createReview,
    updateReview,
} from "@/lib/db/services/reviewService";

export async function POST(request: NextRequest) {
    let activeReviewId: string | null = null;

    try {
        // Extract the GitHub webhook payload.
        const payload = await request.json();

        // Only process pull request events.
        if (!payload.pull_request || !payload.repository) {
            return NextResponse.json({
                success: true,
                message: "Not a pull request event",
            });
        }

        // Review only newly opened, reopened, or synchronized PRs.
        const supportedActions = [
            "opened",
            "reopened",
            "synchronize",
        ];

        if (!supportedActions.includes(payload.action)) {
            return NextResponse.json({
                success: true,
                message: `Ignored pull request action: ${payload.action}`,
            });
        }

        // Parse the GitHub payload.
        const pr = parsePullRequest(payload);

        await connectDB();

        // Find or create the repository.
        const repository = await findOrCreateRepository({
            githubId: payload.repository.id,
            installationId: pr.installationId,
            owner: pr.repository.owner,
            name: pr.repository.name,
            fullName: pr.repository.fullName,
            defaultBranch: payload.repository.default_branch,
        });

        // Find or create the pull request.
        const pullRequest = await findOrCreatePullRequest({
            githubId: payload.pull_request.id,
            repositoryId: repository._id,
            number: pr.pullRequest.number,
            title: pr.pullRequest.title,
            description: pr.pullRequest.body,
            author: {
                username: pr.pullRequest.author,
            },
            baseBranch: pr.pullRequest.baseBranch,
            headBranch: pr.pullRequest.headBranch,
            baseSha: pr.pullRequest.headSha,
            headSha: pr.pullRequest.headSha,
        });

        // Check whether a review already exists for this commit.
        let review = await Review.findOne({
            pullRequestId: pullRequest._id,
            commitSha: pr.pullRequest.headSha,
        });

        if (review) {
            // Do not process the same commit again if it has already
            // been published successfully.
            if (
                review.status === "completed" &&
                review.githubReviewId
            ) {
                return NextResponse.json({
                    success: true,
                    message: "Review already completed and published",
                    review: {
                        id: review._id,
                        status: review.status,
                        commitSha: review.commitSha,
                        githubReviewId: review.githubReviewId,
                        githubReviewUrl: review.githubReviewUrl,
                    },
                });
            }

            // Avoid processing a review that is already in progress.
            if (
                review.status === "queued" ||
                review.status === "processing"
            ) {
                return NextResponse.json({
                    success: true,
                    message: "Review is already queued or processing",
                    review: {
                        id: review._id,
                        status: review.status,
                        commitSha: review.commitSha,
                    },
                });
            }

            // A failed review can be retried when GitHub redelivers
            // the webhook. A completed but unpublished review can
            // also be retried.
            await updateReview(review._id, {
                status: "processing",
            });
        } else {
            // Create a new review record.
            review = await createReview({
                pullRequestId: pullRequest._id,
                commitSha: pr.pullRequest.headSha,
            });

            await updateReview(review._id, {
                status: "processing",
            });
        }

        activeReviewId = review._id.toString();

        // Authenticate with GitHub using the App installation.
        const octokit = await githubApp.getInstallationOctokit(
            pr.installationId,
        );

        // Fetch changed files, patches, and source code.
        const files = await getPullRequestFiles(octokit, pr);

        // Build the context for the AI reviewer.
        const reviewContext = buildReviewContext(pr, files);

        // Run the AI review engine.
        const result = await aiReviewer(reviewContext);

        // Map AI findings to the MongoDB finding schema.
        const findingsToSave = result.findings.map((finding) => ({
            file: finding.file,
            line: finding.startLine ?? undefined,
            startLine: finding.startLine ?? undefined,
            endLine: finding.endLine ?? undefined,
            severity: finding.severity,
            category: finding.category,
            title: finding.title,
            description: finding.description,
            suggestion: finding.suggestion ?? undefined,
            confidence: finding.confidence ?? undefined,
        }));

        // Save the AI-generated review before publishing it.
        const completedReview = await updateReview(
            review._id,
            {
                status: "completed",
                summary: result.summary,
                findings: findingsToSave,
                completedAt: new Date(),
            },
        );

        if (!completedReview) {
            throw new Error(
                "Review was generated but could not be saved.",
            );
        }

        // Publish the summary and findings to the GitHub PR.
        // publishReview also saves the GitHub review ID, URL,
        // and matched inline comment IDs in MongoDB.
        const publication = await publishReview({
            installationId: pr.installationId,
            context: reviewContext,
            result,
            reviewId: activeReviewId,
        });

        console.info(
            "[CodeLens Webhook] GitHub review published",
            {
                reviewId: activeReviewId,
                githubReviewId: publication.githubReviewId,
                githubReviewUrl: publication.githubReviewUrl,
                inlineCommentsSaved: publication.inlineCommentsSaved,
                findingsWithoutInlineComments:
                    publication.findingsWithoutInlineComments,
                reusedExistingReview:
                    publication.reusedExistingReview,
            },
        );

        // Return the completed review and GitHub publication details.
        return NextResponse.json({
            success: true,

            repository: {
                id: repository._id,
                fullName: repository.fullName,
            },

            pullRequest: {
                id: pullRequest._id,
                number: pr.pullRequest.number,
                title: pr.pullRequest.title,
                headSha: pr.pullRequest.headSha,
            },

            review: {
                id: completedReview._id,
                status: completedReview.status,
                commitSha: completedReview.commitSha,
                summary: completedReview.summary,
                findings: completedReview.findings,
                githubReviewId: publication.githubReviewId,
                githubReviewUrl: publication.githubReviewUrl,
            },

            publication: {
                inlineCommentsSaved: publication.inlineCommentsSaved,
                findingsWithoutInlineComments:
                    publication.findingsWithoutInlineComments,
                reusedExistingReview:
                    publication.reusedExistingReview,
            },

            files: files.map((file) => ({
                path: file.path,
                status: file.status,
                additions: file.additions,
                deletions: file.deletions,
                changes: file.changes,
                hasPatch: Boolean(file.patch),
                hasSource: Boolean(file.source),
            })),
        });
    } catch (error) {
        console.error("GitHub webhook error:", error);

        // Mark the review as failed if a record was created.
        if (activeReviewId) {
            try {
                await connectDB();

                await updateReview(
                    new mongoose.Types.ObjectId(activeReviewId),
                    {
                        status: "failed",
                    },
                );
            } catch (updateError) {
                console.error(
                    "Failed to mark review as failed:",
                    updateError,
                );
            }
        }

        return NextResponse.json(
            {
                success: false,
                error: "Webhook processing failed",
            },
            {
                status: 500,
            },
        );
    }
}