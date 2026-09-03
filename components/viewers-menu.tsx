"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";

export const VIEWERS = [
    { label: "schema", href: "/schema-viewer" },
    { label: "convars & commands", href: "/convars-viewer" },
    { label: "entity", href: "/entity-viewer" },
    { label: "protobuf", href: "/protobuf-viewer" },
    { label: "events", href: "/gameevents-viewer" },
];

export function ViewersMenu() {
    const [open, setOpen] = useState(false);
    const pathname = usePathname() ?? "";
    const active = VIEWERS.some((v) => pathname.startsWith(v.href));

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className={`flex items-center gap-1 transition-colors hover:text-white ${
                    active ? "text-white" : ""
                }`}
            >
                viewers
                <ChevronDown
                    className={`h-3 w-3 text-zinc-600 transition-transform ${
                        open ? "rotate-180" : ""
                    }`}
                />
            </button>

            {open && (
                <>
                    <button
                        aria-hidden
                        tabIndex={-1}
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 z-10 cursor-default"
                    />
                    <div className="absolute left-0 top-full z-20 mt-2 min-w-32 overflow-hidden rounded-lg border border-white/10 bg-zinc-950 shadow-xl">
                        {VIEWERS.map((viewer) => (
                            <Link
                                key={viewer.href}
                                href={viewer.href}
                                onClick={() => setOpen(false)}
                                className={`block px-3 py-2 transition-colors hover:bg-white/[0.03] ${
                                    pathname.startsWith(viewer.href)
                                        ? "text-accent"
                                        : "text-zinc-300"
                                }`}
                            >
                                {viewer.label}
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
