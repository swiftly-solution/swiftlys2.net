"use client";

import { useSchemaLanguage } from "@/components/schema/language-context";

export function LanguageSwitcher() {
    const { language, setLanguage } = useSchemaLanguage();

    return (
        <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
            <button
                type="button"
                onClick={() => setLanguage("cpp")}
                className={`rounded-md px-3 py-1.5 font-mono text-sm transition-colors ${
                    language === "cpp"
                        ? "bg-accent text-black"
                        : "text-zinc-400 hover:text-white"
                }`}
            >
                C++
            </button>
            <button
                type="button"
                onClick={() => setLanguage("csharp")}
                className={`rounded-md px-3 py-1.5 font-mono text-sm transition-colors ${
                    language === "csharp"
                        ? "bg-accent text-black"
                        : "text-zinc-400 hover:text-white"
                }`}
            >
                C#
            </button>
        </div>
    );
}
