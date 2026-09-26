"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { addPlayerToTournament, removePlayerFromTournament, startTournament, closeRegistrations, togglePlayerPayment, respondToRegistrationRequest } from "@/app/actions/tournamentActions";
import { createPlayer } from "@/app/actions/matchActions";
import { Users, Swords, AlertTriangle, UserPlus, X, Calendar, Banknote, Trophy, ArrowLeft, CheckCircle2, Circle, Share2, Inbox, MessageSquare, Check, Ban } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";
import RoleIcon from "@/components/RoleIcon";
import TournamentRulebook from "@/components/TournamentRulebook";

export default function TournamentLobby({ tournament, allPlayers }: { tournament: any, allPlayers: any[] }) {
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [fixedPairs, setFixedPairs] = useState<string[][]>([]);
  const registrations = tournament.registrations || [];
  const registeredIds = registrations.map((r: any) => r.playerId);
  const availablePlayers = allPlayers.filter(p => !registeredIds.includes(p.id));
  const isReady = tournament.status === "ready_to_draw";

  const [newPlayerName, setNewPlayerName] = useState("");
  const [newPlayerRole, setNewPlayerRole] = useState("entrambi");
  const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);
  const [showDebtorsModal, setShowDebtorsModal] = useState(false);

  const router = useRouter();
  useEffect(() => {
    // Poll for new inbox requests every 5 seconds if not ready
    if (isReady) return;
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [isReady, router]);

  const pendingRequests = (tournament.registrationRequests || []).filter((r: any) => r.status === "pending");


  const handleAdd = async () => {
    if (!selectedPlayerId) return;
    await addPlayerToTournament(tournament.id, selectedPlayerId);
    setSelectedPlayerId("");
  };

  const handleRemove = async (id: string) => {
    await removePlayerFromTournament(tournament.id, id);
  };

  const handleCreatePlayer = async () => {
    if (!newPlayerName.trim()) return;
    const res = await createPlayer(newPlayerName, newPlayerRole);
    if ('error' in res) {
      alert(res.error);
      return;
    }
    await addPlayerToTournament(tournament.id, res.id);
    setNewPlayerName("");
    setNewPlayerRole("entrambi");
    setIsCreatingPlayer(false);
  };


  const handleCloseRegistrations = async () => {
    const unpaidCount = registrations.filter((r: any) => !r.hasPaid).length;
    if (unpaidCount > 0) {
      const missingAmount = unpaidCount * (tournament.pricePerPlayer || 0);
      const confirm = window.confirm(`ATTENZIONE: Mancano ${missingAmount}€ nella cassa (ci sono ${unpaidCount} giocatori che non hanno pagato).\n\nSei sicuro di voler chiudere le iscrizioni comunque?`);
      if (!confirm) return;
    }
    await closeRegistrations(tournament.id);
  };


  const handleStart = async () => {
    if (tournament.type === "coppie_fisse") {
      const validPairs = fixedPairs.filter(p => p.length === 2);
      if (validPairs.length * 2 !== registrations.length) {
        alert("Devi formare tutte le squadre prima di avviare il torneo!");
        return;
      }
      await startTournament(tournament.id, { fixedPairs: validPairs });
    } else {
      await startTournament(tournament.id);
    }
  };

  const handleTogglePayment = async (playerId: string, currentStatus: boolean) => {
    await togglePlayerPayment(tournament.id, playerId, !currentStatus);
  };

  // Explanations logic
  const getFormatDescription = () => {
    switch (tournament.format) {
      case "eliminazione_diretta":
        return "Le squadre si sfidano in partite secche. Chi perde è fuori, chi vince avanza fino alla finale.";
      case "doppia_eliminazione":
        return "Ogni squadra ha una 'doppia vita'. Se perdi la prima volta finisci nel tabellone dei perdenti (Losers Bracket) da cui puoi ancora risalire e vincere il torneo. Alla seconda sconfitta sei definitivamente eliminato.";
      case "gironi_eliminazione":
        return "Fase a gironi (Round Robin) in cui tutti sfidano tutti nel proprio gruppo. Le migliori classificate passano alla fase finale a eliminazione diretta.";
      default:
        return "";
    }
  };

  const getTypeDescription = () => {
    switch (tournament.type) {
      case "sorteggio_ruoli":
        return "I giocatori vengono divisi in due urne (Attaccanti e Difensori) in base al loro ruolo preferito. L'urna elettronica sorteggerà le coppie bilanciando un attaccante e un difensore per ogni squadra.";
      case "sorteggio_integrale":
        return "Tutti i giocatori in un'unica urna. Le coppie sono formate in modo completamente casuale.";
      case "coppie_fisse":
        return "Le coppie si presentano già formate (es. amici storici). Nella lobby, aggiungi i singoli giocatori: il sistema li accoppierà casualmente tra loro se selezioni questo formato (adattato per la Lobby).";
      default:
        return "";
    }
  };

  const registeredCount = registrations.length;
  const maxPlayers = (tournament.maxTeams || 8) * 2;
  const isPowerOfTwo = (registeredCount / 2) > 0 && Math.log2(registeredCount / 2) % 1 === 0;
  const canStart = registeredCount >= 4 && (tournament.format === "gironi_eliminazione" || isPowerOfTwo);

  return (
    <div className="flex flex-col gap-8 w-full">
      {/* BACK & PROMO BUTTONS */}
      <div className="flex justify-between items-center">
        <Link href="/tournaments" className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors font-bold">
          <ArrowLeft className="w-5 h-5" /> Torna ai Tornei
        </Link>
        <Link href={`/tournaments/${tournament.id}/promo`} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/50 rounded-xl transition-colors font-bold">
          Locandina Pubblica <Share2 className="w-4 h-4" />
        </Link>
      </div>

      {/* HEADER INFO */}
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Users className="w-48 h-48 text-purple-500" />
        </div>
        
        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400 uppercase tracking-widest mb-6">
          {tournament.name}
        </h1>
        <div className="flex flex-wrap gap-6 mb-8 text-slate-300 relative z-10">
          {tournament.startDate && (
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <Calendar className="w-5 h-5 text-purple-400" />
              <span className="font-medium">{new Date(tournament.startDate).toLocaleString('it-IT', { dateStyle: 'short', timeStyle: 'short' })}</span>
            </div>
          )}
          {tournament.pricePerPlayer != null && (
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <Banknote className="w-5 h-5 text-emerald-400" />
              <span className="font-medium">{tournament.pricePerPlayer} € <span className="text-slate-500 text-sm">/ gioc.</span></span>
            </div>
          )}
                    <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
            <Users className="w-5 h-5 text-blue-400" />
            <span className="font-medium">{tournament.maxTeams} Squadre <span className="text-slate-500 text-sm">({tournament.maxTeams * 2} gioc.)</span></span>
          </div>
          {tournament.prizes && (
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-medium">{tournament.prizes}</span>
            </div>
          )}
        </div>
        
        <TournamentRulebook tournament={tournament} />
      </div>

      
      {/* CREA NUOVO GIOCATORE RAPIDO */}
      {!isReady && (
        <div className="mb-8 bg-slate-900 p-6 rounded-3xl border border-slate-700 shadow-xl flex flex-col md:flex-row items-center gap-4">
          <h3 className="text-white font-bold whitespace-nowrap flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-emerald-400" /> Nuovo:
          </h3>
          <input
            type="text"
            placeholder="Nome (Es. Mario)"
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            className="flex-1 bg-slate-800 border border-slate-600 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500"
          />
          <select 
            value={newPlayerRole}
            onChange={(e) => setNewPlayerRole(e.target.value)}
            className="bg-slate-800 border border-slate-600 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500"
          >
            <option value="attaccante">Attaccante</option>
            <option value="portiere">Difensore</option>
            <option value="entrambi">Entrambi</option>
          </select>
          <button 
            onClick={handleCreatePlayer}
            disabled={!newPlayerName.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Salva & Aggiungi
          </button>
        </div>
      )}

      
      {/* INBOX RICHIESTE */}
      {!isReady && pendingRequests.length > 0 && (
        <div className="mb-8 bg-purple-900/30 p-6 rounded-3xl border border-purple-500/50 shadow-xl shadow-purple-500/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Inbox className="text-purple-400" /> Inbox Iscrizioni ({pendingRequests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req: any) => (
              <div key={req.id} className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center font-bold text-xl text-purple-400 shrink-0">
                    {req.playerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{req.playerName}</div>
                    <div className="flex items-center gap-1 text-sm text-slate-400 font-bold uppercase tracking-wider">
                      <RoleIcon role={req.preferredRole} className="w-4 h-4" /> {req.preferredRole}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button 
                    onClick={() => respondToRegistrationRequest(req.id, "accepted", "Pagami alla cassa prima di iniziare.")} 
                    disabled={registeredCount >= maxPlayers}
                    className="flex flex-col items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed text-emerald-400 border border-emerald-500/30 rounded-xl py-2 px-1 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">
                      {registeredCount >= maxPlayers ? "Torneo Pieno" : "Accetta"}
                    </span>
                  </button>
                  <button onClick={() => respondToRegistrationRequest(req.id, "rejected", "Mi spiace, torneo pieno!")} className="flex flex-col items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl py-2 px-1 transition-colors">
                    <Ban className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">Rifiuta<br/>(Torneo Pieno)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* APPELLO GRID */}
      <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-xl mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-emerald-400" /> Appello Giocatori Presenti
          </h2>
          {!isReady && (
            <div className="flex gap-4">
              <button 
                type="button" 
                onClick={async () => {
                  // Aggiunge tutti i non iscritti
                  for (const p of availablePlayers) {
                    await addPlayerToTournament(tournament.id, p.id);
                  }
                }} 
                className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2 bg-slate-900 rounded-lg transition-colors"
              >
                Seleziona Tutti
              </button>
              <button 
                type="button" 
                onClick={async () => {
                  // Rimuove tutti
                  for (const id of registeredIds) {
                    await removePlayerFromTournament(tournament.id, id);
                  }
                }} 
                className="text-sm font-bold text-slate-400 hover:text-white px-4 py-2 bg-slate-900 rounded-lg transition-colors"
              >
                Azzera
              </button>
            </div>
          )}
        </div>

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 flex flex-col justify-center h-full">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="text-slate-400 font-bold uppercase tracking-wider text-xs mb-1">Stato Iscrizioni</div>
                <span className="text-slate-200 font-bold text-lg">Giocatori Presenti</span>
              </div>
              <div className="text-5xl font-black text-white leading-none">
                {registeredCount}
              </div>
            </div>
            
            <div className="flex items-center gap-3 pt-4 border-t border-slate-700/50 mt-auto">
              <div className="flex-1 bg-blue-500/10 rounded-lg p-2 flex flex-col items-center justify-center border border-blue-500/20">
                <span className="text-[10px] text-blue-400/70 font-bold uppercase tracking-widest mb-0.5">Difensori</span>
                <span className="text-blue-400 font-black text-lg">
                  {registrations.filter((r: any) => allPlayers.find(p => p.id === r.playerId)?.preferredRole === "portiere").length}
                </span>
              </div>
              <div className="flex-1 bg-red-500/10 rounded-lg p-2 flex flex-col items-center justify-center border border-red-500/20">
                <span className="text-[10px] text-red-400/70 font-bold uppercase tracking-widest mb-0.5">Attaccanti</span>
                <span className="text-red-400 font-black text-lg">
                  {registrations.filter((r: any) => allPlayers.find(p => p.id === r.playerId)?.preferredRole === "attaccante").length}
                </span>
              </div>
              <div className="flex-1 bg-purple-500/10 rounded-lg p-2 flex flex-col items-center justify-center border border-purple-500/20">
                <span className="text-[10px] text-purple-400/70 font-bold uppercase tracking-widest mb-0.5">Entrambi</span>
                <span className="text-purple-400 font-black text-lg">
                  {registrations.filter((r: any) => allPlayers.find(p => p.id === r.playerId)?.preferredRole === "entrambi").length}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-700 flex flex-col justify-center">
            <div className="flex items-center justify-between mb-4">
              <div className="text-slate-400 font-bold uppercase tracking-wider text-xs flex items-center gap-2">
                <Banknote className="w-4 h-4 text-emerald-400" /> Cassa Torneo
              </div>
              <div className="text-emerald-400 font-black text-2xl">{tournament.pricePerPlayer || 0}€ <span className="text-xs text-slate-500">/cad</span></div>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Attesi</span>
                <span className="text-white font-black text-xl">{((tournament.maxTeams * 2) * (tournament.pricePerPlayer || 0))}€</span>
              </div>
              <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-900/50 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-emerald-500/70 font-bold uppercase tracking-widest mb-1">Incassati</span>
                <span className="text-emerald-400 font-black text-xl">{(registrations.filter((r: any) => r.hasPaid).length * (tournament.pricePerPlayer || 0))}€</span>
              </div>
              <div className="bg-red-950/40 p-3 rounded-xl border border-red-900/50 flex flex-col items-center justify-center text-center">
                <span className="text-[10px] text-red-500/70 font-bold uppercase tracking-widest mb-1">Mancanti</span>
                <span className="text-red-400 font-black text-xl">{(((tournament.maxTeams * 2) - registrations.filter((r: any) => r.hasPaid).length) * (tournament.pricePerPlayer || 0))}€</span>
                <button onClick={() => setShowDebtorsModal(true)} className="mt-1 text-[9px] bg-red-500/20 hover:bg-red-500/40 text-red-300 px-2 py-0.5 rounded border border-red-500/30 uppercase font-bold transition">Vedi chi manca</button>
              </div>
            </div>
          </div>
        </div>


        <div className="flex flex-wrap justify-center gap-4 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
          {allPlayers.map(p => {
            const registration = registrations.find((r: any) => r.playerId === p.id);
            const isSelected = !!registration;
            
            let containerClass = "opacity-40 hover:opacity-70 scale-95 hover:scale-100";
            let circleClass = "bg-slate-800 text-slate-500 grayscale opacity-80";
            let nameClass = "text-slate-500 font-medium";
            
            if (isSelected) {
              containerClass = "opacity-100 scale-100";
              circleClass = "bg-emerald-500 text-emerald-950 ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] grayscale-0 opacity-100";
              nameClass = "text-white font-black drop-shadow-[0_0_5px_rgba(255,255,255,0.3)]";
            }

            return (
              <div 
                key={p.id}
                onClick={() => {
                  if (isReady) return;
                  if (isSelected) {
                    handleRemove(p.id);
                  } else {
                    addPlayerToTournament(tournament.id, p.id);
                  }
                }}
                className={clsx(
                  "cursor-pointer transition-all duration-300 flex flex-col items-center justify-start gap-1 text-center select-none py-2 w-28",
                  !isReady && "active:scale-90",
                  isReady && !isSelected && "opacity-20 cursor-not-allowed",
                  containerClass
                )}
              >
                <div className={clsx("w-16 h-16 rounded-full flex items-center justify-center text-xl transition-all duration-300 overflow-hidden mb-1", circleClass)}>
                  {p.avatarUrl ? (
                    <img src={`/players/${p.avatarUrl}`} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    p.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className={clsx("text-lg leading-tight truncate w-full px-1 transition-all duration-300", nameClass)}>
                  {p.name}
                </div>
                <div className="flex justify-center transition-all duration-300">
                  <RoleIcon role={p.preferredRole} className="w-5 h-5 opacity-80" />
                </div>
                {isSelected && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      handleTogglePayment(p.id, registration.hasPaid); 
                    }}
                    className={clsx(
                      "mt-2 w-max px-4 mx-auto flex justify-center items-center gap-1 py-1 rounded-lg text-[10px] uppercase tracking-wider font-bold transition-all border",
                      registration.hasPaid 
                        ? "bg-emerald-900/50 border-emerald-500/30 text-emerald-400 hover:bg-emerald-800/60" 
                        : "bg-red-900/50 border-red-500/30 text-red-400 hover:bg-red-800/60"
                    )}
                  >
                    {registration.hasPaid ? 'Pagato' : 'Non Pagato'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
{isReady && tournament.type === "coppie_fisse" && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-orange-500/50 mb-6 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="text-orange-400" /> Forma le Squadre (Tocca 2 giocatori per accoppiarli)
              </h3>
              
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                {registrations.map((r: any) => {
                  const p = r.player;
                  let isSelected = false;
                  let pairColorValue = "";
                  
                  const pairIndex = fixedPairs.findIndex(pair => pair.includes(p.id));
                  if (pairIndex !== -1) {
                    isSelected = true;
                    const cssColors = [
                        "#10b981", "#3b82f6", "#f97316", "#ec4899", "#a855f7", "#06b6d4", "#f43f5e", "#eab308"
                    ];
                    pairColorValue = cssColors[pairIndex % cssColors.length];
                  }

                  return (
                    <div 
                      key={p.id}
                      onClick={() => {
                        const id = p.id;
                        const pIdx = fixedPairs.findIndex(pair => pair.includes(id));
                        if (pIdx !== -1) {
                          const newPairs = [...fixedPairs];
                          newPairs[pIdx] = newPairs[pIdx].filter(pId => pId !== id);
                          setFixedPairs(newPairs.filter(pair => pair.length > 0));
                        } else {
                          const openPairIndex = fixedPairs.findIndex(pair => pair.length === 1);
                          if (openPairIndex !== -1) {
                            const newPairs = [...fixedPairs];
                            newPairs[openPairIndex] = [...newPairs[openPairIndex], id];
                            setFixedPairs(newPairs);
                          } else {
                            setFixedPairs([...fixedPairs, [id]]);
                          }
                        }
                      }}
                      className={clsx(
                        "cursor-pointer border-2 rounded-xl p-4 transition-all flex flex-col items-center justify-center gap-2 text-center select-none active:scale-95",
                        isSelected ? "border-solid" : "border-dashed border-slate-700 hover:border-slate-500 bg-slate-800/50"
                      )}
                      style={pairColorValue ? { 
                          borderColor: pairColorValue, 
                          backgroundColor: pairColorValue + "33" 
                      } : {}}
                    >
                      <div className="font-bold" style={pairColorValue ? { color: "#fff" } : { color: "#94a3b8" }}>
                        {p.name}
                      </div>
                      {pairColorValue && (
                        <div className="text-[10px] font-black uppercase px-2 py-1 rounded bg-black/50 text-white mt-1">
                          Squadra {pairIndex + 1}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-end">
            {!isReady ? (
              <button
                onClick={handleCloseRegistrations}
                disabled={!canStart}
                className={clsx(
                  "px-8 py-4 rounded-xl font-black text-lg tracking-widest uppercase flex items-center gap-3 transition-all",
                  canStart 
                    ? "bg-gradient-to-r from-blue-500 to-indigo-500 hover:scale-105 text-white shadow-lg shadow-blue-500/25" 
                    : "bg-slate-800 text-slate-500 cursor-not-allowed"
                )}
              >
                Chiudi Iscrizioni
              </button>
            ) : (
              <button
                onClick={handleStart}
                className="px-8 py-4 rounded-xl font-black text-lg tracking-widest uppercase flex items-center gap-3 transition-all bg-gradient-to-r from-purple-500 to-pink-500 hover:scale-105 text-white shadow-lg shadow-purple-500/25"
              >
                <Swords className="w-6 h-6 animate-pulse" /> Avvia Cerimonia Sorteggio
              </button>
            )}
          </div>
          
          {!isReady && !canStart && registeredCount > 0 && (
            <p className="text-right text-orange-400 text-sm mt-2 flex items-center justify-end gap-1">
              <AlertTriangle className="w-4 h-4" /> 
              Devi raggiungere ESATTAMENTE {maxPlayers} iscritti ({maxPlayers/2} squadre) per poter avviare il torneo, in modo da creare un tabellone perfetto.
            </p>
          )}

      {/* DEBTORS MODAL */}
      {showDebtorsModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-red-400 flex items-center gap-2"><AlertTriangle className="w-5 h-5"/> Lista Debitori</h3>
              <button onClick={() => setShowDebtorsModal(false)} className="p-2 hover:bg-slate-800 rounded-xl text-slate-400"><X className="w-5 h-5"/></button>
            </div>
            
            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar flex flex-col gap-2">
              {registrations.filter((r: any) => !r.hasPaid).length === 0 ? (
                <p className="text-emerald-400 text-center py-8 font-bold">Tutti gli iscritti attuali hanno pagato!</p>
              ) : (
                registrations.filter((r: any) => !r.hasPaid).map((r: any) => {
                  const p = allPlayers.find(player => player.id === r.playerId);
                  if (!p) return null;
                  return (
                    <div key={r.playerId} className="flex items-center justify-between p-3 bg-slate-800 rounded-xl border border-slate-700">
                      <div className="font-bold text-slate-300">{p.name}</div>
                      <button 
                        onClick={() => handleTogglePayment(p.id, false)}
                        className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-bold text-xs uppercase tracking-wider rounded-lg transition"
                      >
                        Segna Pagato
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
