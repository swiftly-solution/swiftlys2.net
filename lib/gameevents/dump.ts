import { getGame, type Game } from "@/lib/schema/games";
import {
    mergeGameEventField,
    parseGameEventsFile,
} from "@/lib/gameevents/parser";
import type { GameEventEntry, GameEventsDump } from "@/lib/gameevents/types";

const REVALIDATE_MS = 60 * 1000;
const LATEST_REF = "main";

type CacheEntry = { dump: GameEventsDump; fetchedAt: number };
const cache = new Map<string, CacheEntry>();

export async function getGameEventsDump(
    gameId: string,
    ref: string = LATEST_REF,
): Promise<GameEventsDump> {
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
        const byName = new Map<string, GameEventEntry>();

        for (const source of game.gameEventsPaths) {
            const url = getGameEventsFileUrl(game, source.path, ref);
            const res = await fetch(url);
            const content = res.ok ? await res.text() : "";
            const parsed = parseGameEventsFile(content);

            for (const [name, ev] of parsed) {
                let entry = byName.get(name);
                if (!entry) {
                    entry = { ...ev, files: [source.file] };
                    byName.set(name, entry);
                    continue;
                }

                if (!entry.files.includes(source.file)) {
                    entry.files.push(source.file);
                }
                if (!entry.comment && ev.comment) {
                    entry.comment = ev.comment;
                }
                for (const field of ev.fields) {
                    const existing = entry.fields.find(
                        (f) => f.name === field.name,
                    );
                    if (existing) {
                        mergeGameEventField(existing, field);
                    } else {
                        entry.fields.push(field);
                    }
                }
            }
        }

        const events = Array.from(byName.values()).sort((a, b) =>
            a.name.localeCompare(b.name),
        );
        const dump: GameEventsDump = { events };
        cache.set(cacheKey, { dump, fetchedAt: Date.now() });
        return dump;
    } catch (error) {
        if (cached) return cached.dump;
        throw error;
    }
}

function getGameEventsFileUrl(game: Game, path: string, ref: string): string {
    return `https://raw.githubusercontent.com/${game.repoOwner}/${game.repoName}/${ref}/${path}`;
}
