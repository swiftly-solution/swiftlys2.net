import { NextResponse, type NextRequest } from "next/server";
import { getConvarsDump } from "@/lib/convars/dump";
import { getGame } from "@/lib/schema/games";
import type { ConCommand, ConVar } from "@/lib/convars/types";

const MAX_RESULTS = 50;

export type ConvarSearchResult = {
    name: string;
    module: string;
    kind: "convar" | "concommand";
};

function attrKeysOf(attributes: Record<string, boolean>): string[] {
    return Object.entries(attributes)
        .filter(([, value]) => value)
        .map(([key]) => key.toLowerCase());
}

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const moduleParam =
        request.nextUrl.searchParams.get("module")?.trim().toLowerCase() ?? "";
    const kindParamRaw = request.nextUrl.searchParams.get("kind");
    const kindParam =
        kindParamRaw === "convar" || kindParamRaw === "concommand"
            ? kindParamRaw
            : null;
    const flagParam =
        request.nextUrl.searchParams.get("flag")?.trim().toLowerCase() ?? "";
    const attrParam =
        request.nextUrl.searchParams.get("attr")?.trim().toLowerCase() ?? "";

    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }
    if (!q && !moduleParam && !kindParam && !flagParam && !attrParam) {
        return NextResponse.json([]);
    }

    let dump;
    try {
        dump = await getConvarsDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const results: ConvarSearchResult[] = [];

    function pushMatches(
        items: (ConVar | ConCommand)[],
        kind: "convar" | "concommand",
    ) {
        if (kindParam && kindParam !== kind) return;
        for (const item of items) {
            if (results.length >= MAX_RESULTS) return;
            if (q && !item.name.toLowerCase().includes(q)) continue;
            if (moduleParam && item.module.toLowerCase() !== moduleParam) {
                continue;
            }
            if (
                flagParam &&
                !item.flags.some((f) => f.toLowerCase() === flagParam)
            ) {
                continue;
            }
            if (attrParam && !attrKeysOf(item.attributes).includes(attrParam)) {
                continue;
            }
            results.push({ name: item.name, module: item.module, kind });
        }
    }

    pushMatches(dump.convars, "convar");
    pushMatches(dump.commands, "concommand");

    return NextResponse.json(results.slice(0, MAX_RESULTS));
}
