#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { connectToMongoDB, closeMongoDB } from "./mongodb/client.js";
import { ToolRegistry } from "./tools/registry.js";

const args = process.argv.slice(2);
if (args.length === 0) {
  console.error("Please provide a MongoDB connection URL");
  process.exit(1);
}
const databaseUrl = args[0];

const toolRegistry = new ToolRegistry();
console.log(toolRegistry.getToolSchemas(), "get tool schemas");

const server = new Server(
  {
    name: "mongodb-mcp",
    version: "0.1.0",
  },
  {
    capabilities: {
      resources: {},
      tools: {
        list: true,
        call: true,
      },
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: toolRegistry.getToolSchemas(),
  _meta: {},
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  console.error("=== REQUEST RECEIVED ===");
  console.error(`Tool: ${request.params.name}`);
  console.error(
    `Arguments: ${JSON.stringify(request.params.arguments, null, 2)}`
  );

  const name = request.params.name;
  const args = request.params.arguments ?? {};

  try {
    if (
      name === "find" &&
      (!args.sort || Object.keys(args.sort).length === 0)
    ) {
      console.error("ERROR: Sort parameter is required but missing!");
      throw new Error("Sort parameter is required for find operations");
    }

    const tool = toolRegistry.getTool(name);
    if (!tool) {
      throw new Error(`Unknown tool: ${name}`);
    }

    const result = await tool.execute(args);
    return { toolResult: result };
  } catch (error) {
    console.error("Operation failed:", error);
    return {
      toolResult: {
        content: [
          {
            type: "text",
            text: error.message,
          },
        ],
        isError: true,
      },
    };
  }
});

async function runServer() {
  try {
    await connectToMongoDB(databaseUrl);
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("MongoDB MCP server running on stdio");
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

process.on("SIGINT", async () => {
  try {
    await closeMongoDB();
  } finally {
    process.exit(0);
  }
});

process.on("unhandledRejection", (error) => {
  console.error("Unhandled promise rejection:", error);
  process.exit(1);
});

runServer().catch(console.error);
