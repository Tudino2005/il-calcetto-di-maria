"use client";

import { useState } from "react";
import { startFreeMatch } from "@/app/actions/matchActions";
import { PlayCircle, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import RoleIcon from "@/components/RoleIcon";

export default function MatchLobbyClient({ players }: { players: any[] }) {
  const router = useRouter();
  const [fixedPairs, setFixedPairs] = useState<string[][]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      const matchId = await startFreeMatch(validPairs);
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
          <button type="button" onClick={() => setFixedPairs([])} className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2 bg-slate-900 rounded-lg transition-colors">
            Azzera
          </button>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 mb-6 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-red-400 font-bold uppercase tracking-wider text-sm mb-1">Squadra Rossa (1)</span>
            <span className="text-white font-black text-xl">
              {getTeamNames(fixedPairs[0])}
            </span>
          </div>
          <div className="w-px h-12 bg-slate-700 mx-4"></div>
          <div className="flex flex-col text-right">
            <span className="text-blue-400 font-bold uppercase tracking-wider text-sm mb-1">Squadra Blu (2)</span>
            <span className="text-white font-black text-xl">
              {getTeamNames(fixedPairs[1])}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
          {players.map(p => {
            const pairIndex = fixedPairs.findIndex(pair => pair.includes(p.id));
            const isSelected = pairIndex !== -1;
            
            let pairColorValue = "";
            let teamName = "";
            
            if (isSelected) {
                if (pairIndex === 0) {
                    pairColorValue = "#ef4444"; // red-500
                    teamName = "SQUADRA ROSSA";
                } else if (pairIndex === 1) {
                    pairColorValue = "#3b82f6"; // blue-500
                    teamName = "SQUADRA BLU";
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
                  <div className="text-[10px] font-black uppercase px-2 py-1 rounded bg-black/50 text-white mt-1">
                    {teamName}
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
