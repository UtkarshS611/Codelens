"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { buttonVariants } from "./button";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className={`${buttonVariants({ variant: "outline", size: "icon" })}`}
        >
            {theme === "dark" ?
                (<>
                    <Moon className="h-5 w-5" />
                </>) : (<>
                    <Sun className="h-5 w-5" />
                </>)}
        </button>
    );
}