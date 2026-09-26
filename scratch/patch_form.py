import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

# 1. Add state for isBalancedDraw
content = content.replace(
    'const [allowRoleSwaps, setAllowRoleSwaps] = useState<boolean>(true);',
    'const [allowRoleSwaps, setAllowRoleSwaps] = useState<boolean>(true);\n  const [isBalancedDraw, setIsBalancedDraw] = useState<boolean>(false);'
)

# 2. Add isBalancedDraw to formData in handleSubmit
content = content.replace(
    'formData.append("allowRoleSwaps", type === "coppie_fisse" ? "false" : allowRoleSwaps.toString());',
    'formData.append("allowRoleSwaps", type === "coppie_fisse" ? "false" : allowRoleSwaps.toString());\n    formData.append("isBalancedDraw", type === "coppie_fisse" ? "false" : isBalancedDraw.toString());'
)

# 3. Add the toggle UI above the Inversione Ruoli toggle
old_toggle = """              <div className="flex flex-col items-center text-center max-w-[250px]">
                <label className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-4">
                  Inversione Ruoli
                </label>"""

new_toggle = """              {type !== "coppie_fisse" && (
                <div className="flex flex-col items-center text-center max-w-[250px] mb-6 border-b border-slate-700/50 pb-6 w-full">
                  <div className="flex items-center justify-between w-full">
                    <button
                      type="button"
                      onClick={() => setIsBalancedDraw(!isBalancedDraw)}
                      className={`w-16 h-9 rounded-full p-1 transition-colors duration-300 ease-in-out relative flex items-center shadow-inner ${
                        isBalancedDraw ? "bg-emerald-500" : "bg-slate-700"
                      }`}
                    >
                      <div
                        className={`w-7 h-7 bg-white rounded-full shadow-md transform transition-transform duration-300 ease-in-out ${
                          isBalancedDraw ? "translate-x-7" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <div className="flex flex-col items-end">
                      <label className="text-lg font-black tracking-wider text-emerald-400 block">
                        Crea torneo equilibrato
                      </label>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col items-center text-center max-w-[250px]">
                <label className="text-xs font-black uppercase tracking-wider text-emerald-400 block mb-4">
                  Inversione Ruoli
                </label>"""

content = content.replace(old_toggle, new_toggle)

with open('src/components/TournamentForm.tsx', 'w') as f:
    f.write(content)

print("Patched TournamentForm!")
