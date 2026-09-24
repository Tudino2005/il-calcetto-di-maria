import re

with open('src/app/actions/tournamentActions.ts', 'r') as f:
    content = f.read()

old_code = """  const type = formData.get("type") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const pricePerPlayerStr = formData.get("pricePerPlayer") as string;
  const prizes = formData.get("prizes") as string;
  const allowRoleSwapsStr = formData.get("allowRoleSwaps") as string;
  const allowRoleSwaps = allowRoleSwapsStr === "true";"""

new_code = """  const type = formData.get("type") as string;
  const startDateStr = formData.get("startDate") as string;
  const endDateStr = formData.get("endDate") as string;
  const pricePerPlayerStr = formData.get("pricePerPlayer") as string;
  const prizes = formData.get("prizes") as string;
  const allowRoleSwapsStr = formData.get("allowRoleSwaps") as string;
  const allowRoleSwaps = allowRoleSwapsStr === "true";
  const targetGoals = Number(formData.get("targetGoals") || 7);
  const advantageThreshold = Number(formData.get("advantageThreshold") || 5);"""

content = content.replace(old_code, new_code)

old_data = """  // Create tournament in setup mode
  const tournament = await prisma.tournament.create({
    data: { 
      name, 
      type, 
      format, 
      allowRoleSwaps,
      status: "setup","""

new_data = """  // Create tournament in setup mode
  const tournament = await prisma.tournament.create({
    data: { 
      name, 
      type, 
      format, 
      allowRoleSwaps,
      targetGoals,
      advantageThreshold,
      status: "setup","""

content = content.replace(old_data, new_data)

with open('src/app/actions/tournamentActions.ts', 'w') as f:
    f.write(content)

print("Patched actions")
