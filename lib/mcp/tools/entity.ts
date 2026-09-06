import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getGame } from "@/lib/schema/games";
import { getEntitiesDump } from "@/lib/entities/dump";
import { buildEntityIndex, findEntityEntry } from "@/lib/entities/queries";
import { toInterfaceName } from "@/lib/schema/codegen/csharp";
import {
    capList,
    errorResult,
    fetchJson,
    gameParam,
    textResult,
    type McpContext,
} from "@/lib/mcp/context";
import type { EntitySearchResponse } from "@/app/api/entities/search/route";

export function registerEntityTools(server: McpServer, ctx: McpContext) {
    server.registerTool(
        "entity_lookup",
        {
            title: "Look up an entity class",
            description:
                "Resolve a Source 2 entity class by name and return its datamap (inputs/outputs/members) plus a link to the entity viewer. Accepts either the raw class name or its C# interface name.",
            inputSchema: {
                className: z
                    .string()
                    .describe("Entity class name, raw (CCSPlayerPawn) or C# interface name"),
                game: gameParam,
            },
        },
        async ({ className, game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const dump = await getEntitiesDump(game);

            let found = findEntityEntry(dump, className);
            let resolvedClassName = className;
            if (!found) {
                const lower = className.toLowerCase();
                const match = dump.datamaps.find(
                    (dm) => toInterfaceName(dm.class_name).toLowerCase() === lower,
                );
                if (match) {
                    resolvedClassName = match.class_name;
                    found = findEntityEntry(dump, resolvedClassName);
                }
            }
            if (!found) {
                return errorResult(`No entity class named "${className}" found.`);
            }
            return textResult({
                url: `${ctx.baseUrl}/entity-viewer/${game}/${encodeURIComponent(resolvedClassName)}`,
                datamap: found.datamap,
                entityClass: found.entityClass,
            });
        },
    );

    server.registerTool(
        "entity_list",
        {
            title: "List entity classes",
            description:
                "List entity class names. Pass a prefix to narrow it down (entity classes aren't grouped into modules); without one, only the first page is returned - use entity_search for substring matches anywhere in the name.",
            inputSchema: {
                prefix: z
                    .string()
                    .optional()
                    .describe("Case-insensitive prefix to filter class names by."),
                game: gameParam,
            },
        },
        async ({ prefix, game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const dump = await getEntitiesDump(game);
            const names = buildEntityIndex(dump).map((e) => e.name);
            const filtered = prefix
                ? names.filter((n) => n.toLowerCase().startsWith(prefix.toLowerCase()))
                : names;
            return textResult(capList(filtered));
        },
    );

    server.registerTool(
        "entity_search",
        {
            title: "Search entity classes and datamap fields",
            description:
                "Search entity classes and their input/output/member datamap fields by substring, exactly like the entity viewer's search bar.",
            inputSchema: {
                q: z.string().optional().describe("Substring to match in class or field names."),
                kind: z
                    .enum(["input", "output", "member"])
                    .optional()
                    .describe("Filter datamap field matches to this kind."),
                field: z.string().optional().describe("Filter: field name contains this."),
                game: gameParam,
            },
        },
        async ({ q, kind, field, game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const params = new URLSearchParams({ game });
            if (q) params.set("q", q);
            if (kind) params.set("kind", kind);
            if (field) params.set("field", field);

            const data = await fetchJson<EntitySearchResponse>(
                `${ctx.baseUrl}/api/entities/search?${params}`,
            );
            return textResult(data);
        },
    );
}
