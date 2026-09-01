import type { ResolvedLink } from "@/lib/schema/queries";

export type EntityClass = {
    class_name: string;
    designer_name: string;
    flags: string[];
};

export type DatamapField = {
    externalName: string;
    fieldName: string;
    fieldType: string;
};

export type Datamap = {
    class_name: string;
    fields: {
        inputs?: DatamapField[];
        outputs?: DatamapField[];
        members?: DatamapField[];
    };
    think_functions: string[];
};

export type EntitiesDump = {
    entityClasses: EntityClass[];
    datamaps: Datamap[];
};

export type EntityInputPayload = { externalName: string; fieldType: string };
export type EntityOutputPayload = { externalName: string };
export type EntityMemberPayload = {
    externalName: string;
    fieldType: string;
    fieldName: string;
    csharpFieldName: string;
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
