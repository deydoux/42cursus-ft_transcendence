--------------------------------------------------------------------------------
-- Up
--------------------------------------------------------------------------------

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

CREATE TABLE direct_messages(
  id           INTEGER PRIMARY KEY AUTOINCREMENT,

  sender_id    INTEGER NOT NULL,
  recipient_id INTEGER NOT NULL,
  content      TEXT NOT NULL,

  created_at   INTEGER NOT NULL DEFAULT (unixepoch()),
  read         INTEGER NOT NULL DEFAULT FALSE,

  FOREIGN KEY(sender_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(recipient_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_direct_messages_sender_id ON direct_messages(sender_id);
CREATE INDEX idx_direct_messages_recipient_id ON direct_messages(recipient_id);
CREATE INDEX idx_direct_messages_recipient_id_read ON direct_messages(recipient_id, read);

CREATE TABLE relationships(
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  type       TEXT,

  user_id    INTEGER NOT NULL,
  other_id   INTEGER NOT NULL,

  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch()),

  CHECK(type IN ('block', 'friend', 'pending')),
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(other_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_relationships_user_id_type ON relationships(user_id, type);
CREATE INDEX idx_relationships_other_id_type ON relationships(other_id, type);

CREATE TRIGGER update_relationships_updated_at
AFTER UPDATE ON relationships
FOR EACH ROW
BEGIN
  UPDATE relationships SET updated_at = unixepoch() WHERE id = NEW.id;
END;

CREATE TABLE users(
  id                 INTEGER PRIMARY KEY AUTOINCREMENT,
  google_id          TEXT UNIQUE,

  username           TEXT UNIQUE NOT NULL,
  password           TEXT,

  last_seen          INTEGER NOT NULL DEFAULT (unixepoch()),
  password_edited_at INTEGER DEFAULT (unixepoch()),

  totp_secret        TEXT,
  totp_enabled       INTEGER NOT NULL DEFAULT FALSE,

  has_avatar         INTEGER NOT NULL DEFAULT FALSE,
  avatar_version     INTEGER NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_users_lower_username ON users(lower(username));
CREATE INDEX idx_users_last_seen ON users(last_seen);

CREATE TRIGGER update_users_password_edited_at
AFTER UPDATE ON users
FOR EACH ROW
WHEN NEW.password != OLD.password
BEGIN
  UPDATE users SET password_edited_at = unixepoch() WHERE id = NEW.id;
END;


--------------------------------------------------------------------------------
-- Down
--------------------------------------------------------------------------------

DROP TRIGGER update_users_password_edited_at;
DROP INDEX idx_users_last_seen;
DROP INDEX idx_users_lower_username;
DROP TABLE users;

DROP TRIGGER update_relationships_updated_at;
DROP INDEX idx_relationships_friend_id_type;
DROP INDEX idx_relationships_other_id_type;
DROP TABLE relationships;

DROP INDEX idx_direct_messages_recipient_id_read;
DROP INDEX idx_direct_messages_recipient_id;
DROP INDEX idx_direct_messages_sender_id;
DROP TABLE direct_messages;

DROP TRIGGER update_connections_updated_at;
DROP INDEX idx_connections_expires_at;
DROP INDEX idx_connections_refresh_token;
DROP INDEX idx_connections_access_token;
DROP INDEX idx_connections_user_id;
DROP TABLE connections;
