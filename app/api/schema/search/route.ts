import { NextResponse, type NextRequest } from "next/server";
import { getSchemaDump } from "@/lib/schema/dump";
import { getGame } from "@/lib/schema/games";

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

export type SchemaSearchResponse = {
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
    const offsetParam = request.nextUrl.searchParams.get("offset")?.trim() ?? "";
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
        networkedParam === "true" ? true : networkedParam === "false" ? false : null;
    const hasKeyFilter = Boolean(
        fieldParam || typeParam || targetOffset !== null || targetNetworked !== null,
    );

    if (!q && !hasKeyFilter && targetEnumValue === null) {
        return NextResponse.json({
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
    if (q || hasKeyFilter) {
        outer: for (const c of dump.classes) {
            for (const field of c.fields ?? []) {
                if (fields.length >= MAX_RESULTS) break outer;
                const nameLower = field.name.toLowerCase();
                const typeLower = field.type.toLowerCase();

                if (hasKeyFilter) {
                    if (fieldParam && !nameLower.includes(fieldParam)) continue;
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
                    if (q && !nameLower.includes(q)) continue;
                } else {
                    if (!nameLower.includes(q) && !typeLower.includes(q)) continue;
                }

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

    return NextResponse.json({ fields, enumValues } satisfies SchemaSearchResponse);
}
