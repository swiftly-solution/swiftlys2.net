import { z } from "zod";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { DEFAULT_GAME_ID, GAMES } from "@/lib/schema/games";

export type McpContext = { baseUrl: string };

export const MAX_LIST_ITEMS = 200;

const GAME_IDS = GAMES.map((g) => g.id) as [string, ...string[]];

export const gameParam = z
    .enum(GAME_IDS)
    .default(DEFAULT_GAME_ID)
    .describe(`Game id. One of: ${GAME_IDS.join(", ")}.`);

export function textResult(data: unknown): CallToolResult {
    return { content: [{ type: "text", text: JSON.stringify(data, null, 2) }] };
}

export function errorResult(message: string): CallToolResult {
    return { content: [{ type: "text", text: message }], isError: true };
}

export async function fetchJson<T>(url: string): Promise<T> {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
        throw new Error(`Request to ${url} failed with status ${res.status}`);
    }
    return (await res.json()) as T;
}

export function capList<T>(items: T[], limit = MAX_LIST_ITEMS) {
    return {
        items: items.slice(0, limit),
        total: items.length,
        truncated: items.length > limit,
    };
}
