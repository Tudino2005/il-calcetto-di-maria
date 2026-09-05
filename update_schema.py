import re

with open("prisma/schema.prisma", "r") as f:
    content = f.read()

new_model = """
model RegistrationRequest {
  id           String   @id @default(uuid())
  tournamentId String
  playerName   String
  preferredRole String
  status       String   @default("pending") // 'pending', 'accepted', 'rejected'
  adminReply   String?
  createdAt    DateTime @default(now())

  tournament   Tournament @relation(fields: [tournamentId], references: [id], onDelete: Cascade)
}
"""

content += new_model

with open("prisma/schema.prisma", "w") as f:
    f.write(content)
