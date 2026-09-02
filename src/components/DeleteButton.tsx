"use client";
import { Trash2 } from "lucide-react";

export default function DeleteButton() {
  return (
    <button 
      type="submit" 
      onClick={(e) => {
        if (!window.confirm("ATTENZIONE: Vuoi davvero eliminare questo giocatore? Verranno cancellate per sempre anche tutte le sue squadre e le partite libere che ha giocato!")) {
          e.preventDefault();
        }
      }}
      className="flex items-center gap-2 px-3 py-2 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white rounded-lg transition-colors text-sm font-bold border border-red-500/30"
      title="Elimina Giocatore"
    >
      <Trash2 className="w-4 h-4" /> Elimina
    </button>
  );
}
