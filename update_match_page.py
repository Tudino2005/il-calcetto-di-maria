import re

with open("src/app/match/page.tsx", "r") as f:
    content = f.read()

# Add import
content = content.replace(
    'import { ArrowLeft, Play } from "lucide-react";',
    'import { ArrowLeft, Play } from "lucide-react";\nimport MatchLobbyClient from "@/components/MatchLobbyClient";'
)

# Replace everything in the else branch with <MatchLobbyClient />
new_else = """      ) : (
        <MatchLobbyClient players={players} />
      )}
    </main>
  );
}"""

content = re.sub(r'      \) : \(\n        <form action=\{startMatch\}.*?\n      \)\}\n    </main>\n  \);\n\}', new_else, content, flags=re.DOTALL)

with open("src/app/match/page.tsx", "w") as f:
    f.write(content)
