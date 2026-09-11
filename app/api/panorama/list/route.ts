import { NextResponse, type NextRequest } from "next/server";
import { getPanoramaDump } from "@/lib/panorama/dump";
import { getGame } from "@/lib/schema/games";

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }

    try {
        const dump = await getPanoramaDump(gameId);
        return NextResponse.json(dump.properties.map((p) => p.name));
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
