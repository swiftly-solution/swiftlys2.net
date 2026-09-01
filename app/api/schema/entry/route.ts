import { NextResponse, type NextRequest } from "next/server";
import { getSchemaDump } from "@/lib/schema/dump";
import {
    buildNameIndex,
    findEntry,
    findReferences,
    resolveLink,
} from "@/lib/schema/queries";
import { getGame } from "@/lib/schema/games";
import {
    getClassFieldDisplays,
    toInterfaceName,
} from "@/lib/schema/codegen/csharp";
import { getEntitiesDump } from "@/lib/entities/dump";
import { hasDatamap } from "@/lib/entities/queries";
import type {
    ClassEntryResponse,
    EnumEntryResponse,
} from "@/lib/schema/api-types";

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const project = request.nextUrl.searchParams.get("project");
    const name = request.nextUrl.searchParams.get("name");

    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }
    if (!project || !name) {
        return NextResponse.json(
            { error: "missing project/name" },
            { status: 400 },
        );
    }

    let dump;
    try {
        dump = await getSchemaDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const found = findEntry(dump, project, name);
    if (!found) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const nameIndex = buildNameIndex(dump);
    const currentProject = found.entry.project;
    const resolve = (typeName: string) =>
        resolveLink(nameIndex, typeName, currentProject);
    const references = findReferences(dump, name);

    const allClassNames = new Set(
        dump.classes.map((c) => c.name.replaceAll(":", "_")),
    );
    const allEnumNames = new Set(
        dump.enums.map((e) => e.name.replaceAll(":", "_")),
    );

    if (found.kind === "class") {
        const c = found.entry;
        const fieldDisplays = getClassFieldDisplays(
            c,
            allClassNames,
            allEnumNames,
        );

        let hasEntityData = false;
        try {
            const entitiesDump = await getEntitiesDump(gameId);
            hasEntityData = hasDatamap(entitiesDump, c.name);
        } catch {
            hasEntityData = false;
        }

        const response: ClassEntryResponse = {
            kind: "class",
            name: c.name,
            csharpName: toInterfaceName(c.name),
            project: c.project,
            size: c.size,
            alignment: c.alignment,
            is_struct: c.is_struct,
            baseClasses: (c.base_classes ?? []).map((base) => ({
                name: base,
                csharpName: toInterfaceName(base),
                link: resolve(base),
            })),
            fields: (c.fields ?? []).map((field, i) => ({
                name: field.name,
                csharpName: fieldDisplays[i].name,
                type: field.type,
                csharpType: fieldDisplays[i].type,
                typeLink: resolve(field.type),
                offset: field.offset,
                size: field.size,
                networked: field.networked,
                kind: field.kind,
                element_count: field.element_count,
                templated: field.templated,
            })),
            references,
            hasEntityData,
        };
        return NextResponse.json(response);
    }

    const e = found.entry;
    const response: EnumEntryResponse = {
        kind: "enum",
        name: e.name,
        csharpName: toInterfaceName(e.name),
        project: e.project,
        size: e.size,
        alignment: e.alignment,
        members: e.fields,
        references,
    };
    return NextResponse.json(response);
}
