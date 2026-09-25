import mongoose, { Schema, Model, Types } from "mongoose";

export type PullRequestStatus = "pending" | "reviewing" | "completed" | "failed";

export interface IPullRequest {
    githubId: number;

    repositoryId: Types.ObjectId;

    number: number;

    title: string;
    description: string | null;

    author: {
        githubId?: number;
        username: string;
    };

    baseBranch: string;
    headBranch: string;

    baseSha: string;
    headSha: string;

    status: PullRequestStatus;

    createdAt: Date;
    updatedAt: Date;
}

const PullRequestSchema = new Schema<IPullRequest>(
    {
        githubId: {
            type: Number,
            required: true,
        },

        repositoryId: {
            type: Schema.Types.ObjectId,
            ref: "Repository",
            required: true,
        },

        number: {
            type: Number,
            required: true,
        },

        title: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            default: null,
        },

        author: {
            githubId: {
                type: Number,
            },

            username: {
                type: String,
                required: true,
                trim: true,
            },
        },

        baseBranch: {
            type: String,
            required: true,
        },

        headBranch: {
            type: String,
            required: true,
        },

        baseSha: {
            type: String,
            required: true,
        },

        headSha: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "pending",
                "reviewing",
                "completed",
                "failed",
            ],
            default: "pending",
        },
    },
    {
        timestamps: true,
    }
);

PullRequestSchema.index(
    {
        repositoryId: 1,
        number: 1,
    },
    {
        unique: true,
    }
);

PullRequestSchema.index({
    headSha: 1,
});

export const PullRequest = (mongoose.models.PullRequest as Model<IPullRequest>) || mongoose.model<IPullRequest>(
    "PullRequest",
    PullRequestSchema
);