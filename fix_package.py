import json

with open("package.json", "r") as f:
    data = json.load(f)

data["scripts"]["build"] = "prisma generate && prisma db push && next build"

with open("package.json", "w") as f:
    json.dump(data, f, indent=2)
