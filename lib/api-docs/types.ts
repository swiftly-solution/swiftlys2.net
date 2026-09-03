export type ApiTypeKind = "Class" | "Interface" | "Enum" | "Struct" | "Delegate";

export type TypeRefToken = string | { text: string; url?: string; uid?: string };

export type ApiParameter = {
    name: string;
    type?: TypeRefToken[];
    description?: string;
    optional?: boolean;
};

export type ApiException = {
    type?: TypeRefToken[];
    description?: string;
};

export type ApiTypeParameter = { name: string; description?: string };

export type ApiMember = {
    name: string;
    uid: string;
    sourceUrl?: string;
    summary?: string;
    declaration: string;
    parameters?: ApiParameter[];
    returns?: { type?: TypeRefToken[]; description?: string };
    valueType?: TypeRefToken[];
    remarks?: string;
    exceptions?: ApiException[];
    typeParameters?: ApiTypeParameter[];
};

export type ApiType = {
    name: string;
    type: ApiTypeKind;
    uid: string;
    parent?: string;
    sourceUrl?: string;
    summary?: string;
    declaration: string;
    remarks?: string;
    typeParameters?: ApiTypeParameter[];
    inherits?: TypeRefToken[];
    implements?: TypeRefToken[];
    operators?: ApiMember[];
    constructors?: ApiMember[];
    methods?: ApiMember[];
    properties?: ApiMember[];
    fields?: ApiMember[];
};

export type ApiCategory = {
    category: string;
    namespace: string;
    types: ApiType[];
};

export type ApiBranch = "stable" | "beta";

export type ApiDump = {
    branch: ApiBranch;
    categories: ApiCategory[];
};
