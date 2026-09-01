import { NextResponse, type NextRequest } from "next/server";
import { getVersions } from "@/lib/schema/versions";
import { getGame } from "@/lib/schema/games";

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const game = gameId ? getGame(gameId) : undefined;
    if (!game) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }

    try {
        const versions = await getVersions(game, game.datamapsPath);
        return NextResponse.json(versions);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
