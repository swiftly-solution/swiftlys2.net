import type { SchemaDump } from "@/lib/schema/types";
import { getDumpUrl, getGame } from "@/lib/schema/games";

const REVALIDATE_MS = 60 * 1000;
const LATEST_REF = "main";

type CacheEntry = { dump: SchemaDump; fetchedAt: number };

const cache = new Map<string, CacheEntry>();

async function fetchDump(url: string): Promise<SchemaDump> {
    const res = await fetch(url);
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
        const dump = await fetchDump(getDumpUrl(game, ref));
        cache.set(cacheKey, { dump, fetchedAt: Date.now() });
        return dump;
    } catch (error) {
        if (cached) return cached.dump;
        throw error;
    }
}
