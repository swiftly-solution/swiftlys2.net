import type { CSharpEventProperty } from "@/lib/gameevents/csharp";

export type GameEventFieldPayload = {
    name: string;
    type: string;
    comment: string;
};

export type GameEventResponse = {
    name: string;
    interfaceName: string;
    comment: string;
    hash: string;
    files: string[];
    fields: GameEventFieldPayload[];
    csharpProperties: CSharpEventProperty[];
};
