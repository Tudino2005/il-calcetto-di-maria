import re

with open('src/app/tournaments/[id]/promo/page.tsx', 'r') as f:
    content = f.read()

# Add import
old_import = 'import RoleIcon from "@/components/RoleIcon";'
new_import = 'import RoleIcon from "@/components/RoleIcon";\nimport TournamentRulebook from "@/components/TournamentRulebook";'
content = content.replace(old_import, new_import)

# Add component
old_section = """          </div>
        </section>

        {/* HYPE & ROSTER */}"""

new_section = """          </div>
        </section>

        {/* REGOLAMENTO DINAMICO */}
        <TournamentRulebook tournament={tournament} />

        {/* HYPE & ROSTER */}"""

content = content.replace(old_section, new_section)

with open('src/app/tournaments/[id]/promo/page.tsx', 'w') as f:
    f.write(content)

print("Patched promo page")
