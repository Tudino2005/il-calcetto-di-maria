export const dynamic = "force-dynamic";
import Link from "next/link";
import { ArrowLeft, Trophy } from "lucide-react";
import LeaderboardView from "@/components/LeaderboardView";
import { getLeaderboardData } from "@/lib/leaderboardData";

export default async function LeaderboardPage() {
  const { playerStats, teamStats } = await getLeaderboardData();

  return (
    <main className="flex-1 p-8 max-w-6xl mx-auto w-full">
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link href="/admin" className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Trophy className="text-yellow-400" /> Classifiche Globali
          </h1>
        </div>
      </header>

      <LeaderboardView playerStats={playerStats} teamStats={teamStats} />
    </main>
  );
}
