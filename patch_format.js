const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

const oldFormatBlock = `
          <div className="flex flex-col gap-3 flex-1">
            <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", format === "eliminazione_diretta" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
              <input type="radio" name="formatRadio" value="eliminazione_diretta" checked={format === "eliminazione_diretta"} onChange={() => setFormat("eliminazione_diretta")} className="w-5 h-5 accent-purple-500" />
              <div>
                <span className="text-white font-bold block">Eliminazione Diretta</span>
                <span className="text-slate-500 text-sm">Tabellone classico. Chi perde è fuori.</span>
              </div>
            </label>
            <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", format === "doppia_eliminazione" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
              <input type="radio" name="formatRadio" value="doppia_eliminazione" checked={format === "doppia_eliminazione"} onChange={() => setFormat("doppia_eliminazione")} className="w-5 h-5 accent-purple-500" />
              <div>
                <span className="text-white font-bold block">Doppia Eliminazione</span>
                <span className="text-slate-500 text-sm">Tabellone Winners e Losers Bracket.</span>
              </div>
            </label>
            <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", format === "gironi_eliminazione" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
              <input type="radio" name="formatRadio" value="gironi_eliminazione" checked={format === "gironi_eliminazione"} onChange={() => setFormat("gironi_eliminazione")} className="w-5 h-5 accent-purple-500" />
              <div>
                <span className="text-white font-bold block">Gironi + Eliminazione</span>
                <span className="text-slate-500 text-sm">Fase a gruppi seguita da playoff stile Mondiali.</span>
              </div>
            </label>
          </div>
`;

const newFormatBlock = `
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
          </div>
`;

code = code.replace(oldFormatBlock.trim(), newFormatBlock.trim());


const oldTypeBlock = `
          <div className="flex flex-col gap-3 flex-1">
            <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", type === "sorteggio_ruoli" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
              <input type="radio" name="typeRadio" value="sorteggio_ruoli" checked={type === "sorteggio_ruoli"} onChange={() => setType("sorteggio_ruoli")} className="w-5 h-5 accent-purple-500" />
              <div>
                <span className="text-white font-bold block">Sorteggio per Ruoli</span>
                <span className="text-slate-500 text-sm">Crea coppie equilibrate unendo un attaccante e un difensore.</span>
              </div>
            </label>
            <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", type === "sorteggio_integrale" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
              <input type="radio" name="typeRadio" value="sorteggio_integrale" checked={type === "sorteggio_integrale"} onChange={() => setType("sorteggio_integrale")} className="w-5 h-5 accent-purple-500" />
              <div>
                <span className="text-white font-bold block">Sorteggio Integrale</span>
                <span className="text-slate-500 text-sm">Composizione puramente casuale.</span>
              </div>
            </label>
            <label className={clsx("flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors", type === "coppie_fisse" ? "bg-purple-900/20 border-purple-500" : "bg-slate-900 border-slate-700 hover:border-slate-500")}>
              <input type="radio" name="typeRadio" value="coppie_fisse" checked={type === "coppie_fisse"} onChange={() => setType("coppie_fisse")} className="w-5 h-5 accent-purple-500" />
              <div>
                <span className="text-white font-bold block">Coppie Fisse</span>
                <span className="text-slate-500 text-sm">Squadre già formate a priori.</span>
              </div>
            </label>
          </div>
`;

const newTypeBlock = `
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
          </div>
`;

code = code.replace(oldTypeBlock.trim(), newTypeBlock.trim());


fs.writeFileSync('src/components/TournamentForm.tsx', code);
