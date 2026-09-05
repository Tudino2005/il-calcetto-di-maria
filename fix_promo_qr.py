import re

with open("src/app/tournaments/[id]/promo/page.tsx", "r") as f:
    content = f.read()

# Add import for QRCodeDisplay
content = content.replace(
    'import Link from "next/link";',
    'import Link from "next/link";\nimport QRCodeDisplay from "@/components/QRCodeDisplay";'
)

old_cta = """        {/* CALL TO ACTION */}
        {(tournament.status === "setup" || tournament.status === "ready_to_draw") && (
          <div className="flex justify-center -mt-6 mb-6">
            <Link 
              href={`/tournaments/${tournament.id}/join`}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-2xl uppercase tracking-widest px-12 py-6 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1"
            >
              Iscriviti Ora!
            </Link>
          </div>
        )}"""

new_cta = """        {/* CALL TO ACTION & QR CODE */}
        {(tournament.status === "setup" || tournament.status === "ready_to_draw") && (
          <div className="flex flex-col items-center justify-center -mt-6 mb-6 gap-6">
            <Link 
              href={`/tournaments/${tournament.id}/join`}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-2xl uppercase tracking-widest px-12 py-6 rounded-3xl shadow-[0_0_40px_rgba(16,185,129,0.3)] hover:shadow-[0_0_60px_rgba(16,185,129,0.5)] transition-all hover:-translate-y-1"
            >
              Iscriviti Ora!
            </Link>
            
            <QRCodeDisplay tournamentId={tournament.id} />
          </div>
        )}"""

content = content.replace(old_cta, new_cta)

with open("src/app/tournaments/[id]/promo/page.tsx", "w") as f:
    f.write(content)
