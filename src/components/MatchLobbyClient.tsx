"use client";

import { useState, useMemo } from "react";
import { startFreeMatch } from "@/app/actions/matchActions";
import { PlayCircle, Users, ArrowLeftRight, Zap, Trophy, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";
import RoleIcon from "@/components/RoleIcon";
import { resolveTeamRoles } from "@/lib/roleUtils";

export interface PlayerItem {
  id: string;
  name: string;
  preferredRole: string;
  avatarUrl?: string | null;
  mediaUrl?: string | null;
}

export default function MatchLobbyClient({ players }: { players: PlayerItem[] }) {
  const router = useRouter();
  // fixedPairs[0] is Team Red (max 2 players), fixedPairs[1] is Team Blue (max 2 players)
  const [fixedPairs, setFixedPairs] = useState<string[][]>([[], []]);
  const [matchFormat, setMatchFormat] = useState<"bo3" | "single">("bo3");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "selected">("all");
  const [roleOverrides, setRoleOverrides] = useState<{
    teamA?: { goalkeeperId?: string; strikerId?: string };
    teamB?: { goalkeeperId?: string; strikerId?: string };
  }>({});

  const teamAIds = fixedPairs[0] || [];
  const teamBIds = fixedPairs[1] || [];

  const pA1 = players.find(p => p.id === teamAIds[0]);
  const pA2 = players.find(p => p.id === teamAIds[1]);
  const resolvedA = pA1 && pA2 ? resolveTeamRoles(pA1, pA2, roleOverrides.teamA) : null;

  const pB1 = players.find(p => p.id === teamBIds[0]);
  const pB2 = players.find(p => p.id === teamBIds[1]);
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
    if (!pair || pair.length === 0) return <span className="text-slate-500 italic font-normal text-sm sm:text-base">Nessun giocatore</span>;
    const names = pair.map(id => players.find(p => p.id === id)?.name).filter(Boolean);
    if (names.length === 1) {
      return (
        <span className="flex items-center gap-2">
          <span>{names[0]}</span>
          <span className="text-xs text-slate-500 font-normal italic">(in attesa compagno...)</span>
        </span>
      );
    }
    return names.join(" & ");
  };

  // Direct assignment to Team 0 (Red) or Team 1 (Blue)
  const assignToTeam = (playerId: string, targetTeamIdx: 0 | 1) => {
    setFixedPairs(prev => {
      let currentA = [...(prev[0] || [])];
      let currentB = [...(prev[1] || [])];

      if (targetTeamIdx === 0) {
        if (currentA.includes(playerId)) {
          // Deselect from Red
          currentA = currentA.filter(id => id !== playerId);
        } else {
          // If Red is already full, do nothing
          if (currentA.length >= 2) return prev;
          // Remove from Blue if present
          currentB = currentB.filter(id => id !== playerId);
          currentA.push(playerId);
        }
      } else {
        if (currentB.includes(playerId)) {
          // Deselect from Blue
          currentB = currentB.filter(id => id !== playerId);
        } else {
          // If Blue is already full, do nothing
          if (currentB.length >= 2) return prev;
          // Remove from Red if present
          currentA = currentA.filter(id => id !== playerId);
          currentB.push(playerId);
        }
      }

      return [currentA, currentB];
    });
  };

  const togglePlayer = (id: string) => {
    if (teamAIds.includes(id)) {
      assignToTeam(id, 0);
    } else if (teamBIds.includes(id)) {
      assignToTeam(id, 1);
    } else {
      if (teamAIds.length < 2) {
        assignToTeam(id, 0);
      } else if (teamBIds.length < 2) {
        assignToTeam(id, 1);
      }
    }
  };

  const sortedPlayers = useMemo(() => {
    return [...players].sort((a, b) => a.name.localeCompare(b.name, "it", { sensitivity: "base" }));
  }, [players]);

  const filteredPlayers = useMemo(() => {
    const aList = fixedPairs[0] || [];
    const bList = fixedPairs[1] || [];
    return sortedPlayers.filter(p => {
      const matchesSearch = !searchQuery.trim() || p.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
      if (!matchesSearch) return false;
      if (filterMode === "selected") {
        return aList.includes(p.id) || bList.includes(p.id);
      }
      return true;
    });
  }, [sortedPlayers, searchQuery, filterMode, fixedPairs]);

  const handleStart = async () => {
    const validPairs = [teamAIds, teamBIds].filter(p => p.length === 2);
    if (validPairs.length !== 2) {
      alert("Devi formare esattamente 2 squadre da 2 giocatori.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const matchId = await startFreeMatch(
        validPairs,
        {
          teamA: resolvedA ? { goalkeeperId: resolvedA.goalkeeperId, strikerId: resolvedA.strikerId } : undefined,
          teamB: resolvedB ? { goalkeeperId: resolvedB.goalkeeperId, strikerId: resolvedB.strikerId } : undefined,
        },
        matchFormat
      );
      router.push(`/match/${matchId}`);
    } catch {
      alert("Errore durante l'avvio della partita.");
      setIsSubmitting(false);
    }
  };

  const totalSelected = teamAIds.length + teamBIds.length;

  return (
    <div className="flex flex-col gap-6 sm:gap-8">
      <section className="bg-slate-800 p-4 sm:p-8 rounded-3xl border border-slate-700 shadow-xl">
        {/* Header con titolo e tasto azzera */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white flex items-center gap-2 sm:gap-3">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" /> Forma le 2 Squadre
          </h2>
          {totalSelected > 0 && (
            <button 
              type="button" 
              onClick={() => {
                setFixedPairs([[], []]);
                setRoleOverrides({});
              }} 
              className="text-xs sm:text-sm font-bold text-rose-400 hover:text-rose-300 px-3 py-1.5 sm:px-4 sm:py-2 bg-slate-900 border border-slate-700 rounded-xl transition-colors active:scale-95"
            >
              Azzera ({totalSelected}/4)
            </button>
          )}
        </div>

        {/* Sommario Squadra Rossa e Squadra Blu */}
        <div className="bg-slate-900 p-4 sm:p-6 rounded-2xl border border-slate-700 mb-6 flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
          {/* Squadra Rossa */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <span className="text-red-400 font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center gap-1.5">
                <span>🔴</span> Squadra Rossa ({teamAIds.length}/2)
              </span>
            </div>
            <div className="text-white font-black text-lg sm:text-xl min-h-[1.75rem] flex items-center">
              {getTeamNames(fixedPairs[0])}
            </div>
            {resolvedA && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
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

          {/* Separatore Responsive */}
          <div className="hidden md:block w-px h-16 bg-slate-700 mx-2"></div>
          <div className="md:hidden w-full h-px bg-slate-800"></div>

          {/* Squadra Blu */}
          <div className="flex-1 flex flex-col md:text-right">
            <div className="flex items-center justify-between md:justify-end mb-1">
              <span className="text-blue-400 font-bold uppercase tracking-wider text-xs sm:text-sm flex items-center gap-1.5">
                <span>🔵</span> Squadra Blu ({teamBIds.length}/2)
              </span>
            </div>
            <div className="text-white font-black text-lg sm:text-xl min-h-[1.75rem] flex items-center md:justify-end">
              {getTeamNames(fixedPairs[1])}
            </div>
            {resolvedB && (
              <div className="mt-2.5 flex flex-wrap items-center gap-2 md:justify-end">
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

        {/* BARRA DI RICERCA E FILTRI VELOCI */}
        <div className="mb-4 flex flex-col sm:flex-row gap-2.5 sm:gap-3 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Cerca giocatore per nome..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                title="Cancella ricerca"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-2 text-xs">
            <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-700/80">
              <button
                type="button"
                onClick={() => setFilterMode("all")}
                className={clsx(
                  "px-2.5 py-1 rounded-lg font-bold transition-colors",
                  filterMode === "all" ? "bg-slate-700 text-white" : "text-slate-400 hover:text-white"
                )}
              >
                Tutti ({sortedPlayers.length})
              </button>
              {totalSelected > 0 && (
                <button
                  type="button"
                  onClick={() => setFilterMode("selected")}
                  className={clsx(
                    "px-2.5 py-1 rounded-lg font-bold transition-colors flex items-center gap-1",
                    filterMode === "selected" ? "bg-emerald-600 text-white" : "text-emerald-400 hover:text-emerald-300"
                  )}
                >
                  <span>Scelti ({totalSelected}/4)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* EMPTY STATE RICERCA */}
        {filteredPlayers.length === 0 && (
          <div className="text-center py-8 text-slate-400 bg-slate-900/60 rounded-2xl border border-slate-800">
            <p className="text-sm">Nessun giocatore trovato con &ldquo;<strong className="text-white">{searchQuery}</strong>&rdquo;</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setFilterMode("all");
              }}
              className="mt-3 text-xs text-emerald-400 hover:text-emerald-300 font-bold underline"
            >
              Mostra tutti i giocatori
            </button>
          </div>
        )}

        {/* ========================================================= */}
        {/* VISTA SMARTPHONE (md:hidden): LISTA COMPATTA + BOTTONI 🔴/🔵 */}
        {/* NESSUN AVATAR - MASSIMA DENSITÀ E VELOCITÀ DI FORMAZIONE  */}
        {/* ========================================================= */}
        <div className="md:hidden flex flex-col gap-2 max-h-[52vh] overflow-y-auto pr-1 custom-scrollbar">
          {filteredPlayers.map(p => {
            const isInTeamA = teamAIds.includes(p.id);
            const isInTeamB = teamBIds.includes(p.id);

            let roleInMatch = "";
            if (isInTeamA && resolvedA) {
              roleInMatch = resolvedA.goalkeeperId === p.id ? "🛡️ Porta" : "⚔️ Attacco";
            } else if (isInTeamB && resolvedB) {
              roleInMatch = resolvedB.goalkeeperId === p.id ? "🛡️ Porta" : "⚔️ Attacco";
            }

            return (
              <div
                key={p.id}
                className={clsx(
                  "flex items-center justify-between p-2.5 rounded-xl border transition-all select-none gap-2",
                  isInTeamA
                    ? "bg-red-950/40 border-red-500/80 shadow-sm"
                    : isInTeamB
                    ? "bg-blue-950/40 border-blue-500/80 shadow-sm"
                    : "bg-slate-900 border-slate-700/80 hover:border-slate-600"
                )}
              >
                {/* Nome e Ruolo Preferito (SENZA AVATAR) */}
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                    <RoleIcon role={p.preferredRole} className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                    <span className={clsx(
                      "font-bold text-sm truncate max-w-[140px] sm:max-w-[200px]",
                      isInTeamA ? "text-red-200" : isInTeamB ? "text-blue-200" : "text-white"
                    )}>
                      {p.name}
                    </span>
                    {roleInMatch && (
                      <span className={clsx(
                        "text-[10px] font-black uppercase px-1.5 py-0.5 rounded border shrink-0",
                        isInTeamA 
                          ? "bg-red-500/20 text-red-300 border-red-500/40" 
                          : "bg-blue-500/20 text-blue-300 border-blue-500/40"
                      )}>
                        {roleInMatch}
                      </span>
                    )}
                  </div>
                </div>

                {/* Pulsanti Assegnazione Diretta 🔴 e 🔵 */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {/* Tasto SQUADRA ROSSA */}
                  <button
                    type="button"
                    onClick={() => assignToTeam(p.id, 0)}
                    disabled={!isInTeamA && teamAIds.length >= 2}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95",
                      isInTeamA
                        ? "bg-red-600 text-white shadow-md shadow-red-950 border border-red-400 ring-2 ring-red-400/40"
                        : teamAIds.length >= 2
                        ? "bg-slate-950/40 text-slate-600 border border-slate-800 opacity-30 cursor-not-allowed"
                        : "bg-slate-950 hover:bg-red-950/50 text-red-400 border border-red-500/40 hover:border-red-400"
                    )}
                  >
                    <span>🔴</span>
                    <span>{isInTeamA ? "Rossi ✓" : "Rossi"}</span>
                  </button>

                  {/* Tasto SQUADRA BLU */}
                  <button
                    type="button"
                    onClick={() => assignToTeam(p.id, 1)}
                    disabled={!isInTeamB && teamBIds.length >= 2}
                    className={clsx(
                      "px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1 active:scale-95",
                      isInTeamB
                        ? "bg-blue-600 text-white shadow-md shadow-blue-950 border border-blue-400 ring-2 ring-blue-400/40"
                        : teamBIds.length >= 2
                        ? "bg-slate-950/40 text-slate-600 border border-slate-800 opacity-30 cursor-not-allowed"
                        : "bg-slate-950 hover:bg-blue-950/50 text-blue-400 border border-blue-500/40 hover:border-blue-400"
                    )}
                  >
                    <span>🔵</span>
                    <span>{isInTeamB ? "Blu ✓" : "Blu"}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* ========================================================= */}
        {/* VISTA DESKTOP (hidden md:grid): CARD GRID CON AVATAR      */}
        {/* ========================================================= */}
        <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4 max-h-[50vh] overflow-y-auto pr-4 custom-scrollbar">
          {filteredPlayers.map(p => {
            const isInTeamA = teamAIds.includes(p.id);
            const isInTeamB = teamBIds.includes(p.id);
            const isSelected = isInTeamA || isInTeamB;
            
            let pairColorValue = "";
            let teamName = "";
            let roleInMatch = "";
            
            if (isSelected) {
                if (isInTeamA) {
                    pairColorValue = "#ef4444"; // red-500
                    teamName = "SQUADRA ROSSA";
                    if (resolvedA) {
                      roleInMatch = resolvedA.goalkeeperId === p.id ? "🛡️ Porta" : "⚔️ Attacco";
                    }
                } else if (isInTeamB) {
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
                    "w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-colors overflow-hidden",
                    !isSelected && "bg-slate-800 text-slate-400"
                  )}
                  style={isSelected ? { backgroundColor: pairColorValue, color: "#fff" } : {}}
                >
                  {p.avatarUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={`/players/${p.avatarUrl}`} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    p.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div 
                   className={clsx("font-bold text-sm", !isSelected && "text-slate-400")}
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

      {/* SELETTORE FORMATO SFIDA */}
      <div className="bg-slate-900/90 border border-slate-700/80 rounded-3xl p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 sm:w-6 sm:h-6 text-purple-400" />
          </div>
          <div>
            <div className="text-sm sm:text-base font-black text-white uppercase tracking-wider">Formato della Sfida</div>
            <div className="text-xs text-slate-400">
              {matchFormat === "single" 
                ? "⚡ Partita Secca: chi conquista il 1° set vince subito la sfida." 
                : "🏆 Al Meglio delle 3: vince la squadra che conquista per prima 2 partite."}
            </div>
          </div>
        </div>

        <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto">
          <button
            type="button"
            onClick={() => setMatchFormat("single")}
            className={clsx(
              "flex-1 md:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2",
              matchFormat === "single"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg scale-100"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Zap className="w-4 h-4" />
            <span>Partita Secca (1 Set)</span>
          </button>
          <button
            type="button"
            onClick={() => setMatchFormat("bo3")}
            className={clsx(
              "flex-1 md:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2",
              matchFormat === "bo3"
                ? "bg-purple-600 text-white shadow-lg shadow-purple-950/50 scale-100"
                : "text-slate-400 hover:text-white"
            )}
          >
            <Trophy className="w-4 h-4" />
            <span>Al Meglio delle 3 (Bo3)</span>
          </button>
        </div>
      </div>

      {/* TASTO AVVIO SFIDA */}
      <button 
        onClick={handleStart}
        disabled={isSubmitting || teamAIds.length !== 2 || teamBIds.length !== 2}
        className="w-full bg-gradient-to-r from-red-500 to-blue-500 hover:from-red-400 hover:to-blue-400 disabled:opacity-40 disabled:cursor-not-allowed text-white font-black text-xl sm:text-3xl py-5 sm:py-8 rounded-3xl shadow-2xl flex items-center justify-center gap-3 sm:gap-4 transition-all active:scale-[0.99]"
      >
        <PlayCircle className="w-8 h-8 sm:w-10 sm:h-10 shrink-0" />
        <span>{isSubmitting ? "AVVIO IN CORSO..." : "AVVIA SFIDA AL VOLO!"}</span>
      </button>

      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
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
