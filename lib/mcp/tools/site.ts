import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getGame } from "@/lib/schema/games";
import { errorResult, fetchJson, gameParam, textResult, type McpContext } from "@/lib/mcp/context";
import type { GlobalSearchResponse } from "@/lib/search/query";

export function registerSiteTools(server: McpServer, ctx: McpContext) {
    server.registerTool(
        "site_search",
        {
            title: "Search the whole website",
            description:
                "Search across everything at once - schema, entities, protobuf, game events, convars, docs, and API docs - exactly like the site's top search bar. Use this when you don't know which specific tool to reach for, then follow up with the matching *_lookup tool for full detail.",
            inputSchema: {
                q: z.string().describe("Substring to match across every source."),
                game: gameParam,
            },
        },
        async ({ q, game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const params = new URLSearchParams({ q, game });
            const data = await fetchJson<GlobalSearchResponse>(
                `${ctx.baseUrl}/api/search/global?${params}`,
            );
            const groups = data.groups.map((g) => ({
                ...g,
                items: g.items.map((item) => ({
                    ...item,
                    href: `${ctx.baseUrl}${item.href}`,
                })),
            }));
            return textResult({ groups });
        },
    );
}
