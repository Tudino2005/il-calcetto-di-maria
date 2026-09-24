"use client";

import { Trash2 } from "lucide-react";
import { deleteTournament } from "@/app/actions/tournamentActions";

export default function DeleteTournamentButton({ tournamentId }: { tournamentId: string }) {
  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (confirm("Sei sicuro di voler eliminare questo torneo per i test? Questa azione è irreversibile e cancellerà tutti i match collegati!")) {
      await deleteTournament(tournamentId);
    }
  };

  return (
    <button 
      onClick={handleDelete}
      className="ml-4 p-2 bg-red-900/30 hover:bg-red-600 text-red-500 hover:text-white rounded-lg transition-colors border border-red-900/50"
      title="Elimina Torneo"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}
