"use client";

import { SyntheticEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import Logo from "@/components/landing/Logo";
import Link from "next/link";

import { Eye, EyeOff } from "lucide-react";

export default function SignUpForm() {
    const router = useRouter();

    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [typePassword, setTypePassword] = useState<string>("password" || "text");

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const togglePasswordVisibility = () => {
        setTypePassword((prev) => (prev === "password" ? "text" : "password"));
    }

    const handleSubmit = async (event: SyntheticEvent) => {

        event.preventDefault();

        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/signup", {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                },

                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    confirmPassword,
                }),
            }
            );

            const data = await response.json();

            if (!response.ok) {
                setError(
                    data.error || "Signup failed"
                );

                return;
            }

            router.push("/login");
        } catch {
            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full max-w-sm space-y-6 border rounded-2xl py-6 px-4 bg-background">
            <div className="flex flex-col items-center gap-2">
                <Logo />
                <h1 className="text-3xl font-semibold">
                    Create an account
                </h1>
            </div>

            <div>
                <Button
                    variant={"secondary"}
                    className="w-full"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="size-4"
                        viewBox="0 0 256 256"
                    >
                        <path
                            fill="currentColor"
                            d="M128 0C57.317 0 0 57.317 0 128c0 56.554 36.676 104.535 87.535 121.46c6.397 1.185 8.746-2.777 8.746-6.158c0-3.052-.117-13.135-.174-23.83c-35.61 7.742-43.124-15.103-43.124-15.103c-5.823-14.795-14.213-18.73-14.213-18.73c-11.613-7.944.876-7.78.876-7.78c12.853.902 19.621 13.19 19.621 13.19c11.417 19.568 29.945 13.911 37.249 10.64c1.149-8.272 4.466-13.92 8.127-17.116c-28.431-3.236-58.318-14.212-58.318-63.258c0-13.975 5-25.394 13.188-34.358c-1.329-3.224-5.71-16.242 1.24-33.874c0 0 10.749-3.44 35.21 13.121c10.21-2.836 21.16-4.258 32.038-4.307c10.878.049 21.837 1.47 32.066 4.307c24.431-16.56 35.165-13.12 35.165-13.12c6.967 17.63 2.584 30.65 1.255 33.873c8.207 8.964 13.173 20.383 13.173 34.358c0 49.163-29.944 59.988-58.447 63.157c4.591 3.972 8.682 11.762 8.682 23.704c0 17.126-.148 30.91-.148 35.126c0 3.407 2.304 7.398 8.792 6.14C219.37 232.5 256 184.537 256 128C256 57.317 198.683 0 128 0"
                        />
                    </svg>
                    <span>Continue with GitHub</span>
                </Button>
            </div>

            <div className="my-4 flex items-center gap-4">
                <hr className="flex-1" />
                <span className="text-muted-foreground text-xs">OR</span>
                <hr className="flex-1" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label
                            htmlFor="firstName"
                            className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                        >
                            First name
                        </label>
                        <input
                            id="firstName"
                            type="text"
                            value={firstName}
                            onChange={(event) => setFirstName(event.target.value)}
                            placeholder="John"
                            autoComplete="given-name"
                            required
                            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                        />
                    </div>

                    <div className="space-y-2">
                        <label
                            htmlFor="lastName"
                            className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                        >
                            Last name
                        </label>
                        <input
                            id="lastName"
                            type="text"
                            value={lastName}
                            onChange={(event) => setLastName(event.target.value)}
                            placeholder="Doe"
                            autoComplete="family-name"
                            required
                            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                        />
                    </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label
                        htmlFor="email"
                        className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                    >
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        required
                        className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="password"
                        className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                    >
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={typePassword}
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Password"
                            autoComplete="new-password"
                            required
                            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                        />
                        {typePassword === "password" ? (
                            <Eye
                                onClick={togglePasswordVisibility}
                                className="cursor-pointer size-5 absolute right-2 top-1/2 -translate-y-1/2"
                            />
                        ) : (
                            <EyeOff
                                onClick={togglePasswordVisibility}
                                className="cursor-pointer size-5 absolute right-2 top-1/2 -translate-y-1/2"
                            />

                        )}
                    </div>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="confirmPassword"
                        className="flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                    >
                        Confirm password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={typePassword}
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Confirm password"
                            autoComplete="new-password"
                            required
                            className="h-8 w-full min-w-0 rounded-lg border border-input bg-transparent px-2.5 py-1 text-base transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 md:text-sm dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40"
                        />
                        {typePassword === "password" ? (
                            <Eye
                                onClick={togglePasswordVisibility}
                                className="cursor-pointer size-5 absolute right-2 top-1/2 -translate-y-1/2"
                            />
                        ) : (
                            <EyeOff
                                onClick={togglePasswordVisibility}
                                className="cursor-pointer size-5 absolute right-2 top-1/2 -translate-y-1/2"
                            />

                        )}
                    </div>
                </div>

                {error && (
                    <p className="text-sm text-red-500">
                        {error}
                    </p>
                )}

                <Button
                    type="submit"
                    disabled={loading}
                    className={"w-full"}
                >
                    {loading
                        ? "Creating account..."
                        : "Create account"}
                </Button>
            </form>

            <p className="text-muted-foreground text-center text-sm">
                Already have an account?{' '}
                <Link
                    href="/signin"
                    className="text-blue-500 font-medium hover:underline"
                >
                    Sign in
                </Link>
            </p>
        </div>
    );
}