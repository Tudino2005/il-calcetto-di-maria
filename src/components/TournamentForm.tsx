"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Swords, Calendar, Clock, Cpu, Hash, CheckSquare, Square } from "lucide-react";
import { createTournament } from "@/app/actions/tournamentActions";
import clsx from "clsx";

const DAYS_OF_WEEK = [
  { label: "Dom", value: 0 },
  { label: "Lun", value: 1 },
  { label: "Mar", value: 2 },
  { label: "Mer", value: 3 },
  { label: "Gio", value: 4 },
  { label: "Ven", value: 5 },
  { label: "Sab", value: 6 },
];

export default function TournamentForm() {
  const [name, setName] = useState("");
  const [format, setFormat] = useState<"eliminazione_diretta" | "doppia_eliminazione" | "gironi_eliminazione">("eliminazione_diretta");
  const [type, setType] = useState<"sorteggio_ruoli" | "sorteggio_integrale" | "coppie_fisse">("sorteggio_ruoli");
  const [teamsPerGroup, setTeamsPerGroup] = useState<number>(4);
  const [maxTeams, setMaxTeams] = useState<number>(8);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [drawDate, setDrawDate] = useState("");
  const [pricePerPlayer, setPricePerPlayer] = useState("");
  const [prizes, setPrizes] = useState("");

  const [targetGoals, setTargetGoals] = useState<number>(7);
  const [advantageThreshold, setAdvantageThreshold] = useState<number>(5);
  const [allowRoleSwaps, setAllowRoleSwaps] = useState<boolean>(false);
  const [isBalancedDraw, setIsBalancedDraw] = useState<boolean>(false);

  // Scheduling
  const [numTables, setNumTables] = useState<number>(1);
  const [scheduleStartTime, setScheduleStartTime] = useState<string>("20:00");
  const [scheduleDays, setScheduleDays] = useState<number[]>([2, 4]); // Tue + Thu default
  const [maxMatchesPerDay, setMaxMatchesPerDay] = useState<number>(6);

  const toggleScheduleDay = (val: number) => {
    setScheduleDays((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]
    );
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem("foosball_scorer_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.targetGoals) setTargetGoals(parsed.targetGoals);
        if (parsed.advantageThreshold) setAdvantageThreshold(parsed.advantageThreshold);
      }
    } catch {}
  }, []);

  const updateGoalSettings = (goals: number, threshold: number) => {
    setTargetGoals(goals);
    setAdvantageThreshold(threshold);
    try {
      const saved = localStorage.getItem("foosball_scorer_settings");
      const parsed = saved ? JSON.parse(saved) : {};
      localStorage.setItem("foosball_scorer_settings", JSON.stringify({
        ...parsed,
        targetGoals: goals,
        advantageThreshold: threshold
      }));
    } catch {}
  };

  const router = useRouter();

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
    if (endDate) formData.append("endDate", endDate);
    if (drawDate && type !== "coppie_fisse") formData.append("drawDate", drawDate);
    if (pricePerPlayer) formData.append("pricePerPlayer", pricePerPlayer);
    if (prizes) formData.append("prizes", prizes);
    formData.append("allowRoleSwaps", type === "coppie_fisse" ? "false" : allowRoleSwaps.toString());
    formData.append("isBalancedDraw", type === "coppie_fisse" ? "false" : isBalancedDraw.toString());
    formData.append("targetGoals", targetGoals.toString());
    formData.append("advantageThreshold", advantageThreshold.toString());

    // Scheduling
    formData.append("numTables", numTables.toString());
    formData.append("scheduleStartTime", scheduleStartTime);
    formData.append("scheduleDays", JSON.stringify(scheduleDays.sort((a, b) => a - b)));
    formData.append("maxMatchesPerDay", maxMatchesPerDay.toString());

    await createTournament(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      {/* ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5">
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
        <div className="md:col-span-4">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Numero Max Squadre</label>
          <select value={maxTeams} onChange={(e) => setMaxTeams(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500">
            <option value={4}>4 Squadre (8 Giocatori)</option>
            <option value={8}>8 Squadre (16 Giocatori)</option>
            <option value={16}>16 Squadre (32 Giocatori)</option>
            <option value={32}>32 Squadre (64 Giocatori)</option>
            <option value={64}>64 Squadre (128 Giocatori)</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Costo Iscrizione a Persona (€)</label>
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
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Data di Inizio</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Data di Fine</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
        
        {type !== "coppie_fisse" ? (
          <>
            <div className="md:col-span-3">
              <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Data Sorteggio</label>
              <input
                type="datetime-local"
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Premi</label>
              <input
                type="text"
                value={prizes}
                onChange={(e) => setPrizes(e.target.value)}
                placeholder="es. 1° Coppa, 2° Cena"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
              />
            </div>
          </>
        ) : (
          <div className="md:col-span-6">
            <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Premi</label>
            <input
              type="text"
              value={prizes}
              onChange={(e) => setPrizes(e.target.value)}
              placeholder="es. 1° Coppa, 2° Cena"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}
      </div>

      <div>
        <label className="block text-slate-400 font-bold uppercase tracking-wider text-sm mb-4">Formato Torneo</label>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col gap-3 flex-1">
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

          <div className="flex flex-col justify-center flex-1">
            <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col gap-6 shadow-inner">
              <div className="flex flex-col items-center text-center">
                <label className="text-xs font-black uppercase tracking-wider text-purple-300 block mb-3">
                  Gol per vincere ogni Set
                </label>
                <div className="flex gap-2">
                  {[5, 6, 7, 8, 10].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateGoalSettings(val, Math.min(advantageThreshold, val - 1))}
                      className={clsx(
                        "w-12 h-12 rounded-xl text-lg font-black transition shadow-sm",
                        targetGoals === val ? "bg-purple-600 text-white border-2 border-purple-400 shadow-purple-500/30" : "bg-slate-900 border-2 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px w-full bg-slate-700/50"></div>

              <div className="flex flex-col items-center text-center">
                <label className="text-xs font-black uppercase tracking-wider text-yellow-400 block mb-3">
                  Soglia Vantaggi (Pari a cui scattano)
                </label>
                <div className="flex gap-2">
                  {[4, 5, 6, 7, 8].filter(val => val < targetGoals).map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => updateGoalSettings(targetGoals, val)}
                      className={clsx(
                        "w-12 h-12 rounded-xl text-lg font-black transition shadow-sm",
                        advantageThreshold === val ? "bg-yellow-500 text-slate-950 border-2 border-yellow-300 shadow-yellow-500/30" : "bg-slate-900 border-2 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                      )}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {format === "gironi_eliminazione" && (
        <div className="lg:w-1/2">
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
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col gap-3 flex-1">
            <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", type === "sorteggio_ruoli" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
              <input type="radio" name="typeRadio" value="sorteggio_ruoli" checked={type === "sorteggio_ruoli"} onChange={() => setType("sorteggio_ruoli")} className="w-5 h-5 accent-purple-500" />
              <div>
                <span className="text-white font-bold block">Sorteggio per Ruoli</span>
                <span className="text-slate-500 text-sm">Crea coppie equilibrate unendo un attaccante e un difensore.</span>
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

          <div className="flex flex-col justify-center flex-1">
            <div className={clsx("bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-center items-center h-full gap-6 shadow-inner transition-all duration-300", type === "coppie_fisse" ? "opacity-0 pointer-events-none" : "opacity-100")}>
              {type !== "coppie_fisse" && (
                <div className="flex flex-col items-center text-center max-w-[250px] mb-6 border-b border-slate-700/50 pb-6 w-full">
                  <div className="flex items-center justify-between w-full">
                    <button
                      type="button"
                      onClick={() => setIsBalancedDraw(!isBalancedDraw)}
                      className={`w-16 h-9 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner ${
                        isBalancedDraw ? "bg-emerald-500" : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                          isBalancedDraw ? "translate-x-7" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <div className="flex flex-col items-end">
                      <label className="text-lg font-black tracking-wider text-emerald-400 block">
                        Crea torneo equilibrato
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center text-center max-w-[250px]">
                <label className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-4">
                  Inversione Ruoli
                </label>
                <div className="flex flex-col items-center gap-3 w-full">
                  <button
                    type="button"
                    onClick={() => setAllowRoleSwaps(!allowRoleSwaps)}
                    className={clsx(
                      "w-16 h-9 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner",
                      allowRoleSwaps ? "bg-emerald-500" : "bg-slate-700"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out",
                        allowRoleSwaps ? "translate-x-7" : "translate-x-0"
                      )}
                    />
                  </button>
                  <span className={clsx("text-sm font-bold", allowRoleSwaps ? "text-emerald-400" : "text-slate-400")}>
                    {allowRoleSwaps ? "SÌ, CONSENTITA" : "NO, BLOCCATA"}
                  </span>
                  <span className="text-xs text-slate-500 leading-tight">
                    {allowRoleSwaps 
                      ? "I giocatori potranno scambiarsi i ruoli durante il torneo."
                      : "I giocatori dovranno mantenere il loro ruolo originario."}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── SEZIONE CALENDARIO AUTOMATICO ──────────────────────────────── */}
      <div className="bg-slate-800/40 border border-indigo-500/30 rounded-2xl p-6 flex flex-col gap-5">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-black uppercase tracking-wider text-sm">Configurazione Calendario</h3>
            <p className="text-slate-500 text-xs">Parametri per la generazione automatica degli orari delle partite</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Start Time */}
          <div>
            <label className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
              <Clock className="w-3.5 h-3.5" /> Orario Primo Fischio
            </label>
            <input
              type="time"
              value={scheduleStartTime}
              onChange={(e) => setScheduleStartTime(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Max Matches Per Day */}
          <div>
            <label className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
              <Hash className="w-3.5 h-3.5" /> Max Partite al Giorno
            </label>
            <input
              type="number"
              min="1"
              max="50"
              value={maxMatchesPerDay}
              onChange={(e) => setMaxMatchesPerDay(Math.max(1, Number(e.target.value)))}
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-colors text-center text-xl font-black"
            />
          </div>
        </div>

        {/* Num Tables */}
        <div>
          <label className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
            <Cpu className="w-3.5 h-3.5" /> Biliardini Disponibili (partite in parallelo)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumTables(n)}
                className={clsx(
                  "flex-1 py-3 rounded-xl font-black text-lg transition border-2",
                  numTables === n
                    ? "bg-indigo-600 border-indigo-400 text-white"
                    : "bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800 hover:text-white"
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        {/* Days of week */}
        <div>
          <label className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
            <CheckSquare className="w-3.5 h-3.5" /> Giorni di Gioco
          </label>
          <div className="flex gap-2">
            {DAYS_OF_WEEK.map((day) => {
              const active = scheduleDays.includes(day.value);
              return (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => toggleScheduleDay(day.value)}
                  className={clsx(
                    "flex-1 flex flex-col items-center justify-center py-3 rounded-xl font-bold text-sm transition border-2",
                    active
                      ? "bg-indigo-600 border-indigo-400 text-white"
                      : "bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500"
                  )}
                >
                  {active
                    ? <CheckSquare className="w-3.5 h-3.5 mb-1" />
                    : <Square className="w-3.5 h-3.5 mb-1" />
                  }
                  {day.label}
                </button>
              );
            })}
          </div>
          {scheduleDays.length === 0 && (
            <p className="text-amber-400 text-xs mt-2 font-bold">⚠ Seleziona almeno un giorno per generare il calendario.</p>
          )}
        </div>
      </div>

      <button type="submit" className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl text-lg transition-transform active:scale-95 flex justify-center items-center gap-2">
        <Swords className="w-6 h-6" /> Crea Sala d'Attesa (Lobby)
      </button>
    </form>
  );
}
