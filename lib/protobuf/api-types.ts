import type { ProtoFieldLabel } from "@/lib/protobuf/parser";
import type { ProtobufLink } from "@/lib/protobuf/queries";
import type { CSharpFieldType } from "@/lib/protobuf/csharp";

export type ProtobufFieldPayload = {
    name: string;
    number: number;
    label: ProtoFieldLabel;
    type: string;
    typeLink: ProtobufLink | null;
    defaultValue?: string;
    csName: string;
    csType: CSharpFieldType;
};

export type ProtobufMessageResponse = {
    kind: "message";
    name: string;
    csharpName: string;
    file: string;
    modules: string[];
    fields: ProtobufFieldPayload[];
    messageId?: number;
};

export type ProtobufEnumResponse = {
    kind: "enum";
    name: string;
    csharpName: string;
    file: string;
    modules: string[];
    values: { name: string; value: number }[];
};

export type ProtobufEntryResponse =
    ProtobufMessageResponse | ProtobufEnumResponse;
