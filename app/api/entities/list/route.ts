import { type NextRequest } from "next/server";
import { getEntitiesDump } from "@/lib/entities/dump";
import { buildEntityIndex } from "@/lib/entities/queries";
import { getGame } from "@/lib/schema/games";

export async function GET(request: NextRequest) {
    const gameId = request.nextUrl.searchParams.get("game");
    if (!gameId || !getGame(gameId)) {
        return new Response(JSON.stringify({ error: "unknown game" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
        });
    }

    let items;
    try {
        const dump = await getEntitiesDump(gameId);
        items = buildEntityIndex(dump);
    } catch {
        return new Response(JSON.stringify({ error: "unavailable" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
        });
    }

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        start(controller) {
            for (const item of items) {
                controller.enqueue(
                    encoder.encode(`${JSON.stringify({ name: item.name })}\n`),
                );
            }
            controller.close();
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "application/x-ndjson; charset=utf-8",
            "X-Content-Type-Options": "nosniff",
        },
    });
}
