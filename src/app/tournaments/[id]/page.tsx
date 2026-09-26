export const dynamic = "force-dynamic";
import { getTournament } from "@/app/actions/tournamentActions";
import { notFound } from "next/navigation";
import TournamentBracket from "@/components/TournamentBracket";
import TournamentDrawCeremony from "@/components/TournamentDrawCeremony";
import GroupStageView from "@/components/GroupStageView";
import DoubleEliminationBracket from "@/components/DoubleEliminationBracket";
import TournamentLobby from "@/components/TournamentLobby";
import SchedulingPanel from "@/components/SchedulingPanel";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function TournamentPage({ params, searchParams }: { params: Promise<{ id: string }>, searchParams: Promise<{ draw?: string }> }) {
  const { id } = await params;
  const { draw } = await searchParams;
  
  const tournament = await getTournament(id);

  if (!tournament) {
    notFound();
  }

  if (tournament.status === "setup" || tournament.status === "ready_to_draw") {
    const allPlayers = await prisma.player.findMany({ orderBy: { name: "asc" } });
    return (
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center min-h-screen">
        <TournamentLobby tournament={tournament} allPlayers={allPlayers} />
      </main>
    );
  }

  // If we are in the draw ceremony
  if (draw === "true" && tournament.status !== "in_progress") {
    return <TournamentDrawCeremony tournamentId={tournament.id} matches={tournament.matches} />;
  }

  return (
    <main className="flex-1 p-4 sm:p-8 xl:p-12 w-full">
      <header className="flex items-center justify-between mb-8 bg-slate-900 p-6 rounded-3xl border border-slate-700">
        <div className="flex items-center gap-4">
          <Link href="/tournaments" className="p-3 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </Link>
          <div>
            <h1 className="text-3xl font-black text-white uppercase tracking-widest">{tournament.name}</h1>
            <div className="flex items-center gap-3 mt-2 text-sm font-bold text-slate-400">
              <span className="px-3 py-1 bg-slate-800 rounded-lg">{tournament.type.replace("_", " ")}</span>
              <span className="px-3 py-1 bg-slate-800 rounded-lg">{tournament.status}</span>
            </div>
          </div>
        </div>
      </header>

      {tournament.format === "gironi_eliminazione" ? (
        <GroupStageView 
          groups={tournament.groups} 
          qualifiersPerGroup={2} // Assumed default, could be dynamic
          tournamentId={tournament.id}
          tournament={tournament}
        />
      ) : tournament.format === "doppia_eliminazione" ? (
        <DoubleEliminationBracket tournament={tournament} />
      ) : (
        <TournamentBracket tournament={tournament} />
      )}

      {/* Scheduling Panel — visible for any active tournament (not setup/lobby) */}
      {!["setup", "ready_to_draw", "completed"].includes(tournament.status) && (() => {
        const allGroupMatches = tournament.groups?.flatMap((g: any) => g.matches) ?? [];
        const directMatches = tournament.matches ?? [];
        const allMatches = tournament.format === "gironi_eliminazione"
          ? [...allGroupMatches, ...directMatches.filter((m: any) => m.bracketType === "playoff")]
          : directMatches;
        const totalMatches = allMatches.length;
        const scheduledMatchesCount = allMatches.filter((m: any) => !!m.scheduledAt).length;

        return (
          <div className="mt-8">
            <SchedulingPanel
              tournamentId={tournament.id}
              currentStartDate={tournament.startDate?.toISOString() ?? null}
              currentScheduleStartTime={(tournament as any).scheduleStartTime ?? null}
              currentScheduleDays={(tournament as any).scheduleDays as number[] ?? null}
              currentNumTables={(tournament as any).numTables ?? null}
              currentMaxMatchesPerDay={(tournament as any).maxMatchesPerDay ?? null}
              totalMatches={totalMatches}
              scheduledMatchesCount={scheduledMatchesCount}
            />
          </div>
        );
      })()}
    </main>
  );
}
