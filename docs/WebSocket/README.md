# WebSocket API Documentation
This WebSocket API handles real-time communication and time-sensitive events. To establish a connection, connect to the `/api/tunnel` endpoint. All messages must be sent and received as JSON objects.

## Client Messages

### `gameMessage`
Sent to send a message in a game match

*Example:*
```json
{
  "type": "gameMessage",
  "content": "Good luck!"
}
```

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

*Response: (to all client sockets)*
```json
{
  "type": "success",
  "origin": "leaveMatchmaking"
}
```

### `move`
Sent to make a move in a game match

*Example:*
```jsonc
{
  "type": "move",
  //...
}
```

### `score`
Sent to send a score in a game match

*Example:*
```json
{
  "type": "score",
  "scorerID": 1
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
  "message": "You are already in a matchmaking queue"
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

### `gameMessage`
Received when a game message is sent in a match

*Example:*
```jsonc
{
  "type": "gameMessage",
  "content": "Good luck!"
}
```

### `generalMessage`
Received when a general message is sent

*Example:*
```json
{
  "type": "generalMessage",
  "sender": {
    "id": 1,
    "username": "user123",
    "avatar": "/static/default_avatar.webp"
  },
  "content": "Hello, World!"
}
```


### `matchCancel`
Received when a match is cancelled due to an error

*Example:*
```json
{
  "type": "matchCancel",
  "cause": "Cheating detected"
}
```

### `matchEnd`
Received when a match ends

*Example:*
```json
{
  "type": "matchEnd",
  "winner": 1,
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
  "players": [{
    "id": 1,
    "username": "user123",
    "avatar": "/static/default_avatar.webp",
    "elo": 1000
  }, {
    "id": 2,
    "username": "user456",
    "avatar": "/static/default_avatar.webp",
    "elo": 1000
  }]
}
```

### `move`
Received when opponent makes a move in a match

*Example:*
```jsonc
{
  "type": "move",
  //...
}
```

### `round`
Received when a round starts in a match

*Example:*
```json
{
  "type": "round"
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
