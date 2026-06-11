import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { LEAGUE_IDS, SITE_NAME } from "@/lib/config";
import { getLeague } from "@/lib/sleeper/api";

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
  description: "Fantasy football league hub — standings, history, and trash talk fuel.",
};

async function LeagueLinks() {
  const leagues = await Promise.all(
    LEAGUE_IDS.map((id) => getLeague(id).catch(() => null)),
  );
  return (
    <nav className="flex items-center gap-1 overflow-x-auto">
      {leagues.map(
        (l) =>
          l && (
            <Link
              key={l.league_id}
              href={`/league/${l.league_id}`}
              className="whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              {l.name}
            </Link>
          ),
      )}
    </nav>
  );
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
      <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans">
        <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl">🥪</span>
              <span className="text-lg font-bold tracking-tight">
                {SITE_NAME}
              </span>
            </Link>
            <LeagueLinks />
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6">
          {children}
        </main>
        <footer className="border-t border-zinc-800 py-4 text-center text-xs text-zinc-500">
          Data from the Sleeper API · updates automatically
        </footer>
      </body>
    </html>
  );
}
