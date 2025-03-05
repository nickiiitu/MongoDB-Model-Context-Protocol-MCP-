import { db } from "../../mongodb/client.js";
import { BaseTool, ToolParams } from "../base/tool.js";

type ListCollectionsParams = ToolParams;

export class ListCollectionsTool extends BaseTool<ListCollectionsParams> {
  name = "listCollections";
  description = "List all available collections in the database";
  inputSchema = {
    type: "object" as const,
    properties: {},
  };

  async execute(_params: ListCollectionsParams) {
    try {
      const collections = await db.listCollections().toArray();
      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              collections.map((c) => ({
                name: c.name,
                type: c.type,
              })),
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
