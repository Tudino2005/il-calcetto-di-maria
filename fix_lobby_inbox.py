import re

with open("src/components/TournamentLobby.tsx", "r") as f:
    content = f.read()

# Add new action import
content = content.replace(
    'togglePlayerPayment } from "@/app/actions/tournamentActions";',
    'togglePlayerPayment, respondToRegistrationRequest } from "@/app/actions/tournamentActions";'
)

# Add imports for UI icons
content = content.replace(
    'Share2 } from "lucide-react";',
    'Share2, Inbox, MessageSquare, Check, Ban } from "lucide-react";'
)

# Add useRouter and interval for polling
content = content.replace(
    'import { useState } from "react";',
    'import { useState, useEffect } from "react";\nimport { useRouter } from "next/navigation";'
)

# Insert router and polling inside TournamentLobby
hook_code = """
  const router = useRouter();
  useEffect(() => {
    // Poll for new inbox requests every 5 seconds if not ready
    if (isReady) return;
    const interval = setInterval(() => {
      router.refresh();
    }, 5000);
    return () => clearInterval(interval);
  }, [isReady, router]);

  const pendingRequests = (tournament.registrationRequests || []).filter((r: any) => r.status === "pending");
"""
content = content.replace(
    'const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);',
    'const [isCreatingPlayer, setIsCreatingPlayer] = useState(false);\n' + hook_code
)

# Build the Inbox UI block to insert before the Appello Grid
inbox_ui = """
      {/* INBOX RICHIESTE */}
      {!isReady && pendingRequests.length > 0 && (
        <div className="mb-8 bg-purple-900/30 p-6 rounded-3xl border border-purple-500/50 shadow-xl shadow-purple-500/10">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
            <Inbox className="text-purple-400" /> Inbox Iscrizioni ({pendingRequests.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map((req: any) => (
              <div key={req.id} className="bg-slate-900 border border-slate-700 p-4 rounded-2xl flex flex-col justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center font-bold text-xl text-purple-400 shrink-0">
                    {req.playerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-white text-lg">{req.playerName}</div>
                    <div className="flex items-center gap-1 text-sm text-slate-400 font-bold uppercase tracking-wider">
                      <RoleIcon role={req.preferredRole} className="w-4 h-4" /> {req.preferredRole}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <button onClick={() => respondToRegistrationRequest(req.id, "accepted", "Pagami alla cassa prima di iniziare.")} className="flex flex-col items-center justify-center gap-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl py-2 px-1 transition-colors">
                    <Check className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">Accetta<br/>(Ricorda Pagamento)</span>
                  </button>
                  <button onClick={() => respondToRegistrationRequest(req.id, "rejected", "Mi spiace, torneo pieno!")} className="flex flex-col items-center justify-center gap-1 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl py-2 px-1 transition-colors">
                    <Ban className="w-5 h-5" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-center">Rifiuta<br/>(Torneo Pieno)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
"""

content = content.replace(
    '{/* APPELLO GRID */}',
    inbox_ui + '\n      {/* APPELLO GRID */}'
)

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(content)
