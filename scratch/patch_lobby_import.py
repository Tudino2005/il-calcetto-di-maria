import re

with open('src/components/TournamentLobby.tsx', 'r') as f:
    content = f.read()

old_import = 'import RoleIcon from "@/components/RoleIcon";'
new_import = 'import RoleIcon from "@/components/RoleIcon";\nimport TournamentRulebook from "@/components/TournamentRulebook";'
content = content.replace(old_import, new_import)

with open('src/components/TournamentLobby.tsx', 'w') as f:
    f.write(content)

print("Fixed imports")
