import { NextRequest, NextResponse } from "next/server";

import { githubApp } from "@/lib/github/app";
import { parsePullRequest } from "@/lib/github/parsePullRequest";
import { getPullRequestFiles } from "@/lib/github/getPullRequestFiles";

import { buildReviewContext } from "@/lib/review/buildReviewContext";
import { aiReviewer } from "@/lib/review/aiReviewer";

import { connectDB } from "@/lib/db/mongoose";

import { Repository } from "@/lib/db/models/Repository";
import { PullRequest } from "@/lib/db/models/PullRequest";
import { Review } from "@/lib/db/models/Review";

import { findOrCreateRepository } from "@/lib/db/services/repositoryService";
import { findOrCreatePullRequest } from "@/lib/db/services/pullRequestService";
import { createReview, updateReview } from "@/lib/db/services/reviewService";


export async function POST(request: NextRequest) {
    let activeReviewId: string | null = null;

    try {
        //extract the github payload
        const payload = await request.json();

        //only catch pull requests
        if (!payload.pull_request || !payload.repository) {
            return NextResponse.json({
                success: true,
                message: "Not a pull request event",
            });
        }

        // check for reviewing only PRs that opened/reopened or synchronized
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

        // parse the github payload
        const pr = parsePullRequest(payload);

        await connectDB();

        // create repo
        const repository = await findOrCreateRepository({
            githubId: payload.repository.id,
            installationId: pr.installationId,
            owner: pr.repository.owner,
            name: pr.repository.name,
            fullName: pr.repository.fullName,
            defaultBranch: payload.repository.default_branch,
        });

        // create/find pull request
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
            baseSha: pr.pullRequest.baseSha,
            headSha: pr.pullRequest.headSha,
        });

        // check if a review already exists for this pull request and commit SHA
        let review = await Review.findOne({
            pullRequestId: pullRequest._id,
            commitSha: pr.pullRequest.headSha,
        });

        if (review) {
            if (
                review.status === "completed" ||
                review.status === "queued" ||
                review.status === "processing"
            ) {
                return NextResponse.json({
                    success: true,
                    message: "Review already exists",
                    review: {
                        id: review._id,
                        status: review.status,
                        commitSha: review.commitSha,
                    },
                });
            }

            /*
             * A failed review can be retried when GitHub
             * redelivers the event.
             */
            await updateReview(review._id, {
                status: "processing",
            });
        } else {
            // create record tfor the review
            review = await createReview({
                pullRequestId: pullRequest._id,
                commitSha: pr.pullRequest.headSha,
            });

            await updateReview(review._id, {
                status: "processing",
            });
        }

        activeReviewId = review._id.toString();

        /// github auth
        const octokit = await githubApp.getInstallationOctokit(
            pr.installationId
        );

        // fetch changes in files, patches and actual source code
        const files = await getPullRequestFiles(
            octokit,
            pr
        );

        // review context build
        const reviewContext = buildReviewContext(
            pr,
            files
        );

        // run the review engine
        const result = await aiReviewer(reviewContext);

        // persist the ai findings in the database
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
        })
        );

        const completedReview = await updateReview(
            review._id,
            {
                status: "completed",
                summary: result.summary,
                findings: findingsToSave,
                completedAt: new Date(),
            }
        );

        if (!completedReview) {
            throw new Error(
                "Review was generated but could not be saved."
            );
        }

        // return the completed review
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

        /*
         * Mark the review as failed when a review record
         * has already been created.
         */
        if (activeReviewId) {
            try {
                await connectDB();

                await updateReview(
                    new (await import("mongoose")).default.Types.ObjectId(
                        activeReviewId
                    ),
                    {
                        status: "failed",
                    }
                );
            } catch (updateError) {
                console.error(
                    "Failed to mark review as failed:",
                    updateError
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
            }
        );
    }
}
