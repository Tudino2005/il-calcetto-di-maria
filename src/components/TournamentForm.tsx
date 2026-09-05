"use client";

import { useState } from "react";
import { Swords } from "lucide-react";
import { createTournament } from "@/app/actions/tournamentActions";
import clsx from "clsx";

export default function TournamentForm() {
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"eliminazione_diretta" | "doppia_eliminazione" | "gironi_eliminazione">("eliminazione_diretta");
  const [type, setType] = useState<"sorteggio_ruoli" | "sorteggio_integrale" | "coppie_fisse">("sorteggio_ruoli");
  const [teamsPerGroup, setTeamsPerGroup] = useState<number>(4);
  const [maxTeams, setMaxTeams] = useState<number>(8);
  const [startDate, setStartDate] = useState("");
  const [pricePerPlayer, setPricePerPlayer] = useState("");
  const [prizes, setPrizes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Use FormData for server action
    const formData = new FormData();
    formData.append("name", name);
    formData.append("format", format);
    formData.append("type", type);
    formData.append("teamsPerGroup", teamsPerGroup.toString());
    formData.append("maxTeams", maxTeams.toString());
    if (startDate) formData.append("startDate", startDate);
    if (pricePerPlayer) formData.append("pricePerPlayer", pricePerPlayer);
    if (prizes) formData.append("prizes", prizes);

    await createTournament(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <div>
        <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Nome Torneo</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="es. Coppa dei Campioni 2026"
          className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 transition-colors"
          required
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-2">
        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Numero Max Squadre</label>
          <select value={maxTeams} onChange={(e) => setMaxTeams(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500">
            <option value={4}>4 Squadre (8 Giocatori)</option>
            <option value={8}>8 Squadre (16 Giocatori)</option>
            <option value={16}>16 Squadre (32 Giocatori)</option>
            <option value={32}>32 Squadre (64 Giocatori)</option>
            <option value={64}>64 Squadre (128 Giocatori)</option>
          </select>
        </div>
        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Data di Inizio</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Costo Iscrizione (€)</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={pricePerPlayer}
            onChange={(e) => setPricePerPlayer(e.target.value)}
            placeholder="es. 10"
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Premi</label>
          <input
            type="text"
            value={prizes}
            onChange={(e) => setPrizes(e.target.value)}
            placeholder="es. 1° Coppa, 2° Cena"
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-slate-400 font-bold mb-4 uppercase tracking-wider text-sm">Formato Torneo</label>
        <div className="flex flex-col gap-3">
          <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", format === "eliminazione_diretta" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
            <input type="radio" name="formatRadio" value="eliminazione_diretta" checked={format === "eliminazione_diretta"} onChange={() => setFormat("eliminazione_diretta")} className="w-5 h-5 accent-purple-500" />
            <div>
              <span className="text-white font-bold block">Eliminazione Diretta</span>
              <span className="text-slate-500 text-sm">Tabellone classico. Chi perde è fuori.</span>
            </div>
          </label>
          <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", format === "doppia_eliminazione" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
            <input type="radio" name="formatRadio" value="doppia_eliminazione" checked={format === "doppia_eliminazione"} onChange={() => setFormat("doppia_eliminazione")} className="w-5 h-5 accent-purple-500" />
            <div>
              <span className="text-white font-bold block">Doppia Eliminazione</span>
              <span className="text-slate-500 text-sm">Tabellone Winners e Losers Bracket.</span>
            </div>
          </label>
          <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", format === "gironi_eliminazione" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
            <input type="radio" name="formatRadio" value="gironi_eliminazione" checked={format === "gironi_eliminazione"} onChange={() => setFormat("gironi_eliminazione")} className="w-5 h-5 accent-purple-500" />
            <div>
              <span className="text-white font-bold block">Gironi + Eliminazione</span>
              <span className="text-slate-500 text-sm">Fase a gruppi seguita da playoff stile Mondiali.</span>
            </div>
          </label>
        </div>
      </div>

      {format === "gironi_eliminazione" && (
        <div>
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Squadre per Girone</label>
          <select value={teamsPerGroup} onChange={(e) => setTeamsPerGroup(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500">
            <option value={3}>3 Squadre (Sconsigliato)</option>
            <option value={4}>4 Squadre (Standard)</option>
            <option value={5}>5 Squadre</option>
            <option value={6}>6 Squadre</option>
          </select>
        </div>
      )}

      <div>
        <label className="block text-slate-400 font-bold mb-4 uppercase tracking-wider text-sm">Modalità Composizione Squadre</label>
        <div className="flex flex-col gap-3">
          <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", type === "sorteggio_ruoli" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
            <input type="radio" name="typeRadio" value="sorteggio_ruoli" checked={type === "sorteggio_ruoli"} onChange={() => setType("sorteggio_ruoli")} className="w-5 h-5 accent-purple-500" />
            <div>
              <span className="text-white font-bold block">Sorteggio per Ruoli</span>
              <span className="text-slate-500 text-sm">Crea coppie equilibrate unendo un attaccante e un portiere.</span>
            </div>
          </label>
          <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", type === "sorteggio_integrale" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
            <input type="radio" name="typeRadio" value="sorteggio_integrale" checked={type === "sorteggio_integrale"} onChange={() => setType("sorteggio_integrale")} className="w-5 h-5 accent-purple-500" />
            <div>
              <span className="text-white font-bold block">Sorteggio Integrale</span>
              <span className="text-slate-500 text-sm">Composizione puramente casuale.</span>
            </div>
          </label>
          <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", type === "coppie_fisse" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
            <input type="radio" name="typeRadio" value="coppie_fisse" checked={type === "coppie_fisse"} onChange={() => setType("coppie_fisse")} className="w-5 h-5 accent-purple-500" />
            <div>
              <span className="text-white font-bold block">Coppie Fisse</span>
              <span className="text-slate-500 text-sm">Squadre già formate a priori.</span>
            </div>
          </label>
        </div>
      </div>

      <button type="submit" className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl text-lg transition-transform active:scale-95 flex justify-center items-center gap-2">
        <Swords className="w-6 h-6" /> Crea Sala d'Attesa (Lobby)
      </button>
    </form>
  );
}
