export type FieldKind = "ref" | "atomic" | "fixed_array" | "ptr" | "bitfield";

export type SchemaField = {
    name: string;
    kind: FieldKind;
    type: string;
    offset: number;
    size: number;
    networked: boolean;
    element_count?: number;
    templated?: string;
};

export type SchemaClass = {
    name: string;
    project: string;
    size: number;
    alignment: number;
    is_struct: boolean;
    base_classes?: string[];
    fields?: SchemaField[];
    fields_count: number;
};

export type SchemaEnumMember = {
    name: string;
    value: number;
};

export type SchemaEnum = {
    name: string;
    project: string;
    size: number;
    alignment: number;
    fields_count: number;
    fields: SchemaEnumMember[];
};

export type SchemaDump = {
    classes: SchemaClass[];
    enums: SchemaEnum[];
};

export type SchemaKind = "class" | "enum";
