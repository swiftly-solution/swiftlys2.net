import { NextResponse, type NextRequest } from "next/server";
import { getProtobufDump } from "@/lib/protobuf/dump";
import {
    buildProtobufTypeIndex,
    findProtobufEntry,
    resolveProtobufType,
} from "@/lib/protobuf/queries";
import {
    computeNetMessageIds,
    toCSharpFieldName,
    toCSharpName,
    resolveCSharpFieldType,
} from "@/lib/protobuf/csharp";
import { getGame } from "@/lib/schema/games";
import type { ProtobufEntryResponse } from "@/lib/protobuf/api-types";

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    const file = request.nextUrl.searchParams.get("file");
    const name = request.nextUrl.searchParams.get("name");

    if (!gameId || !getGame(gameId)) {
        return NextResponse.json({ error: "unknown game" }, { status: 400 });
    }
    if (!file || !name) {
        return NextResponse.json(
            { error: "missing file/name" },
            { status: 400 },
        );
    }

    let dump;
    try {
        dump = await getProtobufDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const found = findProtobufEntry(dump, file, name);
    if (!found) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
    }

    const typeIndex = buildProtobufTypeIndex(dump);

    if (found.kind === "message") {
        const messageId = found.entry.name.includes(".")
            ? undefined
            : computeNetMessageIds(found.file).get(found.entry.name);

        const response: ProtobufEntryResponse = {
            kind: "message",
            name: found.entry.name,
            csharpName: toCSharpName(found.entry.name),
            file: found.file.fileName,
            modules: found.file.modules,
            messageId,
            fields: found.entry.fields.map((field) => ({
                name: field.name,
                number: field.number,
                label: field.label,
                type: field.type,
                typeLink: resolveProtobufType(typeIndex, field.type),
                defaultValue: field.defaultValue,
                csName: toCSharpFieldName(field.name),
                csType: resolveCSharpFieldType(field, typeIndex),
            })),
        };
        return NextResponse.json(response);
    }

    const response: ProtobufEntryResponse = {
        kind: "enum",
        name: found.entry.name,
        csharpName: toCSharpName(found.entry.name),
        file: found.file.fileName,
        modules: found.file.modules,
        values: found.entry.values,
    };
    return NextResponse.json(response);
}
