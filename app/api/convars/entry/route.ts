import { NextResponse, type NextRequest } from "next/server";
import { getConvarsDump } from "@/lib/convars/dump";
import { findConvarsEntry } from "@/lib/convars/queries";
import { getGame } from "@/lib/schema/games";
import type { ConvarsEntryResponse } from "@/lib/convars/types";

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const moduleName = request.nextUrl.searchParams.get("module");
    const name = request.nextUrl.searchParams.get("name");

    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }
    if (!moduleName || !name) {
        return NextResponse.json(
            { error: "missing module/name" },
            { status: 400 },
        );
    }

    let dump;
    try {
        dump = await getConvarsDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const found = findConvarsEntry(dump, moduleName, name);
    if (!found) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const response: ConvarsEntryResponse =
        found.kind === "convar"
            ? { kind: "convar", ...found.entry }
            : { kind: "concommand", ...found.entry };
    return NextResponse.json(response);
}
