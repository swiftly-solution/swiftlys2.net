"use client";

import { useGameEventsLanguage } from "@/components/gameevents/language-context";

export function GameEventsLanguageSwitcher() {
    const { language, setLanguage } = useGameEventsLanguage();

    return (
        <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
            <button
                type="button"
                onClick={() => setLanguage("native")}
                className={`rounded-md px-3 py-1.5 font-mono text-sm transition-colors ${
                    language === "native"
                        ? "bg-accent text-black"
                        : "text-zinc-400 hover:text-white"
                }`}
            >
                Native
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
