import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { LEAGUE_IDS, SITE_NAME } from "@/lib/config";
import { getLeague } from "@/lib/sleeper/api";
import { HeaderLeagueLinks } from "@/components/nav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: SITE_NAME,
  description:
    "Fantasy football league hub — standings, history, and trash talk fuel.",
};

async function LeagueLinks() {
  const leagues = await Promise.all(
    LEAGUE_IDS.map((id) => getLeague(id).catch(() => null)),
  );
  const items = leagues
    .filter((l) => l !== null)
    .map((l) => ({ id: l.league_id, name: l.name }));
  return <HeaderLeagueLinks leagues={items} />;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-surface-0 font-sans text-zinc-100">
        <header className="sticky top-0 z-10 border-b border-edge bg-surface-0/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <span className="text-xl">🥪</span>
              <span className="text-lg font-black tracking-tight">
                Idiot Sandwich <span className="text-accent">FF</span>
              </span>
            </Link>
            <LeagueLinks />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-edge py-4 text-center text-xs text-zinc-500">
          Data from Sleeper · refreshes itself so you can refresh your excuses
        </footer>
      </body>
    </html>
  );
}
