import type { PanoramaDump, PanoramaProperty } from "@/lib/panorama/types";

export function findPanoramaProperty(
    dump: PanoramaDump,
    name: string,
): PanoramaProperty | null {
    return dump.properties.find((p) => p.name === name) ?? null;
}
