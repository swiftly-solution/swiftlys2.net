import { type NextRequest } from "next/server";
import { getSchemaDump } from "@/lib/schema/dump";
import { getConvarsDump } from "@/lib/convars/dump";
import { getEntitiesDump } from "@/lib/entities/dump";
import { getGame } from "@/lib/schema/games";
import { getBaseUrl } from "@/lib/base-url";

export type SearchDocumentType =
    | "class"
    | "enum"
    | "field"
    | "convar"
    | "concommand"
    | "entity_class"
    | "entity_member"
    | "entity_input"
    | "entity_output";

export type SearchDocument = {
    id: string;
    type: SearchDocumentType;
    name: string;
    owner?: string;
    project?: string;
    description?: string;
    url: string;
};

// Recommended Typesense collection schema for these documents:
//
// {
//   "name": "swiftlys2",
//   "fields": [
//     { "name": "type", "type": "string", "facet": true },
//     { "name": "name", "type": "string" },
//     { "name": "owner", "type": "string", "facet": true, "optional": true },
//     { "name": "project", "type": "string", "facet": true, "optional": true },
//     { "name": "description", "type": "string", "optional": true },
//     { "name": "url", "type": "string", "index": false }
//   ]
// }
//
// Import with: curl -X POST 'http://<typesense-host>/collections/swiftlys2/documents/import?action=upsert' \
//   -H 'X-TYPESENSE-API-KEY: <key>' --data-binary @export.ndjson

function sanitizeId(parts: (string | undefined)[]): string {
    return parts
        .filter((p): p is string => Boolean(p))
        .join("::")
        .replaceAll(/\s+/g, "_");
}

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    if (!gameId || !getGame(gameId)) {
        return new Response(JSON.stringify({ error: "unknown game" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    const baseUrl = await getBaseUrl();

    let schemaDump, convarsDump, entitiesDump;
    try {
        [schemaDump, convarsDump, entitiesDump] = await Promise.all([
            getSchemaDump(gameId),
            getConvarsDump(gameId),
            getEntitiesDump(gameId),
        ]);
    } catch {
        return new Response(JSON.stringify({ error: "unavailable" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
        });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            const seenIds = new Set<string>();
            const write = (doc: SearchDocument) => {
                if (seenIds.has(doc.id)) return;
                seenIds.add(doc.id);
                controller.enqueue(encoder.encode(`${JSON.stringify(doc)}\n`));
            };

            for (const c of schemaDump.classes) {
                const url = `${baseUrl}/schema-viewer/${gameId}/${c.project}/${encodeURIComponent(c.name)}`;
                write({
                    id: sanitizeId(["class", c.project, c.name]),
                    type: "class",
                    name: c.name,
                    project: c.project,
                    url,
                });
                for (const field of c.fields ?? []) {
                    write({
                        id: sanitizeId([
                            "field",
                            c.project,
                            c.name,
                            field.name,
                        ]),
                        type: "field",
                        name: field.name,
                        owner: c.name,
                        project: c.project,
                        url: `${url}#field-${encodeURIComponent(field.name)}`,
                    });
                }
            }

            for (const e of schemaDump.enums) {
                write({
                    id: sanitizeId(["enum", e.project, e.name]),
                    type: "enum",
                    name: e.name,
                    project: e.project,
                    url: `${baseUrl}/schema-viewer/${gameId}/${e.project}/${encodeURIComponent(e.name)}`,
                });
            }

            for (const cv of convarsDump.convars) {
                write({
                    id: sanitizeId(["convar", cv.module, cv.name]),
                    type: "convar",
                    name: cv.name,
                    project: cv.module,
                    description: cv.description || undefined,
                    url: `${baseUrl}/convars-viewer/${gameId}/${cv.module}/${encodeURIComponent(cv.name)}`,
                });
            }

            for (const cc of convarsDump.commands) {
                write({
                    id: sanitizeId(["concommand", cc.module, cc.name]),
                    type: "concommand",
                    name: cc.name,
                    project: cc.module,
                    description: cc.description || undefined,
                    url: `${baseUrl}/convars-viewer/${gameId}/${cc.module}/${encodeURIComponent(cc.name)}`,
                });
            }

            const designerNames = new Map(
                entitiesDump.entityClasses.map((ec) => [
                    ec.class_name,
                    ec.designer_name,
                ]),
            );

            for (const dm of entitiesDump.datamaps) {
                const entityUrl = `${baseUrl}/entity-viewer/${gameId}/${encodeURIComponent(dm.class_name)}`;
                write({
                    id: sanitizeId(["entity_class", dm.class_name]),
                    type: "entity_class",
                    name: dm.class_name,
                    description: designerNames.get(dm.class_name),
                    url: entityUrl,
                });

                for (const member of dm.fields.members ?? []) {
                    write({
                        id: sanitizeId([
                            "entity_member",
                            dm.class_name,
                            member.fieldName,
                        ]),
                        type: "entity_member",
                        name: member.externalName,
                        owner: dm.class_name,
                        description: member.fieldName,
                        url: `${entityUrl}#member-${encodeURIComponent(member.fieldName)}`,
                    });
                }
                for (const input of dm.fields.inputs ?? []) {
                    write({
                        id: sanitizeId([
                            "entity_input",
                            dm.class_name,
                            input.externalName,
                        ]),
                        type: "entity_input",
                        name: input.externalName,
                        owner: dm.class_name,
                        url: `${entityUrl}#input-${encodeURIComponent(input.externalName)}`,
                    });
                }
                for (const output of dm.fields.outputs ?? []) {
                    write({
                        id: sanitizeId([
                            "entity_output",
                            dm.class_name,
                            output.externalName,
                        ]),
                        type: "entity_output",
                        name: output.externalName,
                        owner: dm.class_name,
                        url: `${entityUrl}#output-${encodeURIComponent(output.externalName)}`,
                    });
                }
            }

            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
