import type { Datamap, EntitiesDump, EntityClass } from "@/lib/entities/types";
import { getFileUrl, getGame } from "@/lib/schema/games";
import { getCachedGithubDump, LATEST_REF } from "@/lib/github-cache";

async function fetchJson<T>(url: string, label: string): Promise<T> {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`${label} fetch failed: ${res.status}`);
    }
    return (await res.json()) as T;
}

export async function getEntitiesDump(
    gameId: string,
    ref: string = LATEST_REF,
): Promise<EntitiesDump> {
    const game = getGame(gameId);
    if (!game) {
        throw new Error(`Unknown game: ${gameId}`);
    }

    return getCachedGithubDump<EntitiesDump>({
        key: `entities:${gameId}:${ref}`,
        commit: { owner: game.repoOwner, repo: game.repoName, ref },
        load: async () => {
            const [entitiesRaw, datamapsRaw] = await Promise.all([
                fetchJson<{ entity_classes: EntityClass[] }>(
                    getFileUrl(game, game.entitiesPath, ref),
                    "Entities dump",
                ),
                fetchJson<{ datamaps: Datamap[] }>(
                    getFileUrl(game, game.datamapsPath, ref),
                    "Datamaps dump",
                ),
            ]);
            return {
                entityClasses: entitiesRaw.entity_classes,
                datamaps: datamapsRaw.datamaps,
            };
        },
    });
}
