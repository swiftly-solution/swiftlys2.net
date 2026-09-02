import { githubHeaders } from "@/lib/github";
import { getGame, type Game } from "@/lib/schema/games";
import { parseProtoFile } from "@/lib/protobuf/parser";
import type { ProtobufDump, ProtobufFile } from "@/lib/protobuf/types";

const REVALIDATE_MS = 60 * 1000;
const LATEST_REF = "main";
const ALL_FOLDER = "all";

type CacheEntry = { dump: ProtobufDump; fetchedAt: number };
const cache = new Map<string, CacheEntry>();

type TreeEntry = { path: string; type: string };

async function fetchProtoTree(game: Game, ref: string): Promise<TreeEntry[]> {
    const url = `https://api.github.com/repos/${game.repoOwner}/${game.repoName}/git/trees/${ref}?recursive=1`;
    const res = await fetch(url, { headers: githubHeaders() });
    if (!res.ok) {
        throw new Error(`Protobuf tree fetch failed: ${res.status}`);
    }
    const data = (await res.json()) as { tree?: TreeEntry[] };
    return data.tree ?? [];
}

export async function getProtobufDump(
    gameId: string,
    ref: string = LATEST_REF,
): Promise<ProtobufDump> {
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
        const prefix = `${game.protobufsPath}/`;
        const tree = await fetchProtoTree(game, ref);

        const moduleFilesByFile = new Map<string, Set<string>>();
        const allFileNames: string[] = [];

        for (const entry of tree) {
            if (entry.type !== "blob") continue;
            if (
                !entry.path.startsWith(prefix) ||
                !entry.path.endsWith(".proto")
            ) {
                continue;
            }
            const rest = entry.path.slice(prefix.length);
            const slashIdx = rest.indexOf("/");
            if (slashIdx === -1) continue;

            const folder = rest.slice(0, slashIdx);
            const fileName = rest.slice(slashIdx + 1);

            if (folder === ALL_FOLDER) {
                allFileNames.push(fileName);
                continue;
            }
            let modules = moduleFilesByFile.get(fileName);
            if (!modules) {
                modules = new Set();
                moduleFilesByFile.set(fileName, modules);
            }
            modules.add(folder);
        }

        const files: ProtobufFile[] = await Promise.all(
            allFileNames.map(async (fileName) => {
                const url = `https://raw.githubusercontent.com/${game.repoOwner}/${game.repoName}/${ref}/${prefix}${ALL_FOLDER}/${fileName}`;
                const res = await fetch(url);
                const source = res.ok ? await res.text() : "";
                const parsed = parseProtoFile(source);
                const modules = Array.from(
                    moduleFilesByFile.get(fileName) ?? [],
                ).sort();
                return { fileName, modules, ...parsed };
            }),
        );

        files.sort((a, b) => a.fileName.localeCompare(b.fileName));

        const dump: ProtobufDump = { files };
        cache.set(cacheKey, { dump, fetchedAt: Date.now() });
        return dump;
    } catch (error) {
        if (cached) return cached.dump;
        throw error;
    }
}
