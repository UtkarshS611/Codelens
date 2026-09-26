import mongoose, { Model, Schema } from "mongoose";

export interface IUser {
    firstName: string;
    lastName: string;
    email: string;
    password: string;

    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        firstName: {
            type: String,
            required: true,
            trim: true,
        },
        lastName: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
        },
        password: {
            type: String,
            required: true,
        }
    },
    {
        timestamps: true,
    }
);

export const User = (mongoose.models.User as Model<IUser>) || mongoose.model<IUser>(
    "User",
    UserSchema
);