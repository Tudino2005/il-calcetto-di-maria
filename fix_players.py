import re

with open("src/app/players/page.tsx", "r") as f:
    content = f.read()

content = content.replace(
    'import { ArrowLeft, UserPlus } from "lucide-react";',
    'import { ArrowLeft, UserPlus } from "lucide-react";\nimport WipeAllDataButton from "@/components/WipeAllDataButton";'
)

content = content.replace(
    '      </div>\n    </main>',
    '      </div>\n      <div className="mt-16 border-t border-slate-800 pt-8">\n        <WipeAllDataButton />\n      </div>\n    </main>'
)

with open("src/app/players/page.tsx", "w") as f:
    f.write(content)
