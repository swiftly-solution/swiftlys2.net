export type DocsMetaEntry = {
    page?: string;
    title?: string;
    children?: DocsMeta;
};

export type DocsMeta = Record<string, DocsMetaEntry>;
