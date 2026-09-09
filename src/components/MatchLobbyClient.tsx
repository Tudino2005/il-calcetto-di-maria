"use client";

import { useState } from "react";
import { startFreeMatch } from "@/app/actions/matchActions";
import { PlayCircle, Users, ArrowLeftRight } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import RoleIcon from "@/components/RoleIcon";
import { resolveTeamRoles } from "@/lib/roleUtils";

export default function MatchLobbyClient({ players }: { players: any[] }) {
  const router = useRouter();
  const [fixedPairs, setFixedPairs] = useState<string[][]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roleOverrides, setRoleOverrides] = useState<{
    teamA?: { goalkeeperId?: string; strikerId?: string };
    teamB?: { goalkeeperId?: string; strikerId?: string };
  }>({});

  const pA1 = players.find(p => p.id === fixedPairs[0]?.[0]);
  const pA2 = players.find(p => p.id === fixedPairs[0]?.[1]);
  const resolvedA = pA1 && pA2 ? resolveTeamRoles(pA1, pA2, roleOverrides.teamA) : null;

  const pB1 = players.find(p => p.id === fixedPairs[1]?.[0]);
  const pB2 = players.find(p => p.id === fixedPairs[1]?.[1]);
  const resolvedB = pB1 && pB2 ? resolveTeamRoles(pB1, pB2, roleOverrides.teamB) : null;

  const swapTeamARoles = () => {
    if (!resolvedA) return;
    setRoleOverrides(prev => ({
      ...prev,
      teamA: {
        goalkeeperId: resolvedA.strikerId,
        strikerId: resolvedA.goalkeeperId
      }
    }));
  };

  const swapTeamBRoles = () => {
    if (!resolvedB) return;
    setRoleOverrides(prev => ({
      ...prev,
      teamB: {
        goalkeeperId: resolvedB.strikerId,
        strikerId: resolvedB.goalkeeperId
      }
    }));
  };

  const getTeamNames = (pair: string[]) => {
    if (!pair || pair.length === 0) return <span className="text-slate-500 italic">Nessun giocatore</span>;
    const names = pair.map(id => players.find(p => p.id === id)?.name).filter(Boolean);
    return names.join(" & ");
  };

  const togglePlayer = (id: string) => {
    const pIdx = fixedPairs.findIndex(pair => pair.includes(id));
    if (pIdx !== -1) {
      setFixedPairs(prev => {
        const newPairs = [...prev];
        newPairs[pIdx] = newPairs[pIdx].filter(pId => pId !== id);
        return newPairs.filter(pair => pair.length > 0);
      });
    } else {
      // Don't allow more than 4 players total (2 teams)
      if (fixedPairs.flat().length >= 4) return;
      
      setFixedPairs(prev => {
        const openPairIndex = prev.findIndex(pair => pair.length === 1);
        if (openPairIndex !== -1) {
          const newPairs = [...prev];
          newPairs[openPairIndex] = [...newPairs[openPairIndex], id];
          return newPairs;
        } else {
          // Check if we already have 2 teams
          if (prev.length >= 2) return prev;
          return [...prev, [id]];
        }
      });
    }
  };

  const handleStart = async () => {
    const validPairs = fixedPairs.filter(p => p.length === 2);
    if (validPairs.length !== 2) {
      alert("Devi formare esattamente 2 squadre da 2 giocatori.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const matchId = await startFreeMatch(validPairs, {
        teamA: resolvedA ? { goalkeeperId: resolvedA.goalkeeperId, strikerId: resolvedA.strikerId } : undefined,
        teamB: resolvedB ? { goalkeeperId: resolvedB.goalkeeperId, strikerId: resolvedB.strikerId } : undefined,
      });
      router.push(`/match/${matchId}`);
    } catch (e) {
      alert("Errore durante l'avvio della partita.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <section className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-400" /> Forma le 2 Squadre
          </h2>
          <button 
            type="button" 
            onClick={() => {
              setFixedPairs([]);
              setRoleOverrides({});
            }} 
            className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2 bg-slate-900 rounded-lg transition-colors"
          >
            Azzera
          </button>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 mb-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          <div className="flex-1 flex flex-col">
            <span className="text-red-400 font-bold uppercase tracking-wider text-sm mb-1">Squadra Rossa (1)</span>
            <span className="text-white font-black text-xl">
              {getTeamNames(fixedPairs[0])}
            </span>
            {resolvedA && (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-slate-200 flex items-center gap-1.5 shadow-sm">
                  <span>🛡️</span>
                  <span className="text-slate-400">Porta:</span>
                  <strong className="text-white">{pA1?.id === resolvedA.goalkeeperId ? pA1.name : pA2?.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={swapTeamARoles}
                  title="Inverti ruoli"
                  className="p-1.5 hover:bg-slate-700 bg-slate-800 border border-slate-600 rounded-lg text-amber-400 hover:text-amber-300 transition active:scale-95 flex items-center gap-1 text-xs font-bold"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Scambia</span>
                </button>
                <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-slate-200 flex items-center gap-1.5 shadow-sm">
                  <span>⚔️</span>
                  <span className="text-slate-400">Attacco:</span>
                  <strong className="text-white">{pA1?.id === resolvedA.strikerId ? pA1.name : pA2?.name}</strong>
                </span>
              </div>
            )}
            {resolvedA?.isAdapted && resolvedA.adaptationNote && (
              <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md mt-2 flex items-center gap-1.5">
                <span>⚠️</span>
                <span>{resolvedA.adaptationNote}</span>
              </div>
            )}
          </div>

          <div className="hidden md:block w-px h-16 bg-slate-700 mx-2"></div>

          <div className="flex-1 flex flex-col md:text-right">
            <span className="text-blue-400 font-bold uppercase tracking-wider text-sm mb-1">Squadra Blu (2)</span>
            <span className="text-white font-black text-xl">
              {getTeamNames(fixedPairs[1])}
            </span>
            {resolvedB && (
              <div className="mt-3 flex flex-wrap items-center gap-2 md:justify-end">
                <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-slate-200 flex items-center gap-1.5 shadow-sm">
                  <span>🛡️</span>
                  <span className="text-slate-400">Porta:</span>
                  <strong className="text-white">{pB1?.id === resolvedB.goalkeeperId ? pB1.name : pB2?.name}</strong>
                </span>
                <button
                  type="button"
                  onClick={swapTeamBRoles}
                  title="Inverti ruoli"
                  className="p-1.5 hover:bg-slate-700 bg-slate-800 border border-slate-600 rounded-lg text-amber-400 hover:text-amber-300 transition active:scale-95 flex items-center gap-1 text-xs font-bold"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Scambia</span>
                </button>
                <span className="text-xs bg-slate-800 border border-slate-700 px-2.5 py-1.5 rounded-lg text-slate-200 flex items-center gap-1.5 shadow-sm">
                  <span>⚔️</span>
                  <span className="text-slate-400">Attacco:</span>
                  <strong className="text-white">{pB1?.id === resolvedB.strikerId ? pB1.name : pB2?.name}</strong>
                </span>
              </div>
            )}
            {resolvedB?.isAdapted && resolvedB.adaptationNote && (
              <div className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md mt-2 flex items-center gap-1.5 md:justify-end">
                <span>⚠️</span>
                <span>{resolvedB.adaptationNote}</span>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
          {players.map(p => {
            const pairIndex = fixedPairs.findIndex(pair => pair.includes(p.id));
            const isSelected = pairIndex !== -1;
            
            let pairColorValue = "";
            let teamName = "";
            let roleInMatch = "";
            
            if (isSelected) {
                if (pairIndex === 0) {
                    pairColorValue = "#ef4444"; // red-500
                    teamName = "SQUADRA ROSSA";
                    if (resolvedA) {
                      roleInMatch = resolvedA.goalkeeperId === p.id ? "🛡️ Porta" : "⚔️ Attacco";
                    }
                } else if (pairIndex === 1) {
                    pairColorValue = "#3b82f6"; // blue-500
                    teamName = "SQUADRA BLU";
                    if (resolvedB) {
                      roleInMatch = resolvedB.goalkeeperId === p.id ? "🛡️ Porta" : "⚔️ Attacco";
                    }
                }
            }

            return (
              <div 
                key={p.id}
                onClick={() => togglePlayer(p.id)}
                className={clsx(
                  "cursor-pointer border-2 rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 text-center select-none active:scale-95",
                  !isSelected && "bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-400"
                )}
                style={isSelected ? { 
                    borderColor: pairColorValue, 
                    backgroundColor: pairColorValue + "33" 
                } : {}}
              >
                <div 
                  className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors",
                    !isSelected && "bg-slate-800 text-slate-400"
                  )}
                  style={isSelected ? { backgroundColor: pairColorValue, color: "#fff" } : {}}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div 
                   className={clsx("font-bold", !isSelected && "text-slate-400")}
                   style={isSelected ? { color: "#fff" } : {}}
                >
                  {p.name}
                </div>
                <div className="mt-1 flex justify-center"><RoleIcon role={p.preferredRole} className="w-6 h-6" /></div>
                {isSelected && (
                  <div className="flex flex-col gap-1 mt-1 w-full items-center">
                    <div className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-black/50 text-white">
                      {teamName}
                    </div>
                    {roleInMatch && (
                      <div className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-900/80 text-amber-300 border border-amber-500/30">
                        {roleInMatch}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <button 
        onClick={handleStart}
        disabled={isSubmitting || fixedPairs.flat().length !== 4}
        className="w-full bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-3xl py-8 rounded-3xl shadow-2xl flex items-center justify-center gap-4 transition-all"
      >
        <PlayCircle className="w-10 h-10" />
        {isSubmitting ? "AVVIO IN CORSO..." : "AVVIA MATCH AL VOLO!"}
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #0f172a; 
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155; 
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569; 
        }
      `}} />
    </div>
  );
}
