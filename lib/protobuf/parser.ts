export type ProtoFieldLabel = "optional" | "required" | "repeated";

export type ProtoField = {
    name: string;
    number: number;
    label: ProtoFieldLabel;
    type: string;
    defaultValue?: string;
};

export type ProtoMessage = {
    name: string;
    fields: ProtoField[];
};

export type ProtoEnumValue = { name: string; value: number };

export type ProtoEnum = {
    name: string;
    values: ProtoEnumValue[];
};

export type ParsedProtoFile = {
    imports: string[];
    messages: ProtoMessage[];
    enums: ProtoEnum[];
};

function stripComments(source: string): string {
    return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

type Container =
    | { kind: "root" }
    | { kind: "message"; message: ProtoMessage }
    | { kind: "enum"; enum: ProtoEnum }
    | { kind: "oneof"; parentMessage: ProtoMessage }
    | { kind: "skip" };

const FIELD_PATTERN =
    /^(optional|required|repeated)\s+([\w.]+)\s+(\w+)\s*=\s*(-?\d+)\s*(?:\[([^\]]*)\])?\s*$/;
const ONEOF_FIELD_PATTERN =
    /^([\w.]+)\s+(\w+)\s*=\s*(-?\d+)\s*(?:\[([^\]]*)\])?\s*$/;
const ENUM_VALUE_PATTERN = /^(\w+)\s*=\s*(-?\d+)\s*$/;
const IMPORT_PATTERN = /^import\s+(?:public\s+|weak\s+)?"([^"]+)"\s*$/;

function extractDefault(options: string | undefined): string | undefined {
    if (!options) return undefined;
    const match = options.match(/default\s*=\s*([^,\]]+)/);
    return match ? match[1].trim() : undefined;
}

function qualify(prefix: string, name: string): string {
    return prefix ? `${prefix}.${name}` : name;
}

export function parseProtoFile(source: string): ParsedProtoFile {
    const clean = stripComments(source);
    const imports: string[] = [];
    const messages: ProtoMessage[] = [];
    const enums: ProtoEnum[] = [];

    const stack: Container[] = [{ kind: "root" }];
    const prefixStack: string[] = [""];
    let buffer = "";

    function currentMessage(): ProtoMessage | null {
        for (let i = stack.length - 1; i >= 0; i--) {
            const c = stack[i];
            if (c.kind === "message") return c.message;
            if (c.kind === "oneof") return c.parentMessage;
            if (c.kind === "skip") return null;
        }
        return null;
    }

    function handleStatement(raw: string) {
        const stmt = raw.trim();
        if (!stmt) return;

        const top = stack[stack.length - 1];
        if (top.kind === "skip") return;

        if (top.kind === "root") {
            const importMatch = stmt.match(IMPORT_PATTERN);
            if (importMatch) imports.push(importMatch[1]);
            return;
        }

        if (top.kind === "enum") {
            const m = stmt.match(ENUM_VALUE_PATTERN);
            if (m) top.enum.values.push({ name: m[1], value: Number(m[2]) });
            return;
        }

        const msg = currentMessage();
        if (!msg) return;

        if (top.kind === "oneof") {
            const m = stmt.match(ONEOF_FIELD_PATTERN);
            if (m) {
                msg.fields.push({
                    type: m[1],
                    name: m[2],
                    number: Number(m[3]),
                    label: "optional",
                    defaultValue: extractDefault(m[4]),
                });
            }
            return;
        }

        const m = stmt.match(FIELD_PATTERN);
        if (m) {
            msg.fields.push({
                label: m[1] as ProtoFieldLabel,
                type: m[2],
                name: m[3],
                number: Number(m[4]),
                defaultValue: extractDefault(m[5]),
            });
        }
    }

    function handleOpenBrace() {
        const opener = buffer.trim();
        buffer = "";
        const prefix = prefixStack[prefixStack.length - 1];

        const messageMatch = opener.match(/^message\s+(\w+)/);
        if (messageMatch) {
            const qualifiedName = qualify(prefix, messageMatch[1]);
            const message: ProtoMessage = { name: qualifiedName, fields: [] };
            messages.push(message);
            stack.push({ kind: "message", message });
            prefixStack.push(qualifiedName);
            return;
        }

        const enumMatch = opener.match(/^enum\s+(\w+)/);
        if (enumMatch) {
            const qualifiedName = qualify(prefix, enumMatch[1]);
            const protoEnum: ProtoEnum = { name: qualifiedName, values: [] };
            enums.push(protoEnum);
            stack.push({ kind: "enum", enum: protoEnum });
            prefixStack.push(qualifiedName);
            return;
        }

        const oneofMatch = opener.match(/^oneof\s+\w+/);
        if (oneofMatch) {
            const msg = currentMessage();
            stack.push(
                msg ? { kind: "oneof", parentMessage: msg } : { kind: "skip" },
            );
            prefixStack.push(prefix);
            return;
        }

        stack.push({ kind: "skip" });
        prefixStack.push(prefix);
    }

    function handleCloseBrace() {
        handleStatement(buffer);
        buffer = "";
        if (stack.length > 1) {
            stack.pop();
            prefixStack.pop();
        }
    }

    for (const ch of clean) {
        if (ch === "{") {
            handleOpenBrace();
        } else if (ch === "}") {
            handleCloseBrace();
        } else if (ch === ";") {
            handleStatement(buffer);
            buffer = "";
        } else {
            buffer += ch;
        }
    }

    return { imports, messages, enums };
}
