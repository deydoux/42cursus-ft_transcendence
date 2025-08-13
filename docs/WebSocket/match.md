# Match proceeding

```mermaid
sequenceDiagram
  actor m as Mathy (ID 1)
  participant s as Server
  actor q as Quentin (ID 2)

  m ->> s: joinMatchmaking
  Note right of m: {game: 'pong', mode: 'casual'}
  s -->> m: success
  Note left of s: {origin: 'joinMatchmaking'}

  m ->> s: joinMatchmaking
  Note right of m: {game: 'race', mode: 'ranked'}
  s --x m: error
  Note left of s: {message: 'Already in queue'}

  q ->> s: joinMatchmaking
  Note left of q: {game: 'pong', mode: 'casual'}
  s -->> q: success
  Note right of s: {origin: 'joinMatchmaking'}

  s ->> m: matchStart
  s ->> q: matchStart
  Note over s: {game: 'pong', ranked: false, players: [...]}<br><br> players:<br>{id: 1, username: 'mapale', avatar: '/api/users/1/avatar_1.webp'}<br>{id: 2, username: 'quteriss', avatar: '/api/users/2/avatar_1.webp'}

  q ->> s: joinMatchmaking
  s -->> q: error
  Note right of s: {message: 'Already in game'}

  loop Client to client
    m ->> s: move
    s ->> q: move
    q ->> s: move
    s ->> m: move

    m ->> s: gameMessage
    s ->> q: gameMessage
    q ->> s: gameMessage
    s ->> m: gameMessage
  end

  alt Quentin disconnects
    s --x q: *socket closed*
    s ->> m: matchEnd
    Note left of s: {winner: 1, draw: true}

  else Mathy scores
    m ->> s: score
    Note right of m: {player: 1}
    q ->> s: score
    Note left of q: {player: 1}

    alt New round
      s ->> m: round
      s ->> q: round
    else Mathy wins
      s ->> m: matchEnd
      s ->> q: matchEnd
      Note over s: {winner: 1, draw: false}
    end

  else Quentin cheats
    q ->> s: score
    Note left of q: {player: 2}
    m --x s: *nothing sent*
    s -x m: matchCancel
    s -x q: matchCancel
    Note over s: {cause: 'Clients synchronization lost'}
  end
```
