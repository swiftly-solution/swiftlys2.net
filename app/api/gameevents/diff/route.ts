import { NextResponse, type NextRequest } from "next/server";
import { getGameEventsDump } from "@/lib/gameevents/dump";
import { computeGameEventsDiff } from "@/lib/gameevents/diff";
import { getGame } from "@/lib/schema/games";

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const from = request.nextUrl.searchParams.get("from");
    const to = request.nextUrl.searchParams.get("to");

    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }
    if (!from || !to) {
        return NextResponse.json({ error: "missing from/to" }, { status: 400 });
    }

    try {
        const [beforeDump, afterDump] = await Promise.all([
            getGameEventsDump(gameId, from),
            getGameEventsDump(gameId, to),
        ]);
        const diff = computeGameEventsDiff(beforeDump, afterDump);
        return NextResponse.json(diff);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
