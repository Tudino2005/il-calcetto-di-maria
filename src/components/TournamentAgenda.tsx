"use client";

import { useState } from "react";
import { Calendar } from "lucide-react";
import clsx from "clsx";
import Link from "next/link";
import { scheduleMatch } from "@/app/actions/matchActions";

export default function TournamentAgenda({ tournament }: { tournament: any }) {
  // Helper to format date
  const formatDate = (dateInput: Date | string | null) => {
    if (!dateInput) return null;
    const d = new Date(dateInput);
    return d.toLocaleString("it-IT", { 
      weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
    });
  };

  const handleScheduleDirect = async (matchId: string, val: string) => {
    if (val) {
      const date = new Date(val);
      if (!isNaN(date.getTime())) {
        await scheduleMatch(matchId, date);
      }
    }
  };

  // Sort matches for agenda
  const agendaMatches = [...(tournament.matches || [])].sort((a: any, b: any) => {
    if (a.winnerTeamId && !b.winnerTeamId) return 1;
    if (!a.winnerTeamId && b.winnerTeamId) return -1;
    if (a.scheduledAt && b.scheduledAt) {
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    }
    if (a.scheduledAt) return -1;
    if (b.scheduledAt) return 1;
    return 0;
  });

  if (agendaMatches.length === 0) {
    return <div className="text-center text-slate-400 p-8">Nessuna partita trovata in questo torneo.</div>;
  }

  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-4">Agenda e Programmazione - {tournament.name}</h3>
      <div className="flex flex-col gap-3">
        {agendaMatches.map((m: any, i: number) => {
          const isFinished = !!m.winnerTeamId;
          
          let bracketLabel = "Partita";
          if (m.bracketType === "group_stage") bracketLabel = "Fase a Gironi";
          else if (m.bracketType === "winners") bracketLabel = "Winners Bracket";
          else if (m.bracketType === "losers") bracketLabel = "Losers Bracket";
          else if (m.bracketType === "grand_final") bracketLabel = "Grand Final";
          else if (m.bracketType === "grand_final_reset") bracketLabel = "Bracket Reset";

          return (
            <div key={m.id} className={clsx("flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border gap-4", isFinished ? "bg-slate-800 border-slate-700 opacity-60" : "bg-slate-800 border-purple-500/50")}>
              <div className="flex items-center gap-6">
                <div className="flex flex-col">
                  <span className="text-slate-400 text-sm font-bold uppercase">Data</span>
                  {m.scheduledAt ? (
                    <div className="flex items-center gap-2">
                      <span className="text-purple-300 font-medium">{formatDate(m.scheduledAt)}</span>
                      <div className="relative overflow-hidden w-5 h-5 flex items-center justify-center">
                        <input 
                          type="datetime-local" 
                          onClick={(e) => { try { e.currentTarget.showPicker() } catch(err){} }}
                          onChange={(e) => handleScheduleDirect(m.id, e.target.value)}
                          value={new Date(new Date(m.scheduledAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16)}
                          className="absolute opacity-0 inset-0 cursor-pointer w-full h-full"
                        />
                        <Calendar className="w-3 h-3 text-slate-500 hover:text-purple-400 pointer-events-none" />
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input 
                        type="datetime-local" 
                        onClick={(e) => { try { e.currentTarget.showPicker() } catch(err){} }}
                        onChange={(e) => handleScheduleDirect(m.id, e.target.value)}
                        className="opacity-0 absolute inset-0 cursor-pointer w-full h-full z-10"
                      />
                      <button className="text-xs bg-purple-500/20 text-purple-400 px-3 py-1 rounded hover:bg-purple-500/40 font-bold pointer-events-none flex items-center gap-2">
                        <Calendar className="w-3 h-3" /> Fissa Orario
                      </button>
                    </div>
                  )}
                </div>

                <div className="hidden md:flex flex-col border-l border-slate-700 pl-6">
                  <span className="text-slate-500 text-xs font-bold uppercase">{bracketLabel}</span>
                  <div className="flex items-center gap-2 text-sm font-bold mt-1 text-slate-300">
                    <span className={clsx(m.winnerTeamId === m.teamA?.id && "text-emerald-400")}>{m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}</span>
                    <span className="text-slate-600 px-2">vs</span>
                    <span className={clsx(m.winnerTeamId === m.teamB?.id && "text-emerald-400")}>{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}</span>
                  </div>
                </div>
              </div>
              
              {/* Mobile View Team Names */}
              <div className="md:hidden flex flex-col border-t border-slate-700 pt-3">
                <span className="text-slate-500 text-xs font-bold uppercase">{bracketLabel}</span>
                <div className="flex flex-col gap-1 text-sm font-bold mt-1 text-slate-300">
                  <span className={clsx(m.winnerTeamId === m.teamA?.id && "text-emerald-400")}>{m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}</span>
                  <span className="text-slate-600 text-xs italic">vs</span>
                  <span className={clsx(m.winnerTeamId === m.teamB?.id && "text-emerald-400")}>{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}</span>
                </div>
              </div>

              <div className="flex items-center justify-end">
                {isFinished ? (
                  <div className="flex flex-col items-end">
                    <span className="text-emerald-500 font-black text-xl">{m.scoreTeamA} - {m.scoreTeamB}</span>
                    <span className="text-xs text-slate-500 font-bold uppercase">Risultato Finale</span>
                  </div>
                ) : (
                  <Link href={`/match/${m.id}`}>
                    <button className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold py-2 px-6 rounded-xl text-sm transition-all shadow hover:shadow-emerald-500/25 active:scale-95">
                      Inserisci Risultato
                    </button>
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
