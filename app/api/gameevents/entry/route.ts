import { NextResponse, type NextRequest } from "next/server";
import { getGameEventsDump } from "@/lib/gameevents/dump";
import { findGameEvent } from "@/lib/gameevents/queries";
import {
    resolveCSharpEventProperties,
    toEventHashHex,
    toEventInterfaceName,
} from "@/lib/gameevents/csharp";
import { getGame } from "@/lib/schema/games";
import type { GameEventResponse } from "@/lib/gameevents/api-types";

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const name = request.nextUrl.searchParams.get("name");

    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }
    if (!name) {
        return NextResponse.json({ error: "missing name" }, { status: 400 });
    }

    let dump;
    try {
        dump = await getGameEventsDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const event = findGameEvent(dump, name);
    if (!event) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const response: GameEventResponse = {
        name: event.name,
        interfaceName: toEventInterfaceName(event.name),
        comment: event.comment,
        hash: toEventHashHex(event.name),
        files: event.files,
        fields: event.fields.map((field) => ({
            name: field.name,
            type: field.type,
            comment: field.comment,
        })),
        csharpProperties: resolveCSharpEventProperties(event),
    };
    return NextResponse.json(response);
}
