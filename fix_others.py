import re

# TVSlideshow
with open("src/components/TVSlideshow.tsx", "r") as f:
    tv = f.read()
if "import RoleIcon" not in tv:
    tv = tv.replace('import { Users, Medal } from "lucide-react";', 'import { Users, Medal } from "lucide-react";\nimport RoleIcon from "@/components/RoleIcon";')
tv = tv.replace(
    '<div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-1">\n                              {tp.preferredRole}\n                            </div>',
    '<div className="mt-2"><RoleIcon role={tp.preferredRole} className="w-8 h-8" /></div>'
)
tv = tv.replace(
    '<div className="text-sm font-bold text-slate-500 uppercase tracking-widest">{p.preferredRole || "GIOCATORE"}</div>',
    '<div className="mt-1"><RoleIcon role={p.preferredRole || "GIOCATORE"} className="w-6 h-6" /></div>'
)
with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(tv)

# LeaderboardView
with open("src/components/LeaderboardView.tsx", "r") as f:
    lb = f.read()
if "import RoleIcon" not in lb:
    lb = lb.replace('import { Search } from "lucide-react";', 'import { Search } from "lucide-react";\nimport RoleIcon from "@/components/RoleIcon";')
lb = lb.replace(
    '<div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{p.preferredRole || "GIOCATORE"}</div>',
    '<div className="mt-2"><RoleIcon role={p.preferredRole || "GIOCATORE"} className="w-6 h-6" /></div>'
)
with open("src/components/LeaderboardView.tsx", "w") as f:
    f.write(lb)

# QuickTournamentForm
with open("src/components/QuickTournamentForm.tsx", "r") as f:
    qt = f.read()
if "import RoleIcon" not in qt:
    qt = qt.replace('import clsx from "clsx";', 'import clsx from "clsx";\nimport RoleIcon from "@/components/RoleIcon";')
qt = qt.replace(
    '<div className="text-xs uppercase tracking-wider text-slate-500 font-bold">\n                  {p.preferredRole}\n                </div>',
    '<div className="mt-1 flex justify-center"><RoleIcon role={p.preferredRole} className="w-6 h-6" /></div>'
)
with open("src/components/QuickTournamentForm.tsx", "w") as f:
    f.write(qt)

# MatchLobbyClient
with open("src/components/MatchLobbyClient.tsx", "r") as f:
    ml = f.read()
if "import RoleIcon" not in ml:
    ml = ml.replace('import clsx from "clsx";', 'import clsx from "clsx";\nimport RoleIcon from "@/components/RoleIcon";')
ml = ml.replace(
    '<div className="text-xs uppercase tracking-wider text-slate-500 font-bold">\n                  {p.preferredRole}\n                </div>',
    '<div className="mt-1 flex justify-center"><RoleIcon role={p.preferredRole} className="w-6 h-6" /></div>'
)
with open("src/components/MatchLobbyClient.tsx", "w") as f:
    f.write(ml)
