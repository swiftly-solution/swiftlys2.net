"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { Check, Copy, Wand2 } from "lucide-react";

function hsvToHex(h: number, s: number, v: number): string {
    const c = v * s;
    const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m = v - c;
    let [r, g, b] = [0, 0, 0];

    if (h < 60) [r, g, b] = [c, x, 0];
    else if (h < 120) [r, g, b] = [x, c, 0];
    else if (h < 180) [r, g, b] = [0, c, x];
    else if (h < 240) [r, g, b] = [0, x, c];
    else if (h < 300) [r, g, b] = [x, 0, c];
    else [r, g, b] = [c, 0, x];

    const toHex = (n: number) =>
        Math.round((n + m) * 255)
            .toString(16)
            .padStart(2, "0");

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`.toUpperCase();
}

function hexToHsv(hex: string): { h: number; s: number; v: number } | null {
    const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
    if (!match) return null;

    const int = parseInt(match[1], 16);
    const r = ((int >> 16) & 255) / 255;
    const g = ((int >> 8) & 255) / 255;
    const b = (int & 255) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;

    let h = 0;
    if (d !== 0) {
        if (max === r) h = 60 * (((g - b) / d) % 6);
        else if (max === g) h = 60 * ((b - r) / d + 2);
        else h = 60 * ((r - g) / d + 4);
    }
    if (h < 0) h += 360;

    return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function ColorPicker({ defaultColor = "#00FEED" }: { defaultColor?: string }) {
    const initial = hexToHsv(defaultColor) ?? { h: 180, s: 1, v: 1 };
    const [hue, setHue] = useState(initial.h);
    const [sat, setSat] = useState(initial.s);
    const [val, setVal] = useState(initial.v);
    const [hexInput, setHexInput] = useState(hsvToHex(initial.h, initial.s, initial.v));
    const [copied, setCopied] = useState(false);
    const boxRef = useRef<HTMLDivElement>(null);

    const hex = hsvToHex(hue, sat, val);

    function updateFromPointer(clientX: number, clientY: number) {
        const box = boxRef.current;
        if (!box) return;
        const rect = box.getBoundingClientRect();
        const x = Math.min(Math.max(clientX - rect.left, 0), rect.width);
        const y = Math.min(Math.max(clientY - rect.top, 0), rect.height);
        const s = x / rect.width;
        const v = 1 - y / rect.height;
        setSat(s);
        setVal(v);
        setHexInput(hsvToHex(hue, s, v));
    }

    function handlePointerDown(e: ReactPointerEvent<HTMLDivElement>) {
        e.currentTarget.setPointerCapture(e.pointerId);
        updateFromPointer(e.clientX, e.clientY);
    }

    function handlePointerMove(e: ReactPointerEvent<HTMLDivElement>) {
        if (e.buttons !== 1) return;
        updateFromPointer(e.clientX, e.clientY);
    }

    function handleHueChange(next: number) {
        setHue(next);
        setHexInput(hsvToHex(next, sat, val));
    }

    function handleHexChange(next: string) {
        setHexInput(next);
        const parsed = hexToHsv(next);
        if (parsed) {
            setHue(parsed.h);
            setSat(parsed.s);
            setVal(parsed.v);
        }
    }

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(hex);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            // clipboard unavailable, ignore
        }
    }

    const hueColor = `hsl(${hue}, 100%, 50%)`;

    return (
        <div className="my-4 rounded-2xl border border-white/10 bg-zinc-950/40 p-6">
            <div className="flex items-center gap-2 font-mono text-sm text-zinc-300">
                <Wand2 className="h-4 w-4 text-accent" />
                Custom Color Picker
            </div>

            <div className="mt-4 grid gap-6 md:grid-cols-[1fr_16rem]">
                <div>
                    <div
                        ref={boxRef}
                        onPointerDown={handlePointerDown}
                        onPointerMove={handlePointerMove}
                        className="relative h-48 w-full cursor-crosshair touch-none rounded-xl border border-white/10"
                        style={{
                            backgroundColor: hueColor,
                            backgroundImage:
                                "linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)",
                        }}
                    >
                        <div
                            className="pointer-events-none absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow"
                            style={{
                                left: `${sat * 100}%`,
                                top: `${(1 - val) * 100}%`,
                            }}
                        />
                    </div>

                    <div className="mt-4">
                        <div className="mb-2 font-mono text-xs text-zinc-500">
                            Hue: {Math.round(hue)}°
                        </div>
                        <input
                            type="range"
                            min={0}
                            max={360}
                            value={hue}
                            onChange={(e) => handleHueChange(Number(e.target.value))}
                            className="h-2.5 w-full appearance-none rounded-full outline-none"
                            style={{
                                background:
                                    "linear-gradient(to right, #f00, #ff0, #0f0, #0ff, #00f, #f0f, #f00)",
                            }}
                        />
                    </div>
                </div>

                <div className="flex flex-col gap-4">
                    <div>
                        <div
                            className="h-16 w-full rounded-lg border border-white/10"
                            style={{ backgroundColor: hex }}
                        />
                        <div className="mt-2 text-center font-mono text-xs text-zinc-500">
                            Preview
                        </div>
                    </div>

                    <div>
                        <div className="mb-2 font-mono text-xs text-zinc-500">
                            Hex Code
                        </div>
                        <input
                            type="text"
                            value={hexInput}
                            onChange={(e) => handleHexChange(e.target.value)}
                            className="w-full rounded-lg border border-white/10 bg-black/20 px-3 py-2 font-mono text-sm text-zinc-200 outline-none focus:border-accent/40"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={handleCopy}
                        className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-zinc-100 px-3 py-2 font-mono text-sm text-zinc-900 transition-colors hover:bg-white"
                    >
                        {copied ? (
                            <Check className="h-4 w-4" />
                        ) : (
                            <Copy className="h-4 w-4" />
                        )}
                        {copied ? "Copied" : "Copy Hex"}
                    </button>
                </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
                <div className="mb-3 font-mono text-xs text-zinc-500">
                    Usage &amp; Preview
                </div>
                <div className="rounded-lg border border-white/10 bg-black/20 p-4 text-center font-mono text-sm" style={{ color: hex }}>
                    Sample colored text
                </div>
                <div className="mt-3 rounded-lg border border-dashed border-white/10 bg-black/20 px-4 py-3 font-mono text-xs text-zinc-400">
                    &lt;span color=&quot;{hex}&quot;&gt;Text&lt;/span&gt;
                </div>
            </div>
        </div>
    );
}
