import type { ResolvedLink } from "@/lib/schema/queries";

export type EntityClass = {
    class_name: string;
    designer_name: string;
    flags: string[];
};

export type DatamapMember = { name: string; schema_name: string; type: string };
export type DatamapOutput = { name: string; schema_name: string };
export type DatamapInput = {
    name: string;
    raw_name: string;
    description: string;
    return_type: string;
    parameter_count: number;
    parameter_names: string[];
    parameter_types: string[];
    variant_count: number;
};

export type Datamap = {
    class_name: string;
    members: DatamapMember[];
    outputs: DatamapOutput[];
    inputs: DatamapInput[];
    think_functions: string[];
};

export type EntitiesDump = {
    entityClasses: EntityClass[];
    datamaps: Datamap[];
};

export type EntityInputPayload = {
    name: string;
    rawName: string;
    description: string;
    returnType: string;
    parameterNames: string[];
    parameterTypes: string[];
};
export type EntityOutputPayload = { name: string; schemaName: string };
export type EntityMemberPayload = {
    name: string;
    schemaName: string;
    type: string;
    csharpFieldName: string;
    schemaClassName: string | null;
    schemaProject: string | null;
};

export type ParentClassPayload = {
    name: string;
    csharpName: string;
    link: ResolvedLink | null;
};

export type EntityEntryResponse = {
    className: string;
    designerName: string | null;
    flags: string[];
    schemaLink: ResolvedLink | null;
    parentClasses: ParentClassPayload[];
    inputs: EntityInputPayload[];
    outputs: EntityOutputPayload[];
    members: EntityMemberPayload[];
    thinkFunctions: string[];
};
