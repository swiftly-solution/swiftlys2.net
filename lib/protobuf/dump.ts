import { githubHeaders } from "@/lib/github";
import { getGame, type Game } from "@/lib/schema/games";
import { parseProtoFile } from "@/lib/protobuf/parser";
import { getCachedGithubDump, LATEST_REF } from "@/lib/github-cache";
import type { ProtobufDump, ProtobufFile } from "@/lib/protobuf/types";

const ALL_FOLDER = "all";

type TreeEntry = { path: string; type: string };

async function fetchProtoTree(game: Game, ref: string): Promise<TreeEntry[]> {
    const url = `https://api.github.com/repos/${game.repoOwner}/${game.repoName}/git/trees/${ref}?recursive=1`;
    const res = await fetch(url, {
        headers: githubHeaders(),
        cache: "no-store",
    });
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

    return getCachedGithubDump<ProtobufDump>({
        key: `protobuf:${gameId}:${ref}`,
        commit: { owner: game.repoOwner, repo: game.repoName, ref },
        load: async () => {
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
                    const res = await fetch(url, { cache: "no-store" });
                    const source = res.ok ? await res.text() : "";
                    const parsed = parseProtoFile(source);
                    const modules = Array.from(
                        moduleFilesByFile.get(fileName) ?? [],
                    ).sort();
                    return { fileName, modules, ...parsed };
                }),
            );

            files.sort((a, b) => a.fileName.localeCompare(b.fileName));

            return { files };
        },
    });
}
