import type { GameEvent } from "@/lib/gameevents/parser";

const TYPE_MAP: Record<string, { csType: string; canSet: boolean }> = {
    string: { csType: "string", canSet: true },
    bool: { csType: "bool", canSet: true },
    byte: { csType: "byte", canSet: true },
    short: { csType: "short", canSet: true },
    long: { csType: "int", canSet: true },
    int: { csType: "int", canSet: true },
    float: { csType: "float", canSet: true },
    uint64: { csType: "ulong", canSet: true },
    player_controller: { csType: "int", canSet: true },
    player_controller_and_pawn: { csType: "int", canSet: true },
    player_pawn: { csType: "int", canSet: false },
    ehandle: { csType: "nint", canSet: true },
};

const FIELD_OVERRIDES: Record<
    string,
    Record<string, { csType: string; canSet: boolean }>
> = {
    player_hurt: {
        health: { csType: "int", canSet: true },
        armor: { csType: "int", canSet: true },
        dmg_health: { csType: "int", canSet: true },
        dmg_armor: { csType: "int", canSet: true },
        hitgroup: { csType: "HitGroup_t", canSet: true },
    },
    player_death: {
        dmg_health: { csType: "int", canSet: true },
        dmg_armor: { csType: "int", canSet: true },
        hitgroup: { csType: "HitGroup_t", canSet: true },
    },
};

function isPlayerType(fieldType: string, fieldName: string): boolean {
    return (
        fieldType === "player_controller" ||
        fieldType === "player_controller_and_pawn" ||
        fieldName.toLowerCase() === "userid"
    );
}

export function toPascalCase(name: string): string {
    const cleaned = name.replace(/[^0-9a-zA-Z_]/g, "_");
    const parts = cleaned.split("_").filter(Boolean);
    if (parts.length === 0) return "Unnamed";

    let converted = parts.map((p) => p[0].toUpperCase() + p.slice(1)).join("");
    if (/^[0-9]/.test(converted)) converted = "E" + converted;
    return converted;
}

function toPropertyBaseName(fieldName: string): string {
    if (fieldName.toLowerCase() === "userid") return "UserId";
    if (fieldName.includes("_")) return toPascalCase(fieldName);
    return fieldName[0].toUpperCase() + fieldName.slice(1);
}

export function toEventInterfaceName(eventName: string): string {
    return `Event${toPascalCase(eventName)}`;
}

export function fnv1a32(text: string): number {
    let hash = 2166136261;
    for (const byte of new TextEncoder().encode(text)) {
        hash ^= byte;
        hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
}

export function toEventHashHex(eventName: string): string {
    return `0x${fnv1a32(eventName).toString(16).toUpperCase().padStart(8, "0")}`;
}

export type CSharpEventProperty =
    | {
          kind: "plain";
          name: string;
          csType: string;
          canSet: boolean;
          isActualOf?: string;
      }
    | {
          kind: "player";
          baseName: string;
          controllerName: string;
          pawnName: string;
          playerName: string;
          rawName: string;
      };

export function resolveCSharpEventProperties(
    ev: GameEvent,
): CSharpEventProperty[] {
    const used = new Map<string, number>();
    const unique = (base: string): string => {
        const count = used.get(base);
        if (count === undefined) {
            used.set(base, 1);
            return base;
        }
        const next = count + 1;
        used.set(base, next);
        return `${base}${next}`;
    };

    const props: CSharpEventProperty[] = [];

    for (const field of ev.fields) {
        if (isPlayerType(field.type, field.name)) {
            const base = toPropertyBaseName(field.name);
            props.push({
                kind: "player",
                baseName: base,
                controllerName: unique(`${base}Controller`),
                pawnName: unique(`${base}Pawn`),
                playerName: unique(`${base}Player`),
                rawName: unique(base),
            });
            continue;
        }

        const defaultInfo = TYPE_MAP[field.type];
        if (!defaultInfo) continue;

        const propName = unique(toPropertyBaseName(field.name));
        props.push({
            kind: "plain",
            name: propName,
            csType: defaultInfo.csType,
            canSet: defaultInfo.canSet,
        });

        const override = FIELD_OVERRIDES[ev.name]?.[field.name];
        if (override) {
            const actualName = unique(`Actual${propName}`);
            props.push({
                kind: "plain",
                name: actualName,
                csType: override.csType,
                canSet: override.canSet,
                isActualOf: propName,
            });
        }
    }

    return props;
}
