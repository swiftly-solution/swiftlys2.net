import type { ConCommand, ConVar, ConvarsDump } from "@/lib/convars/types";
import { getFileUrl, getGame } from "@/lib/schema/games";
import { getCachedGithubDump, LATEST_REF } from "@/lib/github-cache";

async function fetchJsonArray<T>(url: string, label: string): Promise<T[]> {
    const res = await fetch(url, { cache: "no-store" });
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

    return getCachedGithubDump<ConvarsDump>({
        key: `convars:${gameId}:${ref}`,
        commit: { owner: game.repoOwner, repo: game.repoName, ref },
        load: async () => {
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
            return { convars, commands };
        },
    });
}
