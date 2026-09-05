"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import RoleIcon from "@/components/RoleIcon";
import { createPlayer } from "@/app/actions/matchActions";
import { useRouter } from "next/navigation";

export default function PlayerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [preferredRole, setPreferredRole] = useState("attaccante");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");

    const res = await createPlayer(name, preferredRole);
    if ('error' in res) {
      setError(res.error);
      return;
    }

    setName("");
    setPreferredRole("attaccante");
    router.refresh();
  };

  return (
    <section className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
      <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
        <UserPlus className="w-6 h-6" /> Aggiungi Giocatore
      </h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && (
          <div className="bg-red-500/20 border border-red-500 text-red-400 p-3 rounded-lg text-sm font-bold">
            {error}
          </div>
        )}
        <div>
          <label className="block text-slate-400 mb-2 font-medium">Nome (Nickname)</label>
          <input 
            type="text" 
            value={name}
            onChange={e => setName(e.target.value)}
            required 
            className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white text-lg focus:border-emerald-500 focus:outline-none"
            placeholder="Es. Mario Rossi"
          />
        </div>
        <div>
          <label className="block text-slate-400 mb-4 font-medium">Ruolo Preferito</label>
          <div className="grid grid-cols-3 gap-4">
            <label className="cursor-pointer">
              <input type="radio" name="role" value="attaccante" checked={preferredRole === "attaccante"} onChange={() => setPreferredRole("attaccante")} className="peer sr-only" />
              <div className="h-full flex flex-col items-center justify-center gap-2 bg-slate-900 border-2 border-slate-700 text-center text-slate-400 p-4 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                <RoleIcon role="attaccante" className="w-12 h-12" />
                <span className="text-sm">Attaccante</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="role" value="portiere" checked={preferredRole === "portiere"} onChange={() => setPreferredRole("portiere")} className="peer sr-only" />
              <div className="h-full flex flex-col items-center justify-center gap-2 bg-slate-900 border-2 border-slate-700 text-center text-slate-400 p-4 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                <RoleIcon role="portiere" className="w-12 h-12" />
                <span className="text-sm">Portiere</span>
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" name="role" value="entrambi" checked={preferredRole === "entrambi"} onChange={() => setPreferredRole("entrambi")} className="peer sr-only" />
              <div className="h-full flex flex-col items-center justify-center gap-2 bg-slate-900 border-2 border-slate-700 text-center text-slate-400 p-4 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                <RoleIcon role="entrambi" className="w-12 h-12" />
                <span className="text-sm">Entrambi</span>
              </div>
            </label>
          </div>
        </div>
        <button 
          type="submit" 
          className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
        >
          Salva Giocatore
        </button>
      </form>
    </section>
  );
}
