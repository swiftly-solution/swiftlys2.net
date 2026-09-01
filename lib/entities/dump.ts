import type { Datamap, EntitiesDump, EntityClass } from "@/lib/entities/types";
import { getFileUrl, getGame } from "@/lib/schema/games";

const REVALIDATE_MS = 60 * 1000;
const LATEST_REF = "main";

type CacheEntry = { dump: EntitiesDump; fetchedAt: number };
const cache = new Map<string, CacheEntry>();

async function fetchJson<T>(url: string, label: string): Promise<T> {
    const res = await fetch(url);
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

    const cacheKey = `${gameId}:${ref}`;
    const cached = cache.get(cacheKey);
    const isLatest = ref === LATEST_REF;
    if (
        cached &&
        (!isLatest || Date.now() - cached.fetchedAt < REVALIDATE_MS)
    ) {
        return cached.dump;
    }

    try {
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
        const dump: EntitiesDump = {
            entityClasses: entitiesRaw.entity_classes,
            datamaps: datamapsRaw.datamaps,
        };
        cache.set(cacheKey, { dump, fetchedAt: Date.now() });
        return dump;
    } catch (error) {
        if (cached) return cached.dump;
        throw error;
    }
}
