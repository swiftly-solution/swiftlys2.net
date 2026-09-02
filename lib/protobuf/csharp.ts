import type { ProtoField } from "@/lib/protobuf/parser";
import type { ProtobufFile } from "@/lib/protobuf/types";
import {
    isScalarType,
    resolveProtobufType,
    type ProtobufLink,
    type ProtobufTypeIndex,
} from "@/lib/protobuf/queries";

const NET_MESSAGE_ENUMS: Record<
    string,
    { prefix: string; messagePrefixes: string[] }
> = {
    EBaseUserMessages: {
        prefix: "UM_",
        messagePrefixes: ["CUserMessage", "CUserMsg_"],
    },
    ETEProtobufIds: { prefix: "TE_", messagePrefixes: ["CMsgTE"] },
    ECsgoGameEvents: { prefix: "GE_", messagePrefixes: ["CMsgTE"] },
    ECstrike15UserMessages: {
        prefix: "CS_UM_",
        messagePrefixes: ["CCSUsrMsg_"],
    },
    EBaseGameEvents: { prefix: "GE_", messagePrefixes: ["CMsg"] },
    CLC_Messages: { prefix: "clc_", messagePrefixes: ["CCLCMsg_"] },
    SVC_Messages: { prefix: "svc_", messagePrefixes: ["CSVCMsg_"] },
    NET_Messages: { prefix: "net_", messagePrefixes: ["CNETMsg_"] },
};

const BASE_TYPES: Record<string, string> = {
    bool: "bool",
    int32: "int",
    sint32: "int",
    fixed32: "uint",
    int64: "long",
    fixed64: "ulong",
    sint64: "long",
    uint32: "uint",
    uint64: "ulong",
    float: "float",
    double: "double",
    string: "string",
    bytes: "byte[]",
};

const MANAGED_NESTED_TYPES: Record<string, string> = {
    CMsgVector: "Vector",
    CMsgQAngle: "QAngle",
    CMsgVector2D: "Vector2D",
    CMsgRGBA: "Color",
};

export function toCSharpName(name: string): string {
    return name.replace(/^\.+/, "").replace(/\./g, "_");
}

export function toCSharpFieldName(name: string): string {
    return name
        .split("_")
        .filter(Boolean)
        .map((part) => part[0].toUpperCase() + part.slice(1))
        .join("");
}

export function computeNetMessageIds(file: ProtobufFile): Map<string, number> {
    const topLevelMessages = file.messages.filter((m) => !m.name.includes("."));
    const ids = new Map<string, number>();

    for (const enumDef of file.enums) {
        if (enumDef.name.includes(".")) continue;
        const info = NET_MESSAGE_ENUMS[enumDef.name];
        if (!info) continue;
        const { prefix, messagePrefixes } = info;

        for (const value of enumDef.values) {
            let name = value.name;
            if (name.startsWith(prefix)) name = name.slice(prefix.length);
            if (
                (enumDef.name === "ETEProtobufIds" ||
                    enumDef.name === "ECsgoGameEvents") &&
                name.endsWith("Id")
            ) {
                name = name.slice(0, -2);
            }

            for (const message of topLevelMessages) {
                for (const messagePrefix of messagePrefixes) {
                    if (
                        message.name.includes(messagePrefix) &&
                        message.name.includes(name)
                    ) {
                        ids.set(message.name, value.value);
                        break;
                    }
                }
            }
        }
    }

    return ids;
}

export type CSharpFieldType =
    | { kind: "plain"; text: string; link: ProtobufLink | null }
    | {
          kind: "repeated";
          wrapper:
              | "IProtobufRepeatedFieldValueType"
              | "IProtobufRepeatedFieldSubMessageType";
          inner: string;
          link: ProtobufLink | null;
      };

export function resolveCSharpFieldType(
    field: ProtoField,
    typeIndex: ProtobufTypeIndex,
): CSharpFieldType {
    const isRepeated = field.label === "repeated";
    const link = resolveProtobufType(typeIndex, field.type);
    const flatType = link ? toCSharpName(link.name) : toCSharpName(field.type);

    if (link?.kind === "enum") {
        return { kind: "plain", text: flatType, link };
    }

    if (isScalarType(field.type) && BASE_TYPES[field.type]) {
        const csType = BASE_TYPES[field.type];
        if (isRepeated) {
            return {
                kind: "repeated",
                wrapper: "IProtobufRepeatedFieldValueType",
                inner: csType,
                link: null,
            };
        }
        return { kind: "plain", text: csType, link: null };
    }

    if (MANAGED_NESTED_TYPES[flatType]) {
        const managed = MANAGED_NESTED_TYPES[flatType];
        if (isRepeated) {
            return {
                kind: "repeated",
                wrapper: "IProtobufRepeatedFieldValueType",
                inner: managed,
                link: null,
            };
        }
        return { kind: "plain", text: managed, link: null };
    }

    // Nested message reference.
    if (isRepeated) {
        return {
            kind: "repeated",
            wrapper: "IProtobufRepeatedFieldSubMessageType",
            inner: flatType,
            link,
        };
    }
    return { kind: "plain", text: flatType, link };
}
