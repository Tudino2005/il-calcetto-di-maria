with open('src/components/PlayerHistoryView.tsx', 'r') as f:
    content = f.read()

old_state = 'const [selectedPartnerId, setSelectedPartnerId] = useState<string>("all");'
new_state = 'const [selectedPartnerId, setSelectedPartnerId] = useState<string>("");'

old_filtered_partners = """  const filteredPartners = selectedPartnerId === "all" 
    ? partnerStats 
    : partnerStats.filter(p => p.partner.id === selectedPartnerId);"""

new_filtered_partners = """  const filteredPartners = selectedPartnerId === ""
    ? []
    : selectedPartnerId === "all" 
      ? partnerStats 
      : partnerStats.filter(p => p.partner.id === selectedPartnerId);"""

old_filtered_matches = """  const filteredMatches = selectedPartnerId === "all"
    ? allMatches
    : allMatches.filter(m => {"""

new_filtered_matches = """  const filteredMatches = selectedPartnerId === ""
    ? []
    : selectedPartnerId === "all"
      ? allMatches
      : allMatches.filter(m => {"""

old_select = """              <option value="all">Tutti i compagni</option>
              {partnerStats.map(p => ("""

new_select = """              <option value="">Seleziona Compagno</option>
              <option value="all">Tutti i compagni</option>
              {partnerStats.map(p => ("""

content = content.replace(old_state, new_state)
content = content.replace(old_filtered_partners, new_filtered_partners)
content = content.replace(old_filtered_matches, new_filtered_matches)
content = content.replace(old_select, new_select)

with open('src/components/PlayerHistoryView.tsx', 'w') as f:
    f.write(content)
