"use client";

import { Trophy, Calendar } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function GroupStageView({ groups, qualifiersPerGroup, tournamentId }: { groups: any[], qualifiersPerGroup: number, tournamentId: string }) {
  const allGroupsFinished = groups.every(g => g.matches.every((m: any) => m.winnerTeamId !== null));

  return (
    <div className="flex flex-col gap-8">
      {allGroupsFinished && (
        <div className="bg-emerald-900/50 border border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center gap-4 text-center">
          <Trophy className="w-12 h-12 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Tutti i gironi sono terminati!</h2>
          <p className="text-emerald-200">Le squadre qualificate sono pronte per il tabellone finale.</p>
          <form action="/api/playoff" method="POST" className="mt-4">
            <input type="hidden" name="tournamentId" value={tournamentId} />
            <input type="hidden" name="qualifiers" value={qualifiersPerGroup} />
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-8 rounded-full transition-transform active:scale-95">
              Genera Tabellone Playoff
            </button>
          </form>
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
                  {g.standings.map((s: any, idx: number) => {
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
                        {teamA ? `${teamA.player1.name} & ${teamA.player2.name}` : "TBD"}
                      </div>
                      <div className="px-4 py-1 bg-slate-950 rounded-lg font-black text-slate-300">
                        {isFinished ? `${m.scoreTeamA} - ${m.scoreTeamB}` : "VS"}
                      </div>
                      <div className="flex-1 flex justify-start pl-4 text-sm font-bold text-white">
                        {teamB ? `${teamB.player1.name} & ${teamB.player2.name}` : "TBD"}
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
  );
}
