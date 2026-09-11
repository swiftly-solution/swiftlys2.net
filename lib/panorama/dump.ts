import { getFileUrl, getGame } from "@/lib/schema/games";
import { getCachedGithubDump, LATEST_REF } from "@/lib/github-cache";
import type { PanoramaDump } from "@/lib/panorama/types";

export async function getPanoramaDump(
    gameId: string,
    ref: string = LATEST_REF,
): Promise<PanoramaDump> {
    const game = getGame(gameId);
    if (!game) {
        throw new Error(`Unknown game: ${gameId}`);
    }

    return getCachedGithubDump<PanoramaDump>({
        key: `panorama:${gameId}:${ref}`,
        commit: { owner: game.repoOwner, repo: game.repoName, ref },
        load: async () => {
            const url = getFileUrl(game, game.panoramaPath, ref);
            const res = await fetch(url, { cache: "no-store" });
            if (!res.ok) {
                throw new Error(`Panorama dump fetch failed: ${res.status}`);
            }
            const data = (await res.json()) as {
                properties: Record<string, string>;
            };

            const properties = Object.entries(data.properties ?? {})
                .map(([name, description]) => ({ name, description }))
                .sort((a, b) => a.name.localeCompare(b.name));

            return { properties };
        },
    });
}
