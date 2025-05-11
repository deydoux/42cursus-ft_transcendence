--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

CREATE TABLE users(
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id          TEXT UNIQUE,

  username           TEXT UNIQUE,
  password           TEXT,

  last_seen          INTEGER NOT NULL DEFAULT (unixepoch()),
  password_edited_at INTEGER DEFAULT (unixepoch()),

  totp_secret        TEXT,
  totp_enabled       INTEGER NOT NULL DEFAULT 0,

  has_avatar         INTEGER NOT NULL DEFAULT 0,
  avatar_version     INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX idx_users_username_lower ON users(lower(username));
CREATE INDEX idx_users_last_seen ON users(last_seen);

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

CREATE INDEX idx_connections_user_id ON connections(user_id);
CREATE INDEX idx_connections_access_token ON connections(access_token);
CREATE INDEX idx_connections_refresh_token ON connections(refresh_token);
CREATE INDEX idx_connections_expires_at ON connections(expires_at);

CREATE TRIGGER update_connections_updated_at
AFTER UPDATE ON connections
FOR EACH ROW
BEGIN
  UPDATE connections SET updated_at = unixepoch() WHERE id = NEW.id;
END;


--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TRIGGER update_connections_updated_at;

DROP INDEX idx_connections_expires_at;
DROP INDEX idx_connections_refresh_token;
DROP INDEX idx_connections_access_token;
DROP INDEX idx_connections_user_id;

DROP TABLE connections;

DROP TRIGGER update_users_password_edited_at;

DROP INDEX idx_users_last_seen;
DROP INDEX idx_users_username_lower;

DROP TABLE users;
