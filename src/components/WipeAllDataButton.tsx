"use client";

import { wipeAllData } from "@/app/actions/tournamentActions";
import { AlertOctagon } from "lucide-react";
import { useState } from "react";

export default function WipeAllDataButton() {
  const [isWiping, setIsWiping] = useState(false);

  const handleWipe = async () => {
    const pin = prompt("ATTENZIONE DISTRUZIONE TOTALE! Questa azione cancellerà per sempre TUTTI i Giocatori, le Partite e i Tornei.\n\nPer confermare l'eliminazione dell'Anagrafica completa, scrivi il PIN di sicurezza (MARIA2026):");
    
    if (pin === "MARIA2026") {
      setIsWiping(true);
      try {
        await wipeAllData(pin);
        alert("Distruzione completata. Database raso al suolo (Giocatori inclusi)!");
      } catch (e) {
        alert("Errore durante la pulizia totale.");
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
      className="mt-12 opacity-30 hover:opacity-100 transition-opacity bg-black text-red-600 border-2 border-red-900 hover:bg-red-950 hover:border-red-500 px-6 py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 w-full max-w-sm mx-auto shadow-[0_0_20px_rgba(220,38,38,0.2)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)]"
    >
      <AlertOctagon className="w-5 h-5 animate-pulse" />
      {isWiping ? "Distruzione in corso..." : "PERICOLO: ELIMINA TUTTI I GIOCATORI"}
    </button>
  );
}
