import re

with open("src/components/TournamentLobby.tsx", "r") as f:
    content = f.read()

# Replace opening
pattern_open = r'\) : \(\n            <h2 className="text-xl'
replacement_open = ') : (\n            <>\n            <h2 className="text-xl'
content = re.sub(pattern_open, replacement_open, content)

# Replace closing
pattern_close = r'            </div>\n            \)\}\n          </div>'
replacement_close = '            </div>\n            </>\n            )}\n          </div>'
content = re.sub(pattern_close, replacement_close, content)

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(content)
