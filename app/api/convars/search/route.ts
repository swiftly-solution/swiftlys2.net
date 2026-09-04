import { NextResponse, type NextRequest } from "next/server";
import { getConvarsDump } from "@/lib/convars/dump";
import { getGame } from "@/lib/schema/games";

const MAX_RESULTS = 50;

export type ConvarSearchResult = {
    name: string;
    module: string;
    kind: "convar" | "concommand";
};

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }
    if (!q) {
        return NextResponse.json([]);
    }

    let dump;
    try {
        dump = await getConvarsDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const results: ConvarSearchResult[] = [];

    for (const item of dump.convars) {
        if (results.length >= MAX_RESULTS) break;
        if (item.name.toLowerCase().includes(q)) {
            results.push({ name: item.name, module: item.module, kind: "convar" });
        }
    }
    for (const item of dump.commands) {
        if (results.length >= MAX_RESULTS) break;
        if (item.name.toLowerCase().includes(q)) {
            results.push({
                name: item.name,
                module: item.module,
                kind: "concommand",
            });
        }
    }

    return NextResponse.json(results.slice(0, MAX_RESULTS));
}
