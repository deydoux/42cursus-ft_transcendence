# WebSocket API Documentation
This WebSocket API handles real-time communication and time-sensitive events. To establish a connection, connect to the `/api/tunnel` endpoint. All messages must be sent and received as JSON objects.

## Client Messages

### `createTournament`
Sent to create a new tournament

*Example:*
```json
{
  "type": "createTournament",
  "name": "Kittournament"
}
```

**Note:** the `name` field must be `.trim()`, at least **3** and not exceed **64** characters in length.

### `joinMatchmaking`
Sent to join the matchmaking queue

*Examples:*
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

### `gameInvite`
Received when a user invites another user to a game

*Example:*
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

*Example:*
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
  "result": "forfeit",
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
  "block": false,
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


### `participantJoin`
Received when a participant joins a tournament

*Example:*
```json
{
  "type": "participantJoin",
  "user": {
    "id": 1,
    "username": "user123",
    "avatar": "/static/default_avatar.webp"
  }
}
```

### `participantLeft`
Received when a participant leaves a tournament

*Example:*
```json
{
  "type": "participantLeft",
  "userID":1,
  "ownerID": 2
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
