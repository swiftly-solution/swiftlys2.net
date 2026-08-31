import type { ReactNode } from "react";

export function TerminalWindow({
    title,
    children,
}: {
    title: string;
    children: ReactNode;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl shadow-black/40">
            <div className="flex items-center gap-2 border-b border-white/10 bg-white/[0.03] px-4 py-2.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f56]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#27c93f]" />
                <span className="ml-2 font-mono text-xs text-zinc-500">
                    {title}
                </span>
            </div>
            <div className="overflow-x-auto p-4 font-mono text-xs leading-relaxed sm:p-5 sm:text-sm">
                {children}
            </div>
        </div>
    );
}
