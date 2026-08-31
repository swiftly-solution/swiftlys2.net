import { NextResponse, type NextRequest } from "next/server";
import { getSchemaDump } from "@/lib/schema/dump";
import { computeSchemaDiff } from "@/lib/schema/diff";
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
            getSchemaDump(gameId, from),
            getSchemaDump(gameId, to),
        ]);
        const diff = computeSchemaDiff(beforeDump, afterDump);
        return NextResponse.json(diff);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
