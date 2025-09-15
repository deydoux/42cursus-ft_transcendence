# Tournament proceeding

```mermaid
sequenceDiagram
  actor d as Dorian (ID 1)
  actor m as Mathy (ID 2)
  actor q as Quentin (ID 3)
  participant s as Server

  d ->> s: createTournament
  Note right of d: {name: 'Kittournament'}
  s -->> d: success
  Note left of s: {origin: 'createTournament'}

  m ->> s: joinTournament
  Note right of m: {tournamentID: 1}
  s -->> d: participantJoin
  Note left of s: {user: {id: 2, username: ..., avatar: ...}}
  s -->> m: success
  Note left of s: {origin: 'joinTournament'}

  q ->> s: joinTournament
  Note right of q: {tournamentID: 1}
  s -->> d: participantJoin
  s -->> m: participantJoin
  Note left of s: {user: {id: 3, username: ..., avatar: ...}}
  s -->> q: success
  Note left of s: {origin: 'joinTournament'}

