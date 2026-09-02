"use client";

import { useState } from "react";
import { createQuickTournament } from "@/app/actions/tournamentActions";
import { Users, Layout, Trophy, PlayCircle } from "lucide-react";
import clsx from "clsx";

export default function QuickTournamentForm({ players }: { players: any[] }) {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const togglePlayer = (id: string) => {
    setSelectedPlayers(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    );
  };

  const selectAll = () => setSelectedPlayers(players.map(p => p.id));
  const deselectAll = () => setSelectedPlayers([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedPlayers.length < 4) {
      alert("Seleziona almeno 4 giocatori per avviare un torneo.");
      return;
    }
    setIsSubmitting(true);
    
    const formData = new FormData(e.currentTarget);
    formData.append("playerIds", selectedPlayers.join(","));
    
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
            <Users className="w-6 h-6 text-emerald-400" /> Appello Giocatori Presenti
          </h2>
          <div className="flex gap-4">
            <button type="button" onClick={selectAll} className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2 bg-slate-900 rounded-lg transition-colors">
              Seleziona Tutti
            </button>
            <button type="button" onClick={deselectAll} className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2 bg-slate-900 rounded-lg transition-colors">
              Azzera
            </button>
          </div>
        </div>

        <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 mb-6 flex justify-between items-center">
          <span className="text-slate-400 font-bold text-lg">Giocatori Selezionati:</span>
          <span className="text-4xl font-black text-white">{selectedPlayers.length}</span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
          {players.map(p => {
            const isSelected = selectedPlayers.includes(p.id);
            return (
              <div 
                key={p.id}
                onClick={() => togglePlayer(p.id)}
                className={clsx(
                  "cursor-pointer border-2 rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 text-center select-none active:scale-95",
                  isSelected 
                    ? "bg-emerald-500/20 border-emerald-500" 
                    : "bg-slate-900 border-slate-700 hover:border-slate-500"
                )}
              >
                <div className={clsx(
                  "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors",
                  isSelected ? "bg-emerald-500 text-emerald-950" : "bg-slate-800 text-slate-400"
                )}>
                  {p.name.charAt(0).toUpperCase()}
                </div>
                <div className={clsx("font-bold", isSelected ? "text-white" : "text-slate-400")}>
                  {p.name}
                </div>
                <div className="text-xs uppercase tracking-wider text-slate-500 font-bold">
                  {p.preferredRole}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* AVVIA */}
      <button 
        type="submit" 
        disabled={isSubmitting || selectedPlayers.length < 4}
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
