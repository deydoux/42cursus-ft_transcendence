--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE users(
  id       INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

CREATE TABLE connections(
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER NOT NULL,
  ip            TEXT NOT NULL,
  user_agent    TEXT,
  access_token  TEXT NOT NULL,
  refresh_token TEXT NOT NULL,

  created_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at    INTEGER NOT NULL DEFAULT (unixepoch()),
  expires_at    INTEGER NOT NULL DEFAULT (unixepoch() + 30 * 24 * 60 * 60), -- 30 days

  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TRIGGER update_connections_updated_at
AFTER UPDATE ON connections
FOR EACH ROW
BEGIN
  UPDATE connections SET updated_at = unixepoch() WHERE id = NEW.id;
END;


--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TABLE connections;
DROP TABLE users;
