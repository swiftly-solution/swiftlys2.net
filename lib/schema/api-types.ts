import type { FieldKind } from "@/lib/schema/types";
import type { Reference, ResolvedLink } from "@/lib/schema/queries";

export type FieldPayload = {
    name: string;
    csharpName: string;
    type: string;
    csharpType: string;
    typeLink: ResolvedLink | null;
    offset: number;
    size: number;
    networked: boolean;
    kind: FieldKind;
    element_count?: number;
    templated?: string;
};

export type BaseClassPayload = {
    name: string;
    csharpName: string;
    link: ResolvedLink | null;
};

export type ClassEntryResponse = {
    kind: "class";
    name: string;
    csharpName: string;
    project: string;
    size: number;
    alignment: number;
    is_struct: boolean;
    baseClasses: BaseClassPayload[];
    fields: FieldPayload[];
    references: Reference[];
};

export type EnumEntryResponse = {
    kind: "enum";
    name: string;
    csharpName: string;
    project: string;
    size: number;
    alignment: number;
    members: { name: string; value: number }[];
    references: Reference[];
};

export type EntryResponse = ClassEntryResponse | EnumEntryResponse;
