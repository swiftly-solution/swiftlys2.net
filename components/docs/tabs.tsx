"use client";

import {
    Children,
    isValidElement,
    useState,
    type ReactElement,
    type ReactNode,
} from "react";

type TabProps = { label: string; children: ReactNode };

export function Tab({ children }: TabProps) {
    return <>{children}</>;
}

export function Tabs({ children }: { children: ReactNode }) {
    const tabs = Children.toArray(children).filter(
        isValidElement,
    ) as ReactElement<TabProps>[];
    const [active, setActive] = useState(0);

    if (tabs.length === 0) return null;

    return (
        <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-zinc-950">
            <div className="flex flex-wrap gap-1 border-b border-white/10 bg-black/20 p-1.5">
                {tabs.map((tab, index) => (
                    <button
                        key={tab.props.label}
                        type="button"
                        onClick={() => setActive(index)}
                        className={`rounded-lg px-3 py-1.5 font-mono text-xs transition-colors ${
                            active === index
                                ? "bg-accent/10 text-accent"
                                : "text-zinc-400 hover:text-white"
                        }`}
                    >
                        {tab.props.label}
                    </button>
                ))}
            </div>
            <div className="p-4 [&>:first-child]:mt-0 [&>:last-child]:mb-0">
                {tabs[active]}
            </div>
        </div>
    );
}
