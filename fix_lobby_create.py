import re

with open("src/components/TournamentLobby.tsx", "r") as f:
    content = f.read()

old_create = """  const handleCreatePlayer = async () => {
    if (!newPlayerName.trim()) return;
    const player = await createPlayer(newPlayerName, newPlayerRole);
    await addPlayerToTournament(tournament.id, player.id);
    setNewPlayerName("");
    setNewPlayerRole("entrambi");
    setIsCreatingPlayer(false);
  };"""

new_create = """  const handleCreatePlayer = async () => {
    if (!newPlayerName.trim()) return;
    const res = await createPlayer(newPlayerName, newPlayerRole);
    if ('error' in res) {
      alert(res.error);
      return;
    }
    await addPlayerToTournament(tournament.id, res.id);
    setNewPlayerName("");
    setNewPlayerRole("entrambi");
    setIsCreatingPlayer(false);
  };"""

content = content.replace(old_create, new_create)

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(content)
