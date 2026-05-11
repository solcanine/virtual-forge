import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Virtual Forge — Ship logs for Virtuals builders",
  description:
    "Discover and upvote tools, agents, and templates built for the Virtuals / Virtual Protocol ecosystem.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="font-sans">
        <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pb-16 pt-6 sm:px-6">
          <Header />
          <main className="mt-10 flex-1">{children}</main>
          <footer className="mt-16 border-t border-zinc-800 pt-8 text-sm text-zinc-500">
            Virtual Forge is a demo inspired by community discovery boards — not
            affiliated with Virtuals Protocol. Swap URLs and copy for your own
            launch.
          </footer>
        </div>
      </body>
    </html>
  );
}
