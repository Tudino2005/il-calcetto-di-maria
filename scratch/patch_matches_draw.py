import re

with open('src/components/MatchesDrawCeremony.tsx', 'r') as f:
    content = f.read()

old_logic = "const round1Matches = tournament.matches?.filter((m: any) => m.round === 1) || [];"
new_logic = "const round1Matches = tournament.matches || [];"

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    print("Patched MatchesDrawCeremony!")
else:
    print("Could not find the logic to patch!")

with open('src/components/MatchesDrawCeremony.tsx', 'w') as f:
    f.write(content)
