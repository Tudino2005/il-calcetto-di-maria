"use client";

import Link from "next/link";
import { Trophy, Calendar, CalendarDays, Swords } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import { scheduleMatch } from "@/app/actions/matchActions";

type PlayerInfo = { id: string; name: string };
type TeamInfo = { id: string; player1: PlayerInfo; player2: PlayerInfo };
type MatchInfo = {
  id: string;
  scoreTeamA: number;
  scoreTeamB: number;
  winnerTeamId: string | null;
  teamA: TeamInfo | null;
  teamB: TeamInfo | null;
  scheduledAt: Date | string | null;
};
type TournamentInfo = {
  id: string;
  name: string;
  status: string;
  matches: MatchInfo[];
  winnerTeam: TeamInfo | null;
};

export default function TournamentBracket({ tournament }: { tournament: TournamentInfo }) {
  const [activeTab, setActiveTab] = useState<"bracket" | "agenda" | "squadre">("bracket");

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
  const agendaMatches = [...tournament.matches].sort((a, b) => {
    if (a.winnerTeamId && !b.winnerTeamId) return 1;
    if (!a.winnerTeamId && b.winnerTeamId) return -1;
    if (a.scheduledAt && b.scheduledAt) {
      return new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();
    }
    if (a.scheduledAt) return -1;
    if (b.scheduledAt) return 1;
    return 0;
  });

  // Extract all unique teams for the "Squadre" tab
  const allTeams: TeamInfo[] = [];
  tournament.matches.forEach(m => {
    if (m.teamA && !allTeams.find(t => t.id === m.teamA!.id)) allTeams.push(m.teamA);
    if (m.teamB && !allTeams.find(t => t.id === m.teamB!.id)) allTeams.push(m.teamB);
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* Tabs */}
      <div className="flex flex-wrap gap-4 mb-4">
        <button 
          onClick={() => setActiveTab("bracket")}
          className={clsx("flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all", activeTab === "bracket" ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}
        >
          <Swords className="w-5 h-5" /> Tabellone
        </button>
        <button 
          onClick={() => setActiveTab("agenda")}
          className={clsx("flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all", activeTab === "agenda" ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}
        >
          <CalendarDays className="w-5 h-5" /> Agenda Partite
        </button>
        <button 
          onClick={() => setActiveTab("squadre")}
          className={clsx("flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all", activeTab === "squadre" ? "bg-purple-500 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700")}
        >
          <Trophy className="w-5 h-5" /> Squadre Sorteggiate
        </button>
      </div>

      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 overflow-x-auto">
        {tournament.winnerTeam && (
          <div className="mb-12 p-6 bg-yellow-500/10 border-2 border-yellow-500/50 rounded-2xl flex flex-col items-center justify-center animate-in fade-in">
            <Trophy className="w-16 h-16 text-yellow-500 mb-2" />
            <h2 className="text-2xl font-black text-white text-center">
              VINCITORI DEL TORNEO <br/>
              <span className="text-yellow-400">
                {tournament.winnerTeam.player1.name} & {tournament.winnerTeam.player2.name}
              </span>
            </h2>
          </div>
        )}

        {activeTab === "bracket" && (
          <div className="flex flex-col gap-6">
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-4">Partite del Tabellone - {tournament.name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {tournament.matches.map((m, idx) => {
                const isFinished = !!m.winnerTeamId;
                return (
                  <div key={m.id} className={clsx(
                    "flex flex-col rounded-2xl border-2 p-4 transition-all relative group",
                    isFinished ? "bg-slate-800/80 border-slate-700 opacity-70" : "bg-slate-800 border-purple-500 shadow-lg shadow-purple-900/20 hover:scale-105"
                  )}>
                    <div className="text-xs text-slate-400 font-bold mb-3 uppercase tracking-wider text-center flex justify-between items-center">
                      <span>{isFinished ? "Completata" : (m.scheduledAt ? formatDate(m.scheduledAt) : "Da Pianificare")}</span>
                      {!isFinished && (
                        <div className="relative overflow-hidden w-6 h-6 ml-2 flex items-center justify-center">
                          <input 
                            type="datetime-local" 
                            onClick={(e) => { try { e.currentTarget.showPicker() } catch(err){} }}
                            onChange={(e) => handleScheduleDirect(m.id, e.target.value)}
                            value={m.scheduledAt ? new Date(new Date(m.scheduledAt).getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16) : ""}
                            className="absolute opacity-0 inset-0 cursor-pointer w-full h-full"
                          />
                          <Calendar className="w-4 h-4 text-purple-400 pointer-events-none" />
                        </div>
                      )}
                    </div>
                    
                    <Link href={`/match/${m.id}`}>
                      <div className="flex flex-col gap-2 cursor-pointer">
                        <div className={clsx("flex justify-between items-center p-2 rounded-lg", m.winnerTeamId === m.teamA?.id ? "bg-emerald-500/20 text-emerald-400 font-bold" : "bg-slate-900 text-slate-300")}>
                          <span className="truncate">{m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}</span>
                          <span className="font-black ml-2">{m.scoreTeamA}</span>
                        </div>
                        
                        <div className={clsx("flex justify-between items-center p-2 rounded-lg", m.winnerTeamId === m.teamB?.id ? "bg-emerald-500/20 text-emerald-400 font-bold" : "bg-slate-900 text-slate-300")}>
                          <span className="truncate">{m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}</span>
                          <span className="font-black ml-2">{m.scoreTeamB}</span>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "agenda" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-4">Agenda e Programmazione - {tournament.name}</h3>
            <div className="flex flex-col gap-3">
              {agendaMatches.map((m, i) => {
                const isFinished = !!m.winnerTeamId;
                return (
                  <div key={m.id} className={clsx("flex items-center justify-between p-4 rounded-xl border", isFinished ? "bg-slate-800 border-slate-700 opacity-60" : "bg-slate-800 border-purple-500/50")}>
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
                              className="absolute opacity-0 inset-0 cursor-pointer w-full h-full"
                            />
                            <button className="text-purple-500 hover:text-purple-400 flex items-center gap-1 text-sm font-bold mt-1 pointer-events-none">
                              <Calendar className="w-4 h-4" /> Fissa Data
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <span className={clsx("font-bold text-lg", m.winnerTeamId === m.teamA?.id ? "text-emerald-400" : "text-white")}>
                          {m.teamA ? `${m.teamA.player1.name} & ${m.teamA.player2.name}` : "TBD"}
                        </span>
                        <span className="text-slate-500 font-bold">VS</span>
                        <span className={clsx("font-bold text-lg", m.winnerTeamId === m.teamB?.id ? "text-emerald-400" : "text-white")}>
                          {m.teamB ? `${m.teamB.player1.name} & ${m.teamB.player2.name}` : "TBD"}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      {isFinished ? (
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm font-bold uppercase tracking-wider border border-emerald-500/20">
                          {m.scoreTeamA} - {m.scoreTeamB}
                        </span>
                      ) : (
                        <Link href={`/match/${m.id}`}>
                          <button className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-colors">
                            Gioca
                          </button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "squadre" && (
          <div className="flex flex-col gap-4">
            <h3 className="text-xl font-bold text-slate-400 uppercase tracking-widest mb-4">Le Squadre ({allTeams.length}) - {tournament.name}</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {allTeams.map((t, idx) => (
                <div key={t.id} className="bg-slate-800 p-4 rounded-xl border border-slate-700 flex flex-col items-center gap-2">
                  <span className="text-xs text-slate-500 font-bold uppercase">Squadra {idx + 1}</span>
                  <div className="flex flex-col items-center text-center">
                    <span className="text-white font-bold">{t.player1.name}</span>
                    <span className="text-emerald-400/50 text-sm font-bold">&</span>
                    <span className="text-white font-bold">{t.player2.name}</span>
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
