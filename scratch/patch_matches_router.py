import re

with open('src/components/MatchesDrawCeremony.tsx', 'r') as f:
    content = f.read()

# Add import
if 'useRouter' not in content:
    content = content.replace('import React, { useState, useEffect } from "react";', 'import React, { useState, useEffect } from "react";\nimport { useRouter } from "next/navigation";')

# Add useRouter inside component
if 'const router = useRouter();' not in content:
    content = content.replace('const round1Matches = tournament.matches || [];', 'const round1Matches = tournament.matches || [];\n  const router = useRouter();')

# Modify the call
old_call = """        setTimeout(() => {
          finishMatchesDrawAnimation(tournament.id);
        }, 10000);"""

new_call = """        setTimeout(() => {
          finishMatchesDrawAnimation(tournament.id).then(() => {
             router.refresh();
             router.push("/");
          });
        }, 10000);"""

if old_call in content:
    content = content.replace(old_call, new_call)
    print("Patched call")
else:
    print("Could not find call")

# Fix the zero length array condition too
old_zero = """    if (round1Matches.length === 0) {
      finishMatchesDrawAnimation(tournament.id);
      return;
    }"""
    
new_zero = """    if (round1Matches.length === 0) {
      finishMatchesDrawAnimation(tournament.id).then(() => {
         router.refresh();
         router.push("/");
      });
      return;
    }"""
    
if old_zero in content:
    content = content.replace(old_zero, new_zero)
    print("Patched zero")
else:
    print("Could not find zero call")

with open('src/components/MatchesDrawCeremony.tsx', 'w') as f:
    f.write(content)
