import type { Metadata } from "next";
import { Figtree, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import Background from "@/components/background";
import CursorDecorator from "@/components/cursor-decorator";
import ThemeToggle from "@/components/theme-toggle";

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "Just Code It",
  description: "Interactive gallery and portfolio showcase"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html className={cn("font-sans", figtree.variable)} lang="en">
      <body className={`${geistMono.variable} antialiased relative min-h-screen`}>
        <Background />
        <ThemeToggle />
        <CursorDecorator color="#7FC8FF">{children}</CursorDecorator>
      </body>
    </html>
  );
}
