import re

with open("src/app/players/page.tsx", "r") as f:
    content = f.read()

# Add import
content = content.replace(
    'import WipeAllDataButton from "@/components/WipeAllDataButton";',
    'import WipeAllDataButton from "@/components/WipeAllDataButton";\nimport PlayerForm from "@/components/PlayerForm";'
)

# Remove old addPlayer server action
action_pattern = r'  async function addPlayer\(formData: FormData\) \{\s*"use server";\s*const name = formData\.get\("name"\) as string;\s*const preferredRole = formData\.get\("preferredRole"\) as string;\s*if \(name && preferredRole\) \{\s*await createPlayer\(name, preferredRole\);\s*revalidatePath\("/players"\);\s*\}\s*\}\n'
content = re.sub(action_pattern, '', content)

# Remove the old section and replace with <PlayerForm />
section_start = '<section className="bg-slate-800 p-6 rounded-3xl border border-slate-700 shadow-lg">'
section_end = '</form>\n        </section>'

# Just replace the first occurrence of section
start_idx = content.find(section_start)
end_idx = content.find(section_end) + len(section_end)

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + '<PlayerForm />' + content[end_idx:]

with open("src/app/players/page.tsx", "w") as f:
    f.write(content)
