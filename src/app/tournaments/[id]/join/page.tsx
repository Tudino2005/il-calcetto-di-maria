"use client";

import { useState, useEffect } from "react";
import { createRegistrationRequest } from "@/app/actions/tournamentActions";
import RoleIcon from "@/components/RoleIcon";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function JoinTournamentPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("attaccante");
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    await createRegistrationRequest(tournamentId, name.trim(), role);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-24 h-24 text-emerald-400 mb-6" />
        <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-widest">Richiesta Inviata!</h1>
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-emerald-500/30 max-w-md">
          <p className="text-emerald-200 text-lg leading-relaxed">
            Abbiamo inviato la tua richiesta a Maria. 
            <br/><br/>
            Poiché le iscrizioni richiedono tempo, non c'è bisogno di aspettare in questa pagina. 
            Controlla la locandina ufficiale nei prossimi giorni per vedere se il tuo nome è tra i partecipanti ufficiali!
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="bg-slate-900 p-8 rounded-3xl border border-slate-700 w-full max-w-md shadow-2xl">
        <h1 className="text-3xl font-black text-white mb-2 text-center uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-400">
          Iscriviti
        </h1>
        <p className="text-slate-400 text-center mb-8">Inserisci i tuoi dati per richiedere l'iscrizione al torneo.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-slate-400 mb-2 font-bold uppercase tracking-wider text-sm">Il tuo nome</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-800 border border-slate-600 rounded-xl p-4 text-white text-xl focus:border-emerald-500 focus:outline-none"
              placeholder="Es. Mario"
            />
          </div>
          
          <div>
            <label className="block text-slate-400 mb-3 font-bold uppercase tracking-wider text-sm">Ruolo</label>
            <div className="grid grid-cols-3 gap-3">
              <label className="cursor-pointer">
                <input type="radio" name="role" value="attaccante" checked={role === "attaccante"} onChange={() => setRole("attaccante")} className="peer sr-only" />
                <div className="h-full flex flex-col items-center justify-center gap-2 bg-slate-800 border-2 border-slate-700 p-3 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white transition-all text-slate-500">
                  <RoleIcon role="attaccante" className="w-10 h-10" />
                  <span className="text-xs font-bold uppercase">Attaccante</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="role" value="portiere" checked={role === "portiere"} onChange={() => setRole("portiere")} className="peer sr-only" />
                <div className="h-full flex flex-col items-center justify-center gap-2 bg-slate-800 border-2 border-slate-700 p-3 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white transition-all text-slate-500">
                  <RoleIcon role="portiere" className="w-10 h-10" />
                  <span className="text-xs font-bold uppercase">Portiere</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="role" value="entrambi" checked={role === "entrambi"} onChange={() => setRole("entrambi")} className="peer sr-only" />
                <div className="h-full flex flex-col items-center justify-center gap-2 bg-slate-800 border-2 border-slate-700 p-3 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white transition-all text-slate-500">
                  <RoleIcon role="entrambi" className="w-10 h-10" />
                  <span className="text-xs font-bold uppercase">Entrambi</span>
                </div>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white font-black uppercase tracking-widest py-5 rounded-xl text-lg transition-colors mt-4 shadow-lg shadow-emerald-500/20"
          >
            {isSubmitting ? "Invio..." : "Invia Richiesta"}
          </button>
        </form>
      </div>
    </main>
  );
}
