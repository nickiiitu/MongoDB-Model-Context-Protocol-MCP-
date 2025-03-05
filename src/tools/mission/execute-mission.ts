import { BaseTool, ToolParams, ToolResponse } from "../base/tool.js";
import { McpError, ErrorCode } from "@modelcontextprotocol/sdk/types.js";
import { ObjectId } from "mongodb";

export type FlightRequestType = "DEFAULT" | "AUTOMATION_AUTO_RESPONSE";

export interface ExecuteMissionParams extends ToolParams {
  deviceId: string;
  missionId: string;
  orgId: string;
  userId: string;
  resetTask?: boolean;
  flightRequestType?: FlightRequestType;
}

export class ExecuteMissionTool extends BaseTool<ExecuteMissionParams> {
  name = "execute-mission";
  description = "Execute a predefined mission on a specified drone device";
  inputSchema = {
    type: "object" as const,
    properties: {
      deviceId: {
        type: "string",
        description: "Unique identifier of the target drone device",
      },
      missionId: {
        type: "string",
        description: "Unique identifier of the mission to execute",
      },
      orgId: {
        type: "string",
        description: "Organization ID",
      },
      userId: {
        type: "string",
        description: "User ID performing the request",
      },
      resetTask: {
        type: "boolean",
        description: "Whether to reset task tracking for this mission",
        default: false,
      },
      flightRequestType: {
        type: "string",
        enum: ["DEFAULT", "AUTOMATION_AUTO_RESPONSE"],
        description: "Type of flight request",
        default: "DEFAULT",
      },
    },
    required: ["deviceId", "missionId", "orgId", "userId"] as string[],
    additionalProperties: false,
  };

  async execute(params: ExecuteMissionParams): Promise<ToolResponse> {
    try {
      // Validate ObjectIds and convert them to strings
      const deviceId = this.validateObjectId(
        params.deviceId,
        "deviceId"
      ).toString();
      const missionId = this.validateObjectId(
        params.missionId,
        "missionId"
      ).toString();
      const orgId = this.validateObjectId(params.orgId, "orgId").toString();
      const userId = this.validateObjectId(params.userId, "userId").toString();
      const request = { missionId };
      const response = await fetch(
        `https://api-stag.flytbase.com/flight/${deviceId}/execute`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "org-id": orgId,
            "user-id": userId,
            Authorization: `Bearer `,
          },
          body: JSON.stringify(request),
        }
      );

      const responseData = await response.json();

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(responseData, null, 2),
          },
        ],
        isError: false,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  private validateObjectId(id: string, field: string): ObjectId {
    try {
      return new ObjectId(id);
    } catch (error) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Invalid ${field}: ${id}. Must be a valid ObjectId.`
      );
    }
  }
}
