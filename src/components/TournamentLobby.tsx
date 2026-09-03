"use client";

import { useState } from "react";
import { addPlayerToTournament, removePlayerFromTournament, startTournament, closeRegistrations, togglePlayerPayment } from "@/app/actions/tournamentActions";
import { createPlayer } from "@/app/actions/matchActions";
import { Users, Swords, AlertTriangle, UserPlus, X, Calendar, Banknote, Trophy, ArrowLeft, CheckCircle2, Circle, Share2 } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

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
    const player = await createPlayer(newPlayerName, newPlayerRole);
    await addPlayerToTournament(tournament.id, player.id);
    setNewPlayerName("");
    setNewPlayerRole("entrambi");
    setIsCreatingPlayer(false);
  };

  const handleCloseRegistrations = async () => {
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
        return "I giocatori vengono divisi in due urne (Attaccanti e Portieri) in base al loro ruolo preferito. L'urna elettronica sorteggerà le coppie bilanciando un attaccante e un portiere per ogni squadra.";
      case "sorteggio_integrale":
        return "Tutti i giocatori in un'unica urna. Le coppie sono formate in modo completamente casuale.";
      case "coppie_fisse":
        return "Le coppie si presentano già formate (es. amici storici). Nella lobby, aggiungi i singoli giocatori: il sistema li accoppierà casualmente tra loro se selezioni questo formato (adattato per la Lobby).";
      default:
        return "";
    }
  };

  const registeredCount = registrations.length;
  const isPowerOfTwo = (registeredCount / 2) > 0 && Math.log2(registeredCount / 2) % 1 === 0;
  const canStart = registeredCount >= 4 && (tournament.format === "gironi_eliminazione" || isPowerOfTwo);

  return (
    <div className="flex flex-col gap-8 w-full max-w-5xl mx-auto">
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
          {tournament.prizes && (
            <div className="flex items-center gap-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <Trophy className="w-5 h-5 text-yellow-400" />
              <span className="font-medium">{tournament.prizes}</span>
            </div>
          )}
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 relative z-10">
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-purple-400 font-bold uppercase tracking-wider mb-2 text-sm">Formato Scelto: {tournament.format.replace("_", " ")}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{getFormatDescription()}</p>
          </div>
          
          <div className="bg-slate-800 p-6 rounded-2xl border border-slate-700">
            <h3 className="text-blue-400 font-bold uppercase tracking-wider mb-2 text-sm">Composizione: {tournament.type.replace("_", " ")}</h3>
            <p className="text-slate-300 text-sm leading-relaxed">{getTypeDescription()}</p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* ADD PLAYER COLUMN */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-slate-900 p-6 rounded-3xl border border-slate-700 sticky top-8">
            {isReady ? (
              <div className="text-center p-4 bg-purple-900/20 border border-purple-500 rounded-xl mb-4">
                <h3 className="text-purple-400 font-bold mb-2">Iscrizioni Chiuse</h3>
                <p className="text-sm text-slate-300">Il torneo è pronto per il sorteggio. I giocatori non possono più essere modificati.</p>
              </div>
            ) : (
            <>
            <h2 className="text-xl font-bold text-white mb-6 uppercase tracking-widest flex items-center gap-2">
              <UserPlus className="text-emerald-400" /> Aggiungi
            </h2>
            
            <div className="flex flex-col gap-4">
              <select 
                value={selectedPlayerId} 
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Seleziona Giocatore --</option>
                {availablePlayers.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.preferredRole})</option>
                ))}
              </select>
              
              <button 
                onClick={handleAdd}
                disabled={!selectedPlayerId}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Iscrivi Giocatore
              </button>
            </div>

            <div className="mt-4">
              {!isCreatingPlayer ? (
                <button 
                  onClick={() => setIsCreatingPlayer(true)}
                  className="w-full text-emerald-400 hover:text-emerald-300 text-sm font-bold transition-colors"
                >
                  + Crea Nuovo Giocatore
                </button>
              ) : (
                <div className="flex flex-col gap-3 p-4 bg-slate-800 rounded-xl border border-slate-700 mt-2">
                  <input
                    type="text"
                    placeholder="Nome"
                    value={newPlayerName}
                    onChange={(e) => setNewPlayerName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg py-2 px-3 focus:outline-none focus:border-emerald-500"
                  />
                  <select 
                    value={newPlayerRole} 
                    onChange={(e) => setNewPlayerRole(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 text-white rounded-lg py-2 px-3 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="entrambi">Ruolo Libero</option>
                    <option value="attaccante">Attaccante</option>
                    <option value="portiere">Portiere</option>
                  </select>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setIsCreatingPlayer(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-lg"
                    >
                      Annulla
                    </button>
                    <button 
                      onClick={handleCreatePlayer}
                      disabled={!newPlayerName.trim()}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-bold py-2 rounded-lg"
                    >
                      Salva & Iscrivi
                    </button>
                  </div>
                </div>
              )}
            </div>
            
            <hr className="border-slate-700 my-6" />
            
            <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-xl">
              <h4 className="text-purple-400 font-bold mb-2">Requisiti Avvio</h4>
              <ul className="text-sm text-slate-400 list-disc list-inside space-y-1">
                <li>Almeno 4 giocatori (2 squadre)</li>
                {tournament.format !== "gironi_eliminazione" && <li>Il numero di squadre create deve essere una potenza di 2 (2, 4, 8, 16...)</li>}
              </ul>
            </div>
            </>
            )}
          </div>
        </div>

        {/* REGISTERED LIST */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold text-white uppercase tracking-widest">
              Giocatori Iscritti
            </h2>
            <span className="px-4 py-1 bg-slate-800 text-slate-300 font-bold rounded-full border border-slate-700">
              Totale: {registeredCount}
            </span>
          </div>

          <div className="bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-lg">
            {registrations.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p>Nessun giocatore ancora iscritto.</p>
              </div>
            ) : (
              <ul className="divide-y divide-slate-800">
                {registrations.map((r: any) => (
                  <li key={r.id} className="flex justify-between items-center p-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-400 border border-slate-700">
                        {r.player.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-white">{r.player.name}</div>
                        <div className="text-xs text-slate-500 uppercase tracking-wider">{r.player.preferredRole}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <button 
                        onClick={() => handleTogglePayment(r.player.id, r.hasPaid)}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-bold transition-all ${r.hasPaid ? 'bg-emerald-900/30 border-emerald-500/50 text-emerald-400' : 'bg-slate-800 border-slate-600 text-slate-400 hover:border-slate-500'}`}
                      >
                        {r.hasPaid ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                        {r.hasPaid ? 'Pagato' : 'Non Pagato'}
                      </button>
                      
                      {!isReady && (
                        <button 
                          onClick={() => handleRemove(r.player.id)}
                          className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>


          {isReady && tournament.type === "coppie_fisse" && (
            <div className="bg-slate-900 p-6 rounded-2xl border border-orange-500/50 mb-6 shadow-[0_0_20px_rgba(249,115,22,0.1)]">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Users className="text-orange-400" /> Forma le Squadre (Tocca 2 giocatori per accoppiarli)
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
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
                            newPairs[openPairIndex].push(id);
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
              Il numero di giocatori attuale ({registeredCount}) genererà {registeredCount / 2} squadre. Non rispetta i requisiti di formato.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
