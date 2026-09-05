import re

with open("src/app/admin/page.tsx", "r") as f:
    content = f.read()

old_query = """  const pendingRequests = await prisma.registrationRequest.findMany({
    where: { status: "pending" },
    include: { tournament: true },
    orderBy: { createdAt: "asc" }
  });"""

new_query = """  const pendingRequests = await prisma.registrationRequest.findMany({
    where: { status: "pending" },
    include: { tournament: { include: { _count: { select: { registrations: true } } } } },
    orderBy: { createdAt: "asc" }
  });"""

content = content.replace(old_query, new_query)
with open("src/app/admin/page.tsx", "w") as f:
    f.write(content)


with open("src/components/GlobalInbox.tsx", "r") as f:
    content = f.read()

old_btn = """              <button 
                onClick={async () => {
                  if(confirm(`Accettare ${req.playerName} in ${req.tournament.name}?`)) {
                    await respondToRegistrationRequest(req.id, "accepted", "Pagami alla cassa prima di iniziare.");
                  }
                }} 
                className="flex flex-col items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl py-3 px-1 transition-colors"
              >
                <Check className="w-6 h-6" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-center">Accetta<br/>(Ricorda Pagamento)</span>
              </button>"""

new_btn = """              <button 
                onClick={async () => {
                  if(confirm(`Accettare ${req.playerName} in ${req.tournament.name}?`)) {
                    await respondToRegistrationRequest(req.id, "accepted", "Pagami alla cassa prima di iniziare.");
                  }
                }} 
                disabled={req.tournament._count?.registrations >= (req.tournament.maxTeams || 8) * 2}
                className="flex flex-col items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-30 disabled:cursor-not-allowed text-emerald-400 border border-emerald-500/30 rounded-xl py-3 px-1 transition-colors"
              >
                <Check className="w-6 h-6" />
                <span className="text-[11px] font-bold uppercase tracking-wider text-center">
                  {req.tournament._count?.registrations >= (req.tournament.maxTeams || 8) * 2 ? "Torneo Pieno" : "Accetta"}
                </span>
              </button>"""

content = content.replace(old_btn, new_btn)
with open("src/components/GlobalInbox.tsx", "w") as f:
    f.write(content)

