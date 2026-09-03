import type { ApiBranch } from "@/lib/api-docs/types";
import { apiDocsPrefix, type UidIndexEntry } from "@/lib/api-docs/tree";
import { type InlineToken, parseInlineMarkup } from "@/lib/api-docs/xref";

export function InlineMarkup({ tokens, branch }: { tokens: InlineToken[]; branch: ApiBranch }) {
    const prefix = apiDocsPrefix(branch);

    return (
        <>
            {tokens.map((token, i) => {
                if (token.kind === "text") {
                    return <span key={i}>{token.value}</span>;
                }
                if (token.categorySlug && token.typeSlug) {
                    return (
                        <a
                            key={i}
                            href={`${prefix}/${token.categorySlug}/${token.typeSlug}`}
                            className="text-accent hover:underline"
                        >
                            {token.label}
                        </a>
                    );
                }
                return <span key={i}>{token.label}</span>;
            })}
        </>
    );
}

export function InlineText({
    text,
    branch,
    uidIndex,
}: {
    text: string;
    branch: ApiBranch;
    uidIndex: Map<string, UidIndexEntry>;
}) {
    return <InlineMarkup tokens={parseInlineMarkup(text, uidIndex)} branch={branch} />;
}
