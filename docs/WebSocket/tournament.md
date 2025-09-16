# Tournament proceeding

```mermaid
sequenceDiagram
  actor d as Dorian (ID 1)
  actor m as Mathy (ID 2)
  actor q as Quentin (ID 3)
  participant s as Server

  d ->>+ s: createTournament
  Note right of d: {name: 'Kittournament'}
  s -->>- d: success
  Note left of s: {origin: 'createTournament'}

  d ->>+ s: startTournament
  s --x- d: error
  Note left of s: {message: 'Not enough participants'}

  m ->>+ s: joinTournament
  Note right of m: {tournamentID: 1}
  s -->> m: success
  Note left of s: {origin: 'joinTournament'}
  s -->>- d: participantJoin
  Note left of s: {user: {id: 2, ...}}

  q ->>+ s: joinTournament
  Note right of q: {tournamentID: 1}
  s -->> q: success
  Note left of s: {origin: 'joinTournament'}
  s -->> m: participantJoin
  s -->>- d: participantJoin
  Note left of s: {user: {id: 3, ...}}

  alt
    q ->>+ s: joinTournament
  else
    q ->> s: joinMatchmaking
  end
  s --x- q: error
  Note left of s: {message: 'Already in tournament'}

  alt
    d ->>+ s: leaveTournament
  else
    d --x s: *socket closed*
  end
  s -->> q: participantLeft
  s -->>- m: participantLeft
  Note left of s: {userID: 1, ownerID: 2}
