"use client"

import Link from "next/link";

import { Menu } from "lucide-react";

import Logo from "@/components/landing/Logo";

import ThemeToggle from "@/components/ui/theme-toggle";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetFooter,
    SheetHeader,
    SheetTrigger,
} from "@/components/ui/sheet"
import {
    NavigationMenu,
    NavigationMenuItem,
    NavigationMenuLink,
    NavigationMenuList,
    navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"

export default function Header() {

    const links = [
        {
            href: "/",
            label: "Home"
        },
        {
            href: "/",
            label: "Features"
        },
        {
            href: "/",
            label: "Pricing"
        },
        {
            href: "/",
            label: "Contact"
        }
    ]

    return (
        <header className="py-4 flex items-center justify-between">
            <Link
                href={"/"}
                className="flex items-center gap-2 text-xl"
            >
                <Logo />
                <div className="font-mono font-bold flex items-center">
                    CodeLens
                </div>
            </Link>
            <NavigationMenu className={"hidden xl:block"}>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        {links.map((link, index) => (
                            <NavigationMenuLink
                                key={index}
                                className={`${navigationMenuTriggerStyle()} hover:bg-primary/50`}
                                render={<Link href={link.href}>{link.label}</Link>}
                            />
                        ))}
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <div className="hidden xl:flex items-center gap-4 ">
                <Link
                    href={"/dashboard"}
                    className={`${buttonVariants({ variant: "default", size: "lg" })}`}
                >
                    Get Started
                </Link>
                <Link
                    href={"/signin"}
                    className={`${buttonVariants({ variant: "outline", size: "lg" })}`}
                >
                    Sign In
                </Link>
                <ThemeToggle />
            </div>
            <div className="xl:hidden flex items-center gap-4">
                <ThemeToggle />
                <Sheet>
                    <SheetTrigger render={<Button><Menu /></Button>} />
                    <SheetContent>
                        <SheetHeader>
                            <Link
                                href={"/"}
                                className="flex items-center gap-2 text-xl"
                            >
                                <Logo />
                                <div className="font-mono font-bold flex items-center">
                                    CodeLens
                                </div>
                            </Link>
                        </SheetHeader>
                        <div className="px-6 flex flex-col gap-2">
                            {links.map((link, index) => (
                                <Link
                                    href={link.href}
                                    key={index}
                                    className="hover:bg-primary/50 py-1 rounded-md px-1"
                                >
                                    {link.label}
                                </Link>
                            ))}
                        </div>
                        <SheetFooter>
                            <Link
                                href={"/dashboard"}
                                className={`${buttonVariants({ variant: "default", size: "lg" })}`}
                            >
                                Get Started
                            </Link>
                            <Link
                                href={"/signin"}
                                className={`${buttonVariants({ variant: "secondary", size: "lg" })}`}
                            >
                                Sign In
                            </Link>
                        </SheetFooter>
                    </SheetContent>
                </Sheet>
            </div>
        </header >
    )
}