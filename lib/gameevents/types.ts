import type { GameEvent } from "@/lib/gameevents/parser";

export type GameEventEntry = GameEvent & { files: string[] };

export type GameEventsDump = {
    events: GameEventEntry[];
};
