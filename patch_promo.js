const fs = require('fs');
let code = fs.readFileSync('src/components/TVSlideshow.tsx', 'utf8');

const targetSection = \`              {/* LEFT COLUMN - INFO */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-8 rounded-[2rem] border border-slate-700 shadow-2xl">
                
                <div className="flex flex-wrap items-center gap-4 mb-6">
                  {iscritti < maxPlayers ? (
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 animate-pulse">
                      Iscrizioni Aperte
                    </div>
                  ) : (
                    <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-500/20 text-red-400 rounded-full font-bold uppercase tracking-widest border border-red-500/30">
                      Iscrizioni Chiuse (In Attesa)
                    </div>
                  )}
                  <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-800 text-slate-300 rounded-full font-bold uppercase tracking-widest border border-slate-700">
                    {missingText}
                  </div>
                </div>
                
                <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-4 line-clamp-1">
                  {t.name}
                </h2>
                
                {t.type !== 'coppie_fisse' && (
                  <div className="w-[70%] bg-gradient-to-r from-purple-600 to-fuchsia-600 p-6 rounded-3xl shadow-[0_0_40px_rgba(147,51,234,0.4)] mb-8 border border-purple-400 flex items-center justify-between animate-pulse-slow shrink-0">
                    <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-4 rounded-2xl">
                        <Calendar className="w-10 h-10 text-white" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="text-purple-100 font-bold uppercase tracking-widest text-xs">Evento Dal Vivo</span>
                        <span className="text-2xl font-black text-white uppercase leading-tight">Cerimonia Sorteggio<br/>Coppie e Calendario</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      {t.drawDate ? (
                        <>
                          <div className="text-2xl font-black text-white">{new Date(t.drawDate).toLocaleDateString('it-IT')}</div>
                          <div className="text-sm font-bold text-purple-200">alle {new Date(t.drawDate).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</div>
                        </>
                      ) : (
                        <div className="text-2xl font-black text-white">DA DEFINIRE</div>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-6 mb-6 w-[75%]">
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4 flex-1">
                    <Calendar className="w-10 h-10 text-blue-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Inizio Torneo</div>
                      <div className="text-xl font-bold whitespace-nowrap">{t.startDate ? new Date(t.startDate).toLocaleDateString('it-IT') : "Da Def."}</div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center gap-4 flex-1">
                    <Banknote className="w-10 h-10 text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-slate-500 font-bold uppercase text-xs tracking-wider">Costo a persona</div>
                      <div className="text-xl font-bold">{t.pricePerPlayer ? \`\${t.pricePerPlayer} €\` : "Gratis"}</div>
                    </div>
                  </div>
                </div>\`;

const replacementSection = \`              {/* MAIN CONTENT CARD */}
              <div className="flex-1 flex flex-col bg-slate-900/80 p-8 rounded-[2rem] border border-slate-700 shadow-2xl w-full">
                
                <div className="flex gap-8 mb-6">
                  {/* LEFT INFO SECTION */}
                  <div className="flex-1 flex flex-col">
                    <div className="flex flex-wrap items-center gap-4 mb-6">
                      {iscritti < maxPlayers ? (
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 animate-pulse">
                          Iscrizioni Aperte
                        </div>
                      ) : (
                        <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-500/20 text-red-400 rounded-full font-bold uppercase tracking-widest border border-red-500/30">
                          Iscrizioni Chiuse (In Attesa)
                        </div>
                      )}
                      <div className="inline-flex items-center gap-2 px-6 py-2 bg-slate-800 text-slate-300 rounded-full font-bold uppercase tracking-widest border border-slate-700">
                        {missingText}
                      </div>
                    </div>
                    
                    <h2 className="text-5xl font-black uppercase tracking-tight text-white mb-6 line-clamp-1">
                      {t.name}
                    </h2>
                    
                    {t.type !== 'coppie_fisse' && (
                      <div className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 p-6 rounded-3xl shadow-[0_0_40px_rgba(147,51,234,0.4)] mb-6 border border-purple-400 flex items-center gap-8 shrink-0">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="bg-white/20 p-4 rounded-2xl shrink-0">
                            <Calendar className="w-10 h-10 text-white" />
                          </div>
                          <div className="flex flex-col text-left min-w-0">
                            <span className="text-purple-100 font-bold uppercase tracking-widest text-xs">Evento Dal Vivo</span>
                            <span className="text-2xl font-black text-white uppercase leading-tight truncate">Cerimonia Sorteggio<br/>Coppie e Calendario</span>
                          </div>
                        </div>
                        <div className="text-left shrink-0 pl-6 border-l border-white/20">
                          {t.drawDate ? (
                            <div className="flex flex-col">
                              <span className="text-2xl font-black text-white leading-none mb-1">{new Date(t.drawDate).toLocaleDateString('it-IT')}</span>
                              <span className="text-sm font-bold text-purple-200">alle {new Date(t.drawDate).toLocaleTimeString('it-IT', {hour: '2-digit', minute:'2-digit'})}</span>
                            </div>
                          ) : (
                            <div className="text-2xl font-black text-white">DA DEFINIRE</div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex gap-4 w-full">
                      <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex items-center gap-4 flex-1 min-w-0">
                        <Calendar className="w-8 h-8 text-blue-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider truncate">Inizio Torneo</div>
                          <div className="text-xl font-bold whitespace-nowrap truncate">{t.startDate ? new Date(t.startDate).toLocaleDateString('it-IT') : "Da Def."}</div>
                        </div>
                      </div>
                      
                      <div className="bg-slate-950 p-4 rounded-3xl border border-slate-800 flex items-center gap-4 flex-1 min-w-0">
                        <Banknote className="w-8 h-8 text-emerald-400 shrink-0" />
                        <div className="min-w-0">
                          <div className="text-slate-500 font-bold uppercase text-[10px] tracking-wider truncate">Costo a persona</div>
                          <div className="text-xl font-bold truncate">{t.pricePerPlayer ? \`\${t.pricePerPlayer} €\` : "Gratis"}</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT QR SECTION INSIDE THE CARD */}
                  {iscritti < maxPlayers && (
                    <div className="w-[380px] shrink-0 bg-slate-950/50 p-8 rounded-3xl border border-slate-800 flex flex-col items-center justify-center">
                       <QRCodeDisplay tournamentId={t.id} />
                    </div>
                  )}
                </div>\`;

code = code.replace(targetSection, replacementSection);

// Also remove the old RIGHT COLUMN
const rightColumnPattern = /              \{\/\* RIGHT COLUMN \- QR ONLY \*\/\}[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}\)\(\)\}/;
code = code.replace(rightColumnPattern, '            </div>\n          );})()}');

fs.writeFileSync('src/components/TVSlideshow.tsx', code);
