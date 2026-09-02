import type { ParsedProtoFile } from "@/lib/protobuf/parser";

export type ProtobufFile = ParsedProtoFile & {
    fileName: string;
    modules: string[];
};

export type ProtobufDump = {
    files: ProtobufFile[];
};

export type ProtobufKind = "message" | "enum";
