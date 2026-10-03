"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import RoleIcon from "@/components/RoleIcon";
import { createPlayer } from "@/app/actions/matchActions";
import { useRouter } from "next/navigation";

export default function PlayerForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [preferredRole, setPreferredRole] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [error, setError] = useState("");
  const [showRoleModal, setShowRoleModal] = useState(false);

  const performSave = async (role: string) => {
    if (!name.trim() || !role) return;
    setError("");

    const res = await createPlayer(name, role, mediaUrl.trim() || undefined, avatarUrl.trim() || undefined);
    if ('error' in res) {
      setError(res.error as string);
      return;
    }

    setName("");
    setPreferredRole("");
    setMediaUrl("");
    setAvatarUrl("");
    setShowRoleModal(false);
    router.refresh();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    if (!preferredRole) {
      setShowRoleModal(true);
      return;
    }

    performSave(preferredRole);
  };

  return (
    <>
      <section className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">
        <h2 className="text-xl font-bold text-emerald-400 mb-6 flex items-center gap-2">
          <UserPlus className="w-6 h-6" /> Aggiungi o Modifica Giocatore
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
              placeholder="Es. Mario Rossi (se esiste, verrà aggiornato)"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-2 font-medium">Video Sigla (.mp4)</label>
              <input 
                type="text" 
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white text-base focus:border-emerald-500 focus:outline-none"
                placeholder="es. enzo.mp4"
              />
            </div>
            <div>
              <label className="block text-slate-400 mb-2 font-medium">Foto Card (.jpeg)</label>
              <input 
                type="text" 
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-600 rounded-xl p-4 text-white text-base focus:border-emerald-500 focus:outline-none"
                placeholder="es. Enzo.jpeg"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-4 font-medium">Ruolo Preferito</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="cursor-pointer">
                <input type="radio" name="role" value="attaccante" checked={preferredRole === "attaccante"} onChange={() => setPreferredRole("attaccante")} className="peer sr-only" />
                <div className="flex items-center justify-center gap-2 bg-slate-900 border-2 border-slate-700 text-slate-400 py-3 px-2 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                  <RoleIcon role="attaccante" className="w-6 h-6 shrink-0" />
                  <span className="text-sm">Attaccante</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="role" value="portiere" checked={preferredRole === "portiere"} onChange={() => setPreferredRole("portiere")} className="peer sr-only" />
                <div className="flex items-center justify-center gap-2 bg-slate-900 border-2 border-slate-700 text-slate-400 py-3 px-2 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                  <RoleIcon role="portiere" className="w-6 h-6 shrink-0" />
                  <span className="text-sm">Difensore</span>
                </div>
              </label>
              <label className="cursor-pointer">
                <input type="radio" name="role" value="entrambi" checked={preferredRole === "entrambi"} onChange={() => setPreferredRole("entrambi")} className="peer sr-only" />
                <div className="flex items-center justify-center gap-2 bg-slate-900 border-2 border-slate-700 text-slate-400 py-3 px-2 rounded-xl peer-checked:bg-emerald-500/20 peer-checked:border-emerald-500 peer-checked:text-white hover:border-slate-500 transition-all font-bold">
                  <RoleIcon role="entrambi" className="w-6 h-6 shrink-0" />
                  <span className="text-sm">Entrambi</span>
                </div>
              </label>
            </div>
          </div>
          <button 
            type="submit" 
            className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-xl text-lg transition-colors"
          >
            Salva / Aggiorna Giocatore
          </button>
        </form>
      </section>

      {showRoleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-800 rounded-3xl border border-slate-700 shadow-2xl p-6 sm:p-8 max-w-sm w-full flex flex-col gap-6 animate-in zoom-in-95 duration-200">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
              </div>
              <h3 className="text-2xl font-black text-white text-center mb-2">Attenzione!</h3>
              <p className="text-slate-400 text-center text-sm">
                Devi selezionare un ruolo per <strong>{name}</strong> prima di salvare. Clicca un'opzione qui sotto:
              </p>
            </div>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => performSave("attaccante")} className="flex items-center justify-center gap-3 bg-slate-900 border border-slate-700 text-slate-300 py-4 px-4 rounded-xl hover:bg-emerald-500/20 hover:border-emerald-500 hover:text-white transition-all font-bold">
                <RoleIcon role="attaccante" className="w-8 h-8 shrink-0" />
                <span className="text-lg">Attaccante</span>
              </button>
              <button onClick={() => performSave("portiere")} className="flex items-center justify-center gap-3 bg-slate-900 border border-slate-700 text-slate-300 py-4 px-4 rounded-xl hover:bg-emerald-500/20 hover:border-emerald-500 hover:text-white transition-all font-bold">
                <RoleIcon role="portiere" className="w-8 h-8 shrink-0" />
                <span className="text-lg">Difensore</span>
              </button>
              <button onClick={() => performSave("entrambi")} className="flex items-center justify-center gap-3 bg-slate-900 border border-slate-700 text-slate-300 py-4 px-4 rounded-xl hover:bg-emerald-500/20 hover:border-emerald-500 hover:text-white transition-all font-bold">
                <RoleIcon role="entrambi" className="w-8 h-8 shrink-0" />
                <span className="text-lg">Entrambi</span>
              </button>
            </div>
            
            <button onClick={() => setShowRoleModal(false)} className="mt-2 text-slate-500 hover:text-white transition font-bold py-2">
              Annulla
            </button>
          </div>
        </div>
      )}
    </>
  );
}
