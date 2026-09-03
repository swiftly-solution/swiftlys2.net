import { parse } from "yaml";
import { DOCS_REPO_OWNER, DOCS_REPO_NAME } from "@/lib/docs/config";
import { API_PATH } from "@/lib/api-docs/config";
import { getCachedGithubDump, LATEST_REF } from "@/lib/github-cache";
import type { ApiBranch, ApiDump } from "@/lib/api-docs/types";

function fileUrl(branch: ApiBranch): string {
    return `https://raw.githubusercontent.com/${DOCS_REPO_OWNER}/${DOCS_REPO_NAME}/${LATEST_REF}/${API_PATH}/${branch}.yaml`;
}

export async function getApiDump(branch: ApiBranch): Promise<ApiDump> {
    return getCachedGithubDump<ApiDump>({
        key: `api-docs:${branch}`,
        commit: {
            owner: DOCS_REPO_OWNER,
            repo: DOCS_REPO_NAME,
            ref: LATEST_REF,
            path: `${API_PATH}/${branch}.yaml`,
        },
        load: async () => {
            const res = await fetch(fileUrl(branch), { cache: "no-store" });
            if (!res.ok) {
                throw new Error(`API dump fetch failed: ${res.status}`);
            }
            return parse(await res.text()) as ApiDump;
        },
    });
}
