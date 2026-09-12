import { z } from "zod";
import { getApiDump } from "@/lib/api-docs/dump";
import { apiDocsHref, buildNavTree, findType, isApiBranch } from "@/lib/api-docs/tree";
import { errorResult, fetchJson, textResult } from "@/lib/mcp/context";
import { defineTool, type ToolGroup } from "@/lib/mcp/tools/types";
import type { ApiDocsSearchResult } from "@/app/api/api-docs/search/route";

const MEMBER_LISTS = [
    "operators",
    "constructors",
    "methods",
    "properties",
    "fields",
] as const;

const branchParam = z.enum(["stable", "beta"]).default("stable").describe("API docs branch.");

export const apiDocsToolGroup: ToolGroup = {
    domain: "API docs",
    tools: [
        defineTool({
            name: "apidocs_lookup",
            title: "Look up a SwiftlyS2 API type",
            description:
                "Resolve a SwiftlyS2 C# API type by exact name (e.g. IPlayerManagerService) and return its declaration/members plus a link to the API docs. Optionally narrow to a single member (method/property/field).",
            inputSchema: {
                name: z.string().describe("Type name, e.g. IPlayerManagerService"),
                member: z
                    .string()
                    .optional()
                    .describe("Member name to narrow the result to, e.g. SendCenterHTML"),
                branch: branchParam,
            },
            handler: async ({ name, member, branch }, ctx) => {
                const resolvedBranch = isApiBranch(branch) ? branch : "stable";
                const dump = await getApiDump(resolvedBranch);

                for (const category of buildNavTree(dump)) {
                    const navType = category.types.find((t) => t.name === name);
                    if (!navType) continue;

                    const found = findType(dump, category.slug, navType.slug);
                    if (!found) break;

                    if (member) {
                        const memberEntry = MEMBER_LISTS.flatMap((key) => found.type[key] ?? []).find(
                            (m) => m.name.toLowerCase() === member.toLowerCase(),
                        );
                        if (!memberEntry) {
                            return errorResult(
                                `Type "${name}" was found, but has no member named "${member}".`,
                            );
                        }
                        const anchor = memberEntry.uid
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, "-")
                            .replace(/^-+|-+$/g, "");
                        return textResult({
                            url: `${ctx.baseUrl}${apiDocsHref(resolvedBranch, category.slug, navType.slug)}#${anchor}`,
                            type: name,
                            member: memberEntry,
                        });
                    }

                    return textResult({
                        url: `${ctx.baseUrl}${apiDocsHref(resolvedBranch, category.slug, navType.slug)}`,
                        type: found.type,
                    });
                }

                return errorResult(`No API type named "${name}" found on branch "${resolvedBranch}".`);
            },
        }),

        defineTool({
            name: "apidocs_list",
            title: "List SwiftlyS2 API categories and types",
            description:
                "Browse the SwiftlyS2 C# API docs. Without a category, returns every category with its types. With a category, returns just the types in it.",
            inputSchema: {
                category: z.string().optional().describe("Category slug to list types for."),
                branch: branchParam,
            },
            handler: async ({ category, branch }) => {
                const resolvedBranch = isApiBranch(branch) ? branch : "stable";
                const dump = await getApiDump(resolvedBranch);
                const categories = buildNavTree(dump);

                if (!category) {
                    return textResult({
                        categories: categories.map((c) => ({
                            slug: c.slug,
                            name: c.name,
                            typeCount: c.types.length,
                        })),
                    });
                }

                const found = categories.find((c) => c.slug === category);
                if (!found) {
                    return errorResult(
                        `Unknown category "${category}". Call apidocs_list without "category" to see available categories.`,
                    );
                }
                return textResult({ category: found.slug, types: found.types });
            },
        }),

        defineTool({
            name: "apidocs_search",
            title: "Search SwiftlyS2 API docs",
            description:
                "Search API type names, member names, and summaries by substring, exactly like the API docs search bar.",
            inputSchema: {
                q: z.string().describe("Substring to match in type/member names or summaries."),
                branch: branchParam,
            },
            handler: async ({ q, branch }, ctx) => {
                const resolvedBranch = isApiBranch(branch) ? branch : "stable";
                const params = new URLSearchParams({ q, branch: resolvedBranch });
                const data = await fetchJson<ApiDocsSearchResult[]>(
                    `${ctx.baseUrl}/api/api-docs/search?${params}`,
                );
                return textResult(data);
            },
        }),
    ],
};
