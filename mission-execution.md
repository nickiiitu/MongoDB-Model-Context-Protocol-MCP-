# Mission Execution API

## Execute Mission on Device

Executes a predefined mission on a specified drone device.

### Endpoint

```http
POST /:deviceId/execute
```

### Description

This endpoint triggers the execution of a mission on a specific drone device. It handles mission validation, device status checks, and initiates the mission execution process while maintaining real-time telemetry data capture.

### Headers

| Name    | Type   | Required | Description                    |
| ------- | ------ | -------- | ------------------------------ |
| org-id  | string | Yes      | Organization ID                |
| user-id | string | Yes      | User ID performing the request |

### URL Parameters

| Parameter | Type     | Required | Description                                  |
| --------- | -------- | -------- | -------------------------------------------- |
| deviceId  | ObjectId | Yes      | Unique identifier of the target drone device |

### Request Body

| Field             | Type    | Required | Default | Description                                                      |
| ----------------- | ------- | -------- | ------- | ---------------------------------------------------------------- |
| missionId         | string  | Yes      | -       | Unique identifier of the mission to execute                      |
| resetTask         | boolean | No       | false   | Whether to reset task tracking for this mission                  |
| flightRequestType | enum    | No       | DEFAULT | Type of flight request (DEFAULT, AUTOMATION_AUTO_RESPONSE, etc.) |

### Response

#### Success Response (200 OK)

```typescript
{
  flight_id: string; // Unique identifier for the flight session
}
```

#### Error Responses

- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication failure
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Device or mission not found
- `409 Conflict`: Device busy or in invalid state
- `500 Internal Server Error`: Server-side processing error

### Technical Implementation Details

1. **Data Capture Layer**

   - Establishes WebSocket connection for real-time telemetry
   - Implements data buffering for mission telemetry
   - Synchronizes multiple data streams

2. **Mission Validation**

   - Validates mission existence and compatibility
   - Checks device status and availability
   - Verifies user permissions and organization access

3. **Execution Flow**
   - Initializes mission execution context
   - Triggers mission commands via MQTT
   - Monitors execution status
   - Records telemetry data

### Security Considerations

- Requires valid organization and user authentication
- Implements role-based access control
- Validates device ownership within organization
- Enforces mission execution permissions

### Usage Example

```typescript
// Request
POST /12345/execute
Headers: {
  "org-id": "507f1f77bcf86cd799439011",
  "user-id": "507f1f77bcf86cd799439012"
}
Body: {
  "missionId": "507f1f77bcf86cd799439013",
  "resetTask": false,
  "flightRequestType": "DEFAULT"
}

// Success Response
{
  "flight_id": "507f1f77bcf86cd799439014"
}
```

### Notes

- Mission execution is asynchronous; the response indicates successful initiation
- Real-time status updates are available via WebSocket connections
- Supports task tracking and mission state management
- Compatible with the FlytBase drone autonomy platform
