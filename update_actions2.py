import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

pattern = r'  const type = formData\.get\("type"\) as string;\n  \n  // Create tournament in setup mode\n  const tournament = await prisma\.tournament\.create\(\{\n    data: \{ name, type, format, status: "setup" \}\n  \}\);'
replacement = """  const type = formData.get("type") as string;
  const startDateStr = formData.get("startDate") as string;
  const pricePerPlayerStr = formData.get("pricePerPlayer") as string;
  const prizes = formData.get("prizes") as string;

  const startDate = startDateStr ? new Date(startDateStr) : null;
  const pricePerPlayer = pricePerPlayerStr ? parseFloat(pricePerPlayerStr) : null;
  
  // Create tournament in setup mode
  const tournament = await prisma.tournament.create({
    data: { 
      name, 
      type, 
      format, 
      status: "setup",
      startDate,
      pricePerPlayer,
      prizes: prizes || null
    }
  });"""
content = re.sub(pattern, replacement, content)

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
