import { z } from "zod";
import { getGame } from "@/lib/schema/games";
import { getSchemaDump } from "@/lib/schema/dump";
import { buildModuleIndex, buildNameIndex, findEntry } from "@/lib/schema/queries";
import { toInterfaceName } from "@/lib/schema/codegen/csharp";
import { capList, errorResult, fetchJson, gameParam, textResult } from "@/lib/mcp/context";
import { defineTool, type ToolGroup } from "@/lib/mcp/tools/types";
import type { SchemaSearchResponse } from "@/app/api/schema/search/route";

export const schemaToolGroup: ToolGroup = {
    domain: "Schema",
    tools: [
        defineTool({
            name: "schema_lookup",
            title: "Look up a schema class or enum",
            description:
                "Resolve a Source 2 schema class or enum by name and return its fields/members plus a link to the schema viewer. Accepts either the raw name or its C# interface name. Project is auto-resolved if omitted.",
            inputSchema: {
                name: z.string().describe("Class or enum name, raw or C#, e.g. CBaseEntity"),
                project: z
                    .string()
                    .optional()
                    .describe("Schema project bucket, e.g. server. Auto-resolved if omitted."),
                game: gameParam,
            },
            handler: async ({ name, project, game }, ctx) => {
                if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
                const dump = await getSchemaDump(game);
                const nameIndex = buildNameIndex(dump);

                let resolvedName = name;
                if (!nameIndex.has(resolvedName)) {
                    const lower = name.toLowerCase();
                    const match =
                        dump.classes.find(
                            (c) =>
                                (!project || c.project === project) &&
                                toInterfaceName(c.name).toLowerCase() === lower,
                        ) ??
                        dump.enums.find(
                            (e) =>
                                (!project || e.project === project) &&
                                toInterfaceName(e.name).toLowerCase() === lower,
                        );
                    if (match) resolvedName = match.name;
                }

                let resolvedProject = project;
                if (!resolvedProject) {
                    const links = nameIndex.get(resolvedName);
                    if (!links || links.length === 0) {
                        return errorResult(`No schema class or enum named "${name}" found.`);
                    }
                    resolvedProject =
                        links.find((l) => l.project === "server")?.project ?? links[0].project;
                }

                const found = findEntry(dump, resolvedProject, resolvedName);
                if (!found) {
                    return errorResult(
                        `No schema class or enum named "${name}" found in project "${resolvedProject}".`,
                    );
                }

                return textResult({
                    url: `${ctx.baseUrl}/schema-viewer/${game}/${encodeURIComponent(resolvedProject)}/${encodeURIComponent(resolvedName)}`,
                    project: resolvedProject,
                    kind: found.kind,
                    entry: found.entry,
                });
            },
        }),

        defineTool({
            name: "schema_list",
            title: "List schema projects, classes, and enums",
            description:
                "Browse the schema dump. Without a project, returns every project with its class/enum counts. With a project, returns the class and enum names in it (capped; use schema_search to narrow further).",
            inputSchema: {
                project: z
                    .string()
                    .optional()
                    .describe("Project to list classes/enums for, e.g. server."),
                game: gameParam,
            },
            handler: async ({ project, game }) => {
                if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
                const dump = await getSchemaDump(game);
                const modules = buildModuleIndex(dump);

                if (!project) {
                    return textResult({
                        projects: modules.map((m) => ({
                            project: m.project,
                            classCount: m.items.filter((i) => i.kind === "class").length,
                            enumCount: m.items.filter((i) => i.kind === "enum").length,
                        })),
                    });
                }

                const found = modules.find((m) => m.project === project);
                if (!found) {
                    return errorResult(
                        `Unknown project "${project}". Call schema_list without "project" to see available projects.`,
                    );
                }
                return textResult({ project, ...capList(found.items) });
            },
        }),

        defineTool({
            name: "schema_search",
            title: "Search schema fields and enum values",
            description:
                "Search across all schema fields and enum values by substring, exactly like the schema viewer's search bar. Supports the same filters: field name, type, byte offset, enum value, and networked flag.",
            inputSchema: {
                q: z.string().optional().describe("Substring to match in field/type names."),
                field: z.string().optional().describe("Filter: field name contains this."),
                type: z.string().optional().describe("Filter: field type contains this."),
                offset: z
                    .string()
                    .optional()
                    .describe("Filter: exact byte offset (decimal or 0x-hex)."),
                enumvalue: z
                    .string()
                    .optional()
                    .describe("Filter: exact enum member value (decimal or 0x-hex)."),
                networked: z
                    .boolean()
                    .optional()
                    .describe("Filter: whether the field is networked."),
                game: gameParam,
            },
            handler: async ({ q, field, type, offset, enumvalue, networked, game }, ctx) => {
                if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
                const params = new URLSearchParams({ game });
                if (q) params.set("q", q);
                if (field) params.set("field", field);
                if (type) params.set("type", type);
                if (offset) params.set("offset", offset);
                if (enumvalue) params.set("enumvalue", enumvalue);
                if (networked !== undefined) params.set("networked", String(networked));

                const data = await fetchJson<SchemaSearchResponse>(
                    `${ctx.baseUrl}/api/schema/search?${params}`,
                );
                return textResult(data);
            },
        }),
    ],
};
