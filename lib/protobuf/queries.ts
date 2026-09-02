import type { ProtoEnum, ProtoMessage } from "@/lib/protobuf/parser";
import type {
    ProtobufDump,
    ProtobufFile,
    ProtobufKind,
} from "@/lib/protobuf/types";

const SCALAR_TYPES = new Set([
    "double",
    "float",
    "int32",
    "int64",
    "uint32",
    "uint64",
    "sint32",
    "sint64",
    "fixed32",
    "fixed64",
    "sfixed32",
    "sfixed64",
    "bool",
    "string",
    "bytes",
]);

export function isScalarType(type: string): boolean {
    return SCALAR_TYPES.has(type);
}

export type ProtobufModuleGroupEntry = {
    module: string;
    items: { file: string; name: string; kind: ProtobufKind }[];
};

const UNASSIGNED_MODULE = "(unassigned)";

export function buildProtobufModuleIndex(
    dump: ProtobufDump,
): ProtobufModuleGroupEntry[] {
    const byModule = new Map<
        string,
        { file: string; name: string; kind: ProtobufKind }[]
    >();

    for (const file of dump.files) {
        const modules =
            file.modules.length > 0 ? file.modules : [UNASSIGNED_MODULE];
        const items = [
            ...file.messages.map((m) => ({
                file: file.fileName,
                name: m.name,
                kind: "message" as const,
            })),
            ...file.enums.map((e) => ({
                file: file.fileName,
                name: e.name,
                kind: "enum" as const,
            })),
        ];

        for (const mod of modules) {
            let list = byModule.get(mod);
            if (!list) {
                list = [];
                byModule.set(mod, list);
            }
            list.push(...items);
        }
    }

    return Array.from(byModule.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([module, items]) => ({
            module,
            items: items.sort(
                (a, b) =>
                    a.name.localeCompare(b.name) ||
                    a.file.localeCompare(b.file),
            ),
        }));
}

export type ProtobufLink = { file: string; kind: ProtobufKind; name: string };

export type ProtobufTypeIndex = {
    byQualified: Map<string, ProtobufLink>;
    byLastSegment: Map<string, ProtobufLink[]>;
};

export function buildProtobufTypeIndex(dump: ProtobufDump): ProtobufTypeIndex {
    const byQualified = new Map<string, ProtobufLink>();
    const byLastSegment = new Map<string, ProtobufLink[]>();

    const add = (name: string, link: ProtobufLink) => {
        byQualified.set(name, link);
        const last = name.split(".").pop()!;
        const list = byLastSegment.get(last);
        if (list) list.push(link);
        else byLastSegment.set(last, [link]);
    };

    for (const file of dump.files) {
        for (const message of file.messages) {
            add(message.name, {
                file: file.fileName,
                kind: "message",
                name: message.name,
            });
        }
        for (const protoEnum of file.enums) {
            add(protoEnum.name, {
                file: file.fileName,
                kind: "enum",
                name: protoEnum.name,
            });
        }
    }

    return { byQualified, byLastSegment };
}

export function resolveProtobufType(
    index: ProtobufTypeIndex,
    rawType: string,
): ProtobufLink | null {
    if (isScalarType(rawType)) return null;

    const stripped = rawType.replace(/^\.+/, "");
    const exact = index.byQualified.get(stripped);
    if (exact) return exact;

    const lastSegment = stripped.split(".").pop()!;
    const candidates = index.byLastSegment.get(lastSegment);
    return candidates && candidates.length === 1 ? candidates[0] : null;
}

export type FoundProtobufEntry =
    | { kind: "message"; entry: ProtoMessage; file: ProtobufFile }
    | { kind: "enum"; entry: ProtoEnum; file: ProtobufFile };

export function findProtobufEntry(
    dump: ProtobufDump,
    fileName: string,
    name: string,
): FoundProtobufEntry | null {
    const file = dump.files.find((f) => f.fileName === fileName);
    if (!file) return null;

    const message = file.messages.find((m) => m.name === name);
    if (message) return { kind: "message", entry: message, file };

    const protoEnum = file.enums.find((e) => e.name === name);
    if (protoEnum) return { kind: "enum", entry: protoEnum, file };

    return null;
}
