import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { getGame } from "@/lib/schema/games";
import { getProtobufDump } from "@/lib/protobuf/dump";
import {
    buildProtobufModuleIndex,
    buildProtobufTypeIndex,
    findProtobufEntry,
    resolveProtobufType,
} from "@/lib/protobuf/queries";
import { toCSharpName } from "@/lib/protobuf/csharp";
import {
    capList,
    errorResult,
    fetchJson,
    gameParam,
    textResult,
    type McpContext,
} from "@/lib/mcp/context";
import type { ProtobufSearchResult } from "@/app/api/protobuf/search/route";

export function registerProtobufTools(server: McpServer, ctx: McpContext) {
    server.registerTool(
        "protobuf_lookup",
        {
            title: "Look up a protobuf message or enum",
            description:
                "Resolve a protobuf message or enum by name and return its fields/values plus a link to the protobuf viewer. Accepts either the raw proto name or its C# name (dots replaced with underscores). File is auto-resolved if omitted and the name is unambiguous.",
            inputSchema: {
                name: z.string().describe("Message or enum name, raw or C#, e.g. CMsgSayText2"),
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

            const findByCSharpName = (fileScope?: string) => {
                const lower = name.toLowerCase();
                for (const f of dump.files) {
                    if (fileScope && f.fileName !== fileScope) continue;
                    for (const m of f.messages) {
                        if (toCSharpName(m.name).toLowerCase() === lower) {
                            return { file: f.fileName, name: m.name };
                        }
                    }
                    for (const e of f.enums) {
                        if (toCSharpName(e.name).toLowerCase() === lower) {
                            return { file: f.fileName, name: e.name };
                        }
                    }
                }
                return null;
            };

            let resolvedFile = file;
            let resolvedName = name;

            if (resolvedFile) {
                if (!findProtobufEntry(dump, resolvedFile, resolvedName)) {
                    const alias = findByCSharpName(resolvedFile);
                    if (alias) {
                        resolvedFile = alias.file;
                        resolvedName = alias.name;
                    }
                }
            } else {
                const link = resolveProtobufType(buildProtobufTypeIndex(dump), name);
                if (link) {
                    resolvedFile = link.file;
                } else {
                    const alias = findByCSharpName();
                    if (alias) {
                        resolvedFile = alias.file;
                        resolvedName = alias.name;
                    }
                }
                if (!resolvedFile) {
                    return errorResult(
                        `No unambiguous protobuf message or enum named "${name}" found. Pass "file" to disambiguate.`,
                    );
                }
            }

            const found = findProtobufEntry(dump, resolvedFile, resolvedName);
            if (!found) {
                return errorResult(
                    `No protobuf message or enum named "${name}" found in file "${resolvedFile}".`,
                );
            }

            return textResult({
                url: `${ctx.baseUrl}/protobuf-viewer/${game}/${encodeURIComponent(resolvedFile)}/${encodeURIComponent(resolvedName)}`,
                file: resolvedFile,
                kind: found.kind,
                entry: found.entry,
            });
        },
    );

    server.registerTool(
        "protobuf_list",
        {
            title: "List protobuf modules, files, messages, and enums",
            description:
                "Browse the protobuf dump. Without filters, returns every module with its message/enum count. With a module, lists the messages/enums in it. With a file, lists the messages/enums declared in that exact file.",
            inputSchema: {
                module: z.string().optional().describe("Module to list contents for."),
                file: z.string().optional().describe("Proto file to list contents for."),
                game: gameParam,
            },
        },
        async ({ module, file, game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const dump = await getProtobufDump(game);

            if (file) {
                const found = dump.files.find((f) => f.fileName === file);
                if (!found) {
                    return errorResult(`Unknown protobuf file "${file}".`);
                }
                return textResult({
                    file,
                    modules: found.modules,
                    ...capList([
                        ...found.messages.map((m) => ({ name: m.name, kind: "message" as const })),
                        ...found.enums.map((e) => ({ name: e.name, kind: "enum" as const })),
                    ]),
                });
            }

            const modules = buildProtobufModuleIndex(dump);
            if (module) {
                const found = modules.find((m) => m.module === module);
                if (!found) {
                    return errorResult(
                        `Unknown module "${module}". Call protobuf_list without filters to see available modules.`,
                    );
                }
                return textResult({ module, ...capList(found.items) });
            }

            return textResult({
                modules: modules.map((m) => ({ module: m.module, count: m.items.length })),
            });
        },
    );

    server.registerTool(
        "protobuf_search",
        {
            title: "Search protobuf messages and enums",
            description:
                "Search protobuf messages and enums by substring (or numeric net message id), exactly like the protobuf viewer's search bar. Supports the same filters: kind, file, and module.",
            inputSchema: {
                q: z.string().optional().describe("Substring or numeric net message id to match."),
                kind: z.enum(["message", "enum"]).optional().describe("Filter by kind."),
                file: z.string().optional().describe("Filter: file name contains this."),
                module: z.string().optional().describe("Filter: exact module name."),
                game: gameParam,
            },
        },
        async ({ q, kind, file, module, game }) => {
            if (!getGame(game)) return errorResult(`Unknown game: ${game}`);
            const params = new URLSearchParams({ game });
            if (q) params.set("q", q);
            if (kind) params.set("kind", kind);
            if (file) params.set("file", file);
            if (module) params.set("module", module);

            const data = await fetchJson<ProtobufSearchResult[]>(
                `${ctx.baseUrl}/api/protobuf/search?${params}`,
            );
            return textResult(data);
        },
    );
}
