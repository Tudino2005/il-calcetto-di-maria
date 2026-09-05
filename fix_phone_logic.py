import re

with open("src/app/tournaments/[id]/promo/page.tsx", "r") as f:
    content = f.read()

old_badge = """      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* HEADER */}
        <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 mb-8 animate-fade-in-down">
          <Trophy className="w-5 h-5" />
          Iscrizioni Aperte
        </div>"""

new_badge = """      <div className="max-w-4xl mx-auto flex flex-col items-center">
        
        {/* HEADER */}
        {registrations.length < maxPlayers ? (
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-purple-500/20 text-purple-400 rounded-full font-bold uppercase tracking-widest border border-purple-500/30 mb-8 animate-fade-in-down">
            <Trophy className="w-5 h-5" />
            Iscrizioni Aperte
          </div>
        ) : (
          <div className="inline-flex items-center gap-3 px-6 py-2 bg-red-500/20 text-red-400 rounded-full font-bold uppercase tracking-widest border border-red-500/30 mb-8 animate-fade-in-down">
            <Trophy className="w-5 h-5" />
            Iscrizioni Chiuse (In Attesa)
          </div>
        )}"""

content = content.replace(old_badge, new_badge)

old_qr = """        {tournament.status === "setup" && (
          <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-center text-slate-400 font-bold uppercase tracking-widest mb-6">Condividi con i giocatori</h3>
            
            <QRCodeDisplay tournamentId={tournament.id} />
          </div>
        )}"""

new_qr = """        {tournament.status === "setup" && registrations.length < maxPlayers && (
          <div className="mb-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <h3 className="text-center text-slate-400 font-bold uppercase tracking-widest mb-6">Condividi con i giocatori</h3>
            
            <QRCodeDisplay tournamentId={tournament.id} />
          </div>
        )}"""

content = content.replace(old_qr, new_qr)

with open("src/app/tournaments/[id]/promo/page.tsx", "w") as f:
    f.write(content)
