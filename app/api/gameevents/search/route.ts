import { NextResponse, type NextRequest } from "next/server";
import { getGameEventsDump } from "@/lib/gameevents/dump";
import { toEventHashHex } from "@/lib/gameevents/csharp";
import { getGame } from "@/lib/schema/games";

const MAX_RESULTS = 100;

export type GameEventSearchResult = {
    name: string;
    files: string[];
    matchedField?: string;
    hash?: string;
};

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const fieldParam =
        request.nextUrl.searchParams.get("field")?.trim().toLowerCase() ?? "";
    const fileParam =
        request.nextUrl.searchParams.get("file")?.trim().toLowerCase() ?? "";

    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }
    if (!q && !fieldParam && !fileParam) {
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

        if (
            fileParam &&
            !event.files.some((f) => f.toLowerCase().includes(fileParam))
        ) {
            continue;
        }

        if (fieldParam) {
            const matchedField = event.fields.find((f) =>
                f.name.toLowerCase().includes(fieldParam),
            );
            if (
                matchedField &&
                (!q || event.name.toLowerCase().includes(q))
            ) {
                results.push({
                    name: event.name,
                    files: event.files,
                    matchedField: matchedField.name,
                });
            }
            continue;
        }

        if (!q) {
            results.push({ name: event.name, files: event.files });
            continue;
        }

        if (event.name.toLowerCase().includes(q)) {
            results.push({ name: event.name, files: event.files });
            continue;
        }

        const hash = toEventHashHex(event.name);
        if (hash.slice(2).toLowerCase().includes(normalizedHashQuery)) {
            results.push({ name: event.name, files: event.files, hash });
            continue;
        }

        const matchedField = event.fields.find((f) =>
            f.name.toLowerCase().includes(q),
        );
        if (matchedField) {
            results.push({
                name: event.name,
                files: event.files,
                matchedField: matchedField.name,
            });
        }
    }

    return NextResponse.json(results.slice(0, MAX_RESULTS));
}
