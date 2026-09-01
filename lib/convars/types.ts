export type ConVarAttributes = {
    has_callback: boolean;
    has_default: boolean;
    has_max: boolean;
    has_min: boolean;
};

export type ConVar = {
    name: string;
    module: string;
    description: string;
    default?: string;
    min?: string;
    max?: string;
    flags: string[];
    attributes: ConVarAttributes;
};

export type ConCommandAttributes = {
    has_callback: boolean;
    has_completion_callback: boolean;
};

export type ConCommand = {
    name: string;
    module: string;
    description: string;
    flags: string[];
    attributes: ConCommandAttributes;
};

export type ConvarsDump = {
    convars: ConVar[];
    commands: ConCommand[];
};

export type ConvarsKind = "convar" | "concommand";

export type ConvarsEntryResponse =
    | ({ kind: "convar" } & ConVar)
    | ({ kind: "concommand" } & ConCommand);
