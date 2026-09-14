import { NextResponse } from 'next/server';
import { getFreeMatchesLeaderboard } from '@/lib/leaderboardData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const stats = await getFreeMatchesLeaderboard();
    return NextResponse.json({ count: stats.length, stats });
  } catch(e: any) {
    return NextResponse.json({ error: e.message });
  }
}
