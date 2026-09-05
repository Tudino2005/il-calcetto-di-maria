"use client";

import { Inbox, Check, Ban } from "lucide-react";
import RoleIcon from "@/components/RoleIcon";
import { respondToRegistrationRequest } from "@/app/actions/tournamentActions";

export default function GlobalInbox({ requests }: { requests: any[] }) {
  if (!requests || requests.length === 0) return null;

  return (
    <div className="mb-12 w-full max-w-4xl bg-purple-900/30 p-8 rounded-3xl border border-purple-500/50 shadow-xl shadow-purple-500/10">
      <h2 className="text-2xl font-black text-white flex items-center justify-center gap-3 mb-6 uppercase tracking-widest">
        <Inbox className="w-8 h-8 text-purple-400" /> Inbox Iscrizioni ({requests.length})
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requests.map((req: any) => (
          <div key={req.id} className="bg-slate-900 border border-slate-700 p-5 rounded-2xl flex flex-col justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-500/20 rounded-full flex items-center justify-center font-black text-2xl text-purple-400 shrink-0">
                {req.playerName.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-black text-white text-xl">{req.playerName}</div>
                <div className="flex flex-col gap-1 mt-1">
                  <span className="text-xs text-purple-400 font-bold uppercase tracking-wider bg-purple-900/40 px-2 py-0.5 rounded w-fit">
                    Torneo: {req.tournament.name}
                  </span>
                  <div className="flex items-center gap-1 text-sm text-slate-400 font-bold uppercase tracking-wider">
                    <RoleIcon role={req.preferredRole} className="w-4 h-4" /> {req.preferredRole}
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <button 
                onClick={async () => {
                  if(confirm(`Accettare ${req.playerName} in ${req.tournament.name}?`)) {
                    await respondToRegistrationRequest(req.id, "accepted", "Pagami alla cassa prima di iniziare.");
                  }
                }} 
                className="flex flex-col items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl py-3 px-1 transition-colors"
              >
                <Check className="w-6 h-6" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-center">Accetta<br/>(Ricorda Pagamento)</span>
              </button>
              <button 
                onClick={async () => {
                  if(confirm(`Rifiutare ${req.playerName}?`)) {
                    await respondToRegistrationRequest(req.id, "rejected", "Mi spiace, torneo pieno!");
                  }
                }} 
                className="flex flex-col items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl py-3 px-1 transition-colors"
              >
                <Ban className="w-6 h-6" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-center">Rifiuta<br/>(Torneo Pieno)</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
