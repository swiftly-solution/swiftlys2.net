import type { ToolGroup } from "@/lib/mcp/tools/types";
import { siteToolGroup } from "@/lib/mcp/tools/site";
import { schemaToolGroup } from "@/lib/mcp/tools/schema";
import { entityToolGroup } from "@/lib/mcp/tools/entity";
import { protobufToolGroup } from "@/lib/mcp/tools/protobuf";
import { gameEventToolGroup } from "@/lib/mcp/tools/gameevent";
import { convarToolGroup } from "@/lib/mcp/tools/convar";
import { panoramaToolGroup } from "@/lib/mcp/tools/panorama";
import { apiDocsToolGroup } from "@/lib/mcp/tools/apidocs";
import { docsToolGroup } from "@/lib/mcp/tools/docs";

export const TOOL_GROUPS: ToolGroup[] = [
    siteToolGroup,
    schemaToolGroup,
    entityToolGroup,
    protobufToolGroup,
    gameEventToolGroup,
    convarToolGroup,
    panoramaToolGroup,
    apiDocsToolGroup,
    docsToolGroup,
];
