import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getGame } from "@/lib/schema/games";
import { getPanoramaDump } from "@/lib/panorama/dump";
import { findPanoramaProperty } from "@/lib/panorama/queries";
import {
    capList,
    errorResult,
    fetchJson,
    gameParam,
    textResult,
    type McpContext,
} from "@/lib/mcp/context";
import type { PanoramaSearchResult } from "@/app/api/panorama/search/route";

export function registerPanoramaTools(server: McpServer, ctx: McpContext) {
    server.registerTool(
        "panorama_lookup",
        {
            title: "Look up a Panorama CSS property",
            description:
                "Resolve a Panorama (Source 2 UI) CSS property by name and return its description plus a link to the Panorama viewer.",
            inputSchema: {
                name: z.string().describe("Panorama property name, e.g. box-shadow"),
                game: gameParam,
            },
        },
        async ({ name, game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const dump = await getPanoramaDump(game);

            const found = findPanoramaProperty(dump, name);
            if (!found) {
                return errorResult(`No Panorama property named "${name}" found.`);
            }
            return textResult({
                url: `${ctx.baseUrl}/panorama-viewer/${game}/${encodeURIComponent(found.name)}`,
                entry: found,
            });
        },
    );

    server.registerTool(
        "panorama_list",
        {
            title: "List Panorama CSS properties",
            description:
                "List every Panorama CSS property name known for a game.",
            inputSchema: {
                game: gameParam,
            },
        },
        async ({ game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const dump = await getPanoramaDump(game);
            return textResult(capList(dump.properties.map((p) => p.name)));
        },
    );

    server.registerTool(
        "panorama_search",
        {
            title: "Search Panorama CSS properties",
            description:
                "Search Panorama CSS property names, exactly like the Panorama viewer's search bar.",
            inputSchema: {
                q: z.string().describe("Substring to match against property names."),
                game: gameParam,
            },
        },
        async ({ q, game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const params = new URLSearchParams({ game, q });

            const data = await fetchJson<PanoramaSearchResult[]>(
                `${ctx.baseUrl}/api/panorama/search?${params}`,
            );
            return textResult(data);
        },
    );
}
