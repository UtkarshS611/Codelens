import mongoose, { Schema, Model, Types } from "mongoose";

export type ReviewStatus = "queued" | "processing" | "completed" | "failed";

export type FindingSeverity = "critical" | "high" | "medium" | "low" | "info";

export type FindingCategory = "bug" | "security" | "performance" | "maintainability" | "style" | "logic" | "other";

export interface IReviewFinding {
    file: string;
    line?: number;
    startLine?: number;
    endLine?: number;
    severity: FindingSeverity;
    category: FindingCategory;
    title: string;
    description: string;
    suggestion?: string;
    code?: string;
    confidence?: number;
    githubCommentId?: number;
}

export interface IReview {
    pullRequestId: Types.ObjectId;
    commitSha: string;
    status: ReviewStatus;
    summary?: string;
    findings: IReviewFinding[];
    model?: string;
    tokensUsed?: number;
    processingTimeMs?: number;
    createdAt: Date;
    completedAt?: Date;
    updatedAt: Date;
}

const ReviewFindingSchema = new Schema<IReviewFinding>(
    {
        file: {
            type: String,
            required: true,
        },

        line: {
            type: Number,
        },

        startLine: {
            type: Number,
        },

        endLine: {
            type: Number,
        },

        severity: {
            type: String,
            enum: [
                "critical",
                "high",
                "medium",
                "low",
                "info",
            ],
            required: true,
        },

        category: {
            type: String,
            enum: [
                "bug",
                "security",
                "performance",
                "maintainability",
                "style",
                "logic",
                "other",
            ],
            required: true,
        },

        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        suggestion: {
            type: String,
        },

        code: {
            type: String,
        },

        confidence: {
            type: Number,
            min: 0,
            max: 1,
        },

        githubCommentId: {
            type: Number,
        },
    },
    {
        _id: true,
    }
);

const ReviewSchema = new Schema<IReview>(
    {
        pullRequestId: {
            type: Schema.Types.ObjectId,
            ref: "PullRequest",
            required: true,
        },

        commitSha: {
            type: String,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "queued",
                "processing",
                "completed",
                "failed",
            ],
            default: "queued",
        },

        summary: {
            type: String,
        },

        findings: {
            type: [ReviewFindingSchema],
            default: [],
        },

        model: {
            type: String,
        },

        tokensUsed: {
            type: Number,
        },

        processingTimeMs: {
            type: Number,
        },

        completedAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

ReviewSchema.index(
    {
        pullRequestId: 1,
        commitSha: 1,
    },
    {
        unique: true,
    }
);

export const Review = (mongoose.models.Review as Model<IReview>) || mongoose.model<IReview>(
    "Review",
    ReviewSchema
);