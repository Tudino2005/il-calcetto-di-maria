# Piano di Implementazione: Specializzazione per Ruolo & Indici di Rendimento (Portiere vs Attaccante)

## 1. Obiettivo della Funzionalità
Permettere il calcolo affidabile e oggettivo delle statistiche per ruolo:
- 🛡️ **Indice Difensivo (Portiere)**: Media gol subiti a partita quando si è schierati in porta (più è basso, più il portiere è forte).
- ⚔️ **Indice Offensivo (Attaccante)**: Media gol realizzati a partita quando si è schierati in attacco (più è alto, più l'attaccante è prolifico).
- 🎭 **Indice di Flessibilità (Jolly)**: Confronto rendimento tra porta e attacco per i giocatori versatili.

---

## 2. Il Problema Reale Risolto
Nel calcetto da bar, il **"Ruolo Preferito"** dell'anagrafica non corrisponde sempre a dove il giocatore si posiziona al tavolo:
1. **Due Portieri insieme**: Uno deve per forza giocare in attacco. Se subiscono gol, non devono essere contati come malus per chi giocava avanti!
2. **Due Attaccanti insieme**: Uno deve sacrificarsi e giocare dietro in porta.
3. **Giocatori "Entrambi"**: Non hanno un ruolo fisso e necessitano di tracciare dove giocano ogni singola partita.
4. **Scambio Tattico tra Set**: Due compagni possono decidere di scambiarsi posizione (es. dopo aver perso il 1° Set).

---

## 3. Soluzione UI / UX: Assegnazione Dinamica con 1 Solo Tap

### A. Nella Lobby di Formazione Squadre (`MatchLobbyClient`)
- **Pre-assegnazione Automatica**: Il sistema legge i ruoli preferiti dell'anagrafica e assegna automaticamente Portiere e Attaccante (zero click per la maggior parte dei casi).
- **Se giocano due giocatori dello stesso ruolo (es. 2 Portieri o 2 Attaccanti)**:
  - L'app assegna il primo come Portiere e il secondo come Attaccante.
  - Mostra un avviso amichevole:  
    `⚠️ Coppia con stesso ruolo: [Nome] gioca in Attacco (adattato)`
  - Compare il tasto di **Scambio Rapido `[ ⇄ ]`**: con un solo tap si inverte chi gioca in porta e chi in attacco.

### B. In "Match Scorer" (Durante la Partita)
- Accanto ai nomi di ciascuna squadra, compaiono le due etichette:
  - `[ 🛡️ Portiere: Mario ] ⇄ [ ⚔️ Attaccante: Giovanni ]`
- Toccando **`⇄`** tra un set e l'altro, si possono invertire le posizioni se i giocatori decidono di scambiarsi al tavolo.

---

## 4. Formule di Calcolo delle Statistiche

### 1. Indice Difensivo (Portiere)
Si considerano **soltanto le partite giocate effettivamente in porta**:
$$\text{Indice Difensivo (Media Gol Subiti)} = \frac{\text{Gol Subiti in Porta}}{\text{Partite Giocate da Portiere}}$$
*Classifica: "Il Muro del Mese" (vince chi ha la media più bassa, min. 5 partite).*

### 2. Indice Offensivo (Attaccante)
Si considerano **soltanto le partite giocate effettivamente in attacco**:
$$\text{Indice Offensivo (Media Gol Fatti)} = \frac{\text{Gol Fatti in Attacco}}{\text{Partite Giocate da Attaccante}}$$
*Classifica: "Il Cannoniere del Mese" (vince chi ha la media più alta).*

### 3. Statistica Goliardica / Gamification
- 🎖️ **Badge "Spirito di Sacrificio"**: Assegnato a chi gioca e vince partite sacrificandosi fuori dal proprio ruolo anagrafico per fare spazio al compagno.
- 🔄 **Verdetto Alchimia nel Fascicolo Giocatore**:  
  *"Quando giochi in Porta hai il 68% Win Rate, in Attacco il 45%: il tuo ruolo naturale è la DIFESA!"*

---

## 5. Implementazione Tecnica nel Database
Aggiungere al modello `Match` (o salvare in un campo metadata):
- `teamA_goalkeeperId`: ID giocatore in porta per Squadra A
- `teamA_strikerId`: ID giocatore in attacco per Squadra A
- `teamB_goalkeeperId`: ID giocatore in porta per Squadra B
- `teamB_strikerId`: ID giocatore in attacco per Squadra B

*(Fallback automatico: se non specificato, si usano i ruoli preferiti dell'anagrafica).*
