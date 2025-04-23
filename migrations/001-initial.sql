--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE users(
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE connections(
  refresh_token TEXT PRIMARY KEY,
  access_token  TEXT NOT NULL,
  ip            TEXT NOT NULL,
  user_agent    TEXT,

  user_id       INTEGER NOT NULL,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE

  expires_at    INTEGER NOT NULL DEFAULT (unixepoch() + 30 * 24 * 60 * 60), -- 30 days
);


--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE connections;
DROP TABLE users;
