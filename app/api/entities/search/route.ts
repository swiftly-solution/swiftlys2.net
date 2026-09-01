import { NextResponse, type NextRequest } from "next/server";
import { getEntitiesDump } from "@/lib/entities/dump";
import { getGame } from "@/lib/schema/games";
import type { DatamapField } from "@/lib/entities/types";

const MAX_RESULTS = 100;

export type EntityFieldSearchResult = {
    className: string;
    kind: "input" | "output" | "member";
    externalName: string;
    fieldName: string;
};

function matches(field: DatamapField, q: string): boolean {
    return (
        field.externalName.toLowerCase().includes(q) ||
        field.fieldName.toLowerCase().includes(q)
    );
}

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }
    if (!q) {
        return NextResponse.json([]);
    }

    let dump;
    try {
        dump = await getEntitiesDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const results: EntityFieldSearchResult[] = [];
    for (const dm of dump.datamaps) {
        for (const field of dm.fields.inputs ?? []) {
            if (matches(field, q)) {
                results.push({
                    className: dm.class_name,
                    kind: "input",
                    externalName: field.externalName,
                    fieldName: field.fieldName,
                });
            }
        }
        for (const field of dm.fields.outputs ?? []) {
            if (matches(field, q)) {
                results.push({
                    className: dm.class_name,
                    kind: "output",
                    externalName: field.externalName,
                    fieldName: field.fieldName,
                });
            }
        }
        for (const field of dm.fields.members ?? []) {
            if (matches(field, q)) {
                results.push({
                    className: dm.class_name,
                    kind: "member",
                    externalName: field.externalName,
                    fieldName: field.fieldName,
                });
            }
        }
    }

    return NextResponse.json(results.slice(0, MAX_RESULTS));
}
