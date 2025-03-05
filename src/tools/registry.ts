import { BaseTool } from "./base/tool.js";
import { ListCollectionsTool } from "./collection/list-collections.js";
import { DeleteOneTool } from "./documents/delete-one.js";
import { FindTool } from "./documents/find.js";
import { InsertOneTool } from "./documents/insert-one.js";
import { UpdateOneTool } from "./documents/update-one.js";
import { CreateIndexTool } from "./indexes/create-index.js";
import { DropIndexTool } from "./indexes/drop-index.js";
import { ListIndexesTool } from "./indexes/list-indexes.js";
import { ExecuteMissionTool } from "./mission/execute-mission.js";
import { McpError, ErrorCode, Tool } from "@modelcontextprotocol/sdk/types.js";

export class ToolRegistry {
  private tools: Map<string, BaseTool<any>> = new Map();

  constructor() {
    this.registerTool(new ListCollectionsTool());
    this.registerTool(new FindTool());
    this.registerTool(new InsertOneTool());
    this.registerTool(new UpdateOneTool());
    this.registerTool(new DeleteOneTool());
    this.registerTool(new CreateIndexTool());
    this.registerTool(new DropIndexTool());
    this.registerTool(new ListIndexesTool());
    this.registerTool(new ExecuteMissionTool());
  }

  registerTool(tool: BaseTool<any>) {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): BaseTool<any> | undefined {
    const tool = this.tools.get(name);
    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown tool: ${name}`);
    }
    return tool;
  }

  getAllTools(): BaseTool<any>[] {
    return Array.from(this.tools.values());
  }

  getToolSchemas(): Tool[] {
    return this.getAllTools().map((tool) => ({
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema
    }));
  }
}
