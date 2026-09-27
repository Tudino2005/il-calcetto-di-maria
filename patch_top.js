const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

const oldTop = `
      {/* ROW 1 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-5">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Nome Torneo</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="es. Coppa dei Campioni 2026"
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500 transition-colors"
            required
          />
        </div>
        <div className="md:col-span-4">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">N° Squadre</label>
          <select value={maxTeams} onChange={(e) => setMaxTeams(Number(e.target.value))} className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500">
            <option value={4}>4 Squadre (8 Giocatori)</option>
            <option value={8}>8 Squadre (16 Giocatori)</option>
            <option value={16}>16 Squadre (32 Giocatori)</option>
            <option value={32}>32 Squadre (64 Giocatori)</option>
            <option value={64}>64 Squadre (128 Giocatori)</option>
          </select>
        </div>
        <div className="md:col-span-3">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Costo a Persona</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={pricePerPlayer}
            onChange={(e) => setPricePerPlayer(e.target.value)}
            placeholder="es. 10"
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
      </div>

      {/* ROW 2 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        <div className="md:col-span-3">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Inizio</label>
          <input
            type="datetime-local"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
        <div className="md:col-span-3">
          <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Fine</label>
          <input
            type="datetime-local"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
          />
        </div>
        
        {type !== "coppie_fisse" ? (
          <>
            <div className="md:col-span-3">
              <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Sorteggio</label>
              <input
                type="datetime-local"
                value={drawDate}
                onChange={(e) => setDrawDate(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Premi</label>
              <input
                type="text"
                value={prizes}
                onChange={(e) => setPrizes(e.target.value)}
                placeholder="es. 1° Coppa, 2° Cena"
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
              />
            </div>
          </>
        ) : (
          <div className="md:col-span-6">
            <label className="block text-slate-400 font-bold mb-2 uppercase tracking-wider text-sm">Premi</label>
            <input
              type="text"
              value={prizes}
              onChange={(e) => setPrizes(e.target.value)}
              placeholder="es. 1° Coppa, 2° Cena"
              className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl py-3 px-4 focus:outline-none focus:border-purple-500"
            />
          </div>
        )}
      </div>`;

const newTop = `
      <div className="bg-slate-800/40 border border-slate-700/80 rounded-2xl p-6 shadow-inner flex flex-col gap-6">
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

code = code.replace(oldTop.trim(), newTop.trim());
fs.writeFileSync('src/components/TournamentForm.tsx', code);
