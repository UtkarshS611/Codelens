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
            <NavigationMenu className={"hidden lg:block"}>
                <NavigationMenuList>
                    <NavigationMenuItem>
                        {links.map((link, index) => (
                            <NavigationMenuLink
                                key={index}
                                className={navigationMenuTriggerStyle()}
                                render={<Link href={link.href}>{link.label}</Link>}
                            />
                        ))}
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>
            <div className="hidden xl:flex items-center gap-4 ">
                <Link
                    href={"/"}
                    className={`${buttonVariants({ variant: "default", size: "lg" })}`}
                >
                    Get Started
                </Link>
                <Link
                    href={"/"}
                    className={`${buttonVariants({ variant: "outline", size: "lg" })}`}
                >
                    Sign In
                </Link>
                <ThemeToggle />
            </div>
            <div className="lg:hidden flex items-center gap-4">
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
                        {links.map((link, index) => (
                            <div key={index}>
                                {link.label}
                            </div>
                        ))}
                        <SheetFooter>
                            <Link
                                href={"/"}
                                className={`${buttonVariants({ variant: "default", size: "lg" })}`}
                            >
                                Get Started
                            </Link>
                            <Link
                                href={"/"}
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