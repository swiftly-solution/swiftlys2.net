import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { McpContext } from "@/lib/mcp/context";
import { TOOL_GROUPS } from "@/lib/mcp/tools";

export function createMcpServer(baseUrl: string): McpServer {
    const server = new McpServer({
        name: "swiftlys2",
        version: "1.0.0",
    });

    const ctx: McpContext = { baseUrl };

    for (const group of TOOL_GROUPS) {
        for (const tool of group.tools) {
            server.registerTool(
                tool.name,
                {
                    title: tool.title,
                    description: tool.description,
                    inputSchema: tool.inputSchema,
                },
                (args) => tool.handler(args, ctx),
            );
        }
    }

    return server;
}
