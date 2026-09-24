import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

old_state = """  const [targetGoals, setTargetGoals] = useState<number>(7);
  const [advantageThreshold, setAdvantageThreshold] = useState<number>(5);"""

new_state = """  const [targetGoals, setTargetGoals] = useState<number>(7);
  const [advantageThreshold, setAdvantageThreshold] = useState<number>(5);
  const [allowRoleSwaps, setAllowRoleSwaps] = useState<boolean>(false);"""

content = content.replace(old_state, new_state)

old_submit = """    if (pricePerPlayer) formData.append("pricePerPlayer", pricePerPlayer);
    if (prizes) formData.append("prizes", prizes);

    await createTournament(formData);"""

new_submit = """    if (pricePerPlayer) formData.append("pricePerPlayer", pricePerPlayer);
    if (prizes) formData.append("prizes", prizes);
    formData.append("allowRoleSwaps", type === "coppie_fisse" ? "false" : allowRoleSwaps.toString());

    await createTournament(formData);"""

content = content.replace(old_submit, new_submit)

with open('src/components/TournamentForm.tsx', 'w') as f:
    f.write(content)

print("Patched form state")
