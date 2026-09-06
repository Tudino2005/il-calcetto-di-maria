import re

with open("src/app/globals.css", "r") as f:
    content = f.read()

# Slow down the animation from 0.15s to 0.3s
content = content.replace("slot-spin 0.15s linear infinite", "slot-spin 0.3s linear infinite")

with open("src/app/globals.css", "w") as f:
    f.write(content)
