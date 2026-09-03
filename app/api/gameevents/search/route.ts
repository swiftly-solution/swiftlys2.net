import { NextResponse, type NextRequest } from "next/server";
import { getGameEventsDump } from "@/lib/gameevents/dump";
import { toEventHashHex } from "@/lib/gameevents/csharp";
import { getGame } from "@/lib/schema/games";

const MAX_RESULTS = 100;

export type GameEventSearchResult = {
    name: string;
    matchedField?: string;
    hash?: string;
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
        dump = await getGameEventsDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const normalizedHashQuery = q.replace(/^0x/, "");
    const results: GameEventSearchResult[] = [];

    for (const event of dump.events) {
        if (results.length >= MAX_RESULTS) break;

        if (event.name.toLowerCase().includes(q)) {
            results.push({ name: event.name });
            continue;
        }

        const hash = toEventHashHex(event.name);
        if (hash.slice(2).toLowerCase().includes(normalizedHashQuery)) {
            results.push({ name: event.name, hash });
            continue;
        }

        const matchedField = event.fields.find((f) =>
            f.name.toLowerCase().includes(q),
        );
        if (matchedField) {
            results.push({ name: event.name, matchedField: matchedField.name });
        }
    }

    return NextResponse.json(results.slice(0, MAX_RESULTS));
}
