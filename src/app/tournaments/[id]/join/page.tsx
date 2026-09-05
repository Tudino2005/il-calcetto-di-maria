"use client";

import { useState, useEffect } from "react";
import { createRegistrationRequest, getRegistrationRequest } from "@/app/actions/tournamentActions";
import RoleIcon from "@/components/RoleIcon";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";

export default function JoinTournamentPage() {
  const params = useParams();
  const tournamentId = params.id as string;
  
  const [name, setName] = useState("");
  const [role, setRole] = useState("attaccante");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [status, setStatus] = useState<"pending" | "accepted" | "rejected" | null>(null);
  const [adminReply, setAdminReply] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let interval: any;
    if (requestId && status === "pending") {
      interval = setInterval(async () => {
        const req = await getRegistrationRequest(requestId);
        if (req && req.status !== "pending") {
          setStatus(req.status as any);
          setAdminReply(req.adminReply);
          clearInterval(interval);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [requestId, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    const req = await createRegistrationRequest(tournamentId, name.trim(), role);
    setRequestId(req.id);
    setStatus(req.status as any);
    setIsSubmitting(false);
  };

  if (status === "pending") {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
        <Loader2 className="w-16 h-16 text-emerald-400 animate-spin mb-6" />
        <h1 className="text-2xl font-bold text-white mb-2">Richiesta Inviata!</h1>
        <p className="text-slate-400 max-w-sm">
          Attendi che Maria approvi la tua iscrizione dal suo tablet. Non chiudere questa pagina...
        </p>
      </main>
    );
  }

  if (status === "accepted") {
    return (
      <main className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center p-6 text-center">
        <CheckCircle2 className="w-24 h-24 text-emerald-400 mb-6" />
        <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Sei Dentro!</h1>
        <p className="text-emerald-200 mb-8 font-medium text-lg">La tua iscrizione è stata confermata.</p>
        
        {adminReply && (
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-emerald-500/30 max-w-sm">
            <h3 className="text-emerald-400 font-bold mb-2 uppercase tracking-wider text-sm">Messaggio da Maria:</h3>
            <p className="text-white text-lg">"{adminReply}"</p>
          </div>
        )}
      </main>
    );
  }

  if (status === "rejected") {
    return (
      <main className="min-h-screen bg-red-950 flex flex-col items-center justify-center p-6 text-center">
        <XCircle className="w-24 h-24 text-red-400 mb-6" />
        <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-widest">Iscrizione Rifiutata</h1>
        
        {adminReply && (
          <div className="bg-slate-900/50 p-6 rounded-2xl border border-red-500/30 max-w-sm mt-6">
            <h3 className="text-red-400 font-bold mb-2 uppercase tracking-wider text-sm">Messaggio da Maria:</h3>
            <p className="text-white text-lg">"{adminReply}"</p>
          </div>
        )}
        
        <button onClick={() => { setStatus(null); setRequestId(null); }} className="mt-8 text-red-400 underline underline-offset-4">
          Torna indietro
        </button>
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
