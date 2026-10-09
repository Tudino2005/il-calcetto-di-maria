import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Swords, Trophy, Sparkles, Calendar, Activity, Users } from 'lucide-react';

export default function MobilePlayerProfileSheet({ isOpen, onClose, playerInfo }: { isOpen: boolean; onClose: () => void; playerInfo: any }) {
  const [activeTab, setActiveTab] = useState('panoramica');

  if (!playerInfo) return null;
  const { p, rank, advStats, isTeam } = playerInfo;

  if (isTeam) {
    return (
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 z-[101] h-[85vh] bg-slate-900 rounded-t-3xl border-t border-slate-700 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
              <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}><div className="w-12 h-1.5 bg-slate-700 rounded-full" /></div>
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 pb-24 text-center text-slate-400">Statistiche per le coppie non ancora implementate.</div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    );
  }

  const rStats = advStats?.roleStats;
  const bp = advStats?.bestPartner;
  const allPartners = advStats?.allPartners || [];
  const matches = advStats?.allMatches || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm" />
          <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 200 }} className="fixed bottom-0 left-0 right-0 z-[101] h-[90vh] bg-slate-900 rounded-t-3xl border-t border-slate-700 flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="w-full flex justify-center pt-3 pb-2 cursor-pointer" onClick={onClose}><div className="w-12 h-1.5 bg-slate-700 rounded-full" /></div>
            
            <div className="px-4 sm:px-6 pt-2 pb-4 shrink-0">
              <div className="flex justify-between items-start relative">
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
                <button onClick={onClose} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
              </div>

              {/* TABS */}
              <div className="flex bg-slate-800/50 p-1 rounded-xl mt-6 border border-slate-700/50 max-w-md mx-auto w-full">
                <button onClick={() => setActiveTab('panoramica')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'panoramica' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'}`}><Activity className="w-3.5 h-3.5" /> Panoramica</button>
                <button onClick={() => setActiveTab('compagni')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'compagni' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'}`}><Users className="w-3.5 h-3.5" /> Compagni</button>
                <button onClick={() => setActiveTab('storico')} className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-colors ${activeTab === 'storico' ? 'bg-slate-700 text-white shadow-sm' : 'text-slate-400'}`}><Calendar className="w-3.5 h-3.5" /> Storico</button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-24">
              
              {activeTab === 'panoramica' && (
                <div className="grid grid-cols-2 gap-3 pb-8">
                  <div className="bg-slate-900/50 border border-blue-500/30 rounded-xl p-3 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-2"><Shield className="w-3.5 h-3.5 text-blue-400" /><span className="text-[10px] uppercase font-black tracking-wider text-blue-400">In Porta</span></div>
                    <div className="text-2xl font-black text-white leading-none">{rStats?.defensiveIndex || "-"} <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Subiti</span></div>
                    <div className="flex justify-between text-[10px] font-bold mt-auto pt-2 border-t border-slate-800"><span className="text-slate-400">{rStats?.gkMatches || 0} G</span><span className="text-yellow-500">{rStats?.gkWinRate ? `${rStats.gkWinRate}% V` : "-"}</span></div>
                  </div>
                  <div className="bg-slate-900/50 border border-red-500/30 rounded-xl p-3 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-2"><Swords className="w-3.5 h-3.5 text-red-400" /><span className="text-[10px] uppercase font-black tracking-wider text-red-400">In Attacco</span></div>
                    <div className="text-2xl font-black text-white leading-none">{rStats?.offensiveIndex || "-"} <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Fatti</span></div>
                    <div className="flex justify-between text-[10px] font-bold mt-auto pt-2 border-t border-slate-800"><span className="text-slate-400">{rStats?.stMatches || 0} G</span><span className="text-yellow-500">{rStats?.stWinRate ? `${rStats.stWinRate}% V` : "-"}</span></div>
                  </div>
                  <div className="bg-slate-900/50 border border-purple-500/30 rounded-xl p-3 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-2"><Sparkles className="w-3.5 h-3.5 text-purple-400" /><span className="text-[10px] uppercase font-black tracking-wider text-purple-400">Miglior Partner</span></div>
                    <div className="text-[15px] font-black text-white leading-tight truncate">{bp?.partner?.name || "-"}</div>
                    <div className="flex justify-between text-[10px] font-bold mt-auto pt-2 border-t border-slate-800"><span className="text-slate-400">{bp?.played || 0} G</span><span className="text-emerald-400">{bp?.winRate || "0"}% V</span></div>
                  </div>
                  <div className="bg-slate-900/50 border border-emerald-500/30 rounded-xl p-3 flex flex-col">
                    <div className="flex items-center gap-1.5 mb-2"><Trophy className="w-3.5 h-3.5 text-emerald-400" /><span className="text-[10px] uppercase font-black tracking-wider text-emerald-400">Rendimento Totale</span></div>
                    <div className="text-2xl font-black text-white leading-none">{p.played} <span className="text-[9px] text-slate-500 font-bold tracking-widest uppercase">Partite</span></div>
                    <div className="flex justify-between text-[10px] font-bold mt-auto pt-2 border-t border-slate-800"><span className="text-emerald-400">{p.wins} V</span><span className="text-yellow-500">{p.winRate || 0}% V</span></div>
                  </div>
                </div>
              )}

              {activeTab === 'compagni' && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 pb-8">
                  {allPartners.map((partnerObj: any) => (
                    <div key={partnerObj.partner.id} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex flex-col gap-2">
                      <div className="flex items-center justify-between border-b border-slate-700/50 pb-2">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          {partnerObj.partner.avatarUrl ? (
                            <img src={`/players/${partnerObj.partner.avatarUrl}`} className="w-8 h-8 rounded-full object-cover border border-slate-700 shrink-0" alt="" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center font-bold text-white text-[10px] shrink-0">
                              {partnerObj.partner.name.substring(0, 2).toUpperCase()}
                            </div>
                          )}
                          <span className="font-bold text-white truncate text-sm">{partnerObj.partner.name}</span>
                        </div>
                        {partnerObj.teamRank && (
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="text-[10px] font-bold text-purple-400/80 tracking-wide normal-case">Ranking di coppia</span>
                            <span className="text-xl font-black text-purple-400 leading-none">{partnerObj.teamRank}°</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-7 gap-1 pt-2 pb-1 border-t border-slate-700/30 mt-1">
                        <div className="flex flex-col items-center justify-between gap-1.5">
                          <span className="text-[7px] uppercase font-black text-slate-500 tracking-wider text-center leading-[1.1] max-w-[40px]">Sfide<br/>Giocate</span>
                          <span className="text-xs font-bold text-slate-300 leading-none">{partnerObj.played ?? '-'}</span>
                        </div>
                        <div className="flex flex-col items-center justify-between gap-1.5">
                          <span className="text-[7px] uppercase font-black text-slate-500 tracking-wider text-center leading-[1.1] max-w-[40px]">Sfide<br/>Vinte</span>
                          <span className="text-xs font-bold text-emerald-400/90 leading-none">{partnerObj.wins ?? '-'}</span>
                        </div>
                        <div className="flex flex-col items-center justify-between gap-1.5 bg-slate-900/30 rounded py-0.5">
                          <span className="text-[7px] uppercase font-black text-slate-500 tracking-wider text-center leading-[1.1] max-w-[40px]">Partite<br/>Giocate</span>
                          <span className="text-xs font-bold text-slate-300 leading-none">{partnerObj.setsPlayed ?? 'N/D'}</span>
                        </div>
                        <div className="flex flex-col items-center justify-between gap-1.5 bg-slate-900/30 rounded py-0.5">
                          <span className="text-[7px] uppercase font-black text-slate-500 tracking-wider text-center leading-[1.1] max-w-[40px]">Partite<br/>Vinte</span>
                          <span className="text-xs font-bold text-emerald-400/90 leading-none">{partnerObj.setsWon ?? 'N/D'}</span>
                        </div>
                        <div className="flex flex-col items-center justify-between gap-1.5">
                          <span className="text-[7px] uppercase font-black text-slate-500 tracking-wider text-center leading-[1.1] max-w-[40px]">Gol<br/>Fatti</span>
                          <span className="text-xs font-bold text-emerald-500 leading-none">{partnerObj.goalsFor ?? '-'}</span>
                        </div>
                        <div className="flex flex-col items-center justify-between gap-1.5">
                          <span className="text-[7px] uppercase font-black text-slate-500 tracking-wider text-center leading-[1.1] max-w-[40px]">Gol<br/>Subiti</span>
                          <span className="text-xs font-bold text-red-500 leading-none">{partnerObj.goalsAgainst ?? '-'}</span>
                        </div>
                        <div className="flex flex-col items-center justify-between gap-1.5 border-l border-slate-700/50 pl-1">
                          <span className="text-[7px] uppercase font-black text-slate-500 tracking-wider text-center leading-[1.1] max-w-[40px]">Win<br/>Rate</span>
                          <span className={`text-[11px] font-black leading-none ${Number(partnerObj.winRate) >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {partnerObj.winRate ?? '-'}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                  {allPartners.length === 0 && <div className="text-center text-slate-500 text-xs py-4 col-span-full">Nessun partner.</div>}
                </div>
              )}

              {activeTab === 'storico' && (
                <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-3 pb-8">
                  {matches.map((m: any) => (
                    <div key={m.id} className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/50 flex flex-col gap-2">
                      <div className="flex justify-between items-center border-b border-slate-700/50 pb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${m.role === 'Attaccante' ? 'bg-red-500/20 text-red-400' : m.role === 'Difensore' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-300'}`}>
                            {m.role}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{m.tournamentId ? 'TORNEO' : 'SFIDA LIBERA'}</span>
                        </div>
                        <span className="text-[10px] font-bold text-slate-500">
                          {new Date(m.playedAt).toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-stretch text-sm pt-1">
                        <div className="flex flex-col justify-between min-w-0 flex-1">
                          <span className="font-bold truncate text-white">
                            {m.myTeam?.player1?.name} & {m.myTeam?.player2?.name}
                          </span>
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest my-1.5 pl-1">
                            VS
                          </span>
                          <span className="font-bold truncate text-slate-300">
                            {m.oppTeam?.player1?.name} & {m.oppTeam?.player2?.name}
                          </span>
                        </div>
                        <div className="flex flex-col items-end justify-between shrink-0 ml-3">
                          <span className={`font-black text-xl leading-none pt-0.5 ${m.won ? 'text-emerald-400' : 'text-red-400'}`}>
                            {m.myScore} - {m.oppScore}
                          </span>
                        </div>
                      </div>
                      
                      {/* Set Scores if present */}
                      {m.setScores && typeof m.setScores === 'string' && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          {(() => {
                            try {
                              const sets = JSON.parse(m.setScores);
                              if (Array.isArray(sets) && sets.length > 0) {
                                return sets.map((s: any, i: number) => {
                                  const mySetScore = m.isTeamA ? s.scoreA : s.scoreB;
                                  const oppSetScore = m.isTeamA ? s.scoreB : s.scoreA;
                                  const wonSet = Number(mySetScore) > Number(oppSetScore);
                                  return (
                                    <span key={i} className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${wonSet ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                      {mySetScore}-{oppSetScore}
                                    </span>
                                  );
                                });
                              }
                            } catch(e) {}
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  ))}
                  {matches.length === 0 && <div className="text-center text-slate-500 text-xs py-4">Nessuna partita.</div>}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
