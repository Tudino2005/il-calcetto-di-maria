import re

with open('src/components/TVSlideshow.tsx', 'r') as f:
    content = f.read()

# Add import
if 'import TournamentRulebook' not in content:
    content = content.replace('import { Users, Goal, Swords, Calendar, Clock, Trophy, Shield, ChevronRight, Activity, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";', 'import { Users, Goal, Swords, Calendar, Clock, Trophy, Shield, ChevronRight, Activity, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";\nimport TournamentRulebook from "./TournamentRulebook";')

# Update slide generation
old_push = 'promoTournaments.forEach((t: any) => slides.push({ type: "promo", tournament: t, duration: 30000 }));'
new_push = 'promoTournaments.forEach((t: any) => {\n    slides.push({ type: "promo", tournament: t, duration: 15000 });\n    slides.push({ type: "promo_rules", tournament: t, duration: 20000 });\n  });'
content = content.replace(old_push, new_push)

# Update promo rendering to remove the boxes
old_promo_boxes = """                <div className="flex flex-col gap-5 mb-8">
                  <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-8 rounded-3xl border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Trophy className="w-32 h-32 text-yellow-500" />
                    </div>
                    <h3 className="text-yellow-500 font-black uppercase tracking-widest text-sm flex items-center gap-3 mb-3">
                      <Trophy className="w-5 h-5" /> Regolamento del Torneo
                    </h3>
                    <div className="text-white font-black text-3xl mb-2">{formatTitle}</div>
                    <div className="text-slate-300 text-lg leading-relaxed relative z-10">{formatDesc}</div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-slate-950 to-slate-900 p-8 rounded-3xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.05)] relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <Users className="w-32 h-32 text-blue-500" />
                    </div>
                    <h3 className="text-blue-400 font-black uppercase tracking-widest text-sm flex items-center gap-3 mb-3">
                      <Users className="w-5 h-5" /> Formazione Squadre
                    </h3>
                    <div className="text-white font-black text-3xl mb-2">{typeTitle}</div>
                    <div className="text-slate-300 text-lg leading-relaxed relative z-10">{typeDesc}</div>
                  </div>
                </div>"""
new_promo_boxes = ""
content = content.replace(old_promo_boxes, new_promo_boxes)

# Now append the promo_rules slide rendering logic after the promo slide closing tag
promo_end_marker = "              </div>\n            </div>\n          )}\n\n          {/* PLAYER STATS SLIDE */}"

promo_rules_slide = """              </div>
            </div>
          )}

          {/* PROMO RULES SLIDE (Codice d'Onore) */}
          {currentSlide.type === "promo_rules" && (
            <div className="flex w-full h-full flex-col justify-center items-center px-16">
              <TournamentRulebook tournament={currentSlide.tournament} />
            </div>
          )}

          {/* PLAYER STATS SLIDE */}"""
content = content.replace(promo_end_marker, promo_rules_slide)

with open('src/components/TVSlideshow.tsx', 'w') as f:
    f.write(content)

print("Patched TVSlideshow")
