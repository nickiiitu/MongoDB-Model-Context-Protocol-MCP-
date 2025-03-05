import { db } from "../../mongodb/client.js";
import { BaseTool, ToolParams } from "../base/tool.js";
import { Sort, ObjectId } from "mongodb";

export interface FindParams extends ToolParams {
  collection: string;
  filter?: Record<string, unknown>;
  limit?: number;
  projection?: Record<string, unknown>;
  sort: Sort;
}

export class FindTool extends BaseTool<FindParams> {
  name = "find";
  description =
    "Query and sort documents in MongoDB. IMPORTANT: Always specify sort order (e.g., sort by created_at: -1 for newest first, or created_at: 1 for oldest first)";
  inputSchema = {
    type: "object" as const,
    properties: {
      collection: {
        type: "string",
        description: "Name of the collection to query",
      },
      sort: {
        type: "object",
        description:
          "Sort order specification. Use created_at: -1 for newest first, created_at: 1 for oldest first",
        additionalProperties: {
          type: "integer",
          enum: [1, -1],
        },
        minProperties: 1,
      },
      filter: {
        type: "object",
        description: "MongoDB query filter",
        default: {},
      },
      limit: {
        type: "integer",
        description: "Maximum documents to return",
        default: 10,
        minimum: 1,
        maximum: 1000,
      },
      projection: {
        type: "object",
        description: "Fields to include/exclude",
        default: {},
      },
    },
    required: ["collection", "sort"] as string[],
    additionalProperties: false,
  };

  private convertObjectIds(filter: Record<string, unknown>): Record<string, unknown> {
    const converted = { ...filter };
    for (const [key, value] of Object.entries(converted)) {
      if (typeof value === 'string' && value.match(/^[0-9a-fA-F]{24}$/)) {
        converted[key] = new ObjectId(value);
      } else if (key === '_id' && typeof value === 'string') {
        try {
          converted[key] = new ObjectId(value);
        } catch (error) {
          // If it's not a valid ObjectId, leave it as is
          console.error("Invalid ObjectId:", value);
        }
      } else if (value && typeof value === 'object') {
        converted[key] = this.convertObjectIds(value as Record<string, unknown>);
      }
    }
    return converted;
  }

  async execute(params: FindParams) {
    try {
      console.error("Starting find operation with params:", JSON.stringify(params, null, 2));
      const collection = this.validateCollection(params.collection);
      console.error("Collection validated:", collection);
      
      // Convert string ObjectIds in filter
      const filter = params.filter ? this.convertObjectIds(params.filter) : {};
      console.error("Converted filter:", JSON.stringify(filter, null, 2));
      
      const results = await db
        .collection(collection)
        .find(filter)
        .project(params.projection || {})
        .sort(params.sort || {})
        .limit(Math.min(params.limit || 10, 1000))
        .toArray();

      console.error("Find results:", JSON.stringify(results, null, 2));

      return {
        content: [
          { type: "text" as const, text: JSON.stringify(results, null, 2) },
        ],
        isError: false,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
}
