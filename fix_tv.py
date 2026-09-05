import re

with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Add duration to promo slides
content = content.replace(
    'promoTournaments.forEach((t: any) => slides.push({ type: "promo", tournament: t }));',
    'promoTournaments.forEach((t: any) => slides.push({ type: "promo", tournament: t, duration: 60000 }));'
)

# Add QRCodeDisplay import
if 'import QRCodeDisplay from "@/components/QRCodeDisplay";' not in content:
    content = content.replace(
        'import { Trophy, Users, Calendar, Banknote, Medal, Crown, Activity, Swords, Clock, MonitorPlay } from "lucide-react";',
        'import { Trophy, Users, Calendar, Banknote, Medal, Crown, Activity, Swords, Clock, MonitorPlay } from "lucide-react";\nimport QRCodeDisplay from "@/components/QRCodeDisplay";'
    )

# Replace text with QRCodeDisplay
old_text = """              <div className="text-3xl text-slate-300 bg-slate-900/80 px-12 py-8 rounded-[3rem] border border-slate-700 shadow-2xl">
                Rivolgiti al bancone per iscriverti!
              </div>"""
              
new_text = """              <div className="bg-slate-900/80 px-12 py-8 rounded-[3rem] border border-slate-700 shadow-2xl scale-125 origin-top mt-4">
                <QRCodeDisplay tournamentId={currentSlide.tournament.id} />
              </div>"""

content = content.replace(old_text, new_text)

with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)
