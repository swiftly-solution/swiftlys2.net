import { NextResponse, type NextRequest } from "next/server";
import { getSchemaDump } from "@/lib/schema/dump";
import { getGame } from "@/lib/schema/games";

const MAX_RESULTS = 100;

export type FieldSearchResult = {
    project: string;
    className: string;
    fieldName: string;
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
        dump = await getSchemaDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const results: FieldSearchResult[] = [];
    for (const c of dump.classes) {
        for (const field of c.fields ?? []) {
            if (field.name.toLowerCase().includes(q)) {
                results.push({
                    project: c.project,
                    className: c.name,
                    fieldName: field.name,
                });
            }
        }
    }

    return NextResponse.json(results.slice(0, MAX_RESULTS));
}
