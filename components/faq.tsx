"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQ_ITEMS = [
    {
        question: "Is SwiftlyS2 free and open-source?",
        answer: "Yes. The C++ core is licensed under GPLv3 and the full source is on GitHub - you can read it and build it yourself.",
    },
    {
        question: "Do I have to open-source my plugins?",
        answer: "No. The GPLv3 license carries an explicit MIT exception for derivative works - your plugins, or anything built against the published .NET packages, can stay closed-source or commercial.",
    },
    {
        question: "Which language do I write plugins in?",
        answer: "C#, using the official dotnet templates (dotnet new swplugin). The framework's core is C++, but plugin code never has to touch it directly.",
    },
    {
        question: "Which games does it support?",
        answer: "Counter-Strike 2 today. The core is built engine-first for Source 2 more broadly, but CS2 is the only shipped target right now.",
    },
    {
        question: "Does SwiftlyS2 modify the game client?",
        answer: "No. It's a server-side scripting framework - players connect and play normally, no client-side installation required.",
    },
    {
        question: "Can I reload plugins without restarting the server?",
        answer: "Yes - plugins are told when they've been hot-reloaded, so they can restore state on the fly with no server restart.",
    },
    {
        question: "Is this affiliated with Valve or Steam?",
        answer: "No. SwiftlyS2 is an independent project built by Swiftly Labs and is not affiliated with, endorsed, or sponsored by Valve Corporation.",
    },
    {
        question: "Where do I get help or report a bug?",
        answer: "Join the Discord community for day-to-day help, or open an issue on GitHub for bugs and feature requests.",
    },
];

export function Faq() {
    const [openIndex, setOpenIndex] = useState<number | null>(-1);

    return (
        <section id="faq" className="mx-auto mt-20 max-w-6xl px-6">
            <h2 className="text-2xl font-bold text-white">
                Frequently asked questions
            </h2>

            <div className="mt-6 divide-y divide-white/10 rounded-2xl border border-white/10 bg-zinc-950/40">
                {FAQ_ITEMS.map((item, index) => {
                    const open = openIndex === index;
                    return (
                        <div key={item.question}>
                            <button
                                onClick={() =>
                                    setOpenIndex(open ? null : index)
                                }
                                className="flex w-full items-center justify-between gap-4 px-6 py-4 text-left"
                                aria-expanded={open}
                            >
                                <span className="font-medium text-white">
                                    {item.question}
                                </span>
                                <ChevronDown
                                    className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${
                                        open ? "rotate-180 text-accent" : ""
                                    }`}
                                />
                            </button>
                            <div
                                className={`grid transition-[grid-template-rows] duration-300 ease-out motion-reduce:transition-none ${
                                    open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                                }`}
                            >
                                <div className="overflow-hidden">
                                    <p className="px-6 pb-4 text-sm text-zinc-500">
                                        {item.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
