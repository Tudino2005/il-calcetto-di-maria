import re

with open("src/app/admin/page.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'import WipeDataButton from "@/components/WipeDataButton";',
    'import WipeDataButton from "@/components/WipeDataButton";\nimport { prisma } from "@/lib/prisma";\nimport GlobalInbox from "@/components/GlobalInbox";'
)

# Fetch requests
old_export = 'export default async function AdminHome() {'
new_export = """export default async function AdminHome() {
  const pendingRequests = await prisma.registrationRequest.findMany({
    where: { status: "pending" },
    include: { tournament: true },
    orderBy: { createdAt: "asc" }
  });"""

content = content.replace(old_export, new_export)

# Inject GlobalInbox before the menu
content = content.replace(
    '{/* MENU (4 PULSANTI) */}',
    '<GlobalInbox requests={pendingRequests} />\n\n      {/* MENU (4 PULSANTI) */}'
)

with open("src/app/admin/page.tsx", "w") as f:
    f.write(content)
