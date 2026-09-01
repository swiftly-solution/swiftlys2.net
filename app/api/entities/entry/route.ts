import { NextResponse, type NextRequest } from "next/server";
import { getEntitiesDump } from "@/lib/entities/dump";
import { findEntityEntry } from "@/lib/entities/queries";
import { getSchemaDump } from "@/lib/schema/dump";
import { buildNameIndex, resolveLink } from "@/lib/schema/queries";
import { getGame } from "@/lib/schema/games";
import {
    getClassFieldDisplays,
    toInterfaceName,
} from "@/lib/schema/codegen/csharp";
import type { ResolvedLink } from "@/lib/schema/queries";
import type { SchemaClass, SchemaDump } from "@/lib/schema/types";
import type {
    EntityEntryResponse,
    ParentClassPayload,
} from "@/lib/entities/types";

const MAX_ANCESTOR_DEPTH = 32;

function walkAncestorChain(
    schemaDump: SchemaDump,
    nameIndex: Map<string, ResolvedLink[]>,
    startClass: SchemaClass,
): ParentClassPayload[] {
    const chain: ParentClassPayload[] = [];
    let current: SchemaClass | undefined = startClass;
    const seen = new Set<string>();

    for (
        let depth = 0;
        depth < MAX_ANCESTOR_DEPTH && current?.base_classes?.[0];
        depth++
    ) {
        const baseName: string = current.base_classes[0];
        if (seen.has(baseName)) break;
        seen.add(baseName);

        const link = resolveLink(nameIndex, baseName, "server");
        chain.push({
            name: baseName,
            csharpName: toInterfaceName(baseName),
            link,
        });

        current = link
            ? schemaDump.classes.find(
                  (c) => c.project === link.project && c.name === baseName,
              )
            : undefined;
    }

    return chain;
}

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const className = request.nextUrl.searchParams.get("className");

    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }
    if (!className) {
        return NextResponse.json(
            { error: "missing className" },
            { status: 400 },
        );
    }

    let entitiesDump;
    try {
        entitiesDump = await getEntitiesDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const found = findEntityEntry(entitiesDump, className);
    if (!found) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    // Entities and their think functions are predominantly server-side
    // gameplay logic, so when a class name is ambiguous across projects,
    // prefer the "server" declaration.
    let schemaLink: ResolvedLink | null = null;
    let parentClasses: ParentClassPayload[] = [];
    const csharpFieldNames = new Map<string, string>();
    try {
        const schemaDump = await getSchemaDump(gameId);
        const nameIndex = buildNameIndex(schemaDump);
        schemaLink = resolveLink(nameIndex, className, "server");

        if (schemaLink) {
            const cls = schemaDump.classes.find(
                (c) =>
                    c.project === schemaLink!.project && c.name === className,
            );
            if (cls) {
                const allClassNames = new Set(
                    schemaDump.classes.map((c) => c.name.replaceAll(":", "_")),
                );
                const allEnumNames = new Set(
                    schemaDump.enums.map((e) => e.name.replaceAll(":", "_")),
                );
                const displays = getClassFieldDisplays(
                    cls,
                    allClassNames,
                    allEnumNames,
                );
                (cls.fields ?? []).forEach((field, i) => {
                    csharpFieldNames.set(field.name, displays[i].name);
                });

                parentClasses = walkAncestorChain(schemaDump, nameIndex, cls);
            }
        }
    } catch {
        schemaLink = null;
    }

    const { datamap, entityClass } = found;
    const response: EntityEntryResponse = {
        className: datamap.class_name,
        designerName: entityClass?.designer_name ?? null,
        flags: entityClass?.flags ?? [],
        schemaLink,
        parentClasses,
        inputs: (datamap.fields.inputs ?? []).map((f) => ({
            externalName: f.externalName,
            fieldType: f.fieldType,
        })),
        outputs: (datamap.fields.outputs ?? []).map((f) => ({
            externalName: f.externalName,
        })),
        members: (datamap.fields.members ?? []).map((f) => ({
            externalName: f.externalName,
            fieldType: f.fieldType,
            fieldName: f.fieldName,
            csharpFieldName: csharpFieldNames.get(f.fieldName) ?? f.fieldName,
        })),
        thinkFunctions: datamap.think_functions,
    };
    return NextResponse.json(response);
}
