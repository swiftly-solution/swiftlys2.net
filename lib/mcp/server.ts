import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { DEFAULT_GAME_ID, GAMES, getGame } from "@/lib/schema/games";
import { getSchemaDump } from "@/lib/schema/dump";
import { buildNameIndex, findEntry } from "@/lib/schema/queries";
import { getEntitiesDump } from "@/lib/entities/dump";
import { findEntityEntry } from "@/lib/entities/queries";
import { getProtobufDump } from "@/lib/protobuf/dump";
import {
    buildProtobufTypeIndex,
    findProtobufEntry,
    resolveProtobufType,
} from "@/lib/protobuf/queries";
import { getGameEventsDump } from "@/lib/gameevents/dump";
import { findGameEvent } from "@/lib/gameevents/queries";
import { getConvarsDump } from "@/lib/convars/dump";
import { findConvarsEntry } from "@/lib/convars/queries";
import { getApiDump } from "@/lib/api-docs/dump";
import { apiDocsHref, buildNavTree, findType, isApiBranch } from "@/lib/api-docs/tree";

const GAME_IDS = GAMES.map((g) => g.id) as [string, ...string[]];

const gameParam = z
    .enum(GAME_IDS)
    .default(DEFAULT_GAME_ID)
    .describe(`Game id. One of: ${GAME_IDS.join(", ")}.`);

function textResult(data: unknown): CallToolResult {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

function errorResult(message: string): CallToolResult {
    return { content: [{ type: "text", text: message }], isError: true };
}

export function createMcpServer(baseUrl: string): McpServer {
    const server = new McpServer({
        name: "swiftlys2",
        version: "1.0.0",
    });

    server.registerTool(
        "schema_lookup",
        {
            title: "Look up a schema class or enum",
            description:
                "Resolve a Source 2 schema class or enum by name (e.g. CBaseEntity) and return its fields/members plus a link to the schema viewer. Project is auto-resolved if omitted.",
            inputSchema: {
                name: z.string().describe("Class or enum name, e.g. CBaseEntity"),
                project: z
                    .string()
                    .optional()
                    .describe("Schema project bucket, e.g. server. Auto-resolved if omitted."),
                game: gameParam,
            },
        },
        async ({ name, project, game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const dump = await getSchemaDump(game);

            let resolvedProject = project;
            if (!resolvedProject) {
                const links = buildNameIndex(dump).get(name);
                if (!links || links.length === 0) {
                    return errorResult(`No schema class or enum named "${name}" found.`);
                }
                resolvedProject =
                    links.find((l) => l.project === "server")?.project ?? links[0].project;
            }

            const found = findEntry(dump, resolvedProject, name);
            if (!found) {
                return errorResult(
                    `No schema class or enum named "${name}" found in project "${resolvedProject}".`,
                );
            }

            return textResult({
                url: `${baseUrl}/schema-viewer/${game}/${encodeURIComponent(resolvedProject)}/${encodeURIComponent(name)}`,
                project: resolvedProject,
                kind: found.kind,
                entry: found.entry,
            });
        },
    );

    server.registerTool(
        "entity_lookup",
        {
            title: "Look up an entity class",
            description:
                "Resolve a Source 2 entity class by name (e.g. CCSPlayerPawn) and return its datamap (inputs/outputs/members) plus a link to the entity viewer.",
            inputSchema: {
                className: z.string().describe("Entity class name, e.g. CCSPlayerPawn"),
                game: gameParam,
            },
        },
        async ({ className, game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const dump = await getEntitiesDump(game);
            const found = findEntityEntry(dump, className);
            if (!found) {
                return errorResult(`No entity class named "${className}" found.`);
            }
            return textResult({
                url: `${baseUrl}/entity-viewer/${game}/${encodeURIComponent(className)}`,
                datamap: found.datamap,
                entityClass: found.entityClass,
            });
        },
    );

    server.registerTool(
        "protobuf_lookup",
        {
            title: "Look up a protobuf message or enum",
            description:
                "Resolve a protobuf message or enum by name (e.g. CMsgSayText2) and return its fields/values plus a link to the protobuf viewer. File is auto-resolved if omitted and the name is unambiguous.",
            inputSchema: {
                name: z.string().describe("Message or enum name, e.g. CMsgSayText2"),
                file: z
                    .string()
                    .optional()
                    .describe("Proto file name. Auto-resolved if omitted and unambiguous."),
                game: gameParam,
            },
        },
        async ({ name, file, game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const dump = await getProtobufDump(game);

            let resolvedFile = file;
            if (!resolvedFile) {
                const link = resolveProtobufType(buildProtobufTypeIndex(dump), name);
                if (!link) {
                    return errorResult(
                        `No unambiguous protobuf message or enum named "${name}" found. Pass "file" to disambiguate.`,
                    );
                }
                resolvedFile = link.file;
            }

            const found = findProtobufEntry(dump, resolvedFile, name);
            if (!found) {
                return errorResult(
                    `No protobuf message or enum named "${name}" found in file "${resolvedFile}".`,
                );
            }

            return textResult({
                url: `${baseUrl}/protobuf-viewer/${game}/${encodeURIComponent(resolvedFile)}/${encodeURIComponent(name)}`,
                file: resolvedFile,
                kind: found.kind,
                entry: found.entry,
            });
        },
    );

    server.registerTool(
        "gameevent_lookup",
        {
            title: "Look up a game event",
            description:
                "Resolve a game event by name (e.g. player_death) and return its fields plus a link to the game events viewer.",
            inputSchema: {
                name: z.string().describe("Game event name, e.g. player_death"),
                game: gameParam,
            },
        },
        async ({ name, game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const dump = await getGameEventsDump(game);
            const found = findGameEvent(dump, name);
            if (!found) {
                return errorResult(`No game event named "${name}" found.`);
            }
            return textResult({
                url: `${baseUrl}/gameevents-viewer/${game}/${encodeURIComponent(name)}`,
                entry: found,
            });
        },
    );

    server.registerTool(
        "convar_lookup",
        {
            title: "Look up a convar or concommand",
            description:
                "Resolve a console variable or console command by name (e.g. sv_cheats) and return its flags/description plus a link to the convars viewer. Module is auto-resolved if omitted.",
            inputSchema: {
                name: z.string().describe("ConVar or ConCommand name, e.g. sv_cheats"),
                module: z
                    .string()
                    .optional()
                    .describe("Module the entry belongs to. Auto-resolved if omitted."),
                game: gameParam,
            },
        },
        async ({ name, module, game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const dump = await getConvarsDump(game);

            let resolvedModule = module;
            if (!resolvedModule) {
                const entry =
                    dump.convars.find((c) => c.name === name) ??
                    dump.commands.find((c) => c.name === name);
                if (!entry) {
                    return errorResult(`No convar or concommand named "${name}" found.`);
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
                url: `${baseUrl}/convars-viewer/${game}/${encodeURIComponent(resolvedModule)}/${encodeURIComponent(name)}`,
                module: resolvedModule,
                kind: found.kind,
                entry: found.entry,
            });
        },
    );

    server.registerTool(
        "apidocs_lookup",
        {
            title: "Look up a SwiftlyS2 API type",
            description:
                "Resolve a SwiftlyS2 C# API type by name (e.g. PlayerManager) and return its declaration/members plus a link to the API docs. Optionally narrow to a single member (method/property/field).",
            inputSchema: {
                name: z.string().describe("Type name, e.g. PlayerManager"),
                member: z
                    .string()
                    .optional()
                    .describe("Member name to narrow the result to, e.g. SendCenterHTML"),
                branch: z
                    .enum(["stable", "beta"])
                    .default("stable")
                    .describe("API docs branch."),
            },
        },
        async ({ name, member, branch }) => {
            const resolvedBranch = isApiBranch(branch) ? branch : "stable";
            const dump = await getApiDump(resolvedBranch);

            for (const category of buildNavTree(dump)) {
                const navType = category.types.find((t) => t.name === name);
                if (!navType) continue;

                const found = findType(dump, category.slug, navType.slug);
                if (!found) break;

                if (member) {
                    const lists = [
                        found.type.operators,
                        found.type.constructors,
                        found.type.methods,
                        found.type.properties,
                        found.type.fields,
                    ];
                    const memberEntry = lists
                        .flat()
                        .find((m) => m?.name.toLowerCase() === member.toLowerCase());
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
                        url: `${baseUrl}${apiDocsHref(resolvedBranch, category.slug, navType.slug)}#${anchor}`,
                        type: name,
                        member: memberEntry,
                    });
                }

                return textResult({
                    url: `${baseUrl}${apiDocsHref(resolvedBranch, category.slug, navType.slug)}`,
                    type: found.type,
                });
            }

            return errorResult(`No API type named "${name}" found on branch "${resolvedBranch}".`);
        },
    );

    return server;
}
