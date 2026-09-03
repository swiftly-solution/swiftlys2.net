export type GameEventField = {
    name: string;
    type: string;
    comment: string;
};

export type GameEvent = {
    name: string;
    comment: string;
    fields: GameEventField[];
};

export const KNOWN_FIELD_TYPES = new Set([
    "string",
    "bool",
    "byte",
    "short",
    "long",
    "int",
    "float",
    "uint64",
    "player_controller",
    "player_controller_and_pawn",
    "player_pawn",
    "ehandle",
]);

const SKIP_TYPES = new Set(["none", "local"]);
const EVENT_NAME_RE = /^"([^"]+)"/;
const FIELD_RE = /^"([^"]+)"\s+"([^"]+)"(?:\s*\/\/\s*(.*))?$/;

function extractInlineComment(line: string): string {
    const idx = line.indexOf("//");
    return idx >= 0 ? line.slice(idx + 2).trim() : "";
}

export function mergeGameEventField(
    existing: GameEventField,
    incoming: GameEventField,
): void {
    if (!existing.comment && incoming.comment) {
        existing.comment = incoming.comment;
    }
    if (
        !KNOWN_FIELD_TYPES.has(existing.type) &&
        KNOWN_FIELD_TYPES.has(incoming.type)
    ) {
        existing.type = incoming.type;
    }
}

export function parseGameEventsFile(content: string): Map<string, GameEvent> {
    const events = new Map<string, GameEvent>();
    const lines = content.replace(/\r\n/g, "\n").split("\n");

    function getOrCreate(name: string): GameEvent {
        let ev = events.get(name);
        if (!ev) {
            ev = { name, comment: "", fields: [] };
            events.set(name, ev);
        }
        return ev;
    }

    function addField(event: GameEvent, field: GameEventField): void {
        const existing = event.fields.find((f) => f.name === field.name);
        if (existing) {
            mergeGameEventField(existing, field);
        } else {
            event.fields.push(field);
        }
    }

    function parseBlock(start: number, event: GameEvent | null): number {
        let i = start;
        let depth = 1;

        while (i < lines.length && depth > 0) {
            const raw = lines[i].trim();
            i++;
            if (!raw || raw.startsWith("//")) continue;
            if (raw.startsWith("}")) {
                depth--;
                continue;
            }
            if (raw.startsWith("{")) {
                depth++;
                continue;
            }

            const eventMatch = raw.match(EVENT_NAME_RE);
            if (eventMatch && !raw.includes('""')) {
                const name = eventMatch[1];
                const comment = extractInlineComment(lines[i - 1]);

                if (lines[i - 1].includes("{}")) {
                    const ev = getOrCreate(name);
                    if (comment && !ev.comment) ev.comment = comment;
                    continue;
                }

                let k = i;
                while (
                    k < lines.length &&
                    (!lines[k].trim() || lines[k].trim().startsWith("//"))
                ) {
                    k++;
                }

                if (k < lines.length && lines[k].trim() === "{}") {
                    const ev = getOrCreate(name);
                    if (comment && !ev.comment) ev.comment = comment;
                    i = k + 1;
                    continue;
                }

                if (k < lines.length && lines[k].trim().startsWith("{")) {
                    const ev = getOrCreate(name);
                    if (comment && !ev.comment) ev.comment = comment;
                    i = parseBlock(k + 1, ev);
                    continue;
                }
            }

            const fieldMatch = raw.match(FIELD_RE);
            if (fieldMatch && event) {
                const fieldName = fieldMatch[1];
                let fieldType = fieldMatch[2].toLowerCase();
                const fieldComment = fieldMatch[3] ?? "";

                if (
                    SKIP_TYPES.has(fieldType) ||
                    fieldType === "1" ||
                    fieldType === "0"
                ) {
                    continue;
                }
                if (fieldType === "uint64_t") fieldType = "uint64";
                if (fieldType === "ehandle_t") fieldType = "ehandle";

                addField(event, {
                    name: fieldName,
                    type: fieldType,
                    comment: fieldComment,
                });
            }
        }
        return i;
    }

    let i = 0;
    while (i < lines.length) {
        const raw = lines[i].trim();
        i++;
        if (!raw || raw.startsWith("//")) continue;

        if (!raw.match(EVENT_NAME_RE)) continue;

        let j = i;
        while (
            j < lines.length &&
            (!lines[j].trim() || lines[j].trim().startsWith("//"))
        ) {
            j++;
        }
        if (j >= lines.length || !lines[j].trim().startsWith("{")) continue;

        i = parseBlock(j + 1, null);
    }

    return events;
}
