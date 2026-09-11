import { NextResponse, type NextRequest } from "next/server";
import { getPanoramaDump } from "@/lib/panorama/dump";
import { getGame } from "@/lib/schema/games";

const MAX_RESULTS = 100;

export type PanoramaSearchResult = {
    name: string;
    snippet?: string;
};

function snippetOf(description: string): string | undefined {
    const plain = description
        .replace(/<[^>]+>/g, " ")
        .replace(/&lt;|&gt;|&quot;|&#39;|&nbsp;|&amp;/g, " ")
        .replace(/\s+/g, " ")
        .trim();
    if (!plain) return undefined;
    return plain.length > 80 ? `${plain.slice(0, 80)}...` : plain;
}

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
        dump = await getPanoramaDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const results: PanoramaSearchResult[] = dump.properties
        .filter((p) => p.name.toLowerCase().includes(q))
        .slice(0, MAX_RESULTS)
        .map((p) => ({ name: p.name, snippet: snippetOf(p.description) }));

    return NextResponse.json(results);
}
