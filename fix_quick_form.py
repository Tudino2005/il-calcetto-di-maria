import re

with open("src/components/QuickTournamentForm.tsx", "r") as f:
    content = f.read()

# Replace the component content
# We will use python's powerful string manipulation to insert the new logic

new_content = """"use client";

import { useState } from "react";
import { createQuickTournament } from "@/app/actions/tournamentActions";
import { Users, Layout, Trophy, PlayCircle } from "lucide-react";
import clsx from "clsx";

const PAIR_COLORS = [
  "emerald", "blue", "orange", "pink", "purple", "cyan", "rose", "yellow",
  "lime", "fuchsia", "sky", "amber", "indigo", "teal", "red", "violet"
];

export default function QuickTournamentForm({ players }: { players: any[] }) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [fixedPairs, setFixedPairs] = useState<string[][]>([]);
  const [type, setType] = useState("sorteggio_integrale");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePlayer = (id: string) => {
    if (type === "coppie_fisse") {
      // Find if player is already in a pair
      const pairIndex = fixedPairs.findIndex(pair => pair.includes(id));
      if (pairIndex !== -1) {
        // Remove from pair
        const newPairs = [...fixedPairs];
        newPairs[pairIndex] = newPairs[pairIndex].filter(pId => pId !== id);
        // Remove empty pairs
        setFixedPairs(newPairs.filter(pair => pair.length > 0));
      } else {
        // Find a pair with only 1 player
        const openPairIndex = fixedPairs.findIndex(pair => pair.length === 1);
        if (openPairIndex !== -1) {
          const newPairs = [...fixedPairs];
          newPairs[openPairIndex].push(id);
          setFixedPairs(newPairs);
        } else {
          // Create new pair
          setFixedPairs([...fixedPairs, [id]]);
        }
      }
    } else {
      setSelectedPlayers(prev => 
        prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
      );
    }
  };

  const selectAll = () => {
    if (type !== "coppie_fisse") {
      setSelectedPlayers(players.map(p => p.id));
    }
  };
  const deselectAll = () => {
    setSelectedPlayers([]);
    setFixedPairs([]);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (type === "coppie_fisse") {
      const validPairs = fixedPairs.filter(p => p.length === 2);
      if (validPairs.length < 2) {
        alert("Devi formare almeno 2 squadre (4 giocatori) per avviare un torneo.");
        return;
      }
      if (fixedPairs.some(p => p.length === 1)) {
        alert("Ci sono giocatori spaiati! Completa o rimuovi le coppie incomplete.");
        return;
      }
    } else {
      if (selectedPlayers.length < 4) {
        alert("Seleziona almeno 4 giocatori per avviare un torneo.");
        return;
      }
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    if (type === "coppie_fisse") {
      // For fixed pairs, the registered players are everyone in the valid pairs
      const flattened = fixedPairs.flat();
      formData.append("playerIds", flattened.join(","));
      formData.append("fixedPairs", JSON.stringify(fixedPairs));
    } else {
      formData.append("playerIds", selectedPlayers.join(","));
    }
    
    await createQuickTournament(formData);
    // Page will redirect on success
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* IMPOSTAZIONI */}
      <section className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
          <Layout className="w-6 h-6 text-blue-400" /> Impostazioni Tabellone
        </h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <label className="block text-slate-400 mb-2 font-bold uppercase tracking-wider text-sm">Nome Torneo</label>
            <input 
              name="name" 
              type="text" 
              required 
              defaultValue="Torneo della Domenica"
              className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-white font-bold text-lg focus:border-orange-500 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label className="block text-slate-400 mb-2 font-bold uppercase tracking-wider text-sm">Formato</label>
            <select 
              name="format" 
              className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-white font-bold text-lg focus:border-orange-500 focus:outline-none transition-colors"
            >
              <option value="eliminazione_diretta">Eliminazione Diretta</option>
              <option value="doppia_eliminazione">Doppia Eliminazione (Winner/Loser)</option>
              <option value="gironi_eliminazione">Gironi + Eliminazione</option>
            </select>
          </div>
          <div>
            <label className="block text-slate-400 mb-2 font-bold uppercase tracking-wider text-sm">Squadre</label>
            <select 
              name="type" 
              value={type}
              onChange={(e) => {
                setType(e.target.value);
                // Reset selections when changing type
                setSelectedPlayers([]);
                setFixedPairs([]);
              }}
              className="w-full bg-slate-900 border-2 border-slate-700 rounded-xl p-4 text-white font-bold text-lg focus:border-orange-500 focus:outline-none transition-colors"
            >
              <option value="sorteggio_integrale">Sorteggio Integrale</option>
              <option value="sorteggio_ruoli">Sorteggio per Ruoli (Att/Dif)</option>
              <option value="coppie_fisse">Coppie Fisse</option>
            </select>
          </div>
        </div>
      </section>

      {/* APPELLO */}
      <section className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-400" /> 
            {type === "coppie_fisse" ? "Forma le Squadre (Tocca 2 giocatori per accoppiarli)" : "Appello Giocatori Presenti"}
          </h2>
          <div className="flex gap-4">
            {type !== "coppie_fisse" && (
              <button type="button" onClick={selectAll} className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2 bg-slate-900 rounded-lg transition-colors">
                Seleziona Tutti
              </button>
            )}
            <button type="button" onClick={deselectAll} className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2 bg-slate-900 rounded-lg transition-colors">
              Azzera
            </button>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 mb-6 flex justify-between items-center">
          <span className="text-slate-400 font-bold text-lg">
            {type === "coppie_fisse" ? "Squadre Formate:" : "Giocatori Selezionati:"}
          </span>
          <span className="text-4xl font-black text-white">
            {type === "coppie_fisse" ? Math.floor(fixedPairs.flat().length / 2) : selectedPlayers.length}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
          {players.map(p => {
            let isSelected = false;
            let colorClass = "bg-slate-900 border-slate-700 hover:border-slate-500 text-slate-400";
            let circleClass = "bg-slate-800 text-slate-400";
            let nameClass = "text-slate-400";
            
            if (type === "coppie_fisse") {
              const pairIndex = fixedPairs.findIndex(pair => pair.includes(p.id));
              if (pairIndex !== -1) {
                isSelected = true;
                const c = PAIR_COLORS[pairIndex % PAIR_COLORS.length];
                
                // We use generic tailwind classes. Since dynamic classes like `bg-${c}-500` can be stripped by Tailwind JIT if not explicitly declared,
                // we will use a style object for the exact color, or just rely on a set of pre-defined ones. 
                // But for simplicity in a quick script, let's use a safe static map or generic style.
                // Wait, tailwind won't compile dynamic strings like `border-${c}-500`.
              }
            } else {
              isSelected = selectedPlayers.includes(p.id);
            }

            // Fallback classes if tailwind dynamic names fail
            if (isSelected && type !== "coppie_fisse") {
              colorClass = "bg-emerald-500/20 border-emerald-500";
              circleClass = "bg-emerald-500 text-emerald-950";
              nameClass = "text-white";
            }

            // Render with inline CSS variables for the color if it's a fixed pair to bypass Tailwind JIT missing classes
            let pairColorValue = "";
            if (type === "coppie_fisse" && isSelected) {
                const pairIndex = fixedPairs.findIndex(pair => pair.includes(p.id));
                const cssColors = [
                    "#10b981", "#3b82f6", "#f97316", "#ec4899", "#a855f7", "#06b6d4", "#f43f5e", "#eab308"
                ];
                pairColorValue = cssColors[pairIndex % cssColors.length];
            }

            return (
              <div 
                key={p.id}
                onClick={() => togglePlayer(p.id)}
                className={clsx(
                  "cursor-pointer border-2 rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 text-center select-none active:scale-95"
                )}
                style={pairColorValue ? { 
                    borderColor: pairColorValue, 
                    backgroundColor: pairColorValue + "33" 
                } : {}}
              >
                <div 
                  className={clsx(
                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors"
                  )}
                  style={pairColorValue ? { backgroundColor: pairColorValue, color: "#fff" } : { backgroundColor: "#1e293b", color: "#94a3b8" }}
                >
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div 
                   className="font-bold"
                   style={pairColorValue ? { color: "#fff" } : { color: "#94a3b8" }}
                >
                  {p.name}
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  {p.preferredRole}
                </div>
                {type === "coppie_fisse" && pairColorValue && (
                  <div className="text-[10px] font-black uppercase px-2 py-1 rounded bg-black/50 text-white mt-1">
                    Squadra {fixedPairs.findIndex(pair => pair.includes(p.id)) + 1}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* AVVIA */}
      <button 
        type="submit" 
        disabled={isSubmitting}
        className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-400 hover:to-rose-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-3xl py-8 rounded-3xl shadow-2xl flex items-center justify-center gap-4 transition-all"
      >
        <PlayCircle className="w-10 h-10" />
        {isSubmitting ? "GENERAZIONE TABELLONE IN CORSO..." : "AVVIA SUBITO IL TORNEO!"}
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
    </form>
  );
}
"""

with open("src/components/QuickTournamentForm.tsx", "w") as f:
    f.write(new_content)
