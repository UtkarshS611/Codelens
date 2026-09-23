import { App } from "octokit";

const privateKey = process.env.GITHUB_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n"
);

if (!process.env.GITHUB_APP_ID) {
    throw new Error("GITHUB_APP_ID is missing");
}

if (!privateKey) {
    throw new Error("GITHUB_PRIVATE_KEY is missing");
}

export const githubApp = new App({
    appId: process.env.GITHUB_APP_ID!,
    privateKey: privateKey!,
});