import { NextResponse, type NextRequest } from "next/server";
import { getVersions, type Version } from "@/lib/schema/versions";
import { getGame } from "@/lib/schema/games";

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const game = gameId ? getGame(gameId) : undefined;
    if (!game) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }

    try {
        const perFile = await Promise.all(
            game.gameEventsPaths.map((source) =>
                getVersions(game, source.path),
            ),
        );

        const bySha = new Map<string, Version>();
        for (const versions of perFile) {
            for (const version of versions) {
                if (!bySha.has(version.sha)) {
                    bySha.set(version.sha, version);
                }
            }
        }

        const merged = Array.from(bySha.values()).sort(
            (a, b) =>
                new Date(b.commitDate).getTime() -
                new Date(a.commitDate).getTime(),
        );

        return NextResponse.json(merged);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }
}
