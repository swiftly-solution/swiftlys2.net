import type { SchemaDump } from "@/lib/schema/types";
import { getDumpUrl, getGame } from "@/lib/schema/games";
import { getCachedGithubDump, LATEST_REF } from "@/lib/github-cache";

async function fetchDump(url: string): Promise<SchemaDump> {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Schema dump fetch failed: ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data?.classes) || !Array.isArray(data?.enums)) {
        throw new Error("Schema dump response has unexpected shape");
    }
    return data as SchemaDump;
}

export async function getSchemaDump(
    gameId: string,
    ref: string = LATEST_REF,
): Promise<SchemaDump> {
    const game = getGame(gameId);
    if (!game) {
        throw new Error(`Unknown game: ${gameId}`);
    }

    return getCachedGithubDump<SchemaDump>({
        key: `schema:${gameId}:${ref}`,
        commit: { owner: game.repoOwner, repo: game.repoName, ref },
        load: () => fetchDump(getDumpUrl(game, ref)),
    });
}
