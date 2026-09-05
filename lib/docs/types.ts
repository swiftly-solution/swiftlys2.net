export type DocsMetaEntry = {
    page?: string;
    title?: string;
    category?: string;
    children?: DocsMeta;
};

export type DocsMeta = Record<string, DocsMetaEntry>;
