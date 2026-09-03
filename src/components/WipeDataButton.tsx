"use client";

import { wipeTournamentData } from "@/app/actions/tournamentActions";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";

export default function WipeDataButton() {
  const [isWiping, setIsWiping] = useState(false);

  const handleWipe = async () => {
    const pin = prompt("ATTENZIONE! Questa azione cancellerà per sempre TUTTE le partite e i tornei (i giocatori rimarranno salvi).\n\nPer confermare, scrivi il PIN di sicurezza (MARIA2026):");
    
    if (pin === "MARIA2026") {
      setIsWiping(true);
      try {
        await wipeTournamentData(pin);
        alert("Dati cancellati con successo. Il database è pulito!");
      } catch (e) {
        alert("Errore durante la pulizia.");
      }
      setIsWiping(false);
    } else if (pin !== null) {
      alert("PIN errato. Operazione annullata.");
    }
  };

  return (
    <button 
      onClick={handleWipe}
      disabled={isWiping}
      className="mt-12 opacity-50 hover:opacity-100 transition-opacity bg-red-950/30 text-red-500 border border-red-900/50 hover:bg-red-900/50 hover:border-red-500 px-6 py-3 rounded-full text-sm font-bold flex items-center gap-2 mx-auto"
    >
      <AlertTriangle className="w-4 h-4" />
      {isWiping ? "Pulizia in corso..." : "Pulisci Dati di Prova"}
    </button>
  );
}
