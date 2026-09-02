"use client";

import { useProtobufLanguage } from "@/components/protobuf/language-context";

export function ProtobufLanguageSwitcher() {
    const { language, setLanguage } = useProtobufLanguage();

    return (
        <div className="inline-flex rounded-lg border border-white/10 bg-white/5 p-1">
            <button
                type="button"
                onClick={() => setLanguage("proto")}
                className={`rounded-md px-3 py-1.5 font-mono text-sm transition-colors ${
                    language === "proto"
                        ? "bg-accent text-black"
                        : "text-zinc-400 hover:text-white"
                }`}
            >
                Proto
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
