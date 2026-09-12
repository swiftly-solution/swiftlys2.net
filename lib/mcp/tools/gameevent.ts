import { z } from "zod";
import { getGame } from "@/lib/schema/games";
import { getGameEventsDump } from "@/lib/gameevents/dump";
import { buildGameEventFileIndex, findGameEvent } from "@/lib/gameevents/queries";
import { toEventInterfaceName } from "@/lib/gameevents/csharp";
import { capList, errorResult, fetchJson, gameParam, textResult } from "@/lib/mcp/context";
import { defineTool, type ToolGroup } from "@/lib/mcp/tools/types";
import type { GameEventSearchResult } from "@/app/api/gameevents/search/route";

export const gameEventToolGroup: ToolGroup = {
    domain: "Game events",
    tools: [
        defineTool({
            name: "gameevent_lookup",
            title: "Look up a game event",
            description:
                "Resolve a game event by name and return its fields plus a link to the game events viewer. Accepts either the raw name (player_death) or its C# interface name (EventPlayerDeath).",
            inputSchema: {
                name: z
                    .string()
                    .describe("Game event name, raw (player_death) or C# (EventPlayerDeath)"),
                game: gameParam,
            },
            handler: async ({ name, game }, ctx) => {
                if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
                const dump = await getGameEventsDump(game);

                const found =
                    findGameEvent(dump, name) ??
                    dump.events.find(
                        (e) => toEventInterfaceName(e.name).toLowerCase() === name.toLowerCase(),
                    ) ??
                    null;
                if (!found) {
                    return errorResult(`No game event named "${name}" found.`);
                }
                return textResult({
                    url: `${ctx.baseUrl}/gameevents-viewer/${game}/${encodeURIComponent(found.name)}`,
                    entry: found,
                });
            },
        }),

        defineTool({
            name: "gameevent_list",
            title: "List game event files and events",
            description:
                "Browse the game events dump. Without a file, returns every gameevents file with its event count. With a file, lists the events declared in it.",
            inputSchema: {
                file: z.string().optional().describe("Gameevents file to list events for."),
                game: gameParam,
            },
            handler: async ({ file, game }) => {
                if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
                const dump = await getGameEventsDump(game);
                const files = buildGameEventFileIndex(dump);

                if (!file) {
                    return textResult({
                        files: files.map((f) => ({ file: f.file, count: f.items.length })),
                    });
                }

                const found = files.find((f) => f.file === file);
                if (!found) {
                    return errorResult(
                        `Unknown gameevents file "${file}". Call gameevent_list without "file" to see available files.`,
                    );
                }
                return textResult({ file, ...capList(found.items) });
            },
        }),

        defineTool({
            name: "gameevent_search",
            title: "Search game events",
            description:
                "Search game events by name, field name, or hex hash, exactly like the game events viewer's search bar.",
            inputSchema: {
                q: z.string().optional().describe("Substring or hex hash to match."),
                field: z.string().optional().describe("Filter: event has a field matching this."),
                file: z.string().optional().describe("Filter: event is declared in this file."),
                game: gameParam,
            },
            handler: async ({ q, field, file, game }, ctx) => {
                if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
                const params = new URLSearchParams({ game });
                if (q) params.set("q", q);
                if (field) params.set("field", field);
                if (file) params.set("file", file);

                const data = await fetchJson<GameEventSearchResult[]>(
                    `${ctx.baseUrl}/api/gameevents/search?${params}`,
                );
                return textResult(data);
            },
        }),
    ],
};
