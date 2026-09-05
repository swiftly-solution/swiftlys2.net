import type { ComponentProps } from "react";
import { Callout } from "@/components/docs/callout";
import { Box } from "@/components/docs/box";
import { Download } from "@/components/docs/download";
import { Tabs, Tab } from "@/components/docs/tabs";
import { Steps, Step } from "@/components/docs/steps";
import { ColorPicker } from "@/components/docs/color-picker";

export const mdxComponents = {
    Callout,
    Box,
    Download,
    Tabs,
    Tab,
    Steps,
    Step,
    ColorPicker,
    h1: (props: ComponentProps<"h1">) => (
        <h1
            className="mb-4 mt-8 font-mono text-3xl font-bold text-white first:mt-0"
            {...props}
        />
    ),
    h2: (props: ComponentProps<"h2">) => (
        <h2
            className="mb-3 mt-8 font-mono text-2xl font-bold text-white"
            {...props}
        />
    ),
    h3: (props: ComponentProps<"h3">) => (
        <h3
            className="mb-2 mt-6 font-mono text-lg font-semibold text-white"
            {...props}
        />
    ),
    p: (props: ComponentProps<"p">) => (
        <p className="my-3 leading-relaxed text-zinc-400" {...props} />
    ),
    a: (props: ComponentProps<"a">) => (
        <a className="text-accent hover:underline" {...props} />
    ),
    ul: (props: ComponentProps<"ul">) => (
        <ul
            className="my-3 list-disc space-y-1 pl-6 text-zinc-400"
            {...props}
        />
    ),
    ol: (props: ComponentProps<"ol">) => (
        <ol
            className="my-3 list-decimal space-y-1 pl-6 text-zinc-400"
            {...props}
        />
    ),
    li: (props: ComponentProps<"li">) => <li {...props} />,
    code: (props: ComponentProps<"code">) => (
        <code
            className="rounded bg-black/40 px-1.5 py-0.5 font-mono text-[0.85em] text-accent"
            {...props}
        />
    ),
    pre: (props: ComponentProps<"pre">) => (
        <pre
            className="my-4 overflow-x-auto rounded-xl border border-white/10 bg-zinc-950 p-4 font-mono text-sm text-zinc-300 [&>code]:bg-transparent [&>code]:p-0 [&>code]:text-inherit"
            {...props}
        />
    ),
    figure: (props: ComponentProps<"figure">) => (
        <figure className="my-4" {...props} />
    ),
    figcaption: (props: ComponentProps<"figcaption">) => (
        <figcaption
            className="rounded-t-xl border border-b-0 border-white/10 bg-zinc-900 px-4 py-2 font-mono text-xs text-zinc-400 [&+pre]:mt-0 [&+pre]:rounded-t-none"
            {...props}
        />
    ),
    strong: (props: ComponentProps<"strong">) => (
        <strong className="font-semibold text-white" {...props} />
    ),
    hr: () => <hr className="my-8 border-white/10" />,
    table: (props: ComponentProps<"table">) => (
        <div className="my-4 overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full border-collapse text-left text-sm" {...props} />
        </div>
    ),
    thead: (props: ComponentProps<"thead">) => (
        <thead className="bg-white/5" {...props} />
    ),
    tbody: (props: ComponentProps<"tbody">) => (
        <tbody className="divide-y divide-white/10" {...props} />
    ),
    tr: (props: ComponentProps<"tr">) => <tr {...props} />,
    th: (props: ComponentProps<"th">) => (
        <th
            className="whitespace-nowrap px-4 py-2 font-mono text-xs uppercase tracking-wide text-zinc-400"
            {...props}
        />
    ),
    td: (props: ComponentProps<"td">) => (
        <td className="px-4 py-2 text-zinc-300" {...props} />
    ),
};
