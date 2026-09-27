const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

const oldTypeBlock = `      <div>
        <label className="block text-slate-400 font-bold mb-4 uppercase tracking-wider text-sm">Modalità Composizione Squadre</label>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col flex-1 bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 shadow-inner">
            <label className="flex items-center justify-between w-full cursor-pointer group">
              <input type="radio" name="typeRadio" value="sorteggio_ruoli" checked={type === "sorteggio_ruoli"} onChange={() => setType("sorteggio_ruoli")} className="w-5 h-5 accent-purple-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={clsx("text-sm font-bold tracking-wider block text-right transition-colors", type === "sorteggio_ruoli" ? "text-purple-400" : "text-slate-300 group-hover:text-white")}>Sorteggio per Ruoli</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Crea coppie unendo un attaccante e un difensore.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="typeRadio" value="sorteggio_integrale" checked={type === "sorteggio_integrale"} onChange={() => setType("sorteggio_integrale")} className="w-5 h-5 accent-purple-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={clsx("text-sm font-bold tracking-wider block text-right transition-colors", type === "sorteggio_integrale" ? "text-purple-400" : "text-slate-300 group-hover:text-white")}>Sorteggio Integrale</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Composizione puramente casuale.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="typeRadio" value="coppie_fisse" checked={type === "coppie_fisse"} onChange={() => setType("coppie_fisse")} className="w-5 h-5 accent-purple-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={clsx("text-sm font-bold tracking-wider block text-right transition-colors", type === "coppie_fisse" ? "text-purple-400" : "text-slate-300 group-hover:text-white")}>Coppie Fisse</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Squadre già formate a priori.</span>
              </div>
            </label>
          </div>`;

const newTypeBlock = `      <div>
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex flex-col flex-1 bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 shadow-inner">
            <h3 className="text-lg font-black text-slate-300 mb-6">Composizione Squadre</h3>
            <label className="flex items-center justify-between w-full cursor-pointer group">
              <input type="radio" name="typeRadio" value="sorteggio_ruoli" checked={type === "sorteggio_ruoli"} onChange={() => setType("sorteggio_ruoli")} className="w-5 h-5 accent-emerald-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={clsx("text-sm font-bold tracking-wider block text-right transition-colors", type === "sorteggio_ruoli" ? "text-emerald-400" : "text-slate-300 group-hover:text-white")}>Sorteggio per Ruoli</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Crea coppie unendo un attaccante e un difensore.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="typeRadio" value="sorteggio_integrale" checked={type === "sorteggio_integrale"} onChange={() => setType("sorteggio_integrale")} className="w-5 h-5 accent-amber-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={clsx("text-sm font-bold tracking-wider block text-right transition-colors", type === "sorteggio_integrale" ? "text-amber-400" : "text-slate-300 group-hover:text-white")}>Sorteggio Integrale</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Composizione puramente casuale.</span>
              </div>
            </label>
            
            <label className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50 cursor-pointer group">
              <input type="radio" name="typeRadio" value="coppie_fisse" checked={type === "coppie_fisse"} onChange={() => setType("coppie_fisse")} className="w-5 h-5 accent-blue-500 shrink-0 cursor-pointer" />
              <div className="flex flex-col items-end pl-4">
                <span className={clsx("text-sm font-bold tracking-wider block text-right transition-colors", type === "coppie_fisse" ? "text-blue-400" : "text-slate-300 group-hover:text-white")}>Coppie Fisse</span>
                <span className="text-[10px] text-slate-400 text-right leading-tight mt-0.5">Squadre già formate a priori.</span>
              </div>
            </label>
          </div>`;

code = code.replace(oldTypeBlock.trim(), newTypeBlock.trim());

fs.writeFileSync('src/components/TournamentForm.tsx', code);
