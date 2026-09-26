import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
        } = body;

        if (
            !firstName ||
            !lastName ||
            !email ||
            !password ||
            !confirmPassword
        ) {
            return NextResponse.json(
                {
                    error: "All fields are required",
                },
                {
                    status: 400,
                }
            );
        }

        const normalizedFirstName = firstName.trim();
        const normalizedLastName = lastName.trim();

        if (normalizedFirstName.length < 2 || normalizedLastName.length < 2) {
            return NextResponse.json(
                {
                    error:
                        "First name and last name must be at least 2 characters",
                },
                {
                    status: 400,
                }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(normalizedEmail)) {
            return NextResponse.json(
                {
                    error: "Invalid email address",
                },
                {
                    status: 400,
                }
            );
        }

        if (password.length < 8) {
            return NextResponse.json(
                {
                    error:
                        "Password must be at least 8 characters",
                },
                {
                    status: 400,
                }
            );
        }

        if (password !== confirmPassword) {
            return NextResponse.json(
                {
                    error:
                        "Passwords do not match",
                },
                {
                    status: 400,
                }
            );
        }

        await connectDB();

        const existingUser = await User.findOne({
            email: normalizedEmail,
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    error:
                        "An account with this email already exists",
                },
                {
                    status: 409,
                }
            );
        }

        const hashedPassword = await bcrypt.hash(password, 12);
        const user = await User.create({
            firstName: normalizedFirstName,
            lastName: normalizedLastName,
            email: normalizedEmail,
            password: hashedPassword,
        });

        return NextResponse.json(
            {
                success: true,
                user: {
                    id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                },
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        console.error("Signup error:", error);

        return NextResponse.json(
            {
                error: "Something went wrong",
            },
            {
                status: 500,
            }
        );
    }
}