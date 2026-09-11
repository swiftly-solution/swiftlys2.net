import type { ReactNode } from "react";

const TAG_PATTERN = /(<br\s*\/?>|<\/?b>|<\/?pre>)/gi;

function decodeEntities(text: string): string {
    return text
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&");
}

export function renderPanoramaDescription(description: string): ReactNode[] {
    const parts = description.split(TAG_PATTERN);
    const nodes: ReactNode[] = [];
    let bold = false;
    let pre = false;
    let key = 0;

    for (const part of parts) {
        if (!part) continue;

        if (/^<br\s*\/?>$/i.test(part)) {
            nodes.push(<br key={key++} />);
            continue;
        }
        if (/^<b>$/i.test(part)) {
            bold = true;
            continue;
        }
        if (/^<\/b>$/i.test(part)) {
            bold = false;
            continue;
        }
        if (/^<pre>$/i.test(part)) {
            pre = true;
            continue;
        }
        if (/^<\/pre>$/i.test(part)) {
            pre = false;
            continue;
        }

        const text = decodeEntities(part);
        if (pre) {
            nodes.push(
                <pre
                    key={key++}
                    className="mt-2 whitespace-pre-wrap rounded-lg border border-white/10 bg-black/30 px-3 py-2 font-mono text-xs text-zinc-300"
                >
                    {text.replace(/^\n+|\n+$/g, "")}
                </pre>,
            );
        } else if (bold) {
            nodes.push(<b key={key++}>{text}</b>);
        } else {
            nodes.push(<span key={key++}>{text}</span>);
        }
    }

    return nodes;
}
