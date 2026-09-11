import { NextResponse, type NextRequest } from "next/server";
import { getSchemaDump } from "@/lib/schema/dump";
import { getGame } from "@/lib/schema/games";
import { toFieldName, toInterfaceName } from "@/lib/schema/codegen/csharp";

const MAX_RESULTS = 100;

export type FieldSearchResult = {
    project: string;
    className: string;
    fieldName: string;
    fieldType: string;
    networked: boolean;
};

export type EnumValueSearchResult = {
    project: string;
    enumName: string;
    memberName: string;
    value: number;
};

export type ClassSearchResult = {
    project: string;
    name: string;
    kind: "class" | "enum";
};

export type SchemaSearchResponse = {
    classes: ClassSearchResult[];
    fields: FieldSearchResult[];
    enumValues: EnumValueSearchResult[];
};

function parseIntFlexible(value: string): number | null {
    if (!value) return null;
    const n = /^0x/i.test(value) ? parseInt(value, 16) : parseInt(value, 10);
    return Number.isFinite(n) ? n : null;
}

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const fieldParam =
        request.nextUrl.searchParams.get("field")?.trim().toLowerCase() ?? "";
    const typeParam =
        request.nextUrl.searchParams.get("type")?.trim().toLowerCase() ?? "";
    const offsetParam =
        request.nextUrl.searchParams.get("offset")?.trim() ?? "";
    const enumvalueParam =
        request.nextUrl.searchParams.get("enumvalue")?.trim() ?? "";
    const networkedParam = request.nextUrl.searchParams
        .get("networked")
        ?.trim()
        .toLowerCase();

    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }

    const targetOffset = parseIntFlexible(offsetParam);
    const targetEnumValue = parseIntFlexible(enumvalueParam);
    const targetNetworked =
        networkedParam === "true"
            ? true
            : networkedParam === "false"
              ? false
              : null;
    const hasKeyFilter = Boolean(
        fieldParam ||
        typeParam ||
        targetOffset !== null ||
        targetNetworked !== null,
    );

    if (!q && !hasKeyFilter && targetEnumValue === null) {
        return NextResponse.json({
            classes: [],
            fields: [],
            enumValues: [],
        } satisfies SchemaSearchResponse);
    }

    let dump;
    try {
        dump = await getSchemaDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const fields: FieldSearchResult[] = [];
    if (hasKeyFilter) {
        outer: for (const c of dump.classes) {
            for (const field of c.fields ?? []) {
                if (fields.length >= MAX_RESULTS) break outer;
                const nameLower = field.name.toLowerCase();
                const typeLower = field.type.toLowerCase();
                // Also match the C# property name (m_fFlags -> Flags) so a
                // search for either naming scheme finds the same field.
                const csharpNameLower = toFieldName(field.name).toLowerCase();

                if (
                    fieldParam &&
                    !nameLower.includes(fieldParam) &&
                    !csharpNameLower.includes(fieldParam)
                )
                    continue;
                if (typeParam && !typeLower.includes(typeParam)) continue;
                if (targetOffset !== null && field.offset !== targetOffset) {
                    continue;
                }
                if (
                    targetNetworked !== null &&
                    field.networked !== targetNetworked
                ) {
                    continue;
                }
                if (q && !nameLower.includes(q) && !csharpNameLower.includes(q))
                    continue;

                fields.push({
                    project: c.project,
                    className: c.name,
                    fieldName: field.name,
                    fieldType: field.type,
                    networked: field.networked,
                });
            }
        }
    }

    const classes: ClassSearchResult[] = [];
    if (q && !hasKeyFilter) {
        for (const c of dump.classes) {
            if (classes.length >= MAX_RESULTS) break;
            if (
                c.name.toLowerCase().includes(q) ||
                toInterfaceName(c.name).toLowerCase().includes(q)
            ) {
                classes.push({
                    project: c.project,
                    name: c.name,
                    kind: "class",
                });
            }
        }
        for (const e of dump.enums) {
            if (classes.length >= MAX_RESULTS) break;
            if (
                e.name.toLowerCase().includes(q) ||
                toInterfaceName(e.name).toLowerCase().includes(q)
            ) {
                classes.push({
                    project: e.project,
                    name: e.name,
                    kind: "enum",
                });
            }
        }
    }

    const enumValues: EnumValueSearchResult[] = [];
    if (targetEnumValue !== null) {
        outer: for (const e of dump.enums) {
            for (const member of e.fields) {
                if (enumValues.length >= MAX_RESULTS) break outer;
                if (member.value !== targetEnumValue) continue;
                enumValues.push({
                    project: e.project,
                    enumName: e.name,
                    memberName: member.name,
                    value: member.value,
                });
            }
        }
    }

    return NextResponse.json({
        classes,
        fields,
        enumValues,
    } satisfies SchemaSearchResponse);
}
