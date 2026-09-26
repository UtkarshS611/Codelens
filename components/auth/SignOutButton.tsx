"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function SignOutButton() {
    const handleSignOut = async () => {
        await signOut({
            callbackUrl: "/",
        });
    };

    return (
        <Button
            type="button"
            variant="destructive"
            onClick={handleSignOut}
        >
            Sign out
        </Button>
    );
}