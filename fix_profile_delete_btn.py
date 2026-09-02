import re

with open("src/app/players/[id]/page.tsx", "r") as f:
    content = f.read()

if 'import DeleteButton' not in content:
    content = content.replace(
        'import { notFound, redirect } from "next/navigation";',
        'import { notFound, redirect } from "next/navigation";\nimport DeleteButton from "@/components/DeleteButton";'
    )

content = re.sub(
    r'<button\s+type="submit"[\s\S]*?<Trash2 className="w-4 h-4" /> Elimina\n\s*</button>',
    '<DeleteButton />',
    content
)

with open("src/app/players/[id]/page.tsx", "w") as f:
    f.write(content)
