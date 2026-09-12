import { z } from "zod";
import { getGame } from "@/lib/schema/games";
import { getPanoramaDump } from "@/lib/panorama/dump";
import { findPanoramaProperty } from "@/lib/panorama/queries";
import {
    capList,
    errorResult,
    fetchJson,
    gameParam,
    textResult,
} from "@/lib/mcp/context";
import { defineTool, type ToolGroup } from "@/lib/mcp/tools/types";
import type { PanoramaSearchResult } from "@/app/api/panorama/search/route";

export const panoramaToolGroup: ToolGroup = {
    domain: "Panorama",
    tools: [
        defineTool({
            name: "panorama_lookup",
            title: "Look up a Panorama CSS property",
            description:
                "Resolve a Panorama (Source 2 UI) CSS property by name and return its description plus a link to the Panorama viewer.",
            inputSchema: {
                name: z
                    .string()
                    .describe("Panorama property name, e.g. box-shadow"),
                game: gameParam,
            },
            handler: async ({ name, game }, ctx) => {
                if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
                const dump = await getPanoramaDump(game);

                const found = findPanoramaProperty(dump, name);
                if (!found) {
                    return errorResult(
                        `No Panorama property named "${name}" found.`,
                    );
                }
                return textResult({
                    url: `${ctx.baseUrl}/panorama-viewer/${game}/${encodeURIComponent(found.name)}`,
                    entry: found,
                });
            },
        }),

        defineTool({
            name: "panorama_list",
            title: "List Panorama CSS properties",
            description:
                "List every Panorama CSS property name known for a game.",
            inputSchema: {
                game: gameParam,
            },
            handler: async ({ game }) => {
                if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
                const dump = await getPanoramaDump(game);
                return textResult(capList(dump.properties.map((p) => p.name)));
            },
        }),

        defineTool({
            name: "panorama_search",
            title: "Search Panorama CSS properties",
            description:
                "Search Panorama CSS property names, exactly like the Panorama viewer's search bar.",
            inputSchema: {
                q: z
                    .string()
                    .describe("Substring to match against property names."),
                game: gameParam,
            },
            handler: async ({ q, game }, ctx) => {
                if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
                const params = new URLSearchParams({ game, q });

                const data = await fetchJson<PanoramaSearchResult[]>(
                    `${ctx.baseUrl}/api/panorama/search?${params}`,
                );
                return textResult(
                    data.map((item) => ({
                        ...item,
                        url: `${ctx.baseUrl}/panorama-viewer/${game}/${encodeURIComponent(item.name)}`,
                    })),
                );
            },
        }),
    ],
};
