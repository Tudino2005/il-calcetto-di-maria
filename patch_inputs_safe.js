const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

const targetStr = `      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 shadow-inner flex flex-col gap-6">
        <h3 className="text-lg font-black text-slate-300 mb-2">Informazioni Generali</h3>
        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-5">
            <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-xs">Nome Torneo</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="es. Coppa dei Campioni 2026"
              className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 transition-colors shadow-inner"
              required
            />
          </div>
          <div className="md:col-span-4">
            <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-xs">N° Squadre</label>
            <select value={maxTeams} onChange={(e) => setMaxTeams(Number(e.target.value))} className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 shadow-inner">
              <option value={4}>4 Squadre (8 Giocatori)</option>
              <option value={8}>8 Squadre (16 Giocatori)</option>
              <option value={16}>16 Squadre (32 Giocatori)</option>
              <option value={32}>32 Squadre (64 Giocatori)</option>
              <option value={64}>64 Squadre (128 Giocatori)</option>
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-xs">Costo a Persona</label>
            <input
              type="number"
              min="0"
              step="0.5"
              value={pricePerPlayer}
              onChange={(e) => setPricePerPlayer(e.target.value)}
              placeholder="es. 10"
              className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 shadow-inner"
            />
          </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-3">
            <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-xs">Inizio</label>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 shadow-inner"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-xs">Fine</label>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 shadow-inner"
            />
          </div>
          
          {type !== "coppie_fisse" ? (
            <>
              <div className="md:col-span-3">
                <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-xs">Sorteggio</label>
                <input
                  type="datetime-local"
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                  className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>
              <div className="md:col-span-3">
                <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-xs">Premi</label>
                <input
                  type="text"
                  value={prizes}
                  onChange={(e) => setPrizes(e.target.value)}
                  placeholder="es. 1° Coppa, 2° Cena"
                  className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 shadow-inner"
                />
              </div>
            </>
          ) : (
            <div className="md:col-span-6">
              <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-xs">Premi</label>
              <input
                type="text"
                value={prizes}
                onChange={(e) => setPrizes(e.target.value)}
                placeholder="es. 1° Coppa, 2° Cena"
                className="w-full bg-slate-900/80 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 shadow-inner"
              />
            </div>
          )}
        </div>
      </div>`;

const replaceStr = `      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-8 shadow-inner flex flex-col gap-10">
        <h3 className="text-lg font-black text-slate-300 -mb-4">Informazioni Generali</h3>
        
        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-5 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Nome Torneo</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Inserisci Nome..."
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
              required
            />
          </div>
          <div className="md:col-span-4 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">N° Squadre</span>
            <select value={maxTeams} onChange={(e) => setMaxTeams(Number(e.target.value))} className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none cursor-pointer appearance-none transition-colors">
              <option value={4} className="bg-slate-900">4 Squadre (8 Giocatori)</option>
              <option value={8} className="bg-slate-900">8 Squadre (16 Giocatori)</option>
              <option value={16} className="bg-slate-900">16 Squadre (32 Giocatori)</option>
              <option value={32} className="bg-slate-900">32 Squadre (64 Giocatori)</option>
              <option value={64} className="bg-slate-900">64 Squadre (128 Giocatori)</option>
            </select>
          </div>
          <div className="md:col-span-3 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Costo a Persona (€)</span>
            <input
              type="number"
              min="0"
              step="0.5"
              value={pricePerPlayer}
              onChange={(e) => setPricePerPlayer(e.target.value)}
              placeholder="0"
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-xl p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
            />
          </div>
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-3 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Data Inizio</span>
            <input
              type="datetime-local"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-lg p-0 focus:ring-0 focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert opacity-90 transition-colors"
            />
          </div>
          <div className="md:col-span-3 flex flex-col-reverse group">
            <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Data Fine</span>
            <input
              type="datetime-local"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-lg p-0 focus:ring-0 focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert opacity-90 transition-colors"
            />
          </div>
          
          {type !== "coppie_fisse" ? (
            <>
              <div className="md:col-span-3 flex flex-col-reverse group">
                <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Data Sorteggio</span>
                <input
                  type="datetime-local"
                  value={drawDate}
                  onChange={(e) => setDrawDate(e.target.value)}
                  className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-lg p-0 focus:ring-0 focus:outline-none cursor-pointer [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert opacity-90 transition-colors"
                />
              </div>
              <div className="md:col-span-3 flex flex-col-reverse group">
                <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Premi in Palio</span>
                <input
                  type="text"
                  value={prizes}
                  onChange={(e) => setPrizes(e.target.value)}
                  placeholder="es. Coppa e Cena"
                  className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-lg p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
                />
              </div>
            </>
          ) : (
            <div className="md:col-span-6 flex flex-col-reverse group">
              <span className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold group-hover:text-purple-400 transition-colors">Premi in Palio</span>
              <input
                type="text"
                value={prizes}
                onChange={(e) => setPrizes(e.target.value)}
                placeholder="es. Coppa e Cena"
                className="w-full bg-transparent border-0 border-b border-transparent text-white font-bold text-lg p-0 focus:ring-0 focus:outline-none placeholder-slate-600 transition-colors"
              />
            </div>
          )}
        </div>
      </div>`;

if (!code.includes(targetStr)) {
   console.log("Could not find target string exactly.");
} else {
   code = code.replace(targetStr, replaceStr);
   fs.writeFileSync('src/components/TournamentForm.tsx', code);
   console.log("Success");
}
