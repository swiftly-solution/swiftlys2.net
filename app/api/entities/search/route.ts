import { NextResponse, type NextRequest } from "next/server";
import { getEntitiesDump } from "@/lib/entities/dump";
import { getGame } from "@/lib/schema/games";
import type { DatamapField } from "@/lib/entities/types";

const MAX_RESULTS = 100;
const MAX_CLASS_RESULTS = 20;

export type EntityFieldSearchResult = {
    className: string;
    kind: "input" | "output" | "member";
    externalName: string;
    fieldName: string;
};

export type EntitySearchResponse = {
    classes: string[];
    fields: EntityFieldSearchResult[];
};

function isKind(
    value: string | null,
): value is EntityFieldSearchResult["kind"] {
    return value === "input" || value === "output" || value === "member";
}

function fieldMatches(
    field: DatamapField,
    q: string,
    fieldParam: string,
): boolean {
    if (fieldParam) {
        if (!field.fieldName.toLowerCase().includes(fieldParam)) return false;
        if (q) {
            return (
                field.externalName.toLowerCase().includes(q) ||
                field.fieldName.toLowerCase().includes(q)
            );
        }
        return true;
    }
    if (q) {
        return (
            field.externalName.toLowerCase().includes(q) ||
            field.fieldName.toLowerCase().includes(q)
        );
    }
    return true;
}

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";
    const kindParamRaw = request.nextUrl.searchParams.get("kind");
    const kindParam = isKind(kindParamRaw) ? kindParamRaw : null;
    const fieldParam =
        request.nextUrl.searchParams.get("field")?.trim().toLowerCase() ?? "";

    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }
    if (!q && !kindParam && !fieldParam) {
        return NextResponse.json({
            classes: [],
            fields: [],
        } satisfies EntitySearchResponse);
    }

    let dump;
    try {
        dump = await getEntitiesDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const classes: string[] = [];
    if (q) {
        for (const dm of dump.datamaps) {
            if (classes.length >= MAX_CLASS_RESULTS) break;
            if (dm.class_name.toLowerCase().includes(q)) {
                classes.push(dm.class_name);
            }
        }
    }

    const fields: EntityFieldSearchResult[] = [];
    outer: for (const dm of dump.datamaps) {
        const groups: [EntityFieldSearchResult["kind"], DatamapField[]][] = [
            ["input", dm.fields.inputs ?? []],
            ["output", dm.fields.outputs ?? []],
            ["member", dm.fields.members ?? []],
        ];
        for (const [kind, fieldsArr] of groups) {
            if (kindParam && kindParam !== kind) continue;
            for (const field of fieldsArr) {
                if (fields.length >= MAX_RESULTS) break outer;
                if (!fieldMatches(field, q, fieldParam)) continue;
                fields.push({
                    className: dm.class_name,
                    kind,
                    externalName: field.externalName,
                    fieldName: field.fieldName,
                });
            }
        }
    }

    return NextResponse.json({ classes, fields } satisfies EntitySearchResponse);
}
