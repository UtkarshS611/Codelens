import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

import {
  Fjalla_One,
  Courier_Prime,
  Roboto,
  JetBrains_Mono
} from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";

const display = Fjalla_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  variable: "--font-mono",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "CodeLens - AI based PR review tool",
  description: "Codelens is a AI based PR review tool that helps developers to review code faster and more efficiently.",
  icons:{
    icon: "/svgs/terminal.svg"
  }
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", display.variable, mono.variable, roboto.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
