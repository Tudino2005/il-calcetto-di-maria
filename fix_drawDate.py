import re

with open("src/app/actions/tournamentActions.ts", "r") as f:
    content = f.read()

old_code = """  const startDate = startDateStr ? new Date(startDateStr) : null;
  const pricePerPlayer = pricePerPlayerStr ? parseFloat(pricePerPlayerStr) : null;
  
  // Create tournament in setup mode"""

new_code = """  const drawDateStr = formData.get("drawDate") as string;
  const drawDate = drawDateStr ? new Date(drawDateStr) : null;
  const startDate = startDateStr ? new Date(startDateStr) : null;
  const pricePerPlayer = pricePerPlayerStr ? parseFloat(pricePerPlayerStr) : null;
  
  // Create tournament in setup mode"""

content = content.replace(old_code, new_code)

with open("src/app/actions/tournamentActions.ts", "w") as f:
    f.write(content)
