"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function CopyBlock({ text, label }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch { }
    }

    return (
        <div>
            {label && (
                <div className="mb-2 font-mono text-xs uppercase tracking-wide text-zinc-500">
                    {label}
                </div>
            )}
            <div className="relative">
                <pre className="overflow-x-auto rounded-xl border border-white/10 bg-zinc-950 p-4 pr-12 font-mono text-sm text-zinc-300">
                    {text}
                </pre>
                <button
                    type="button"
                    onClick={handleCopy}
                    aria-label="Copy to clipboard"
                    className="absolute right-3 top-3 rounded-lg border border-white/10 bg-black/40 p-1.5 text-zinc-400 transition-colors hover:border-accent/40 hover:text-accent"
                >
                    {copied ? (
                        <Check className="h-3.5 w-3.5" />
                    ) : (
                        <Copy className="h-3.5 w-3.5" />
                    )}
                </button>
            </div>
        </div>
    );
}
