# Websocket API Documentation
This WebSocket API handles real-time communication and time-sensitive events. To establish a connection, connect to the `/api/tunnel` endpoint. All messages must be sent and received as JSON objects.

## Incoming Messages

### `directMessage`
Received when another user sends you a direct message

*Example:*
```json
{
  "type": "directMessage",
  "sender": {
    "id": 1,
    "username": "user123",
    "avatar": "/static/default_avatar.webp"
  },
  "content": "Hello, World!"
}
```

### `error`
Received when there is an error processing a message

*Example:*
```json
{
  "type": "error",
  "message": "Invalid JSON"
}
```

### `friendRequest`
Received when a user receives a friend request

*Example:*
```json
{
  "type": "friendRequest",
  "user": {
    "id": 1,
    "username": "user123",
    "avatar": "/static/default_avatar.webp"
  },
  "relationship": 1
}
```

### `friendRequestAccepted`
Received when a user accepts a friend request

*Example:*
```json
{
  "type": "friendRequestAccepted",
  "user": {
    "id": 1,
    "username": "user123",
    "avatar": "/static/default_avatar.webp"
  },
  "relationship": 1
}
```

### `hotReload` (development only)
Received when the client should reload the page to apply updates. `NODE_ENV` must be set to `development` for this message to be sent

*Example:*
```json
{
  "type": "hotReload"
}
```

## Outgoing Messages

### `joinMatchmaking`
Sent to join the matchmaking queue

*Example:*
```json
{
  "type": "joinMatchmaking",
  "mode": "casual"
}
```

### `leaveMatchmaking`
Sent to leave the matchmaking queue

*Example:*
```json
{
  "type": "leaveMatchmaking"
}
