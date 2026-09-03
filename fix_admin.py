import re

with open("src/app/admin/page.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'import { Trophy, Users, Play, Swords, Zap } from "lucide-react";',
    'import { Trophy, Users, Play, Swords, Zap } from "lucide-react";\nimport WipeDataButton from "@/components/WipeDataButton";'
)

content = content.replace(
    '      </div>\n    </main>',
    '      </div>\n      <WipeDataButton />\n    </main>'
)

with open("src/app/admin/page.tsx", "w") as f:
    f.write(content)
