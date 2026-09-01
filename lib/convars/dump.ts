import type { ConCommand, ConVar, ConvarsDump } from "@/lib/convars/types";
import { getFileUrl, getGame } from "@/lib/schema/games";

const REVALIDATE_MS = 60 * 1000;
const LATEST_REF = "main";

type CacheEntry = { dump: ConvarsDump; fetchedAt: number };
const cache = new Map<string, CacheEntry>();

async function fetchJsonArray<T>(url: string, label: string): Promise<T[]> {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`${label} fetch failed: ${res.status}`);
    }
    const data = await res.json();
    if (!Array.isArray(data)) {
        throw new Error(`${label} response has unexpected shape`);
    }
    return data as T[];
}

export async function getConvarsDump(
    gameId: string,
    ref: string = LATEST_REF,
): Promise<ConvarsDump> {
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
        const [convars, commands] = await Promise.all([
            fetchJsonArray<ConVar>(
                getFileUrl(game, game.convarsPath, ref),
                "ConVars dump",
            ),
            fetchJsonArray<ConCommand>(
                getFileUrl(game, game.commandsPath, ref),
                "ConCommands dump",
            ),
        ]);
        const dump: ConvarsDump = { convars, commands };
        cache.set(cacheKey, { dump, fetchedAt: Date.now() });
        return dump;
    } catch (error) {
        if (cached) return cached.dump;
        throw error;
    }
}
