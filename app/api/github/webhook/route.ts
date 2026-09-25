import { NextRequest, NextResponse } from "next/server";

import { githubApp } from "@/lib/github/app";

import { parsePullRequest } from "@/lib/github/parsePullRequest";
import { getPullRequestFiles } from "@/lib/github/getPullRequestFiles";

import { buildReviewContext } from "@/lib/review/buildReviewContext";

import { connectDB } from "@/lib/db/mongoose";

import { findOrCreateRepository } from "@/lib/db/services/repositoryService";
import { findOrCreatePullRequest } from "@/lib/db/services/pullRequestService";
import { createReview } from "@/lib/db/services/reviewService";

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        if (!payload.pull_request) {
            return NextResponse.json({
                message: "Not a pull request event",
            });
        }

        //parse the github raw payload to usable structure
        const pr = parsePullRequest(payload);

        await connectDB();

        //create or find the repository in the database
        const repository = await findOrCreateRepository({
            githubId: payload.repository.id,
            installationId: pr.installationId,
            owner: pr.repository.owner,
            name: pr.repository.name,
            fullName: pr.repository.fullName,
            defaultBranch: payload.repository.default_branch,
        });

        //fint or create the pull request in the database
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

        //authenticate with GitHub using the installation ID to get an Octokit instance
        const octokit = await githubApp.getInstallationOctokit(
            pr.installationId
        );

        //retrieve PR files, patches and source code for review context
        const files = await getPullRequestFiles(
            octokit,
            pr
        );

        // build the review context for AI reviewr
        const reviewContext = buildReviewContext(
            pr,
            files
        );

        //create review queue record for the pull request in the database
        const review = await createReview({
            pullRequestId: pullRequest._id,
            commitSha: pr.pullRequest.headSha,
        });


        // ============================================================
        // 11. AI REVIEW
        // ============================================================
        //
        // NEXT STAGE:
        //
        // reviewContext
        //      ↓
        // AI Reviewer
        //      ↓
        // ReviewResult
        //      ↓
        // updateReview()
        //
        // The AI reviewer will be added here.


        // ============================================================
        // 12. TEMPORARY DEVELOPMENT RESPONSE
        // ============================================================
        // This response is only for verifying the complete
        // GitHub + MongoDB pipeline.
        //
        // Later, this will be replaced by the AI review workflow.

        return NextResponse.json({
            success: true,

            repository: {
                id: repository._id,
                githubId: repository.githubId,
                fullName: repository.fullName,
            },

            pullRequest: {
                id: pullRequest._id,
                number: pr.pullRequest.number,
                title: pr.pullRequest.title,
                author: pr.pullRequest.author,
                baseBranch: pr.pullRequest.baseBranch,
                headBranch: pr.pullRequest.headBranch,
                baseSha: pr.pullRequest.baseSha,
                headSha: pr.pullRequest.headSha,
                status: pullRequest.status,
            },

            review: {
                id: review._id,
                status: review.status,
                commitSha: review.commitSha,
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

        console.error(
            "GitHub webhook error:",
            error
        );
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