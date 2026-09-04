import re

with open("src/components/MatchLobbyClient.tsx", "r") as f:
    content = f.read()

# Add getTeamNames function inside the component
func_code = """
  const getTeamNames = (pair: string[]) => {
    if (!pair || pair.length === 0) return <span className="text-slate-500 italic">Nessun giocatore</span>;
    const names = pair.map(id => players.find(p => p.id === id)?.name).filter(Boolean);
    return names.join(" & ");
  };
"""

content = content.replace('const [isSubmitting, setIsSubmitting] = useState(false);', 'const [isSubmitting, setIsSubmitting] = useState(false);\n' + func_code)

# Replace the text-xl spans
content = content.replace(
    '{fixedPairs[0]?.length === 2 ? "PRONTA" : fixedPairs[0]?.length === 1 ? "1 Giocatore..." : "Vuota"}',
    '{getTeamNames(fixedPairs[0])}'
)

content = content.replace(
    '{fixedPairs[1]?.length === 2 ? "PRONTA" : fixedPairs[1]?.length === 1 ? "1 Giocatore..." : "Vuota"}',
    '{getTeamNames(fixedPairs[1])}'
)

with open("src/components/MatchLobbyClient.tsx", "w") as f:
    f.write(content)
