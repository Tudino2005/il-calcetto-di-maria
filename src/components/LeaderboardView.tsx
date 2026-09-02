"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function LeaderboardView({ playerStats, teamStats }: { playerStats: any[], teamStats: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  
  const query = searchTerm.toLowerCase();

  const filteredPlayers = playerStats.filter(p => p.name.toLowerCase().includes(query));
  
  const filteredTeams = teamStats.filter(t => 
    t.player1.name.toLowerCase().includes(query) || 
    t.player2.name.toLowerCase().includes(query)
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Search Bar */}
      <div className="relative max-w-xl mx-auto w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400" />
        </div>
        <input
          type="text"
          placeholder="Cerca un giocatore o una squadra..."
          className="w-full bg-slate-900 border border-slate-700 text-white rounded-full py-4 pl-12 pr-4 focus:outline-none focus:border-yellow-500 transition-colors shadow-lg"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Classifica Singoli */}
        <section className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
          <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest text-center border-b border-slate-700 pb-4">Top Singoli</h2>
          <div className="flex flex-col gap-3">
            {filteredPlayers.length === 0 && <p className="text-center text-slate-500">Nessun giocatore trovato.</p>}
            {filteredPlayers.map((p, i) => (
              <div key={p.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-slate-500 w-6 text-center">
                    {/* Preserve original ranking index by finding it in the original array if needed, or just show current index */}
                    {playerStats.findIndex(orig => orig.id === p.id) + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-white">{p.name}</h3>
                    <p className="text-xs text-slate-400 uppercase">{p.preferredRole}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-emerald-400 text-xl">{p.wins} V <span className="text-slate-600 text-sm">/ {p.played} G</span></div>
                  <div className="text-sm text-yellow-500 font-bold">{p.winRate}% WR</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Classifica Coppie */}
        <section className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
          <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-widest text-center border-b border-slate-700 pb-4">Top Coppie</h2>
          <div className="flex flex-col gap-3">
            {filteredTeams.length === 0 && <p className="text-center text-slate-500">Nessuna squadra trovata.</p>}
            {filteredTeams.map((t, i) => (
              <div key={t.id} className="bg-slate-900 p-4 rounded-xl border border-slate-700 flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <span className="text-2xl font-black text-slate-500 w-6 text-center">
                    {teamStats.findIndex(orig => orig.id === t.id) + 1}
                  </span>
                  <div>
                    <h3 className="font-bold text-lg text-white truncate max-w-[150px]">{t.player1.name}</h3>
                    <h3 className="font-bold text-lg text-white truncate max-w-[150px]">{t.player2.name}</h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-black text-emerald-400 text-xl">{t.wins} V <span className="text-slate-600 text-sm">/ {t.played} G</span></div>
                  <div className="text-sm text-yellow-500 font-bold">{t.winRate}% WR</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
