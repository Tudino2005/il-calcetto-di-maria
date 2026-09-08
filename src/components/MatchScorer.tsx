"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import { updateMatchScore, updateExactMatchScore } from "@/app/actions/matchActions";
import Link from "next/link";
import { ArrowLeft, Trophy, Zap, RotateCcw, Settings, Check } from "lucide-react";
import clsx from "clsx";

type PlayerInfo = { id: string; name: string };
type TeamInfo = { id: string; player1: PlayerInfo; player2: PlayerInfo };
type MatchInfo = {
  id: string;
  scoreTeamA: number;
  scoreTeamB: number;
  winnerTeamId: string | null;
  tournamentId: string | null;
  teamA: TeamInfo | null;
  teamB: TeamInfo | null;
};

type ScorerMode = "goals" | "sets";

export default function MatchScorer({ match }: { match: MatchInfo }) {
  const [isPending, startTransition] = useTransition();

  // Settings with LocalStorage persistence
  const [mode, setMode] = useState<ScorerMode>("goals");
  const [targetGoals, setTargetGoals] = useState<number>(7);
  const [advantageThreshold, setAdvantageThreshold] = useState<number>(5);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  // Load saved settings
  useEffect(() => {
    try {
      const saved = localStorage.getItem("foosball_scorer_settings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.mode) setMode(parsed.mode);
        if (parsed.targetGoals) setTargetGoals(parsed.targetGoals);
        if (parsed.advantageThreshold) setAdvantageThreshold(parsed.advantageThreshold);
      }
    } catch {}
  }, []);

  // Save settings when changed
  const updateSettings = (newMode: ScorerMode, newTarget: number, newThreshold: number) => {
    setMode(newMode);
    setTargetGoals(newTarget);
    setAdvantageThreshold(newThreshold);
    try {
      localStorage.setItem("foosball_scorer_settings", JSON.stringify({
        mode: newMode,
        targetGoals: newTarget,
        advantageThreshold: newThreshold
      }));
    } catch {}
  };

  // Goals history array to compute state deterministically
  const [goalsHistory, setGoalsHistory] = useState<("A" | "B")[]>(() => {
    const list: ("A" | "B")[] = [];
    for (let i = 0; i < match.scoreTeamA; i++) list.push("A");
    for (let i = 0; i < match.scoreTeamB; i++) list.push("B");
    return list;
  });

  // Derived state from goals history
  const matchState = useMemo(() => {
    let scoreA = 0;
    let scoreB = 0;
    let inAdvantages = false;
    let advA = 0; // 0, 1, 2
    let advB = 0; // 0, 1, 2
    let winner: "A" | "B" | null = match.winnerTeamId 
      ? (match.teamA && match.winnerTeamId === match.teamA.id ? "A" : "B")
      : null;

    for (const team of goalsHistory) {
      if (winner) break;

      if (team === "A") scoreA++;
      else scoreB++;

      if (!inAdvantages) {
        if (scoreA >= advantageThreshold && scoreB >= advantageThreshold) {
          inAdvantages = true;
          advA = 0;
          advB = 0;
        } else if (scoreA >= targetGoals && scoreB < advantageThreshold) {
          winner = "A";
          break;
        } else if (scoreB >= targetGoals && scoreA < advantageThreshold) {
          winner = "B";
          break;
        }
      } else {
        // Already in advantages
        if (team === "A") {
          if (advB === 1) {
            // Team B had +1, Team A scored -> reset to 0-0!
            advB = 0;
            advA = 0;
          } else if (advA === 0 && advB === 0) {
            advA = 1;
          } else if (advA === 1) {
            advA = 2;
            winner = "A";
            break;
          }
        } else {
          // team === "B"
          if (advA === 1) {
            // Team A had +1, Team B scored -> reset to 0-0!
            advA = 0;
            advB = 0;
          } else if (advA === 0 && advB === 0) {
            advB = 1;
          } else if (advB === 1) {
            advB = 2;
            winner = "B";
            break;
          }
        }
      }
    }

    return { scoreA, scoreB, inAdvantages, advA, advB, winner };
  }, [goalsHistory, targetGoals, advantageThreshold, match.winnerTeamId, match.teamA]);

  const teamAWon = match.teamA ? (matchState.winner === "A" || match.winnerTeamId === match.teamA.id) : false;
  const teamBWon = match.teamB ? (matchState.winner === "B" || match.winnerTeamId === match.teamB.id) : false;
  const isFinished = teamAWon || teamBWon;

  const backLink = match.tournamentId ? `/tournaments/${match.tournamentId}` : "/admin";
  const backText = match.tournamentId ? "Torna al Tabellone" : "Torna al Pannello";

  // Handle adding a goal in Goal Mode
  const addGoal = (team: "A" | "B") => {
    if (isFinished || isPending) return;

    const newHistory = [...goalsHistory, team];
    setGoalsHistory(newHistory);

    // Compute preview
    let previewScoreA = matchState.scoreA + (team === "A" ? 1 : 0);
    let previewScoreB = matchState.scoreB + (team === "B" ? 1 : 0);
    let winnerId: string | null = null;

    if (!matchState.inAdvantages) {
      if (previewScoreA >= advantageThreshold && previewScoreB >= advantageThreshold) {
        // Will enter advantages
      } else if (previewScoreA >= targetGoals && previewScoreB < advantageThreshold && match.teamA) {
        winnerId = match.teamA.id;
      } else if (previewScoreB >= targetGoals && previewScoreA < advantageThreshold && match.teamB) {
        winnerId = match.teamB.id;
      }
    } else {
      // In advantages: check if this goal seals 2 in a row
      if (team === "A" && matchState.advA === 1 && match.teamA) {
        winnerId = match.teamA.id;
      } else if (team === "B" && matchState.advB === 1 && match.teamB) {
        winnerId = match.teamB.id;
      }
    }

    startTransition(() => {
      updateExactMatchScore(match.id, previewScoreA, previewScoreB, winnerId);
    });
  };

  // Handle removing the last goal (Undo)
  const removeLastGoal = (team?: "A" | "B") => {
    if (goalsHistory.length === 0 || isPending) return;

    let targetIdx = -1;
    if (team) {
      for (let i = goalsHistory.length - 1; i >= 0; i--) {
        if (goalsHistory[i] === team) {
          targetIdx = i;
          break;
        }
      }
    } else {
      targetIdx = goalsHistory.length - 1;
    }

    if (targetIdx === -1) return;

    const newHistory = [...goalsHistory];
    newHistory.splice(targetIdx, 1);
    setGoalsHistory(newHistory);

    const prevScoreA = newHistory.filter(x => x === "A").length;
    const prevScoreB = newHistory.filter(x => x === "B").length;

    startTransition(() => {
      updateExactMatchScore(match.id, prevScoreA, prevScoreB, null);
    });
  };

  // Handle direct click on numbered box (1-10) in regular phase
  const handleBoxClick = (team: "A" | "B", boxNum: number) => {
    if (isFinished || matchState.inAdvantages || isPending) return;
    const currentScore = team === "A" ? matchState.scoreA : matchState.scoreB;

    if (boxNum === currentScore) {
      // Click on current highest: undo 1
      removeLastGoal(team);
    } else if (boxNum === currentScore + 1) {
      // Click next box: add 1
      addGoal(team);
    }
  };

  // Legacy Set Mode Handler
  const handleLegacyScore = (team: "A" | "B", action: "add" | "remove") => {
    if (match.winnerTeamId || isPending) return;
    startTransition(() => {
      updateMatchScore(match.id, team, action);
    });
  };

  if (!match.teamA || !match.teamB) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center h-screen">
        <h2 className="text-2xl font-bold text-slate-400 mb-4">In attesa degli avversari...</h2>
        <p className="text-slate-500 mb-8">Questa partita non ha ancora entrambe le squadre assegnate. Ritorna quando il tabellone sarà aggiornato.</p>
        <Link href={backLink} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-bold transition">
          {backText}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-3 md:p-6 relative max-w-7xl mx-auto w-full min-h-screen">
      {/* HEADER & NAV */}
      <header className="flex flex-wrap justify-between items-center gap-4 mb-4 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href={backLink} className="p-2.5 bg-slate-800 hover:bg-slate-700 rounded-xl text-white transition">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white tracking-wider uppercase flex items-center gap-2">
              Match Scorer
            </h1>
            <p className="text-xs text-slate-400">
              {match.tournamentId ? "Partita di Torneo" : "Partita Libera"}
            </p>
          </div>
        </div>

        {/* SETTINGS & MODE CONTROLS */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Mode switch */}
          <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl p-1 text-xs font-bold">
            <button
              onClick={() => updateSettings("goals", targetGoals, advantageThreshold)}
              className={clsx(
                "px-3 py-1.5 rounded-lg transition-all",
                mode === "goals" ? "bg-purple-600 text-white shadow" : "text-slate-400 hover:text-white"
              )}
            >
              ⚽ Modalità Gol
            </button>
            <button
              onClick={() => updateSettings("sets", targetGoals, advantageThreshold)}
              className={clsx(
                "px-3 py-1.5 rounded-lg transition-all",
                mode === "sets" ? "bg-slate-700 text-white shadow" : "text-slate-400 hover:text-white"
              )}
            >
              🏆 Solo Set
            </button>
          </div>

          {/* Settings panel trigger */}
          {mode === "goals" && (
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={clsx(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition",
                showSettings 
                  ? "bg-slate-700 border-slate-500 text-white" 
                  : "bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700"
              )}
            >
              <Settings className="w-4 h-4 text-purple-400" />
              <span>Regole: <b>{targetGoals} Gol</b> (Vantaggi a <b>{advantageThreshold}</b>)</span>
            </button>
          )}
        </div>
      </header>

      {/* EXPANDABLE SETTINGS PANEL */}
      {mode === "goals" && showSettings && (
        <div className="bg-slate-900/95 border border-purple-500/30 rounded-2xl p-4 mb-4 shadow-xl flex flex-wrap items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-4 flex-wrap">
            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-purple-300 block mb-1">
                A quanti gol si vince
              </label>
              <div className="flex gap-1.5">
                {[5, 6, 7, 8, 10].map(val => (
                  <button
                    key={val}
                    onClick={() => updateSettings("goals", val, Math.min(advantageThreshold, val - 1))}
                    className={clsx(
                      "px-3 py-1 rounded-lg text-sm font-black transition",
                      targetGoals === val ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-8 w-px bg-slate-700 hidden sm:block"></div>

            <div>
              <label className="text-[11px] font-black uppercase tracking-wider text-yellow-400 block mb-1">
                Soglia Vantaggi (Pari a cui scattano)
              </label>
              <div className="flex gap-1.5">
                {[4, 5, 6, 7, 8].filter(val => val < targetGoals).map(val => (
                  <button
                    key={val}
                    onClick={() => updateSettings("goals", targetGoals, val)}
                    className={clsx(
                      "px-3 py-1 rounded-lg text-sm font-black transition",
                      advantageThreshold === val ? "bg-yellow-500 text-slate-950" : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
                    )}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowSettings(false)}
            className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg font-bold transition ml-auto"
          >
            Chiudi Impostazioni
          </button>
        </div>
      )}

      {/* VANTAGGI BANNER NOTIFICATION */}
      {mode === "goals" && matchState.inAdvantages && !isFinished && (
        <div className="bg-gradient-to-r from-yellow-500/20 via-orange-500/20 to-yellow-500/20 border-2 border-yellow-500/60 rounded-2xl p-3 mb-4 shadow-[0_0_25px_rgba(234,179,8,0.25)] flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6 text-yellow-400 animate-pulse" />
            </div>
            <div>
              <div className="text-base font-black text-yellow-400 uppercase tracking-wider">
                ⚡ FASE VANTAGGI ATTIVA (Pari raggiunto a {advantageThreshold})
              </div>
              <p className="text-xs text-slate-300">
                Il punteggio dei vantaggi è azzerato: <b>vince la squadra che segna 2 gol consecutivi</b> (+2). Se l'avversario pareggia, si riazzera!
              </p>
            </div>
          </div>
          <div className="bg-slate-900/80 px-4 py-1.5 rounded-xl border border-yellow-500/30 shrink-0">
            <span className="text-xs text-slate-400 font-bold block">Gol Reali a Referto:</span>
            <span className="text-lg font-black text-white">{matchState.scoreA} - {matchState.scoreB}</span>
          </div>
        </div>
      )}

      {/* OVERLAY VITTORIA */}
      {isFinished && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
          <Trophy className="w-24 h-24 md:w-32 md:h-32 text-yellow-400 mb-4 animate-bounce" />
          <h2 className="text-4xl md:text-6xl font-black text-white text-center mb-2">
            VITTORIA!
          </h2>
          <div className={clsx(
            "text-2xl md:text-4xl font-black text-center mb-4",
            teamAWon ? "text-red-500" : "text-blue-500"
          )}>
            {teamAWon 
              ? `${match.teamA.player1.name} & ${match.teamA.player2.name}` 
              : `${match.teamB.player1.name} & ${match.teamB.player2.name}`}
          </div>

          <div className="bg-slate-900 border border-slate-700 px-8 py-4 rounded-2xl mb-8 text-center shadow-2xl">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block mb-1">Punteggio Finale Registrato</span>
            <div className="text-5xl font-black text-white tracking-wider">
              <span className={teamAWon ? "text-red-400" : "text-slate-400"}>{mode === "goals" ? matchState.scoreA : match.scoreTeamA}</span>
              <span className="text-slate-600 mx-3">-</span>
              <span className={teamBWon ? "text-blue-400" : "text-slate-400"}>{mode === "goals" ? matchState.scoreB : match.scoreTeamB}</span>
            </div>
            {mode === "goals" && matchState.inAdvantages && (
              <span className="inline-block mt-2 text-xs font-black uppercase tracking-wider text-yellow-400 bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
                Vittoria conquistata ai Vantaggi
              </span>
            )}
          </div>

          <Link href={backLink} className="px-8 py-3.5 bg-white text-slate-950 rounded-full font-black text-lg hover:scale-105 transition-transform shadow-xl">
            {backText}
          </Link>
        </div>
      )}

      {/* MAIN TWO-COLUMN ARENA */}
      <div className="flex-1 grid md:grid-cols-2 gap-4 md:gap-6 min-h-[420px]">
        {/* SQUADRA ROSSA */}
        <div className={clsx(
          "relative flex flex-col rounded-3xl p-5 md:p-6 transition-all duration-300 border-2 flex-1 justify-between",
          teamAWon ? "bg-red-950/60 border-red-500" : "bg-slate-900/90 border-slate-800 hover:border-red-900/60",
          isFinished && !teamAWon && "opacity-40"
        )}>
          {/* Header Team */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-widest text-red-400">Squadra Rossa</span>
              {matchState.inAdvantages && matchState.advA === 1 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-red-500 text-white animate-pulse">
                  Match Point Rosso (+1)
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
              {match.teamA.player1.name} <span className="text-slate-600">&</span> {match.teamA.player2.name}
            </h2>
          </div>

          {/* CENTER DISPLAY */}
          <div className="my-4 flex flex-col items-center justify-center">
            {mode === "goals" ? (
              <>
                <div className="text-7xl md:text-9xl font-black text-white tabular-nums tracking-tight drop-shadow-md">
                  {matchState.scoreA}
                </div>
                <span className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">
                  Gol Totali Segnati
                </span>

                {/* VANTAGGI DUEL HUD (Se in fase vantaggi) */}
                {matchState.inAdvantages && (
                  <div className="mt-4 w-full bg-slate-950/80 border border-red-500/40 rounded-2xl p-3 text-center">
                    <div className="text-[11px] font-black uppercase tracking-wider text-red-400 mb-2">
                      Duello Vantaggi (Serve +2 consecutivo)
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className={clsx(
                        "w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 transition-all",
                        matchState.advA >= 1 
                          ? "bg-red-600 border-red-400 text-white shadow-[0_0_15px_rgba(239,68,68,0.5)] scale-105" 
                          : "bg-slate-900 border-slate-700 text-slate-500"
                      )}>
                        <span className="text-xs font-bold leading-none">GOL 1</span>
                        <span className="text-base font-black">+1</span>
                      </div>
                      <div className={clsx(
                        "w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 transition-all",
                        matchState.advA >= 2 
                          ? "bg-red-600 border-red-400 text-white shadow-[0_0_20px_rgba(239,68,68,0.7)] scale-110" 
                          : "bg-slate-900 border-slate-700 text-slate-500"
                      )}>
                        <span className="text-xs font-bold leading-none">GOL 2</span>
                        <Trophy className="w-4 h-4 mt-0.5" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="text-8xl md:text-9xl font-black text-white tabular-nums">
                  {match.scoreTeamA}
                </span>
                <span className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Set Vinti</span>
              </>
            )}
          </div>

          {/* STECCA 1-10 (Solo in Modalità Gol) */}
          {mode === "goals" && (
            <div className="mb-4">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-black tracking-wider mb-2">
                <span>Stecca Segnapunti (1 - 10)</span>
                <span>Target: {targetGoals} gol</span>
              </div>
              <div className="grid grid-cols-10 gap-1 sm:gap-1.5 w-full">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
                  const isEnabled = num <= targetGoals || matchState.inAdvantages;
                  const isChecked = matchState.scoreA >= num;
                  const isTarget = num === targetGoals;

                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={!isEnabled || isFinished}
                      onClick={() => handleBoxClick("A", num)}
                      className={clsx(
                        "h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center transition-all relative font-black select-none",
                        isChecked
                          ? "bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)] border-2 border-red-400"
                          : isEnabled
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-red-500/50 border border-slate-700"
                          : "bg-slate-950/40 text-slate-600 border border-slate-800 opacity-30 cursor-not-allowed",
                        isTarget && !isChecked && isEnabled && "ring-1 ring-red-500/50"
                      )}
                    >
                      {isChecked ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span className="text-xs sm:text-sm">{num}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          {!isFinished && (
            <div className="flex gap-2 sm:gap-3">
              <button 
                onClick={() => mode === "goals" ? removeLastGoal("A") : handleLegacyScore("A", "remove")}
                disabled={isPending || (mode === "goals" ? matchState.scoreA === 0 : match.scoreTeamA === 0)}
                className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-2xl disabled:opacity-30 flex items-center justify-center shrink-0 border border-slate-700 transition active:scale-95"
                title="Annulla ultimo gol rosso"
              >
                -
              </button>
              <button 
                onClick={() => mode === "goals" ? addGoal("A") : handleLegacyScore("A", "add")}
                disabled={isPending}
                className="flex-1 h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white font-black text-xl sm:text-2xl shadow-lg shadow-red-950/50 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                + GOL ROSSO
              </button>
            </div>
          )}
        </div>

        {/* SQUADRA BLU */}
        <div className={clsx(
          "relative flex flex-col rounded-3xl p-5 md:p-6 transition-all duration-300 border-2 flex-1 justify-between",
          teamBWon ? "bg-blue-950/60 border-blue-500" : "bg-slate-900/90 border-slate-800 hover:border-blue-900/60",
          isFinished && !teamBWon && "opacity-40"
        )}>
          {/* Header Team */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-black uppercase tracking-widest text-blue-400">Squadra Blu</span>
              {matchState.inAdvantages && matchState.advB === 1 && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-blue-500 text-white animate-pulse">
                  Match Point Blu (+1)
                </span>
              )}
            </div>
            <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
              {match.teamB.player1.name} <span className="text-slate-600">&</span> {match.teamB.player2.name}
            </h2>
          </div>

          {/* CENTER DISPLAY */}
          <div className="my-4 flex flex-col items-center justify-center">
            {mode === "goals" ? (
              <>
                <div className="text-7xl md:text-9xl font-black text-white tabular-nums tracking-tight drop-shadow-md">
                  {matchState.scoreB}
                </div>
                <span className="text-xs text-slate-400 font-black uppercase tracking-widest mt-1">
                  Gol Totali Segnati
                </span>

                {/* VANTAGGI DUEL HUD (Se in fase vantaggi) */}
                {matchState.inAdvantages && (
                  <div className="mt-4 w-full bg-slate-950/80 border border-blue-500/40 rounded-2xl p-3 text-center">
                    <div className="text-[11px] font-black uppercase tracking-wider text-blue-400 mb-2">
                      Duello Vantaggi (Serve +2 consecutivo)
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <div className={clsx(
                        "w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 transition-all",
                        matchState.advB >= 1 
                          ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)] scale-105" 
                          : "bg-slate-900 border-slate-700 text-slate-500"
                      )}>
                        <span className="text-xs font-bold leading-none">GOL 1</span>
                        <span className="text-base font-black">+1</span>
                      </div>
                      <div className={clsx(
                        "w-12 h-12 rounded-xl flex flex-col items-center justify-center border-2 transition-all",
                        matchState.advB >= 2 
                          ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_20px_rgba(59,130,246,0.7)] scale-110" 
                          : "bg-slate-900 border-slate-700 text-slate-500"
                      )}>
                        <span className="text-xs font-bold leading-none">GOL 2</span>
                        <Trophy className="w-4 h-4 mt-0.5" />
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <span className="text-8xl md:text-9xl font-black text-white tabular-nums">
                  {match.scoreTeamB}
                </span>
                <span className="text-sm text-slate-400 font-bold uppercase tracking-widest mt-2">Set Vinti</span>
              </>
            )}
          </div>

          {/* STECCA 1-10 (Solo in Modalità Gol) */}
          {mode === "goals" && (
            <div className="mb-4">
              <div className="flex justify-between items-center text-[10px] text-slate-400 uppercase font-black tracking-wider mb-2">
                <span>Stecca Segnapunti (1 - 10)</span>
                <span>Target: {targetGoals} gol</span>
              </div>
              <div className="grid grid-cols-10 gap-1 sm:gap-1.5 w-full">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => {
                  const isEnabled = num <= targetGoals || matchState.inAdvantages;
                  const isChecked = matchState.scoreB >= num;
                  const isTarget = num === targetGoals;

                  return (
                    <button
                      key={num}
                      type="button"
                      disabled={!isEnabled || isFinished}
                      onClick={() => handleBoxClick("B", num)}
                      className={clsx(
                        "h-10 sm:h-12 rounded-xl flex flex-col items-center justify-center transition-all relative font-black select-none",
                        isChecked
                          ? "bg-blue-600 text-white shadow-[0_0_10px_rgba(59,130,246,0.4)] border-2 border-blue-400"
                          : isEnabled
                          ? "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:border-blue-500/50 border border-slate-700"
                          : "bg-slate-950/40 text-slate-600 border border-slate-800 opacity-30 cursor-not-allowed",
                        isTarget && !isChecked && isEnabled && "ring-1 ring-blue-500/50"
                      )}
                    >
                      {isChecked ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <span className="text-xs sm:text-sm">{num}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ACTION BUTTONS */}
          {!isFinished && (
            <div className="flex gap-2 sm:gap-3">
              <button 
                onClick={() => mode === "goals" ? removeLastGoal("B") : handleLegacyScore("B", "remove")}
                disabled={isPending || (mode === "goals" ? matchState.scoreB === 0 : match.scoreTeamB === 0)}
                className="w-14 sm:w-16 h-14 sm:h-16 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-2xl disabled:opacity-30 flex items-center justify-center shrink-0 border border-slate-700 transition active:scale-95"
                title="Annulla ultimo gol blu"
              >
                -
              </button>
              <button 
                onClick={() => mode === "goals" ? addGoal("B") : handleLegacyScore("B", "add")}
                disabled={isPending}
                className="flex-1 h-14 sm:h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black text-xl sm:text-2xl shadow-lg shadow-blue-950/50 active:scale-95 transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              >
                + GOL BLU
              </button>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER BAR WITH RECAP & UNDO ALL */}
      <footer className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <span>Stato partita:</span>
          {isFinished ? (
            <span className="text-emerald-400 font-bold">Completata</span>
          ) : matchState.inAdvantages ? (
            <span className="text-yellow-400 font-bold">In corso ai Vantaggi</span>
          ) : (
            <span className="text-slate-300 font-bold">In corso (Fase regolare)</span>
          )}
        </div>

        {goalsHistory.length > 0 && !isFinished && (
          <button
            onClick={() => {
              if (confirm("Vuoi azzerare il punteggio di questa partita?")) {
                setGoalsHistory([]);
                startTransition(() => {
                  updateExactMatchScore(match.id, 0, 0, null);
                });
              }
            }}
            className="flex items-center gap-1 text-slate-400 hover:text-red-400 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Azzera Partita</span>
          </button>
        )}
      </footer>
    </div>
  );
}
