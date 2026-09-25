import { NextRequest, NextResponse } from "next/server";

import { githubApp } from "@/lib/github/app";
import { parsePullRequest } from "@/lib/github/parsePullRequest";
import { getPullRequestFiles } from "@/lib/github/getPullRequestFiles";

import { buildReviewContext } from "@/lib/review/buildReviewContext";

export async function POST(request: NextRequest) {
    try {
        const payload = await request.json();

        if (!payload.pull_request) {
            return NextResponse.json({
                message: "Not a pull request event",
            });
        }

        const pr = parsePullRequest(payload);


        //create octokit client for specific repo that has codelens installed.
        const octokit = await githubApp.getInstallationOctokit(
            pr.installationId
        );


        //retrieve PR files, patches and source code changes
        const files = await getPullRequestFiles(
            octokit,
            pr
        );


        //prepare review context for AI review, including PR metadata and file changes
        const reviewContext = buildReviewContext(
            pr,
            files
        );

        console.log(reviewContext)


        // ============================================================
        // 7. AI REVIEW
        // ============================================================
        // NEXT STAGE:
        //
        // reviewContext
        //      ↓
        // AI Reviewer
        //      ↓
        // Review Result
        //
        // This will eventually replace the temporary response below.


        // ============================================================
        // 8. TEMPORARY RESPONSE
        // ============================================================
        // Used only during development/testing.
        // Later this will be replaced by the review pipeline.

        return NextResponse.json({
            success: true,

            pullRequest: {
                number: pr.pullRequest.number,
                title: pr.pullRequest.title,
                author: pr.pullRequest.author,

                baseBranch: pr.pullRequest.baseBranch,
                headBranch: pr.pullRequest.headBranch,

                baseSha: pr.pullRequest.baseSha,
                headSha: pr.pullRequest.headSha,
            },

            files,
        });
    } catch (error) {
        console.error("GitHub webhook error:", error);

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