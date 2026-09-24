import re

with open('src/components/TournamentForm.tsx', 'r') as f:
    content = f.read()

old_code = """    if (pricePerPlayer) formData.append("pricePerPlayer", pricePerPlayer);
    if (prizes) formData.append("prizes", prizes);
    formData.append("allowRoleSwaps", type === "coppie_fisse" ? "false" : allowRoleSwaps.toString());"""

new_code = """    if (pricePerPlayer) formData.append("pricePerPlayer", pricePerPlayer);
    if (prizes) formData.append("prizes", prizes);
    formData.append("allowRoleSwaps", type === "coppie_fisse" ? "false" : allowRoleSwaps.toString());
    formData.append("targetGoals", targetGoals.toString());
    formData.append("advantageThreshold", advantageThreshold.toString());"""

content = content.replace(old_code, new_code)

with open('src/components/TournamentForm.tsx', 'w') as f:
    f.write(content)

print("Patched form")
