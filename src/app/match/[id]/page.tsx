import { prisma } from "@/lib/prisma";
import MatchScorer from "@/components/MatchScorer";
import { notFound } from "next/navigation";

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      teamA: { include: { player1: true, player2: true } },
      teamB: { include: { player1: true, player2: true } },
    }
  });

  if (!match) {
    notFound();
  }

  // Next 15 specific, might need await params.id in latest but let's assume standard app router
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col h-screen">
      <MatchScorer match={match} />
    </main>
  );
}
