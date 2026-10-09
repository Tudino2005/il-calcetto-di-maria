"use client";

import React, { useState } from "react";
import { Search, User, Users, Shield, Trophy } from "lucide-react";
import MobilePlayerProfileSheet from "./MobilePlayerProfileSheet";

export default function PublicLeaderboardClient({ data }: { data: any }) {
  const [activeTab, setActiveTab] = useState("singoli"); // singoli, coppie, ruoli
  const [activeRole, setActiveRole] = useState("defenders"); // defenders, strikers
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlayer, setSelectedPlayer] = useState<any>(null);

  const { playerStats, teamStats, advancedPlayerStats } = data;

  // Filtriamo i dati come fatto nella TV (inclusione di tutti, escludendo chi ha 0 wins se si vuole, ma qui lasciamo tutti per far trovare chiunque, ordinati per punti)
  // Wait, in TV we filtered `wins > 0`. On mobile it's better to show everyone who played at least 1 match.
  // Actually, if someone is in playerStats, they played at least 1 match (handled by leaderboard logic).
  
  const filteredSingoli = playerStats.filter((p: any) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredCoppie = teamStats.filter((t: any) => {
    const tName = `${t.player1?.name || ""} & ${t.player2?.name || ""}`.toLowerCase();
    return tName.includes(searchQuery.toLowerCase());
  });

  const defenderStats = playerStats.filter((p: any) => p.preferredRole?.toLowerCase() === 'difensore' || p.preferredRole?.toLowerCase() === 'portiere');
  const strikerStats = playerStats.filter((p: any) => p.preferredRole?.toLowerCase() === 'attaccante');

  const filteredDefenders = defenderStats.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredStrikers = strikerStats.filter((p: any) => p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderSingoli = () => (
    <div className="flex flex-col gap-3 pb-24 px-4 mt-4">
      <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_1.25rem_1.25rem_1.25rem_2rem_1.5rem] gap-1.5 px-2 text-[9px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">
        <div className="text-center">#</div>
        <div>NOME</div>
        <div className="text-center">SG</div>
        <div className="text-center">SV</div>
        <div className="text-center">SP</div>
        <div className="text-center">WR%</div>
        <div className="text-right text-yellow-500/50">PT</div>
      </div>
      {filteredSingoli.map((p: any, i: number) => {
        const rank = playerStats.findIndex((x: any) => x.id === p.id) + 1;
        const wr = p.winRate ?? '-';
        return (
          <div key={p.id} onClick={() => { const advStats = advancedPlayerStats?.find((s: any) => s.player?.id === p.id); setSelectedPlayer({ p, rank, advStats, isTeam: false }); }} className="bg-slate-900/50 border border-slate-800 rounded-xl p-2.5 grid grid-cols-[1.25rem_minmax(0,1fr)_1.25rem_1.25rem_1.25rem_2rem_1.5rem] gap-1.5 items-center cursor-pointer active:scale-[0.98] transition-transform">
            <div className={`text-center text-xs font-black ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-orange-400' : 'text-slate-500'}`}>
              {rank}
            </div>
            <div className="flex items-center gap-2 min-w-0">
              {p.avatarUrl ? (
                <img src={`/players/${p.avatarUrl}`} className="w-7 h-7 rounded-full object-cover border border-slate-700 shrink-0" alt={p.name} />
              ) : (
                <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-[9px] shrink-0">
                  {p.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <span className="font-bold text-white truncate text-sm">{p.name}</span>
            </div>
            <div className="text-center text-[11px] font-bold text-slate-400">{p.played}</div>
            <div className="text-center text-[11px] font-bold text-emerald-400/80">{p.wins}</div>
            <div className="text-center text-[11px] font-bold text-red-400/80">{p.played - p.wins}</div>
            <div className="text-center text-[11px] font-bold text-slate-300">{wr}{wr !== '-' ? '%' : ''}</div>
            <div className="text-right text-sm font-black text-yellow-500">{p.points}</div>
          </div>
        );
      })}
      {filteredSingoli.length === 0 && <div className="text-center text-slate-500 mt-8">Nessun giocatore trovato.</div>}
    </div>
  );

  const renderCoppie = () => (
    <div className="flex flex-col gap-3 pb-24 px-4 mt-4">
      <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_1.25rem_1.25rem_1.25rem_2rem_1.5rem] gap-1.5 px-2 text-[9px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">
        <div className="text-center">#</div>
        <div>NOME</div>
        <div className="text-center">SG</div>
        <div className="text-center">SV</div>
        <div className="text-center">SP</div>
        <div className="text-center">WR%</div>
        <div className="text-right text-yellow-500/50">PT</div>
      </div>
      {filteredCoppie.map((t: any, i: number) => {
        const rank = teamStats.findIndex((x: any) => x.id === t.id) + 1;
        const wr = t.winRate ?? '-';
        return (
          <div key={t.id} onClick={() => setSelectedPlayer({ p: t, rank, isTeam: true })} className="bg-slate-900/50 border border-slate-800 rounded-xl p-2.5 grid grid-cols-[1.25rem_minmax(0,1fr)_1.25rem_1.25rem_1.25rem_2rem_1.5rem] gap-1.5 items-center cursor-pointer active:scale-[0.98] transition-transform">
            <div className={`text-center text-xs font-black ${rank === 1 ? 'text-yellow-400' : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-orange-400' : 'text-slate-500'}`}>
              {rank}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-white truncate text-[11px] leading-tight">{t.player1?.name || "G1"}</span>
              <span className="font-bold text-white truncate text-[11px] leading-tight">{t.player2?.name || "G2"}</span>
            </div>
            <div className="text-center text-[11px] font-bold text-slate-400">{t.played}</div>
            <div className="text-center text-[11px] font-bold text-emerald-400/80">{t.wins}</div>
            <div className="text-center text-[11px] font-bold text-red-400/80">{t.played - t.wins}</div>
            <div className="text-center text-[11px] font-bold text-slate-300">{wr}{wr !== '-' ? '%' : ''}</div>
            <div className="text-right text-sm font-black text-yellow-500">{t.points}</div>
          </div>
        );
      })}
      {filteredCoppie.length === 0 && <div className="text-center text-slate-500 mt-8">Nessuna coppia trovata.</div>}
    </div>
  );

  const renderRuoli = () => {
    const list = activeRole === 'defenders' ? filteredDefenders : filteredStrikers;
    const baseList = activeRole === 'defenders' ? defenderStats : strikerStats;
    const titleColor = activeRole === 'defenders' ? 'text-yellow-500' : 'text-red-500';

    return (
      <div className="flex flex-col gap-3 pb-24 px-4 mt-4">
        
        {/* Sub-tabs per i ruoli */}
        <div className="flex bg-slate-900 p-1 rounded-xl mx-auto w-full max-w-sm mb-2 border border-slate-800">
          <button 
            onClick={() => setActiveRole('defenders')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeRole === 'defenders' ? 'bg-slate-800 text-yellow-500 shadow-sm' : 'text-slate-400'}`}
          >
            DEFENDERS
          </button>
          <button 
            onClick={() => setActiveRole('strikers')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-colors ${activeRole === 'strikers' ? 'bg-slate-800 text-red-500 shadow-sm' : 'text-slate-400'}`}
          >
            STRIKERS
          </button>
        </div>

        <div className="grid grid-cols-[1.25rem_minmax(0,1fr)_2.5rem_2.5rem_2rem] gap-1.5 px-2 text-[9px] font-black text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-2">
          <div className="text-center">#</div>
          <div>NOME</div>
          <div className="text-center">{activeRole === 'defenders' ? 'GS' : 'GF'}</div>
          <div className="text-center">MED</div>
          <div className="text-right text-yellow-500/50">PT</div>
        </div>
        
        {list.map((p: any) => {
          const rank = baseList.findIndex((x: any) => x.id === p.id) + 1;
          const advStats = advancedPlayerStats?.find((s: any) => s.player?.id === p.id);
          const rStats = advStats?.roleStats;
          
          let matches = 0, goals = 0, media = '-';
          if (activeRole === 'defenders') {
            matches = rStats?.gkMatches || 0;
            goals = rStats?.gkGoalsConceded || 0;
            media = matches > 0 ? (goals / matches).toFixed(2) : '-';
          } else {
            matches = rStats?.stMatches || 0;
            goals = rStats?.stGoalsScored || 0;
            media = matches > 0 ? (goals / matches).toFixed(2) : '-';
          }

          return (
            <div key={p.id} onClick={() => { const advStats = advancedPlayerStats?.find((s: any) => s.player?.id === p.id); setSelectedPlayer({ p, rank, advStats, isTeam: false }); }} className="bg-slate-900/50 border border-slate-800 rounded-xl p-3 flex items-center gap-2 cursor-pointer active:scale-[0.98] transition-transform">
              <div className={`w-6 text-center font-black ${rank === 1 ? titleColor : rank === 2 ? 'text-slate-300' : rank === 3 ? 'text-orange-400' : 'text-slate-500'}`}>
                {rank}
              </div>
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {p.avatarUrl ? (
                  <img src={`/players/${p.avatarUrl}`} className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 shrink-0" alt={p.name} />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-white shrink-0">
                    {p.name.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-white truncate text-sm">{p.name}</span>
                  <span className="text-[10px] text-slate-400">{matches} Match giocati</span>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center shrink-0 w-8">
                <span className="text-sm font-bold text-slate-300">{goals}</span>
              </div>
              <div className="flex flex-col items-center justify-center shrink-0 w-10">
                <span className="text-sm font-bold text-slate-300">{media}</span>
              </div>
              <div className="flex flex-col items-end justify-center shrink-0 w-10">
                <span className={`text-lg font-black ${titleColor}`}>{p.points}</span>
              </div>
            </div>
          );
        })}
        {list.length === 0 && <div className="text-center text-slate-500 mt-8">Nessun giocatore trovato.</div>}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 w-full max-w-md mx-auto relative shadow-2xl overflow-hidden">
      
      {/* HEADER */}
      <div className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800 pt-12 pb-4 px-4 flex flex-col gap-4">
        <h1 className="text-2xl font-black text-white text-center tracking-widest flex items-center justify-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          ARENA STATS
        </h1>
        
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Cerca giocatore o coppia..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-full py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'singoli' && renderSingoli()}
        {activeTab === 'coppie' && renderCoppie()}
        {activeTab === 'ruoli' && renderRuoli()}
      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 w-full z-50 flex justify-center pb-4">
        <div className="w-full max-w-md bg-slate-900/90 backdrop-blur-xl border-t border-slate-800 flex items-center justify-around p-2 pb-6 pt-3">
          <button 
            onClick={() => setActiveTab('singoli')}
            className={`flex flex-col items-center gap-1 w-20 transition-colors ${activeTab === 'singoli' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <User className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Singoli</span>
          </button>
          
          <button 
            onClick={() => setActiveTab('coppie')}
            className={`flex flex-col items-center gap-1 w-20 transition-colors ${activeTab === 'coppie' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Users className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Coppie</span>
          </button>

          <button 
            onClick={() => setActiveTab('ruoli')}
            className={`flex flex-col items-center gap-1 w-20 transition-colors ${activeTab === 'ruoli' ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <Shield className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Ruoli</span>
          </button>
        </div>
      </div>

      <MobilePlayerProfileSheet isOpen={!!selectedPlayer} onClose={() => setSelectedPlayer(null)} playerInfo={selectedPlayer} />
    </div>
  );
}
