import { NextResponse, type NextRequest } from "next/server";
import { getPanoramaDump } from "@/lib/panorama/dump";
import { computePanoramaDiff } from "@/lib/panorama/diff";
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
            getPanoramaDump(gameId, from),
            getPanoramaDump(gameId, to),
        ]);
        const diff = computePanoramaDiff(beforeDump, afterDump);
        return NextResponse.json(diff);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
