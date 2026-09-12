import { z } from "zod";
import { getGame } from "@/lib/schema/games";
import { errorResult, fetchJson, gameParam, textResult } from "@/lib/mcp/context";
import { defineTool, type ToolGroup } from "@/lib/mcp/tools/types";
import type { GlobalSearchResponse } from "@/lib/search/query";

export const siteToolGroup: ToolGroup = {
    domain: "Site",
    tools: [
        defineTool({
            name: "site_search",
            title: "Search the whole website",
            description:
                "Search across everything at once - schema, entities, protobuf, game events, convars, docs, and API docs - exactly like the site's top search bar. Use this when you don't know which specific tool to reach for, then follow up with the matching *_lookup tool for full detail.",
            inputSchema: {
                q: z.string().describe("Substring to match across every source."),
                game: gameParam,
            },
            handler: async ({ q, game }, ctx) => {
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
        }),
    ],
};
