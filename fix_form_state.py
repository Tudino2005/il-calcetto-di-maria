import re

with open("src/components/TournamentForm.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'const [teamsPerGroup, setTeamsPerGroup] = useState<number>(4);',
    'const [teamsPerGroup, setTeamsPerGroup] = useState<number>(4);\n  const [maxTeams, setMaxTeams] = useState<number>(8);'
)

with open("src/components/TournamentForm.tsx", "w") as f:
    f.write(content)
