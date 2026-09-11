import { NextResponse, type NextRequest } from "next/server";
import { getPanoramaDump } from "@/lib/panorama/dump";
import { findPanoramaProperty } from "@/lib/panorama/queries";
import { getGame } from "@/lib/schema/games";
import type { PanoramaProperty } from "@/lib/panorama/types";

export type PanoramaEntryResponse = PanoramaProperty;

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
        dump = await getPanoramaDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const property = findPanoramaProperty(dump, name);
    if (!property) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    return NextResponse.json(property satisfies PanoramaEntryResponse);
}
