import re

# Fix page.tsx query
with open("src/app/page.tsx", "r") as f:
    content = f.read()

old_query = """  const promoTournaments = await prisma.tournament.findMany({
    where: { status: { in: ["setup", "ready_to_draw"] } },
    orderBy: { createdAt: "desc" },
    include: { registrations: true }
  });"""

new_query = """  const promoTournaments = await prisma.tournament.findMany({
    where: { status: { in: ["setup", "ready_to_draw"] } },
    orderBy: { createdAt: "desc" },
    include: { registrations: { include: { player: true } } }
  });"""

content = content.replace(old_query, new_query)
with open("src/app/page.tsx", "w") as f:
    f.write(content)

# Fix TVSlideshow.tsx
with open("src/components/TVSlideshow.tsx", "r") as f:
    content = f.read()

# Fix role checking
old_roles = """              registrations.forEach((r: any) => {
                if(r.preferredRole === "attaccante") attCount++;
                else if(r.preferredRole === "portiere") porCount++;
                else entCount++;
              });"""

new_roles = """              registrations.forEach((r: any) => {
                if(r.player?.preferredRole === "attaccante") attCount++;
                else if(r.player?.preferredRole === "portiere") porCount++;
                else entCount++;
              });"""

content = content.replace(old_roles, new_roles)

# Fix render
old_render = """                      registrations.slice(0, 48).map((r: any) => (
                        <div key={r.id} className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-white font-bold text-sm flex items-center gap-2 shadow-md">
                          <RoleIcon role={r.preferredRole} className="w-4 h-4" />
                          {r.playerName.split(" ")[0]}
                        </div>
                      ))"""

new_render = """                      registrations.slice(0, 48).map((r: any) => (
                        <div key={r.id} className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-full text-white font-bold text-sm flex items-center gap-2 shadow-md">
                          <RoleIcon role={r.player?.preferredRole} className="w-4 h-4" />
                          {r.player?.name.split(" ")[0]}
                        </div>
                      ))"""

content = content.replace(old_render, new_render)
with open("src/components/TVSlideshow.tsx", "w") as f:
    f.write(content)

