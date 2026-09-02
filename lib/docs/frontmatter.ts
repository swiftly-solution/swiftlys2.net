export function extractFrontmatterTitle(source: string): string | null {
    const frontmatterMatch = source.match(/^---\s*\n([\s\S]*?)\n---/);
    if (!frontmatterMatch) return null;

    const titleMatch = frontmatterMatch[1].match(/^title:\s*(.+)$/m);
    return titleMatch ? titleMatch[1].trim() : null;
}
