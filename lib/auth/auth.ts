import NextAuth, {
    type NextAuthOptions,
} from "next-auth";

import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";

import bcrypt from "bcryptjs";

import { connectDB } from "@/lib/db/mongoose";
import { User } from "@/lib/db/models/User";

interface GitHubProfile {
    id: number;
    login: string;
    name: string | null;
    email: string | null;
    avatar_url?: string;
}

export const authOptions: NextAuthOptions = {

    session: {
        strategy: "jwt",
    },

    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                },

                password: {
                    label: "Password",
                    type: "password",
                },
            },

            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password
                ) {
                    return null;
                }

                const email = String(credentials.email).trim().toLowerCase();
                const password = String(credentials.password);

                await connectDB();
                const user = await User.findOne({ email, });

                //check if there is no user or the user exists with github OAUTH credentials
                if (!user || !user.password
                ) {
                    return null;
                }

                const passwordMatches = await bcrypt.compare(
                    password,
                    user.password
                );

                if (!passwordMatches) {
                    return null;
                }

                // Return the user object with the required fields
                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: `${user.firstName} ${user.lastName}`,
                };
            },
        }),

        GitHubProvider({
            clientId: process.env.GITHUB_CLIENT_ID!,
            clientSecret: process.env.GITHUB_CLIENT_SECRET!,

            authorization: {
                params: {
                    scope: "read:user user:email",
                    prompt: "select_account",
                },
            },
        }),
    ],

    callbacks: {
        async signIn({
            user,
            account,
            profile,
        }) {
            /*
             * Credentials authentication has
             * already been handled by authorize().
             */
            if (account?.provider === "credentials") {
                return true;
            }


            //GitHub OAuth authentication.
            if (account?.provider === "github") {
                await connectDB();

                const githubProfile = profile as GitHubProfile;
                const githubId = githubProfile.id;

                const email = user.email?.trim().toLowerCase();

                // If the GitHub profile does not have an email, do not proceed.
                if (
                    !githubId ||
                    !email
                ) {
                    return false;
                }

                //find github OAUTH user so that a new account is not created if the user already exists in the database
                let existingUser = await User.findOne({
                    githubId,
                });

                if (existingUser) {
                    return true;
                }

                //find user by email to match with github OAUTH
                existingUser = await User.findOne({
                    email,
                });

                if (existingUser) {
                    existingUser.githubId = githubId;
                    existingUser.githubUsername = githubProfile.login;

                    await existingUser.save();
                    return true;
                }

                //finally, create a new user if no existing user is found
                const githubName =
                    (
                        githubProfile.name ||
                        githubProfile.login
                    ).trim();

                const nameParts = githubName.split(
                    /\s+/
                );

                const firstName = nameParts.shift() || "GitHub";

                const lastName = nameParts.join(" ") || "User";

                await User.create({
                    firstName,
                    lastName,

                    email,

                    githubId,

                    githubUsername: githubProfile.login,
                });

                return true;
            }

            return false;
        },

        async jwt({
            token,
            user,
            account,
        }) {
            if (
                user &&
                account?.provider ===
                "credentials"
            ) {
                token.userId = user.id;
            }

            if (
                account?.provider ===
                "github" &&
                user.email
            ) {
                await connectDB();

                const dbUser =
                    await User.findOne({
                        email: user.email
                            .trim()
                            .toLowerCase(),
                    });

                if (dbUser) {
                    token.userId =
                        dbUser._id.toString();
                }
            }

            return token;
        },

        async session({
            session,
            token,
        }) {
            if (
                session.user &&
                token.userId
            ) {
                session.user.id =
                    String(
                        token.userId
                    );
            }

            return session;
        },
    },

    pages: {
        signIn: "/signin",
    },
};

export default NextAuth(authOptions);