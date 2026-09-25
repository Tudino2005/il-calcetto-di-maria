"use client";

import { useState } from "react";
import { Trophy, Calendar, Swords, CalendarDays } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import { formatSetScores } from "@/lib/scoreUtils";
import TournamentAgenda from "./TournamentAgenda";
import TournamentBracket from "./TournamentBracket";
import { generatePlayoffSeeding } from "@/app/actions/tournamentActions";
import { useRouter } from "next/navigation";

export default function GroupStageView({ groups, qualifiersPerGroup, tournamentId, tournament }: { groups: any[], qualifiersPerGroup: number, tournamentId: string, tournament: any }) {
  const hasPlayoffs = !!(tournament.bracketData && JSON.parse(tournament.bracketData)?.rounds?.length > 0);
  const [activeTab, setActiveTab] = useState<"bracket" | "playoff" | "agenda">(hasPlayoffs ? "playoff" : "bracket");
  const [isGenerating, setIsGenerating] = useState(false);
  const router = useRouter();
  const allGroupsFinished = groups.every(g => g.matches.every((m: any) => m.winnerTeamId !== null));

  // Helper to format date for match cards
  const formatDate = (dateInput: Date | string | null) => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    return d.toLocaleString("it-IT", { 
      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-4">
        <button 
          onClick={() => setActiveTab("bracket")}
          className={clsx("flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all", activeTab === "bracket" ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}
        >
          <Swords className="w-5 h-5" /> Gironi
        </button>
        {hasPlayoffs && (
          <button 
            onClick={() => setActiveTab("playoff")}
            className={clsx("flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all", activeTab === "playoff" ? "bg-yellow-500 text-slate-950" : "bg-slate-800 text-yellow-400 hover:bg-slate-700")}
          >
            <Trophy className="w-5 h-5" /> Tabellone Playoff
          </button>
        )}
        <button 
          onClick={() => setActiveTab("agenda")}
          className={clsx("flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all", activeTab === "agenda" ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}
        >
          <CalendarDays className="w-5 h-5" /> Agenda Partite
        </button>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700">
        {activeTab === "agenda" && (
          <TournamentAgenda tournament={tournament} />
        )}

        {activeTab === "playoff" && hasPlayoffs && (
          <TournamentBracket tournament={{
            ...tournament,
            matches: tournament.matches.filter((m: any) => m.bracketType === "playoff")
          }} />
        )}

        {activeTab === "bracket" && (
          <div className="flex flex-col gap-8">
            {allGroupsFinished && (
        <div className="bg-emerald-900/50 border border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-center">
          <Trophy className="w-12 h-12 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Tutti i gironi sono terminati!</h2>
          <p className="text-emerald-200">Le squadre qualificate sono pronte per il tabellone finale.</p>
          <button
            onClick={async () => {
              setIsGenerating(true);
              try {
                await generatePlayoffSeeding(tournamentId, qualifiersPerGroup);
                router.refresh();
                setActiveTab("playoff");
              } finally {
                setIsGenerating(false);
              }
            }}
            disabled={isGenerating}
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-wait text-white font-bold py-3 px-8 rounded-full transition-transform active:scale-95"
          >
            {isGenerating ? "Generazione in corso..." : "Genera Tabellone Playoff"}
          </button>
        </div>

      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {groups.map((g: any) => (
          <div key={g.id} className="bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden flex flex-col">
            <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
              <h3 className="text-xl font-black text-white uppercase tracking-wider">{g.name}</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/50 text-slate-400 text-sm uppercase tracking-wider">
                    <th className="p-4 font-bold w-12 text-center">Pos</th>
                    <th className="p-4 font-bold">Squadra</th>
                    <th className="p-4 font-bold text-center" title="Partite Giocate">PG</th>
                    <th className="p-4 font-bold text-center" title="Vinte">V</th>
                    <th className="p-4 font-bold text-center" title="Differenza Set">DS</th>
                    <th className="p-4 font-bold text-center text-purple-400">PTI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {[...g.standings].sort((a: any, b: any) => {
                    // 1. Punti
                    if (a.points !== b.points) return b.points - a.points;
                    
                    // 2. Differenza Set (DS)
                    const diffA = (a.setsFor || 0) - (a.setsAgainst || 0);
                    const diffB = (b.setsFor || 0) - (b.setsAgainst || 0);
                    if (diffA !== diffB) return diffB - diffA;
                    
                    // 3. Sets Fatti
                    if (a.setsFor !== b.setsFor) return (b.setsFor || 0) - (a.setsFor || 0);
                    
                    // 4. Scontro Diretto (H2H)
                    const h2h = g.matches?.find((m: any) => 
                      (m.teamAId === a.teamId && m.teamBId === b.teamId) || 
                      (m.teamAId === b.teamId && m.teamBId === a.teamId)
                    );
                    if (h2h && h2h.winnerTeamId) {
                      return h2h.winnerTeamId === a.teamId ? -1 : 1;
                    }
                    
                    return 0;
                  }).map((s: any, idx: number) => {
                    const isQualified = idx < qualifiersPerGroup;
                    return (
                      <tr key={s.id} className={clsx("transition-colors hover:bg-slate-800/50", isQualified ? "bg-emerald-900/10" : "")}>
                        <td className="p-4 text-center font-black">
                          <span className={clsx("flex items-center justify-center w-8 h-8 rounded-full", isQualified ? "bg-emerald-500/20 text-emerald-400" : "text-slate-500")}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="p-4 font-bold text-white">
                          {s.team.player1.name} & {s.team.player2.name}
                        </td>
                        <td className="p-4 text-center text-slate-400 font-medium">{s.played}</td>
                        <td className="p-4 text-center text-slate-400 font-medium">{s.won}</td>
                        <td className="p-4 text-center text-slate-400 font-medium">{s.setsFor - s.setsAgainst}</td>
                        <td className="p-4 text-center font-black text-purple-400 text-lg">{s.points}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="p-4 bg-slate-950 flex flex-col gap-2">
              <h4 className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-2">Partite del Girone</h4>
              {g.matches.map((m: any) => {
                const teamA = g.standings.find((s:any) => s.teamId === m.teamAId)?.team;
                const teamB = g.standings.find((s:any) => s.teamId === m.teamBId)?.team;
                const isFinished = !!m.winnerTeamId;
                
                return (
                  <Link key={m.id} href={`/match/${m.id}`}>
                    <div className={clsx("flex items-center justify-between p-3 rounded-xl border transition-colors cursor-pointer", isFinished ? "bg-slate-900 border-slate-800 opacity-75" : "bg-slate-800 border-slate-700 hover:border-purple-500")}>
                      <div className="flex-1 flex justify-end pr-4 text-sm font-bold text-white">
                        {teamA ? `${teamA.player1.name} & ${teamA.player2.name}` : "IN ATTESA"}
                      </div>
                      <div className="px-4 py-1 bg-slate-950 rounded-lg font-black text-slate-300 flex flex-col items-center">
                        {m.scheduledAt && !m.winnerTeamId && (
                          <div className="text-[10px] text-purple-400 font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {formatDate(m.scheduledAt)}
                          </div>
                        )}
                        <span>{isFinished ? `${m.scoreTeamA} - ${m.scoreTeamB}` : "VS"}</span>
                        {isFinished && m.setScores && formatSetScores(m.setScores) && (
                          <span className="text-[10px] text-emerald-400 font-bold tracking-tight">
                            ({formatSetScores(m.setScores)})
                          </span>
                        )}
                      </div>
                      <div className="flex-1 flex justify-start pl-4 text-sm font-bold text-white">
                        {teamB ? `${teamB.player1.name} & ${teamB.player2.name}` : "IN ATTESA"}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
          </div>
        )}
      </div>
    </div>
  );
}
