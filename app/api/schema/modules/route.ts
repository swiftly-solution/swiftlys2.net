import { NextResponse, type NextRequest } from "next/server";
import { getSchemaDump } from "@/lib/schema/dump";
import { buildModuleIndex } from "@/lib/schema/queries";
import { getGame } from "@/lib/schema/games";

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }

    try {
        const dump = await getSchemaDump(gameId);
        const modules = buildModuleIndex(dump);
        return NextResponse.json(modules);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
