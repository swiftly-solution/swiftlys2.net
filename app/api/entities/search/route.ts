import { NextResponse, type NextRequest } from "next/server";
import { getEntitiesDump } from "@/lib/entities/dump";
import { getGame } from "@/lib/schema/games";
import { toFieldName, toInterfaceName } from "@/lib/schema/codegen/csharp";
import type { DatamapInput, DatamapMember, DatamapOutput } from "@/lib/entities/types";

const MAX_RESULTS = 100;
const MAX_CLASS_RESULTS = 20;

export type EntityFieldSearchResult =
    | { className: string; kind: "member"; name: string; schemaName: string }
    | { className: string; kind: "output"; name: string; schemaName: string }
    | { className: string; kind: "input"; name: string; rawName: string };

export type EntitySearchResponse = {
    classes: string[];
    fields: EntityFieldSearchResult[];
};

function isKind(
    value: string | null,
): value is EntityFieldSearchResult["kind"] {
    return value === "input" || value === "output" || value === "member";
}

function schemaFieldMatches(
    field: DatamapMember | DatamapOutput,
    q: string,
    fieldParam: string,
): boolean {
    const csharpName = toFieldName(field.schema_name).toLowerCase();
    const schemaNameMatches = (needle: string) =>
        field.schema_name.toLowerCase().includes(needle) ||
        csharpName.includes(needle);

    if (fieldParam) {
        if (!schemaNameMatches(fieldParam)) return false;
        if (q) {
            return field.name.toLowerCase().includes(q) || schemaNameMatches(q);
        }
        return true;
    }
    if (q) {
        return field.name.toLowerCase().includes(q) || schemaNameMatches(q);
    }
    return true;
}

function inputMatches(field: DatamapInput, q: string): boolean {
    if (!q) return true;
    return (
        field.name.toLowerCase().includes(q) ||
        field.raw_name.toLowerCase().includes(q) ||
        field.description.toLowerCase().includes(q)
    );
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
            const csharpName = toInterfaceName(dm.class_name).toLowerCase();
            if (
                dm.class_name.toLowerCase().includes(q) ||
                csharpName.includes(q)
            ) {
                classes.push(dm.class_name);
            }
        }
    }

    const fields: EntityFieldSearchResult[] = [];
    outer: for (const dm of dump.datamaps) {
        if (!kindParam || kindParam === "member") {
            for (const field of dm.members) {
                if (fields.length >= MAX_RESULTS) break outer;
                if (!schemaFieldMatches(field, q, fieldParam)) continue;
                fields.push({
                    className: dm.class_name,
                    kind: "member",
                    name: field.name,
                    schemaName: field.schema_name,
                });
            }
        }
        if (!kindParam || kindParam === "output") {
            for (const field of dm.outputs) {
                if (fields.length >= MAX_RESULTS) break outer;
                if (!schemaFieldMatches(field, q, fieldParam)) continue;
                fields.push({
                    className: dm.class_name,
                    kind: "output",
                    name: field.name,
                    schemaName: field.schema_name,
                });
            }
        }
        if ((!kindParam || kindParam === "input") && !fieldParam) {
            for (const field of dm.inputs) {
                if (fields.length >= MAX_RESULTS) break outer;
                if (!inputMatches(field, q)) continue;
                fields.push({
                    className: dm.class_name,
                    kind: "input",
                    name: field.name,
                    rawName: field.raw_name,
                });
            }
        }
    }

    return NextResponse.json({ classes, fields } satisfies EntitySearchResponse);
}
