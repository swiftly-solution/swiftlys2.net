import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpContext } from "@/lib/mcp/context";
import { registerSchemaTools } from "@/lib/mcp/tools/schema";
import { registerEntityTools } from "@/lib/mcp/tools/entity";
import { registerProtobufTools } from "@/lib/mcp/tools/protobuf";
import { registerGameEventTools } from "@/lib/mcp/tools/gameevent";
import { registerConvarTools } from "@/lib/mcp/tools/convar";
import { registerApiDocsTools } from "@/lib/mcp/tools/apidocs";
import { registerDocsTools } from "@/lib/mcp/tools/docs";
import { registerSiteTools } from "@/lib/mcp/tools/site";

export function createMcpServer(baseUrl: string): McpServer {
    const server = new McpServer({
        name: "swiftlys2",
        version: "1.0.0",
    });

    const ctx: McpContext = { baseUrl };

    registerSchemaTools(server, ctx);
    registerEntityTools(server, ctx);
    registerProtobufTools(server, ctx);
    registerGameEventTools(server, ctx);
    registerConvarTools(server, ctx);
    registerApiDocsTools(server, ctx);
    registerDocsTools(server, ctx);
    registerSiteTools(server, ctx);

    return server;
}
