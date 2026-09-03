import type { ApiBranch, TypeRefToken } from "@/lib/api-docs/types";
import { apiDocsPrefix, type UidIndexEntry } from "@/lib/api-docs/tree";
import { resolveSchemaLink, type SchemaProjectIndex } from "@/lib/api-docs/schema-links";

export function TypeRef({
    tokens,
    branch,
    uidIndex,
    schemaIndex,
}: {
    tokens: TypeRefToken[];
    branch: ApiBranch;
    uidIndex: Map<string, UidIndexEntry>;
    schemaIndex: SchemaProjectIndex;
}) {
    const prefix = apiDocsPrefix(branch);

    return (
        <>
            {tokens.map((token, i) => {
                if (typeof token === "string") {
                    return <span key={i}>{token}</span>;
                }
                const entry = token.uid ? uidIndex.get(token.uid) : undefined;
                if (entry) {
                    return (
                        <a
                            key={i}
                            href={`${prefix}/${entry.categorySlug}/${entry.typeSlug}`}
                            className="text-accent hover:underline"
                        >
                            {token.text}
                        </a>
                    );
                }
                const schemaHref = resolveSchemaLink(schemaIndex, token.uid, token.url);
                if (schemaHref) {
                    return (
                        <a key={i} href={schemaHref} className="text-accent hover:underline">
                            {token.text}
                        </a>
                    );
                }
                if (token.url && /^https?:\/\//.test(token.url)) {
                    return (
                        <a
                            key={i}
                            href={token.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent hover:underline"
                        >
                            {token.text}
                        </a>
                    );
                }
                return <span key={i}>{token.text}</span>;
            })}
        </>
    );
}
