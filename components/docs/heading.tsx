"use client";

import { useState, type ComponentProps } from "react";
import { Check, Link as LinkIcon } from "lucide-react";

const TAGS = { h1: "h1", h2: "h2", h3: "h3", h4: "h4" } as const;

const SIZE_CLASS: Record<keyof typeof TAGS, string> = {
    h1: "mb-4 mt-8 font-mono text-3xl font-bold text-white first:mt-0",
    h2: "mb-3 mt-8 font-mono text-2xl font-bold text-white",
    h3: "mb-2 mt-6 font-mono text-lg font-semibold text-white",
    h4: "mb-2 mt-4 font-mono text-base font-semibold text-white",
};

export function Heading({
    as,
    id,
    children,
    ...rest
}: { as: keyof typeof TAGS } & ComponentProps<"h1">) {
    const Tag = TAGS[as];
    const [copied, setCopied] = useState(false);

    function handleCopy() {
        if (!id) return;
        const url = `${window.location.origin}${window.location.pathname}#${id}`;
        navigator.clipboard.writeText(url).catch(() => {});
        window.history.replaceState(null, "", `#${id}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1500);
    }

    return (
        <Tag id={id} className={`group scroll-mt-24 ${SIZE_CLASS[as]}`} {...rest}>
            <span className="inline-flex items-center gap-2">
                {children}
                {id && (
                    <button
                        type="button"
                        onClick={handleCopy}
                        aria-label="Copy link to section"
                        className="opacity-0 shrink-0 text-zinc-600 transition-opacity hover:text-accent focus:opacity-100 group-hover:opacity-100"
                    >
                        {copied ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <LinkIcon className="h-4 w-4" />
                        )}
                    </button>
                )}
            </span>
        </Tag>
    );
}
