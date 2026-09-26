import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'const [allowRoleSwaps, setAllowRoleSwaps] = useState<boolean>(false);',
    'const [allowRoleSwaps, setAllowRoleSwaps] = useState<boolean>(false);\n  const [isBalancedDraw, setIsBalancedDraw] = useState<boolean>(false);'
)

with open('src/components/TournamentForm.tsx', 'w') as f:
    f.write(content)

print("Patched TournamentForm again!")
