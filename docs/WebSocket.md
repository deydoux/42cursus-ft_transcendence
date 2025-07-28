# WebSocket API Documentation
This WebSocket API handles real-time communication and time-sensitive events. To establish a connection, connect to the `/api/tunnel` endpoint. All messages must be sent and received as JSON objects.

## Client Messages

### `joinMatchmaking`
Sent to join the matchmaking queue

*Example:*
```json
{
  "type": "joinMatchmaking",
  "game": "pong",
  "mode": "casual"
}
```

*Response:*
```json
{
  "type": "success",
  "origin": "joinMatchmaking"
}
```

### `leaveMatchmaking`
Sent to leave the matchmaking queue

*Example:*
```json
{
  "type": "leaveMatchmaking"
}
```

## Server Messages

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

*Examples:*
```json
{
  "type": "error",
  "message": "Invalid JSON"
}
```

```json
{
  "type": "error",
  "message": "You are already in a matchmaking queue",
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

### `matchEnd`
Received when a match ends

*Example:*
```json
{
  "type": "matchEnd",
  "winner": 1,
  "looser": 2,
  "draw": false,
  "eloChange": 20
}
```

### `matchStart`
Received when a match is starting

*Example:*
```json
{
  "type": "matchStart",
  "game": "pong",
  "ranked": true,
  "user": {
    "id": 1,
    "username": "user123",
    "avatar": "/static/default_avatar.webp",
    "elo": 1000
  },
  "opponent": {
    "id": 2,
    "username": "user456",
    "avatar": "/static/default_avatar.webp",
    "elo": 1000
  }
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
