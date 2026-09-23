import { NextRequest, NextResponse } from "next/server";

import { githubApp } from "@/lib/github/app";
import { parsePullRequest } from "@/lib/github/parsePullRequest";
import { getPullRequestFiles } from "@/lib/github/getPullRequestFiles";

export async function POST(
    request: NextRequest
) {
    try {
        const payload = await request.json();

        //check to process only pull request events.
        if (!payload.pull_request) {
            return NextResponse.json({
                message: "Not a pull request event",
            });
        }

        //convert raw data to PullRequestData type.
        const pr = parsePullRequest(payload);

        console.log("Pull Request:", {
            action: pr.action,
            repository: pr.repository.fullName,
            number: pr.pullRequest.number,
            title: pr.pullRequest.title,
        });

        //octokit client authentication 
        const octokit = await githubApp.getInstallationOctokit(
            pr.installationId
        );

        //retrieve pr info from github
        const { data: pullRequest } = await octokit.rest.pulls.get({
            owner: pr.repository.owner,
            repo: pr.repository.name,
            pull_number: pr.pullRequest.number,
        });

        console.log("PR fetched:", {
            number: pullRequest.number,
            title: pullRequest.title,
            state: pullRequest.state,
            headSha: pullRequest.head.sha,
            baseSha: pullRequest.base.sha,
        });

        //fetch changed files, patches and the source code of the files in PR
        const files = await getPullRequestFiles(
            octokit,
            pr
        );

        console.log(`Found ${files.length} changed files`);

        //only for test - PRINT THE FILES
        for (const file of files) {
            console.log({
                path: file.path,
                status: file.status,
                additions: file.additions,
                deletions: file.deletions,
                changes: file.changes,
                hasPatch: Boolean(file.patch),
                hasSource: Boolean(file.source),
            });
        }

        //return the PR info and the changed files as JSON response - CONVERT TO AI REVIEW LATRE
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