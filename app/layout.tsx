import type { Metadata } from "next";
import "./globals.css";
import { cn } from "@/lib/utils";

import {
  Fjalla_One,
  Courier_Prime,
  Roboto,
} from "next/font/google";
import { ThemeProvider } from "@/components/ui/theme-provider";

const display = Fjalla_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
});

const courier = Courier_Prime({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-courier",
});

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-roboto",
});

export const metadata: Metadata = {
  title: "CodeLens - AI based PR review tool",
  description: "Codelens is a AI based PR review tool that helps developers to review code faster and more efficiently.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased", display.variable, courier.variable, roboto.variable)}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <main>
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}
