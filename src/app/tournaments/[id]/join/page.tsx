import { getTournament } from "@/app/actions/tournamentActions";
import { notFound } from "next/navigation";
import JoinClient from "@/components/JoinClient";

export const dynamic = "force-dynamic";

export default async function JoinTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const tournament = await getTournament(id);

  if (!tournament) {
    notFound();
  }

  return <JoinClient tournament={tournament} />;
}
