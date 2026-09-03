import { NextResponse, type NextRequest } from "next/server";
import { getEntitiesDump } from "@/lib/entities/dump";
import { findEntityEntry } from "@/lib/entities/queries";
import { getSchemaDump } from "@/lib/schema/dump";
import {
    buildNameIndex,
    resolveLink,
    walkAncestorChain,
} from "@/lib/schema/queries";
import { getGame } from "@/lib/schema/games";
import {
    getClassFieldDisplays,
    toInterfaceName,
} from "@/lib/schema/codegen/csharp";
import type { ResolvedLink } from "@/lib/schema/queries";
import type { SchemaClass } from "@/lib/schema/types";
import type {
    EntityEntryResponse,
    ParentClassPayload,
} from "@/lib/entities/types";

type FieldOwner = { link: ResolvedLink; cls: SchemaClass };

function resolveMemberFieldOwner(
    chain: FieldOwner[],
    displaysCache: Map<number, ReturnType<typeof getClassFieldDisplays>>,
    allClassNames: Set<string>,
    allEnumNames: Set<string>,
    fieldName: string,
): { link: ResolvedLink; className: string; csharpFieldName: string } | null {
    for (let i = 0; i < chain.length; i++) {
        const owner = chain[i];
        const idx = (owner.cls.fields ?? []).findIndex(
            (f) => f.name === fieldName,
        );
        if (idx === -1) continue;

        let displays = displaysCache.get(i);
        if (!displays) {
            displays = getClassFieldDisplays(
                owner.cls,
                allClassNames,
                allEnumNames,
            );
            displaysCache.set(i, displays);
        }

        return {
            link: owner.link,
            className: owner.cls.name,
            csharpFieldName: displays[idx].name,
        };
    }
    return null;
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

    let schemaLink: ResolvedLink | null = null;
    let parentClasses: ParentClassPayload[] = [];
    const fieldOwnerChain: FieldOwner[] = [];
    let allClassNames = new Set<string>();
    let allEnumNames = new Set<string>();
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
                allClassNames = new Set(
                    schemaDump.classes.map((c) => c.name.replaceAll(":", "_")),
                );
                allEnumNames = new Set(
                    schemaDump.enums.map((e) => e.name.replaceAll(":", "_")),
                );

                fieldOwnerChain.push({ link: schemaLink, cls });

                const ancestors = walkAncestorChain(schemaDump, nameIndex, cls);
                parentClasses = ancestors.map((ancestor) => ({
                    name: ancestor.name,
                    csharpName: toInterfaceName(ancestor.name),
                    link: ancestor.link,
                }));

                for (const ancestor of ancestors) {
                    if (!ancestor.link) continue;
                    const ancestorCls = schemaDump.classes.find(
                        (c) =>
                            c.project === ancestor.link!.project &&
                            c.name === ancestor.name,
                    );
                    if (ancestorCls) {
                        fieldOwnerChain.push({
                            link: ancestor.link,
                            cls: ancestorCls,
                        });
                    }
                }
            }
        }
    } catch {
        schemaLink = null;
    }

    const displaysCache = new Map<
        number,
        ReturnType<typeof getClassFieldDisplays>
    >();

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
        members: (datamap.fields.members ?? []).map((f) => {
            const owner = resolveMemberFieldOwner(
                fieldOwnerChain,
                displaysCache,
                allClassNames,
                allEnumNames,
                f.fieldName,
            );
            return {
                externalName: f.externalName,
                fieldType: f.fieldType,
                fieldName: f.fieldName,
                csharpFieldName: owner?.csharpFieldName ?? f.fieldName,
                schemaClassName: owner?.className ?? null,
                schemaProject: owner?.link.project ?? null,
            };
        }),
        thinkFunctions: datamap.think_functions,
    };
    return NextResponse.json(response);
}
