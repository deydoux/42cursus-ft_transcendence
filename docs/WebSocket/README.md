# WebSocket API Documentation

This WebSocket API handles real-time communication and time-sensitive events. To establish a connection, connect to the `/api/tunnel` endpoint. All messages must be sent and received as JSON objects.

## Client Messages

### `joinMatchmaking`

Sent to join the matchmaking queue

_Examples:_

```json
{
  "type": "joinMatchmaking",
  "game": "pong",
  "mode": "ranked"
}
```

```json
{
  "type": "joinMatchmaking",
  "game": "race",
  "mode": "casual",
  "targetID": 2
}
```

_Response:_

```json
{
  "type": "success",
  "origin": "joinMatchmaking"
}
```

### `leaveMatchmaking`

Sent to leave the matchmaking queue

_Example:_

```json
{
  "type": "leaveMatchmaking"
}
```

_Response: (to all client sockets)_

```json
{
  "type": "success",
  "origin": "leaveMatchmaking"
}
```

### `move`

Sent to make a move in a game match

_Example:_

```jsonc
{
  "type": "move",
  //...
}
```

### `score`

Sent to send a score in a game match

_Example:_

```json
{
  "type": "score",
  "scorerID": 1
}
```

## Server Messages

### `directMessage`

Received when another user sends you a direct message

_Example:_

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

_Examples:_

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

_Example:_

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

_Example:_

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

### `gameInvite`

Received when a user invites another user to a game

_Example:_

```json
{
  "type": "gameInvite",
  "game": "pong",
  "user": {
    "id": 1,
    "username": "user123",
    "avatar": "/static/default_avatar.webp"
  }
}
```

### `generalMessage`

Received when a general message is sent

_Example:_

```json
{
  "type": "generalMessage",
  "sender": {
    "id": 1,
    "username": "user123",
    "avatar": "/static/default_avatar.webp"
  },
  "content": "Hello, World!",
  "mention": false
}
```

### `matchCancel`

Received when a match is cancelled due to an error

_Example:_

```json
{
  "type": "matchCancel",
  "cause": "Cheating detected"
}
```

### `matchEnd`

Received when a match ends

_Example:_

```json
{
  "type": "matchEnd",
  "winner": 1,
  "result": "forfeit",
  "eloChange": 20
}
```

### `matchStart`

Received when a match is starting

_Example:_

```json
{
  "type": "matchStart",
  "game": "pong",
  "ranked": true,
  "block": false,
  "players": [
    {
      "id": 1,
      "username": "user123",
      "avatar": "/static/default_avatar.webp",
      "elo": 1000
    },
    {
      "id": 2,
      "username": "user456",
      "avatar": "/static/default_avatar.webp",
      "elo": 1000
    }
  ]
}
```

### `move`

Received when opponent makes a move in a match

_Example:_

```jsonc
{
  "type": "move",
  //...
}
```

### `round`

Received when a round starts in a match

_Example:_

```json
{
  "type": "round"
}
```
