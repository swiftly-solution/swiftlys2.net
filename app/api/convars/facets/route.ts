import { NextResponse, type NextRequest } from "next/server";
import { getConvarsDump } from "@/lib/convars/dump";
import { getGame } from "@/lib/schema/games";
import type { ConvarsFacets } from "@/lib/convars/types";

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }

    let dump;
    try {
        dump = await getConvarsDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const modules = new Set<string>();
    const flags = new Set<string>();
    for (const entry of [...dump.convars, ...dump.commands]) {
        modules.add(entry.module);
        for (const flag of entry.flags ?? []) flags.add(flag);
    }

    const response: ConvarsFacets = {
        modules: [...modules].sort(),
        flags: [...flags].sort(),
    };
    return NextResponse.json(response);
}
