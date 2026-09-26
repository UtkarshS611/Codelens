import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { email, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                {
                    error:
                        "Email and password are required",
                },
                {
                    status: 400,
                }
            );
        }

        const normalizedEmail = email.trim().toLowerCase();

        await connectDB();
        const user = await User.findOne({ email: normalizedEmail});

        if (!user) {
            return NextResponse.json(
                {
                    error:
                        "Invalid email or password",
                },
                {
                    status: 401,
                }
            );
        }

        const passwordMatches = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatches) {
            return NextResponse.json(
                {
                    error:
                        "Invalid email or password",
                },
                {
                    status: 401,
                }
            );
        }

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
                status: 200,
            }
        );
    } catch (error) {
        console.error("Signin error:", error);
        return NextResponse.json(
            {
                error:
                    "Something went wrong",
            },
            {
                status: 500,
            }
        );
    }
}