import { z } from "zod";
import { docHref, listDocPages } from "@/lib/docs/pages";
import { errorResult, fetchJson, textResult } from "@/lib/mcp/context";
import { defineTool, type ToolGroup } from "@/lib/mcp/tools/types";
import type { DocsSearchResult } from "@/app/api/docs/search/route";

export const docsToolGroup: ToolGroup = {
    domain: "Docs",
    tools: [
        defineTool({
            name: "docs_list",
            title: "List every docs page",
            description: "List every SwiftlyS2 docs page with its title and URL.",
            inputSchema: {},
            handler: async (_args, ctx) => {
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
        }),

        defineTool({
            name: "docs_search",
            title: "Search docs pages",
            description:
                "Search docs page bodies and headings by substring, exactly like the docs sidebar search bar. Returns matching pages with the heading/snippet and a deep link.",
            inputSchema: {
                q: z.string().describe("Substring to match."),
            },
            handler: async ({ q }, ctx) => {
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
        }),
    ],
};
