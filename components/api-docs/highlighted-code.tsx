import { highlightCode } from "@/lib/highlight-code";

export async function HighlightedCode({
    code,
    lang = "csharp",
    className,
}: {
    code: string;
    lang?: string;
    className?: string;
}) {
    const html = await highlightCode(code, lang);

    return (
        <div
            className={`overflow-x-auto rounded-xl border border-white/10 bg-zinc-950 p-4 font-mono text-sm [&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0 ${className ?? ""}`}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
