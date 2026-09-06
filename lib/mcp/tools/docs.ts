import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { docHref, listDocPages } from "@/lib/docs/pages";
import { errorResult, fetchJson, textResult, type McpContext } from "@/lib/mcp/context";
import type { DocsSearchResult } from "@/app/api/docs/search/route";

export function registerDocsTools(server: McpServer, ctx: McpContext) {
    server.registerTool(
        "docs_list",
        {
            title: "List every docs page",
            description: "List every SwiftlyS2 docs page with its title and URL.",
            inputSchema: {},
        },
        async () => {
            try {
                const pages = (await listDocPages()).map(({ slug, title }) => ({
                    title,
                    slug,
                    url: `${ctx.baseUrl}${docHref(slug)}`,
                }));
                return textResult({ pages });
            } catch {
                return errorResult("Docs are temporarily unavailable.");
            }
        },
    );

    server.registerTool(
        "docs_search",
        {
            title: "Search docs pages",
            description:
                "Search docs page bodies and headings by substring, exactly like the docs sidebar search bar. Returns matching pages with the heading/snippet and a deep link.",
            inputSchema: {
                q: z.string().describe("Substring to match."),
            },
        },
        async ({ q }) => {
            const params = new URLSearchParams({ q });
            const data = await fetchJson<DocsSearchResult[]>(
                `${ctx.baseUrl}/api/docs/search?${params}`,
            );
            return textResult(
                data.map((r) => ({
                    ...r,
                    url: `${ctx.baseUrl}${docHref(r.slug)}${r.anchor ? `#${r.anchor}` : ""}`,
                })),
            );
        },
    );
}
