"use client";

import { useState } from "react";
import { Calendar, Clock, Cpu, Hash, CheckSquare, Square, Play, Loader2, Info, AlertCircle, CheckCircle2, RefreshCw, ChevronDown } from "lucide-react";
import { saveSchedulingConfig, generateSchedule } from "@/app/actions/tournamentActions";
import clsx from "clsx";

const DAYS = [
  { label: "Dom", short: "D", value: 0 },
  { label: "Lun", short: "L", value: 1 },
  { label: "Mar", short: "M", value: 2 },
  { label: "Mer", short: "M", value: 3 },
  { label: "Gio", short: "G", value: 4 },
  { label: "Ven", short: "V", value: 5 },
  { label: "Sab", short: "S", value: 6 },
];

interface Props {
  tournamentId: string;
  currentStartDate?: string | null;
  currentScheduleStartTime?: string | null;
  currentScheduleDays?: number[] | null;
  currentNumTables?: number | null;
  currentMaxMatchesPerDay?: number | null;
  totalMatches: number;
  scheduledMatchesCount?: number; // How many matches already have scheduledAt set
}

export default function SchedulingPanel({
  tournamentId,
  currentStartDate,
  currentScheduleStartTime,
  currentScheduleDays,
  currentNumTables,
  currentMaxMatchesPerDay,
  totalMatches,
  scheduledMatchesCount = 0,
}: Props) {
  // If all matches are already scheduled, start in collapsed "done" mode
  const alreadyScheduled = scheduledMatchesCount > 0 && scheduledMatchesCount >= totalMatches;
  const [collapsed, setCollapsed] = useState(alreadyScheduled);

  const [startDate, setStartDate] = useState(
    currentStartDate ? currentStartDate.slice(0, 10) : ""
  );
  const [startTime, setStartTime] = useState(currentScheduleStartTime || "20:00");
  const [selectedDays, setSelectedDays] = useState<number[]>(
    currentScheduleDays ?? [2, 4] // Default: Tuesday + Thursday
  );
  const [numTables, setNumTables] = useState(currentNumTables ?? 1);
  const [maxMatchesPerDay, setMaxMatchesPerDay] = useState(currentMaxMatchesPerDay ?? 6);

  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [report, setReport] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const toggleDay = (val: number) => {
    setSelectedDays((prev) =>
      prev.includes(val) ? prev.filter((d) => d !== val) : [...prev, val]
    );
    setSaved(false);
  };

  // Estimate: matches per day = numTables * maxMatchesPerDay (capped by daily rule)
  const estimatedMatchesPerDay = Math.min(numTables, maxMatchesPerDay);
  const estimatedDays = selectedDays.length > 0
    ? Math.ceil(totalMatches / (estimatedMatchesPerDay * selectedDays.length) * 7)
    : 0;

  const handleSave = async () => {
    if (!startDate || !startTime || selectedDays.length === 0) {
      setError("Compila tutti i campi e seleziona almeno un giorno.");
      return;
    }
    setIsSaving(true);
    setError(null);
    try {
      await saveSchedulingConfig(tournamentId, {
        numTables,
        scheduleStartTime: startTime,
        scheduleDays: selectedDays.sort((a, b) => a - b),
        maxMatchesPerDay,
        scheduleStartDate: startDate,
      });
      setSaved(true);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setReport(null);

    // Auto-save first if dirty
    if (!saved) {
      await handleSave();
    }

    setIsGenerating(true);
    try {
      const result = await generateSchedule(tournamentId);
      if (result.ok && result.report) {
        setReport(result.report);
        setCollapsed(false); // Show report after regeneration
      } else {
        setError(result.error || "Errore sconosciuto.");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // ─── COLLAPSED / DONE STATE ────────────────────────────────────────────────
  if (collapsed) {
    return (
      <div className="bg-slate-900 border border-emerald-500/30 rounded-3xl px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <p className="text-white font-black text-sm uppercase tracking-wider">Calendario Generato</p>
            <p className="text-slate-400 text-xs">
              {scheduledMatchesCount} / {totalMatches} partite con orario assegnato
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 text-sm text-slate-400 hover:text-white transition font-bold border border-slate-700 hover:border-slate-500 px-4 py-2 rounded-xl"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Rigenera
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-white font-black text-lg uppercase tracking-wider">Genera Calendario Automatico</h3>
            <p className="text-slate-400 text-sm">{totalMatches} partite da schedulare · 30 min/partita</p>
          </div>
        </div>
        {scheduledMatchesCount > 0 && (
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition"
          >
            <ChevronDown className="w-4 h-4" /> Comprimi
          </button>
        )}
      </div>

      {/* Estimation banner */}
      {totalMatches > 0 && selectedDays.length > 0 && (
        <div className="bg-indigo-900/20 border border-indigo-500/20 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-indigo-300">
          <Info className="w-4 h-4 mt-0.5 shrink-0" />
          <span>
            Stima rapida: circa <strong>{estimatedMatchesPerDay} partite/sera</strong> su{" "}
            <strong>{selectedDays.length} giorno/i</strong> a settimana →{" "}
            <strong>~{estimatedDays} giorni totali</strong> (l'algoritmo calcola il dato esatto).
          </span>
        </div>
      )}

      {/* Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Start Date */}
        <div>
          <label className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
            <Calendar className="w-3.5 h-3.5" /> Data di Inizio Torneo
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => { setStartDate(e.target.value); setSaved(false); }}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Start Time */}
        <div>
          <label className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
            <Clock className="w-3.5 h-3.5" /> Orario Primo Fischio
          </label>
          <input
            type="time"
            value={startTime}
            onChange={(e) => { setStartTime(e.target.value); setSaved(false); }}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {/* Num Tables */}
        <div>
          <label className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-2">
            <Cpu className="w-3.5 h-3.5" /> Biliardini Disponibili
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => { setNumTables(n); setSaved(false); }}
                className={clsx(
                  "flex-1 py-3 rounded-xl font-black text-lg transition",
                  numTables === n
                    ? "bg-indigo-600 text-white border-2 border-indigo-400"
                    : "bg-slate-800 border-2 border-slate-700 text-slate-400 hover:bg-slate-700 hover:text-white"
                )}
              >
                {n}
              </button>
            ))}
          </div>
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
            onChange={(e) => { setMaxMatchesPerDay(Math.max(1, Number(e.target.value))); setSaved(false); }}
            className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-indigo-500 transition-colors text-center text-xl font-black"
          />
        </div>
      </div>

      {/* Days of week selector */}
      <div>
        <label className="flex items-center gap-2 text-slate-400 font-bold uppercase tracking-wider text-xs mb-3">
          <CheckSquare className="w-3.5 h-3.5" /> Giorni di Gioco
        </label>
        <div className="flex gap-2">
          {DAYS.map((day) => {
            const active = selectedDays.includes(day.value);
            return (
              <button
                key={day.value}
                type="button"
                onClick={() => toggleDay(day.value)}
                className={clsx(
                  "flex-1 flex flex-col items-center justify-center py-3 rounded-xl font-bold text-sm transition border-2",
                  active
                    ? "bg-indigo-600 border-indigo-400 text-white"
                    : "bg-slate-800 border-slate-700 text-slate-500 hover:border-slate-500"
                )}
              >
                {active
                  ? <CheckSquare className="w-4 h-4 mb-1" />
                  : <Square className="w-4 h-4 mb-1" />
                }
                {day.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-500/40 rounded-xl px-4 py-3 flex items-start gap-2 text-sm text-red-300">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* Report */}
      {report && (
        <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-xl px-4 py-4">
          <pre className="text-emerald-300 text-sm font-mono whitespace-pre-wrap leading-relaxed">{report}</pre>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className={clsx(
            "flex-1 py-3 px-4 rounded-xl font-bold transition flex items-center justify-center gap-2 border-2",
            saved
              ? "bg-slate-800 border-emerald-600 text-emerald-400"
              : "bg-slate-800 border-slate-600 text-slate-300 hover:border-indigo-500 hover:text-white"
          )}
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {saved ? "✓ Salvato" : "Salva Configurazione"}
        </button>

        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || isSaving}
          className="flex-1 py-3 px-4 rounded-xl font-black bg-indigo-600 hover:bg-indigo-500 text-white transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-wait"
        >
          {isGenerating
            ? <><Loader2 className="w-4 h-4 animate-spin" /> Calcolo in corso...</>
            : <><Play className="w-4 h-4" /> Genera Calendario</>
          }
        </button>
      </div>
    </div>
  );
}
