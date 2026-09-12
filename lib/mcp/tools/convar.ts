import { z } from "zod";
import { getGame } from "@/lib/schema/games";
import { getConvarsDump } from "@/lib/convars/dump";
import {
    buildConvarsModuleIndex,
    findConvarsEntry,
} from "@/lib/convars/queries";
import {
    ATTR_KEYS,
    matchesFilters,
    type FilterFacet,
    type Filters,
} from "@/lib/convars/filter";
import { capList, errorResult, gameParam, textResult } from "@/lib/mcp/context";
import { defineTool, type ToolGroup } from "@/lib/mcp/tools/types";

function facetFrom(include?: string[], exclude?: string[]): FilterFacet {
    const facet: FilterFacet = {};
    for (const key of include ?? []) facet[key] = "include";
    for (const key of exclude ?? []) facet[key] = "exclude";
    return facet;
}

export const convarToolGroup: ToolGroup = {
    domain: "ConVars",
    tools: [
        defineTool({
            name: "convar_lookup",
            title: "Look up a convar or concommand",
            description:
                "Resolve a console variable or console command by exact name (e.g. sv_cheats) and return its flags/description plus a link to the convars viewer. Module is auto-resolved if omitted.",
            inputSchema: {
                name: z
                    .string()
                    .describe("ConVar or ConCommand name, e.g. sv_cheats"),
                module: z
                    .string()
                    .optional()
                    .describe(
                        "Module the entry belongs to. Auto-resolved if omitted.",
                    ),
                game: gameParam,
            },
            handler: async ({ name, module, game }, ctx) => {
                if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
                const dump = await getConvarsDump(game);

                let resolvedModule = module;
                if (!resolvedModule) {
                    const entry =
                        dump.convars.find((c) => c.name === name) ??
                        dump.commands.find((c) => c.name === name);
                    if (!entry) {
                        return errorResult(
                            `No convar or concommand named "${name}" found.`,
                        );
                    }
                    resolvedModule = entry.module;
                }

                const found = findConvarsEntry(dump, resolvedModule, name);
                if (!found) {
                    return errorResult(
                        `No convar or concommand named "${name}" found in module "${resolvedModule}".`,
                    );
                }

                return textResult({
                    url: `${ctx.baseUrl}/convars-viewer/${game}/${encodeURIComponent(resolvedModule)}/${encodeURIComponent(name)}`,
                    module: resolvedModule,
                    kind: found.kind,
                    entry: found.entry,
                });
            },
        }),

        defineTool({
            name: "convar_list",
            title: "List convar/concommand modules",
            description:
                "Browse the convars dump. Without a module, returns every module with its entry count. With a module, lists the convars/concommands in it.",
            inputSchema: {
                module: z
                    .string()
                    .optional()
                    .describe("Module to list entries for."),
                game: gameParam,
            },
            handler: async ({ module, game }) => {
                if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
                const dump = await getConvarsDump(game);
                const modules = buildConvarsModuleIndex(dump);

                if (!module) {
                    return textResult({
                        modules: modules.map((m) => ({
                            module: m.module,
                            count: m.items.length,
                        })),
                    });
                }

                const found = modules.find((m) => m.module === module);
                if (!found) {
                    return errorResult(
                        `Unknown module "${module}". Call convar_list without "module" to see available modules.`,
                    );
                }
                return textResult({ module, ...capList(found.items) });
            },
        }),

        defineTool({
            name: "convar_search",
            title: "Search convars/concommands with tag filters",
            description:
                "Search convars and concommands exactly like the convars viewer's filter panel: substring on name, kind, and include/exclude tag filters on module, engine flag (lowercase, e.g. cheat, replicated, notify), and attribute (has_default, has_min, has_max, has_callback, has_completion_callback).",
            inputSchema: {
                q: z
                    .string()
                    .optional()
                    .describe("Substring to match in the name."),
                kind: z.enum(["all", "convar", "concommand"]).default("all"),
                modulesInclude: z
                    .array(z.string())
                    .optional()
                    .describe("Only these modules."),
                modulesExclude: z
                    .array(z.string())
                    .optional()
                    .describe("Exclude these modules."),
                flagsInclude: z
                    .array(z.string())
                    .optional()
                    .describe(
                        "Only entries with all of these engine flags, e.g. cheat.",
                    ),
                flagsExclude: z
                    .array(z.string())
                    .optional()
                    .describe(
                        "Exclude entries with any of these engine flags.",
                    ),
                attrsInclude: z
                    .array(z.enum(ATTR_KEYS))
                    .optional()
                    .describe("Only entries with all of these attributes."),
                attrsExclude: z
                    .array(z.enum(ATTR_KEYS))
                    .optional()
                    .describe("Exclude entries with any of these attributes."),
                game: gameParam,
            },
            handler: async (
                {
                    q,
                    kind,
                    modulesInclude,
                    modulesExclude,
                    flagsInclude,
                    flagsExclude,
                    attrsInclude,
                    attrsExclude,
                    game,
                },
                ctx,
            ) => {
                if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
                const dump = await getConvarsDump(game);
                const modules = buildConvarsModuleIndex(dump);

                const filters: Filters = {
                    kind,
                    modules: facetFrom(modulesInclude, modulesExclude),
                    flags: facetFrom(flagsInclude, flagsExclude),
                    attrs: facetFrom(attrsInclude, attrsExclude),
                };

                const qLower = q?.toLowerCase();
                const results: {
                    name: string;
                    module: string;
                    kind: "convar" | "concommand";
                    flags: string[];
                    attrs: string[];
                    url: string;
                }[] = [];

                for (const mod of modules) {
                    for (const item of mod.items) {
                        if (qLower && !item.name.toLowerCase().includes(qLower))
                            continue;
                        if (
                            !matchesFilters(
                                {
                                    kind: item.kind,
                                    module: mod.module,
                                    flags: item.flags,
                                    attrs: item.attrs,
                                },
                                filters,
                            )
                        ) {
                            continue;
                        }
                        results.push({
                            module: mod.module,
                            ...item,
                            url: `${ctx.baseUrl}/convars-viewer/${game}/${encodeURIComponent(mod.module)}/${encodeURIComponent(item.name)}`,
                        });
                    }
                }

                return textResult(capList(results));
            },
        }),
    ],
};
