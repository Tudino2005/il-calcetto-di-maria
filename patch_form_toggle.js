const fs = require('fs');
let code = fs.readFileSync('src/components/TournamentForm.tsx', 'utf8');

const regex = /Crea torneo equilibrato\s*<\/label>\s*<\/div>\s*<\/div>\s*<\/div>\s*\)\}/;

const newToggle = `Crea torneo equilibrato
                      </label>
                    </div>
                  </div>
                  
                  {isBalancedDraw && (
                    <div className="flex items-center justify-between w-full mt-4 pt-4 border-t border-slate-700/50">
                      <button
                        type="button"
                        onClick={() => setAvoidRepeatedPairs(!avoidRepeatedPairs)}
                        className={\`w-12 h-7 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner \${
                          avoidRepeatedPairs ? "bg-amber-500" : "bg-slate-700"
                        }\`}
                      >
                        <div
                          className={\`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out \${
                            avoidRepeatedPairs ? "translate-x-5" : "translate-x-0"
                          }\`}
                        />
                      </button>
                      <div className="flex flex-col items-end">
                        <label className="text-sm font-bold tracking-wider text-amber-400 block">
                          Evita coppie ripetute
                        </label>
                        <span className="text-[10px] text-slate-400 max-w-[120px] text-right leading-tight">Penalizza coppie già formate in passato</span>
                      </div>
                    </div>
                  )}
                </div>
              )}`;

code = code.replace(regex, newToggle);

code = code.replace(
  'const [isBalancedDraw, setIsBalancedDraw] = useState<boolean>(true);',
  'const [isBalancedDraw, setIsBalancedDraw] = useState<boolean>(true);\n  const [avoidRepeatedPairs, setAvoidRepeatedPairs] = useState<boolean>(false);'
);

code = code.replace(
  'formData.append("isBalancedDraw", isBalancedDraw.toString());',
  'formData.append("isBalancedDraw", isBalancedDraw.toString());\n    formData.append("avoidRepeatedPairs", avoidRepeatedPairs.toString());'
);

fs.writeFileSync('src/components/TournamentForm.tsx', code);
