"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Swords, Calendar, Clock, Cpu, Hash, CheckSquare, Square, Settings, ChevronDown, ChevronUp } from "lucide-react";
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
  const [avoidRepeatedPairs, setAvoidRepeatedPairs] = useState<boolean>(false);

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
    formData.append("avoidRepeatedPairs", avoidRepeatedPairs.toString());
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
      {/* ─── SEZIONE OPZIONI (CALENDARIO AUTOMATICO) ──────────────────────────────── */}
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-8 shadow-inner flex flex-col gap-8">
        <h3 className="text-lg font-black text-slate-300 -mb-2">Opzioni</h3>
        <p className="text-slate-500 text-xs -mt-6">Impostazioni avanzate del torneo</p>
        
        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-2">
          <div className="md:col-span-3 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Orario Primo Fischio</span>
            <input
              type="time"
              value={scheduleStartTime}
              onChange={(e) => setScheduleStartTime(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
            />
          </div>
          <div className="md:col-span-3 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Max Partite al Giorno</span>
            <input
              type="number"
              min="1"
              max="50"
              value={maxMatchesPerDay}
              onChange={(e) => setMaxMatchesPerDay(Math.max(1, Number(e.target.value)))}
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
            />
          </div>
          <div className="md:col-span-6 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Biliardini Disponibili</span>
            <select value={numTables} onChange={(e) => setNumTables(Number(e.target.value))} className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none cursor-pointer appearance-none transition-colors">
              <option value={1} className="bg-slate-900">1 Biliardino</option>
              <option value={2} className="bg-slate-900">2 Biliardini (Parallelo)</option>
              <option value={3} className="bg-slate-900">3 Biliardini (Parallelo)</option>
              <option value={4} className="bg-slate-900">4 Biliardini (Parallelo)</option>
            </select>
          </div>
        </div>

        {/* ROW 2 - Giorni di gioco */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-4">
          <div className="md:col-span-12 flex flex-col group">
            <span className="text-[10px] text-slate-500 mb-2 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Giorni di Gioco Settimanali</span>
            <div className="flex flex-wrap gap-4 items-center">
              {DAYS_OF_WEEK.map((day) => {
                const active = scheduleDays.includes(day.value);
                return (
                  <button
                    key={day.value}
                    type="button"
                    onClick={() => toggleScheduleDay(day.value)}
                    className={clsx(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full font-bold text-sm transition-all",
                      active
                        ? "bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/50"
                        : "text-slate-500 hover:text-slate-300"
                    )}
                  >
                    {active ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    {day.label}
                  </button>
                );
              })}
            </div>
            {scheduleDays.length === 0 && (
              <p className="text-amber-400 text-xs mt-2 font-bold">⚠ Seleziona almeno un giorno.</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-8 shadow-inner flex flex-col gap-10">
        <h3 className="text-lg font-black text-slate-300 -mb-4">Informazioni Generali</h3>
        
        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Nome Torneo</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Inserisci Nome..."
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
              required
            />
          </div>
          <div className="md:col-span-4 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">N° Squadre</span>
            <select value={maxTeams} onChange={(e) => setMaxTeams(Number(e.target.value))} className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none cursor-pointer appearance-none transition-colors">
              <option value={4} className="bg-slate-900">4 Squadre (8 Giocatori)</option>
              <option value={8} className="bg-slate-900">8 Squadre (16 Giocatori)</option>
              <option value={16} className="bg-slate-900">16 Squadre (32 Giocatori)</option>
              <option value={32} className="bg-slate-900">32 Squadre (64 Giocatori)</option>
              <option value={64} className="bg-slate-900">64 Squadre (128 Giocatori)</option>
            </select>
          </div>
          <div className="md:col-span-3 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Costo a Persona (€)</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={pricePerPlayer}
              onChange={(e) => setPricePerPlayer(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
            />
          </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Data Inizio</span>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-lg p-0 focus:ring-0 focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert opacity-90 transition-colors"
            />
          </div>
          <div className="md:col-span-3 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Data Fine</span>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-lg p-0 focus:ring-0 focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert opacity-90 transition-colors"
            />
          </div>
          
          {type !== "coppie_fisse" ? (
            <>
              <div className="md:col-span-3 flex flex-col-reverse group">
                <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Data Sorteggio</span>
                <input
                  type="datetime-local"
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-lg p-0 focus:ring-0 focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert opacity-90 transition-colors"
                />
              </div>
              <div className="md:col-span-3 flex flex-col-reverse group">
                <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Premi in Palio</span>
                <input
                  type="text"
                  value={prizes}
                  onChange={(e) => setPrizes(e.target.value)}
                  placeholder="es. Coppa e Cena"
                  className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-lg p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
                />
              </div>
            </>
          ) : (
            <div className="md:col-span-6 flex flex-col-reverse group">
              <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Premi in Palio</span>
              <input
                type="text"
                value={prizes}
                onChange={(e) => setPrizes(e.target.value)}
                placeholder="es. Coppa e Cena"
                className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-lg p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
              />
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col flex-1 bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 shadow-inner">
            <h3 className="text-lg font-black text-slate-300 mb-6">Formato</h3>
            <label className="flex items-center justify-between w-full cursor-pointer group">
              <input type="radio" name="formatRadio" value="eliminazione_diretta" checked={format === "eliminazione_diretta"} onChange={() => setFormat("eliminazione_diretta")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={"text-sm font-bold tracking-wider block text-right transition-colors text-emerald-400"}>Eliminazione Diretta</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Tabellone classico. Chi perde è fuori.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="formatRadio" value="doppia_eliminazione" checked={format === "doppia_eliminazione"} onChange={() => setFormat("doppia_eliminazione")} className="w-5 h-5 accent-amber-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={"text-sm font-bold tracking-wider block text-right transition-colors text-amber-400"}>Doppia Eliminazione</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Tabellone Winners e Losers Bracket.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="formatRadio" value="gironi_eliminazione" checked={format === "gironi_eliminazione"} onChange={() => setFormat("gironi_eliminazione")} className="w-5 h-5 accent-blue-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={"text-sm font-bold tracking-wider block text-right transition-colors text-blue-400"}>Gironi + Eliminazione</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Fase a gruppi seguita da playoff stile Mondiali.</span>
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
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col flex-1 bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 shadow-inner">
            <h3 className="text-lg font-black text-slate-300 mb-6">Composizione Squadre</h3>
            <label className="flex items-center justify-between w-full cursor-pointer group">
              <input type="radio" name="typeRadio" value="sorteggio_ruoli" checked={type === "sorteggio_ruoli"} onChange={() => setType("sorteggio_ruoli")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={"text-sm font-bold tracking-wider block text-right transition-colors text-emerald-400"}>Sorteggio per Ruoli</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Crea coppie unendo un attaccante e un difensore.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="typeRadio" value="sorteggio_integrale" checked={type === "sorteggio_integrale"} onChange={() => setType("sorteggio_integrale")} className="w-5 h-5 accent-amber-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={"text-sm font-bold tracking-wider block text-right transition-colors text-amber-400"}>Sorteggio Integrale</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Composizione puramente casuale.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="typeRadio" value="coppie_fisse" checked={type === "coppie_fisse"} onChange={() => setType("coppie_fisse")} className="w-5 h-5 accent-blue-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={"text-sm font-bold tracking-wider block text-right transition-colors text-blue-400"}>Coppie Fisse</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Squadre già formate a priori.</span>
              </div>
            </label>
          </div>

          <div className="flex flex-col justify-center flex-1">
            <div className={clsx("bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 flex flex-col justify-center items-center h-full gap-6 shadow-inner transition-all duration-300", type === "coppie_fisse" ? "opacity-0 pointer-events-none" : "opacity-100")}>
              {type !== "coppie_fisse" && (
                <div className="w-full max-w-[250px] flex flex-col items-center">
                  <div className="flex items-center justify-between w-full">
                    <button
                      type="button"
                      onClick={() => setIsBalancedDraw(!isBalancedDraw)}
                      className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner shrink-0 ${
                        isBalancedDraw ? "bg-emerald-500" : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                          isBalancedDraw ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <div className="flex flex-col items-end pl-4">
                      <label className="text-sm font-bold tracking-wider text-emerald-400 block text-right">
                        Torneo Equilibrato
                      </label>
                      <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Associa giocatori forti a giocatori deboli</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50">
                    <button
                      type="button"
                      onClick={() => setAvoidRepeatedPairs(!avoidRepeatedPairs)}
                      className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner shrink-0 ${
                        avoidRepeatedPairs ? "bg-amber-500" : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                          avoidRepeatedPairs ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <div className="flex flex-col items-end pl-4">
                      <label className="text-sm font-bold tracking-wider text-amber-400 block text-right">
                        Evita coppie ripetute
                      </label>
                      <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Penalizza coppie già formate in passato</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 max-w-[250px]">
                <button
                  type="button"
                  onClick={() => setAllowRoleSwaps(!allowRoleSwaps)}
                  className={clsx(
                    "w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner shrink-0",
                    allowRoleSwaps ? "bg-blue-500" : "bg-slate-700"
                  )}
                >
                  <div
                    className={clsx(
                      "w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out",
                      allowRoleSwaps ? "translate-x-5" : "translate-x-0"
                    )}
                  />
                </button>
                <div className="flex flex-col items-end pl-4">
                  <label className={clsx("text-sm font-bold tracking-wider block text-right", allowRoleSwaps ? "text-blue-400" : "text-slate-400")}>
                    Inversione Ruoli
                  </label>
                  <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">
                    {allowRoleSwaps 
                      ? "Ruoli interscambiabili in partita"
                      : "I giocatori mantengono il ruolo"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      

      <button type="submit" className="mt-4 bg-purple-500 hover:bg-purple-600 text-white font-bold py-4 rounded-xl text-lg transition-transform active:scale-95 flex justify-center items-center gap-2">
        <Swords className="w-6 h-6" /> Crea Sala d'Attesa (Lobby)
      </button>
    </form>
  );
}
