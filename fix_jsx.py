with open("src/components/TournamentLobby.tsx", "r") as f:
    content = f.read()

content = content.replace(
    ') : (\\n            <h2',
    ') : (\\n            <>\\n            <h2'
)

# And close the fragment before the )}
content = content.replace(
    '            </div>\\n            )}\\n          </div>',
    '            </div>\\n            </>\\n            )}\\n          </div>'
)

with open("src/components/TournamentLobby.tsx", "w") as f:
    f.write(content)
