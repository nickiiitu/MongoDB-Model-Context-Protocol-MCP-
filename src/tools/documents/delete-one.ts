import { db } from "../../mongodb/client.js";
import { BaseTool, ToolParams } from "../base/tool.js";

interface DeleteOneParams extends ToolParams {
  collection: string;
  filter: Record<string, unknown>;
  [key: string]: unknown;
}

export class DeleteOneTool extends BaseTool<DeleteOneParams> {
  name = "deleteOne";
  description = "Delete a single document from a collection";
  inputSchema = {
    type: "object" as const,
    properties: {
      collection: {
        type: "string",
        description: "Name of the collection",
      },
      filter: {
        type: "object",
        description: "Filter to identify document",
      },
    },
    required: ["collection", "filter"],
  };

  async execute(params: DeleteOneParams) {
    try {
      const collection = this.validateCollection(params.collection);
      const filter = this.validateObject(params.filter, "Filter");
      const result = await db.collection(collection).deleteOne(filter);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ deleted: result.deletedCount }, null, 2),
          },
        ],
        isError: false,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
