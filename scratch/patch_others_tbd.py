import re

def replace_in_file(filepath, old_str, new_str):
    with open(filepath, 'r') as f:
        content = f.read()
    content = content.replace(old_str, new_str)
    with open(filepath, 'w') as f:
        f.write(content)

replace_in_file('src/components/DoubleEliminationBracket.tsx', '>TBD</span>', '>IN ATTESA</span>')

replace_in_file('src/components/GroupStageView.tsx', ': "TBD"}', ': "IN ATTESA"}')

replace_in_file('src/components/MatchesDrawCeremony.tsx', ' = "TBD";', ' = "IN ATTESA";')

replace_in_file('src/lib/tournamentLogic.ts', 'return "TBD";', 'return "IN ATTESA";')

print("Patched other files!")
