import re

with open("src/components/TournamentLobby.tsx", "r") as f:
    content = f.read()

# The file currently ends with:
#         </div>
#       </div>
#     </div>
#   );
# }
# I want to remove the two extra </div>.
# Wait, actually I just need to remove exactly two `</div>` right before the end.

pattern = r'\s*</div>\s*</div>\s*</div>\s*\);\s*}\s*$'
replacement = '\n    </div>\n  );\n}\n'

content = re.sub(pattern, replacement, content)

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(content)
