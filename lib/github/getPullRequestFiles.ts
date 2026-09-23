import type { Octokit } from "octokit";
import type { PullRequestData, ReviewFile } from "./types";

export async function getPullRequestFiles(
    octokit: Octokit,
    pr: PullRequestData
): Promise<ReviewFile[]> {
    const { data: files } =
        await octokit.rest.pulls.listFiles({
            owner: pr.repository.owner,
            repo: pr.repository.name,
            pull_number: pr.pullRequest.number,
        });

    const reviewFiles: ReviewFile[] = [];

    for (const file of files) {

        // Deleted files check
        if (String(file.status) === "deleted") {
            reviewFiles.push({
                path: file.filename,
                previousPath: file.previous_filename,

                status: file.status,

                additions: file.additions,
                deletions: file.deletions,
                changes: file.changes,

                patch: file.patch ?? null,
                source: null,
            });

            continue;
        }

        let source: string | null = null;

        try {
            const { data } = await octokit.rest.repos.getContent({
                owner: pr.repository.owner,
                repo: pr.repository.name,
                path: file.filename,
                ref: pr.pullRequest.headSha,
            });

            //fetch the files from arrays of directories from github.
            if (
                !Array.isArray(data) &&
                "content" in data &&
                data.content
            ) {
                source = Buffer.from(
                    data.content.replace(/\s/g, ""),
                    "base64"
                ).toString("utf-8");
            }
        } catch (error) {
            console.error(
                `Failed to retrieve source for ${file.filename}`,
                error
            );
        }

        reviewFiles.push({
            path: file.filename,
            previousPath: file.previous_filename,

            status: file.status,

            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes,

            patch: file.patch ?? null,
            source,
        });
    }

    return reviewFiles;
}