import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Swords, Trophy, Sparkles, Calendar } from 'lucide-react';

export default function MobilePlayerProfileSheet({ isOpen, onClose, playerInfo }: { isOpen: boolean; onClose: () => void; playerInfo: any }) {
  if (!playerInfo) return null;
  const { p, rank, advStats, isTeam } = playerInfo;

  if (isTeam) {
    // Basic view for team (future expansion)
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 z-[101] h-[85vh] bg-slate-900 rounded-t-3xl border-t border-slate-700 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
            >
              <div className="w-full flex justify-center pt-3 pb-2">
                <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
              </div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-black text-white">{p.player1?.name} & {p.player2?.name}</h2>
                    <span className="text-yellow-500 font-bold text-lg">{rank}° Coppia</span>
                  </div>
                  <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700 text-center text-slate-400">
                  Statistiche avanzate per la coppia in arrivo!
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  // SINGLE PLAYER VIEW
  const rStats = advStats?.roleStats;
  const bp = advStats?.bestPartner;
  const matches = advStats?.last5Matches || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 z-[101] h-[85vh] bg-slate-900 rounded-t-3xl border-t border-slate-700 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            {/* Grab handle */}
            <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}>
              <div className="w-12 h-1.5 bg-slate-700 rounded-full" />
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24">
              {/* HEADER */}
              <div className="flex justify-between items-start mb-6 relative">
                <div className="flex items-center gap-4">
                  {p.avatarUrl ? (
                    <img src={`/players/${p.avatarUrl}`} className="w-16 h-16 rounded-full object-cover border-2 border-slate-700" alt={p.name} />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center font-bold text-white text-xl">
                      {p.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-black text-white leading-tight flex items-baseline gap-2">
                      {p.name} <span className="text-xl text-yellow-500">{rank}°</span>
                    </h2>
                    <span className="inline-block mt-1 px-3 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs uppercase tracking-wider font-bold border border-slate-700">
                      {p.preferredRole || "Jolly"}
                    </span>
                  </div>
                </div>
                <button onClick={onClose} className="absolute right-0 top-0 p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 4 CARDS GRID */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                
                {/* IN PORTA */}
                <div className="bg-slate-900/50 border border-blue-500/30 rounded-xl p-3 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Shield className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-[10px] uppercase font-black tracking-wider text-blue-400">In Porta</span>
                  </div>
                  <div className="text-2xl font-black text-white leading-none">
                    {rStats?.defensiveIndex || "-"} <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Sub</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold mt-auto pt-2 border-t border-slate-800">
                    <span className="text-slate-400">{rStats?.gkMatches || 0} G</span>
                    <span className="text-yellow-500">{rStats?.gkWinRate ? `${rStats.gkWinRate}% V` : "-"}</span>
                  </div>
                </div>

                {/* IN ATTACCO */}
                <div className="bg-slate-900/50 border border-red-500/30 rounded-xl p-3 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Swords className="w-3.5 h-3.5 text-red-400" />
                    <span className="text-[10px] uppercase font-black tracking-wider text-red-400">In Attacco</span>
                  </div>
                  <div className="text-2xl font-black text-white leading-none">
                    {rStats?.offensiveIndex || "-"} <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Fatti</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold mt-auto pt-2 border-t border-slate-800">
                    <span className="text-slate-400">{rStats?.stMatches || 0} G</span>
                    <span className="text-yellow-500">{rStats?.stWinRate ? `${rStats.stWinRate}% V` : "-"}</span>
                  </div>
                </div>

                {/* BEST PARTNER */}
                <div className="bg-slate-900/50 border border-purple-500/30 rounded-xl p-3 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    <span className="text-[10px] uppercase font-black tracking-wider text-purple-400">Partner</span>
                  </div>
                  <div className="text-[15px] font-black text-white leading-tight truncate">
                    {bp?.partner?.name || "Nessuno"}
                  </div>
                  <div className="flex justify-between text-[10px] font-bold mt-auto pt-2 border-t border-slate-800">
                    <span className="text-slate-400">{bp?.played || 0} G</span>
                    <span className="text-emerald-400">{bp?.winRate || "0"}% V</span>
                  </div>
                </div>

                {/* TOTALE */}
                <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-3 flex flex-col">
                  <div className="flex items-center gap-1.5 mb-2">
                    <Trophy className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">Totale</span>
                  </div>
                  <div className="text-2xl font-black text-white leading-none">
                    {p.played} <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Partite</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-bold mt-auto pt-2 border-t border-slate-800">
                    <span className="text-emerald-400">{p.wins} V</span>
                    <span className="text-yellow-500">{p.winRate || 0}% V</span>
                  </div>
                </div>

              </div>

              {/* RECENT MATCHES */}
              <div className="mt-4">
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Ultime Partite</h3>
                </div>
                
                {matches.length > 0 ? (
                  <div className="flex flex-col gap-2">
                    {matches.map((m: any) => (
                      <div key={m.id} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex justify-between items-center text-sm">
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={`font-bold truncate ${m.won ? 'text-white' : 'text-slate-300'}`}>
                            {m.myTeam?.player1?.name} & {m.myTeam?.player2?.name}
                          </span>
                          <span className="text-xs text-slate-500 truncate">vs {m.oppTeam?.player1?.name} & {m.oppTeam?.player2?.name}</span>
                        </div>
                        <div className="flex flex-col items-end shrink-0 ml-3">
                          <span className={`font-black text-lg leading-none ${m.won ? 'text-emerald-400' : 'text-red-400'}`}>
                            {m.myScore} - {m.oppScore}
                          </span>
                          <span className="text-[10px] font-bold text-slate-500">
                            {new Date(m.playedAt).toLocaleDateString('it-IT')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-500 text-xs py-4">Nessuna partita trovata.</div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
