import Link from "next/link";
import { Button, buttonVariants } from "../ui/button";
import TextHighlight from "./TextHighlight";
import Image from "next/image";

export default function Hero() {
    return (
        <section className="pt-32 md:pt-44 flex flex-col 2xl:flex-row items-center 2xl:items-start gap-16 2xl:gap-0 justify-between">
            <div className="flex flex-col gap-4 lg:gap-6 items-center 2xl:items-start">
                <h1 className="text-center xl:text-start flex flex-col items-center 2xl:items-start text-5xl md:text-6xl lg:text-7xl">
                    <span>
                        AI does the review,
                    </span>
                    <span>
                        you do the <TextHighlight text="merge." />
                    </span>
                </h1>
                <p className="text-muted-foreground text-center 2xl:text-start text-sm w-full md:max-w-lg xl:max-w-xl">
                    Codelens is an AI-powered code review tool that helps you write better code, faster. It provides real-time feedback on your code, helping you catch bugs and improve your code quality before you even submit a pull request.
                </p>
                <div className="space-x-4">
                    <Link href="/" className={buttonVariants({ size: "lg" })}>
                        Get Started
                    </Link>
                    <Link href="/" className={buttonVariants({ variant: "secondary", size: "lg" })}>
                        View Docs
                    </Link>
                </div>
            </div>
            <div className="w-full 2xl:max-w-xl relative flex-1 hero-image rounded-lg p-2 md:p-4 2xl:p-0">
                <Image
                    src="/hero/heroGradient.avif"
                    alt="Hero Image"
                    width={800}
                    height={600}
                    loading="eager"
                    className="w-full h-auto object-cover rounded-lg hidden 2xl:block"
                />
                <Image
                    src="/hero/heroDemo.avif"
                    alt="Hero Image"
                    width={800}
                    height={600}
                    loading="eager"
                    className="2xl:absolute 2xl:top-10 2xl:right-10 w-full h-full object-cover rounded-lg"
                />
            </div>
        </section>
    )
}