import { createHighlighter, type Highlighter } from "shiki";

const THEME = "github-dark-default";

const LANGS = [
    "csharp",
    "cpp",
    "c",
    "bash",
    "shell",
    "powershell",
    "json",
    "jsonc",
    "typescript",
    "tsx",
    "javascript",
    "jsx",
    "yaml",
    "toml",
    "ini",
    "xml",
    "html",
    "css",
    "sql",
    "python",
    "diff",
    "markdown",
];

const ALIASES: Record<string, string> = {
    "c++": "cpp",
    "c#": "csharp",
    cs: "csharp",
    sh: "bash",
    zsh: "bash",
    shellscript: "bash",
    ps1: "powershell",
    yml: "yaml",
    ts: "typescript",
    js: "javascript",
    py: "python",
    md: "markdown",
    plaintext: "text",
    txt: "text",
    "": "text",
};

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
    if (!highlighterPromise) {
        highlighterPromise = createHighlighter({
            themes: [THEME],
            langs: LANGS,
        });
    }
    return highlighterPromise;
}

function resolveLang(highlighter: Highlighter, lang: string): string {
    const normalized = (lang || "").toLowerCase();
    const mapped = ALIASES[normalized] ?? normalized;
    if (mapped === "text") return "text";
    return highlighter.getLoadedLanguages().includes(mapped) ? mapped : "text";
}

export async function highlightCode(
    code: string,
    lang: string,
): Promise<string> {
    const highlighter = await getHighlighter();
    return highlighter.codeToHtml(code, {
        lang: resolveLang(highlighter, lang),
        theme: THEME,
        colorReplacements: {
            "#0d1117": "transparent",
            "#ffa657": "#e6edf3",
        },
    });
}
