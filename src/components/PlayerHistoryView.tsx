"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Users, Calendar, Trophy, Swords } from "lucide-react";
import RoleIcon from "@/components/RoleIcon";
import { formatSetScores } from "@/lib/scoreUtils";
import { getEffectiveMatchRole } from "@/lib/roleUtils";

export default function PlayerHistoryView({
  playerId,
  partnerStats,
  allMatches,
}: {
  playerId: string;
  partnerStats: any[];
  allMatches: any[];
}) {
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>("all");

  const filteredPartners = selectedPartnerId === "all" 
    ? partnerStats 
    : partnerStats.filter(p => p.partner.id === selectedPartnerId);

  const filteredMatches = selectedPartnerId === "all"
    ? allMatches
    : allMatches.filter(m => {
        const isTeamA = m.teamA?.player1Id === playerId || m.teamA?.player2Id === playerId;
        const myTeam = isTeamA ? m.teamA : m.teamB;
        if (!myTeam) return false;
        const partner = myTeam.player1Id === playerId ? myTeam.player2 : myTeam.player1;
        return partner?.id === selectedPartnerId;
      });

  return (
    <>
      {/* RIEPILOGO PER COMPAGNO */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h3 className="text-2xl font-black uppercase tracking-wider text-white flex items-center gap-3">
            <Users className="w-7 h-7 text-purple-400" /> RIEPILOGO PER COMPAGNO
          </h3>
          
          <div className="flex items-center gap-3 bg-slate-800/80 p-2 rounded-xl border border-slate-700 shadow-sm">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-wider px-2">Filtra:</span>
            <select
              value={selectedPartnerId}
              onChange={(e) => setSelectedPartnerId(e.target.value)}
              className="bg-slate-900 text-white font-bold px-4 py-2 rounded-lg border border-slate-700 outline-none focus:border-purple-500 transition-colors cursor-pointer"
            >
              <option value="all">Tutti i compagni</option>
              {partnerStats.map(p => (
                <option key={p.partner.id} value={p.partner.id}>
                  {p.partner.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {filteredPartners.length === 0 ? (
          <div className="bg-slate-800 p-6 rounded-2xl text-center text-slate-400 border border-slate-700">
            Nessuna coppia trovata con questo filtro.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredPartners.map(({ partner, played, wins, winRate, teamId, partnerRank, teamRank, goalsScored, goalsConceded }) => {
              const winRateNum = Number(winRate);
              const isHigh = winRateNum >= 60;
              const isMid = winRateNum >= 40 && winRateNum < 60;

              return (
                <div key={partner.id} className="bg-slate-800/90 border border-slate-700 hover:border-purple-500/50 transition-all p-5 rounded-2xl shadow-lg flex flex-col justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 bg-slate-700/80 rounded-full flex items-center justify-center shrink-0">
                      <RoleIcon role={partner.preferredRole || "entrambi"} className="w-6 h-6" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-0.5">
                        <Link href={`/players/${partner.id}`} className="text-xl font-black text-white hover:text-purple-400 transition-colors block leading-snug truncate">
                          {partner.name}
                        </Link>
                        {partnerRank && (
                          <span className="text-lg font-black text-purple-400 shrink-0">{partnerRank}°</span>
                        )}
                      </div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mt-0.5">
                        {partner.preferredRole || "Giocatore"}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-y-3 gap-x-2 pt-3 border-t border-slate-700/60 text-center bg-slate-900/40 p-2.5 rounded-xl">
                    <div>
                      <div className="text-[10px] sm:text-[11px] text-purple-400 font-bold uppercase tracking-wider">Classifica</div>
                      <div className="text-lg font-black text-purple-400">{teamRank ? `${teamRank}°` : "-"}</div>
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] text-slate-400 font-bold uppercase tracking-wider">Giocate</div>
                      <div className="text-lg font-black text-white">{played}</div>
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] text-emerald-400 font-bold uppercase tracking-wider">Vinte</div>
                      <div className="text-lg font-black text-emerald-400">{wins}</div>
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] text-yellow-500 font-bold uppercase tracking-wider">Win Rate</div>
                      <div className={`text-lg font-black ${
                        isHigh ? 'text-emerald-400' : isMid ? 'text-yellow-400' : 'text-slate-300'
                      }`}>
                        {winRate}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] text-blue-400 font-bold uppercase tracking-wider">Gol Fatti</div>
                      <div className="text-lg font-black text-white">{goalsScored}</div>
                    </div>
                    <div>
                      <div className="text-[10px] sm:text-[11px] text-red-400 font-bold uppercase tracking-wider">Gol Subiti</div>
                      <div className="text-lg font-black text-white">{goalsConceded}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* STORICO PARTITE GIOCATE */}
      <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
        <Calendar className="w-6 h-6 text-blue-400" /> Storico Partite Giocate
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filteredMatches.length === 0 ? (
          <div className="bg-slate-800 p-8 rounded-3xl text-center text-slate-400">
            Nessuna partita trovata con questo filtro.
          </div>
        ) : (
          filteredMatches.map((m: any) => {
            const isTeamA = m.teamA?.player1Id === playerId || m.teamA?.player2Id === playerId;
            const myTeam = isTeamA ? m.teamA : m.teamB;
            const enemyTeam = isTeamA ? m.teamB : m.teamA;
            const myScore = isTeamA ? m.scoreTeamA : m.scoreTeamB;
            const enemyScore = isTeamA ? m.scoreTeamB : m.scoreTeamA;
            const iWon = m.winnerTeamId === myTeam?.id;
            const roleInMatch = getEffectiveMatchRole(m, playerId);

            return (
              <div key={m.id} className={`p-6 rounded-2xl flex items-center justify-between border-2 bg-slate-900 ${
                iWon ? 'border-emerald-500/30' : 'border-red-500/30'
              }`}>
                <div className="flex-1">
                  <div className="flex items-center gap-3 text-sm text-slate-400 font-bold mb-2 flex-wrap">
                    <span>
                      {new Date(m.playedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="text-slate-600">•</span>
                    {m.tournament ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/30">
                        <Trophy className="w-3.5 h-3.5 text-purple-400" />
                        {m.tournament.name}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <Swords className="w-3.5 h-3.5 text-emerald-400" />
                        Partita Libera
                      </span>
                    )}
                    {roleInMatch === "portiere" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        🛡️ In Porta
                      </span>
                    )}
                    {roleInMatch === "attaccante" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-500/20 text-red-300 border border-red-500/30">
                        ⚔️ In Attacco
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xl font-bold flex-wrap">
                    <span className="text-white">Con: {myTeam?.player1Id === playerId ? myTeam?.player2?.name : myTeam?.player1?.name}</span>
                    <span className="text-slate-500 text-sm mx-2">VS</span>
                    <span className="text-slate-400">{enemyTeam?.player1?.name} & {enemyTeam?.player2?.name}</span>
                  </div>
                  {m.setScores && formatSetScores(m.setScores) && (
                    <div className="text-xs font-black text-emerald-400 mt-1 tracking-wider">
                      Dettaglio Set: {formatSetScores(m.setScores)}
                    </div>
                  )}
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="bg-slate-900 px-6 py-2 rounded-xl text-3xl font-black shadow-inner">
                    <span className={iWon ? "text-emerald-400" : "text-white"}>{myScore}</span>
                    <span className="text-slate-600 mx-2">-</span>
                    <span className={!iWon ? "text-emerald-400" : "text-slate-400"}>{enemyScore}</span>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    iWon ? 'bg-emerald-500 text-emerald-950' : 'bg-red-500/20 text-red-400'
                  }`}>
                    {iWon ? <Trophy className="w-6 h-6" /> : <span className="font-black">L</span>}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </>
  );
}
