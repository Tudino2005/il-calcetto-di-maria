const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

const oldFormatoBlock = `      <div>
        <label className="block text-slate-400 font-bold uppercase tracking-wider text-sm mb-4">Formato Torneo</label>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col flex-1 bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 shadow-inner">
            <label className="flex items-center justify-between w-full cursor-pointer group">
              <input type="radio" name="formatRadio" value="eliminazione_diretta" checked={format === "eliminazione_diretta"} onChange={() => setFormat("eliminazione_diretta")} className="w-5 h-5 accent-purple-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={clsx("text-sm font-bold tracking-wider block text-right transition-colors", format === "eliminazione_diretta" ? "text-purple-400" : "text-slate-300 group-hover:text-white")}>Eliminazione Diretta</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Tabellone classico. Chi perde è fuori.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="formatRadio" value="doppia_eliminazione" checked={format === "doppia_eliminazione"} onChange={() => setFormat("doppia_eliminazione")} className="w-5 h-5 accent-purple-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={clsx("text-sm font-bold tracking-wider block text-right transition-colors", format === "doppia_eliminazione" ? "text-purple-400" : "text-slate-300 group-hover:text-white")}>Doppia Eliminazione</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Tabellone Winners e Losers Bracket.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="formatRadio" value="gironi_eliminazione" checked={format === "gironi_eliminazione"} onChange={() => setFormat("gironi_eliminazione")} className="w-5 h-5 accent-purple-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={clsx("text-sm font-bold tracking-wider block text-right transition-colors", format === "gironi_eliminazione" ? "text-purple-400" : "text-slate-300 group-hover:text-white")}>Gironi + Eliminazione</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Fase a gruppi seguita da playoff stile Mondiali.</span>
              </div>
            </label>
          </div>`;

const newFormatoBlock = `      <div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col flex-1 bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 shadow-inner">
            <h3 className="text-lg font-black text-slate-300 mb-6">Formato</h3>
            <label className="flex items-center justify-between w-full cursor-pointer group">
              <input type="radio" name="formatRadio" value="eliminazione_diretta" checked={format === "eliminazione_diretta"} onChange={() => setFormat("eliminazione_diretta")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={clsx("text-sm font-bold tracking-wider block text-right transition-colors", format === "eliminazione_diretta" ? "text-emerald-400" : "text-slate-300 group-hover:text-white")}>Eliminazione Diretta</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Tabellone classico. Chi perde è fuori.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="formatRadio" value="doppia_eliminazione" checked={format === "doppia_eliminazione"} onChange={() => setFormat("doppia_eliminazione")} className="w-5 h-5 accent-amber-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={clsx("text-sm font-bold tracking-wider block text-right transition-colors", format === "doppia_eliminazione" ? "text-amber-400" : "text-slate-300 group-hover:text-white")}>Doppia Eliminazione</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Tabellone Winners e Losers Bracket.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="formatRadio" value="gironi_eliminazione" checked={format === "gironi_eliminazione"} onChange={() => setFormat("gironi_eliminazione")} className="w-5 h-5 accent-blue-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={clsx("text-sm font-bold tracking-wider block text-right transition-colors", format === "gironi_eliminazione" ? "text-blue-400" : "text-slate-300 group-hover:text-white")}>Gironi + Eliminazione</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Fase a gruppi seguita da playoff stile Mondiali.</span>
              </div>
            </label>
          </div>`;

code = code.replace(oldFormatoBlock.trim(), newFormatoBlock.trim());

fs.writeFileSync('src/components/TournamentForm.tsx', code);
