import { NextResponse, type NextRequest } from "next/server";
import { getProtobufDump } from "@/lib/protobuf/dump";
import { computeNetMessageIds } from "@/lib/protobuf/csharp";
import { getGame } from "@/lib/schema/games";

const MAX_RESULTS = 100;

export type ProtobufSearchResult = {
    file: string;
    name: string;
    kind: "message" | "enum";
    matchedField?: string;
    messageId?: number;
};

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
        dump = await getProtobufDump(gameId);
    } catch {
        return NextResponse.json({ error: "unavailable" }, { status: 503 });
    }

    const results: ProtobufSearchResult[] = [];
    const isNumericQuery = /^\d+$/.test(q);

    for (const file of dump.files) {
        if (results.length >= MAX_RESULTS) break;

        const netMessageIds = isNumericQuery
            ? computeNetMessageIds(file)
            : null;

        for (const message of file.messages) {
            if (message.name.toLowerCase().includes(q)) {
                results.push({
                    file: file.fileName,
                    name: message.name,
                    kind: "message",
                    messageId: netMessageIds?.get(message.name),
                });
                continue;
            }

            if (netMessageIds) {
                const id = netMessageIds.get(message.name);
                if (id !== undefined && String(id).includes(q)) {
                    results.push({
                        file: file.fileName,
                        name: message.name,
                        kind: "message",
                        messageId: id,
                    });
                    continue;
                }
            }

            const matchedField = message.fields.find((f) =>
                f.name.toLowerCase().includes(q),
            );
            if (matchedField) {
                results.push({
                    file: file.fileName,
                    name: message.name,
                    kind: "message",
                    matchedField: matchedField.name,
                });
            }
        }

        for (const protoEnum of file.enums) {
            if (protoEnum.name.toLowerCase().includes(q)) {
                results.push({
                    file: file.fileName,
                    name: protoEnum.name,
                    kind: "enum",
                });
            }
        }
    }

    return NextResponse.json(results.slice(0, MAX_RESULTS));
}
