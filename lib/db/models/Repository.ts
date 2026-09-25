import mongoose, { Schema, Model } from "mongoose";

export interface IRepository {
    githubId: number;

    owner: string;
    name: string;
    fullName: string;

    installationId: number;

    defaultBranch: string;

    isActive: boolean;

    createdAt: Date;
    updatedAt: Date;
}

const RepositorySchema = new Schema<IRepository>(
    {
        githubId: {
            type: Number,
            required: true,
            unique: true,
        },

        owner: {
            type: String,
            required: true,
            trim: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        fullName: {
            type: String,
            required: true,
            trim: true,
        },

        installationId: {
            type: Number,
            required: true,
        },

        defaultBranch: {
            type: String,
            default: "main",
        },

        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

RepositorySchema.index({
    owner: 1,
    name: 1,
});

export const Repository = (mongoose.models.Repository as Model<IRepository>) || mongoose.model<IRepository>(
    "Repository",
    RepositorySchema
);