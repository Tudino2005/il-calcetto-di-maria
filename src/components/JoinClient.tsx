"use client";

import { useState } from "react";
import { createRegistrationRequest } from "@/app/actions/tournamentActions";
import RoleIcon from "@/components/RoleIcon";
import { CheckCircle2, AlertTriangle, Calendar, Banknote, ShieldAlert, ChevronRight, MessageCircle, Camera, Euro } from "lucide-react";
import Link from "next/link";

export default function JoinClient({ tournament }: { tournament: any }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("attaccante");
  
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsSubmitting(true);
    await createRegistrationRequest(tournament.id, name.trim(), role);
    setIsSubmitted(true);
    setIsSubmitting(false);
  };

  const drawDateObj = tournament.drawDate ? new Date(tournament.drawDate) : null;
  const drawDateStr = drawDateObj ? drawDateObj.toLocaleDateString('it-IT') : 'Da definire';

  if (isSubmitted) {
    return (
      <main className="min-h-screen bg-slate-950 flex flex-col items-center p-6 pb-20">
        
        {/* SUCCESS HEADER */}
        <div className="flex flex-col items-center mt-10 mb-8 text-center animate-in slide-in-from-bottom-8 duration-500">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-12 h-12 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-widest mb-2">
            Richiesta Ricevuta!
          </h1>
          <p className="text-emerald-400 font-bold tracking-wider">
            Il tuo posto è in sospeso. Ora bloccalo.
          </p>
        </div>

        <div className="w-full max-w-md flex flex-col gap-6">
          
          {/* STEP 1: PAYMENT */}
          <div className="bg-slate-900 rounded-3xl border-2 border-emerald-500/30 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none"></div>
            
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0">
                <Euro className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-wider">Step 1: La Quota</h3>
                <p className="text-emerald-400 font-bold text-sm">Blocca il posto prima degli altri</p>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed relative z-10 mb-4">
              Per confermare ufficialmente la tua presenza, la quota d'ingresso è di <strong className="text-white">{tournament.pricePerPlayer || 50}€</strong>.
            </p>
            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-sm text-slate-400 relative z-10">
              Invia la quota tramite <strong>Satispay</strong>, <strong>PayPal</strong> o passa alla <strong>cassa del locale</strong> indicando come causale: <br/>
              <span className="text-white font-mono mt-2 block bg-slate-900 p-2 text-center rounded border border-slate-700">{name.toUpperCase()} - {tournament.name}</span>
            </div>
          </div>

          {/* STEP 2: FACEBOOK PHOTO */}
          <div className="bg-gradient-to-br from-blue-900/40 to-slate-900 rounded-3xl border-2 border-blue-500/30 p-6 shadow-xl relative overflow-hidden">
            
            <div className="flex items-center gap-4 mb-4 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center shrink-0">
                <MessageCircle className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-black uppercase tracking-wider">Step 2: La Figurina</h3>
                <p className="text-blue-400 font-bold text-sm">Entra nella grafica ufficiale</p>
              </div>
            </div>
            
            <p className="text-slate-300 text-sm leading-relaxed relative z-10 mb-6">
              Vogliamo farti apparire sulle TV del locale con stile! Invia un messaggio alla nostra Pagina Facebook ufficiale con la tua <strong>foto migliore</strong>.
            </p>
            
            <a href="https://www.facebook.com/profile.php?id=61594379083733" target="_blank" rel="noopener noreferrer" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-4 rounded-xl text-center flex items-center justify-center gap-3 transition-colors shadow-[0_0_20px_rgba(37,99,235,0.4)] relative z-10">
              <MessageCircle className="w-5 h-5" /> Apri Messenger
            </a>
          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 flex flex-col items-center p-4 py-10">
      
      {/* ESPORTS PASS HEADER */}
      <div className="w-full max-w-md bg-gradient-to-b from-purple-900/40 to-slate-900 rounded-t-[2.5rem] border-x border-t border-purple-500/30 p-8 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-purple-600"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-purple-500/20 blur-[50px] rounded-full pointer-events-none"></div>
        
        <div className="px-4 py-1 bg-purple-500/20 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">
          Official Entry Pass
        </div>
        
        <h1 className="text-3xl sm:text-4xl font-black text-white uppercase tracking-tight leading-none mb-6 drop-shadow-lg">
          {tournament.name}
        </h1>
        
        <div className="flex w-full gap-4">
          <div className="flex-1 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <Calendar className="w-5 h-5 text-purple-400 mx-auto mb-2" />
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Inizio</div>
            <div className="text-white font-bold">{drawDateStr}</div>
          </div>
          <div className="flex-1 bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            <Banknote className="w-5 h-5 text-emerald-400 mx-auto mb-2" />
            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1">Quota</div>
            <div className="text-emerald-400 font-black">{tournament.pricePerPlayer ? tournament.pricePerPlayer + '€' : 'Gratis'}</div>
          </div>
        </div>
      </div>

      {/* THE FORM CONTAINER */}
      <div className="w-full max-w-md bg-slate-900 rounded-b-[2.5rem] border-x border-b border-slate-700 p-8 shadow-2xl z-10 relative">
        
        {/* CORSA AL POSTO WARNING */}
        <div className="bg-orange-500/10 border border-orange-500/30 p-4 rounded-2xl mb-8 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <p className="text-orange-200/80 text-xs leading-relaxed">
            <strong className="text-orange-400 block mb-1">ATTENZIONE: Corsa al posto</strong>
            L'invio di questo modulo NON garantisce l'ingresso. Il tuo slot sarà bloccato ufficialmente SOLO al versamento della quota. Chi prima paga, prima gioca.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div>
            <label className="block text-slate-400 mb-2 font-bold uppercase tracking-wider text-xs ml-1">Nome sul Tabellone</label>
            <input 
              type="text" 
              required
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white text-lg font-bold focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all outline-none"
              placeholder="Es. Mario Rossi"
            />
          </div>
          
          <div>
            <label className="block text-slate-400 mb-3 font-bold uppercase tracking-wider text-xs ml-1">Il tuo Ruolo</label>
            <div className="grid grid-cols-3 gap-3">
              <label className="cursor-pointer group">
                <input type="radio" name="role" value="attaccante" checked={role === "attaccante"} onChange={() => setRole("attaccante")} className="peer sr-only" />
                <div className="h-full flex flex-col items-center justify-center gap-2 bg-slate-950 border border-slate-800 p-3 rounded-xl peer-checked:bg-purple-500/20 peer-checked:border-purple-500 peer-checked:text-white text-slate-500 transition-all">
                  <RoleIcon role="attaccante" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Attaccante</span>
                </div>
              </label>
              <label className="cursor-pointer group">
                <input type="radio" name="role" value="portiere" checked={role === "portiere"} onChange={() => setRole("portiere")} className="peer sr-only" />
                <div className="h-full flex flex-col items-center justify-center gap-2 bg-slate-950 border border-slate-800 p-3 rounded-xl peer-checked:bg-purple-500/20 peer-checked:border-purple-500 peer-checked:text-white text-slate-500 transition-all">
                  <RoleIcon role="portiere" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Difensore</span>
                </div>
              </label>
              <label className="cursor-pointer group">
                <input type="radio" name="role" value="entrambi" checked={role === "entrambi"} onChange={() => setRole("entrambi")} className="peer sr-only" />
                <div className="h-full flex flex-col items-center justify-center gap-2 bg-slate-950 border border-slate-800 p-3 rounded-xl peer-checked:bg-purple-500/20 peer-checked:border-purple-500 peer-checked:text-white text-slate-500 transition-all">
                  <RoleIcon role="entrambi" className="w-8 h-8 group-hover:scale-110 transition-transform" />
                  <span className="text-[10px] font-black uppercase tracking-wider">Entrambi</span>
                </div>
              </label>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isSubmitting}
            className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 disabled:opacity-50 text-white font-black uppercase tracking-[0.2em] py-5 rounded-xl text-sm transition-all mt-4 shadow-[0_0_20px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2"
          >
            {isSubmitting ? "Invio in corso..." : (
              <>Richiedi Pass <ChevronRight className="w-5 h-5" /></>
            )}
          </button>
        </form>

        {/* BLACKLIST WARNING */}
        <div className="mt-8 flex gap-3 items-start border-t border-slate-800 pt-6">
          <ShieldAlert className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-slate-500 text-[10px] leading-relaxed uppercase tracking-wider font-bold">
            <strong className="text-red-400 block mb-1">Codice d'Onore (No-Show)</strong>
            Inviando la richiesta ti impegni a partecipare. Le assenze ingiustificate comporteranno l'inserimento in Blacklist e il divieto di partecipazione ai tornei futuri.
          </p>
        </div>

      </div>
    </main>
  );
}
