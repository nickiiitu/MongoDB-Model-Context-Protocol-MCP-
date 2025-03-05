import { db } from "../../mongodb/client.js";
import { BaseTool, ToolParams } from "../base/tool.js";

interface UpdateOneParams extends ToolParams {
  collection: string;
  filter: Record<string, unknown>;
  update: Record<string, unknown>;
  [key: string]: unknown;
}

export class UpdateOneTool extends BaseTool<UpdateOneParams> {
  name = "updateOne";
  description = "Update a single document in a collection";
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
      update: {
        type: "object",
        description: "Update operations to apply",
      },
    },
    required: ["collection", "filter", "update"],
  };

  async execute(params: UpdateOneParams) {
    try {
      const collection = this.validateCollection(params.collection);
      const filter = this.validateObject(params.filter, "Filter");
      const update = this.validateObject(params.update, "Update");
      const result = await db.collection(collection).updateOne(filter, update);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              {
                matched: result.matchedCount,
                modified: result.modifiedCount,
                upsertedId: result.upsertedId,
              },
              null,
              2
            ),
          },
        ],
        isError: false,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
