--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE users(
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id          TEXT UNIQUE,

  username           TEXT UNIQUE,
  password           TEXT,

  totp_secret        TEXT,
  totp_enabled       INTEGER NOT NULL DEFAULT 0,

  has_avatar         INTEGER NOT NULL DEFAULT 0,
  avatar_version     INTEGER NOT NULL DEFAULT 0,

  password_edited_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TRIGGER update_users_password_edited_at
AFTER UPDATE ON users
FOR EACH ROW
WHEN NEW.password != OLD.password
BEGIN
  UPDATE users SET password_edited_at = unixepoch() WHERE id = NEW.id;
END;

CREATE TABLE connections(
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id       INTEGER,
  ip            TEXT NOT NULL,
  user_agent    TEXT,
  access_token  TEXT NOT NULL,
  refresh_token TEXT,

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
