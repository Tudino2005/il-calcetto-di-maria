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
          <div className="flex flex-col-reverse group mt-2 mb-4">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-emerald-400 transition-colors">Nome (Nickname)</span>
            <input 
              type="text" 
              value={name}
              onChange={e => setName(e.target.value)}
              required 
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
              placeholder="Es. Mario Rossi (se esiste, verrà aggiornato)"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-4 mb-6">
            <div className="flex flex-col-reverse group">
              <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-emerald-400 transition-colors">Video Sigla (.mp4)</span>
              <input 
                type="text" 
                value={mediaUrl}
                onChange={e => setMediaUrl(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
                placeholder="es. enzo.mp4"
              />
            </div>
            <div className="flex flex-col-reverse group">
              <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-emerald-400 transition-colors">Foto Card (.jpeg)</span>
              <input 
                type="text" 
                value={avatarUrl}
                onChange={e => setAvatarUrl(e.target.value)}
                className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
                placeholder="es. Enzo.jpeg"
              />
            </div>
          </div>
          <div>
            <label className="block text-slate-400 mb-4 font-medium uppercase tracking-wider text-[10px]">Ruolo Preferito</label>
            <div className="flex flex-col sm:flex-row gap-6 sm:gap-8">
              <label className="flex items-center justify-start gap-3 cursor-pointer group">
                <input type="radio" name="role" value="attaccante" checked={preferredRole === "attaccante"} onChange={() => setPreferredRole("attaccante")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
                <div className="flex items-center gap-2">
                  <RoleIcon role="attaccante" className={`w-5 h-5 transition-colors ${preferredRole === 'attaccante' ? 'text-emerald-400 opacity-100' : 'text-slate-500 opacity-80 group-hover:text-emerald-400 group-hover:opacity-100'}`} />
                  <span className={`text-sm font-bold tracking-wider block text-left transition-colors ${preferredRole === 'attaccante' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'}`}>Attaccante</span>
                </div>
              </label>
              
              <label className="flex items-center justify-start gap-3 cursor-pointer group">
                <input type="radio" name="role" value="portiere" checked={preferredRole === "portiere"} onChange={() => setPreferredRole("portiere")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
                <div className="flex items-center gap-2">
                  <RoleIcon role="portiere" className={`w-5 h-5 transition-colors ${preferredRole === 'portiere' ? 'text-emerald-400 opacity-100' : 'text-slate-500 opacity-80 group-hover:text-emerald-400 group-hover:opacity-100'}`} />
                  <span className={`text-sm font-bold tracking-wider block text-left transition-colors ${preferredRole === 'portiere' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'}`}>Difensore</span>
                </div>
              </label>

              <label className="flex items-center justify-start gap-3 cursor-pointer group">
                <input type="radio" name="role" value="entrambi" checked={preferredRole === "entrambi"} onChange={() => setPreferredRole("entrambi")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
                <div className="flex items-center gap-2">
                  <RoleIcon role="entrambi" className={`w-5 h-5 transition-colors ${preferredRole === 'entrambi' ? 'text-emerald-400 opacity-100' : 'text-slate-500 opacity-80 group-hover:text-emerald-400 group-hover:opacity-100'}`} />
                  <span className={`text-sm font-bold tracking-wider block text-left transition-colors ${preferredRole === 'entrambi' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'}`}>Entrambi</span>
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
