import os

pages = [
    "src/app/match/[id]/page.tsx",
    "src/app/match/page.tsx",
    "src/app/players/[id]/page.tsx",
    "src/app/players/page.tsx",
    "src/app/admin/page.tsx",
    "src/app/leaderboard/page.tsx",
    "src/app/tournaments/quick/page.tsx",
    "src/app/tournaments/[id]/page.tsx",
    "src/app/tournaments/[id]/promo/page.tsx",
    "src/app/tournaments/page.tsx",
    "src/app/page.tsx"
]

for page in pages:
    if os.path.exists(page):
        with open(page, "r") as f:
            content = f.read()
        
        if 'export const dynamic = "force-dynamic";' not in content:
            new_content = 'export const dynamic = "force-dynamic";\n' + content
            with open(page, "w") as f:
                f.write(new_content)

