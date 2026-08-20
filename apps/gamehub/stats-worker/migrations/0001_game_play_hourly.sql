CREATE TABLE game_play_hourly (
  game_id TEXT NOT NULL,
  hour TEXT NOT NULL,
  play_count INTEGER NOT NULL CHECK (play_count >= 0),
  PRIMARY KEY (game_id, hour)
);

CREATE INDEX game_play_hourly_hour_idx ON game_play_hourly (hour);

INSERT INTO game_play_hourly (game_id, hour, play_count) VALUES
  ('neon-tunnel', strftime('%Y-%m-%dT%H:00:00Z', 'now', '-1 hours'), 18),
  ('neon-tunnel', strftime('%Y-%m-%dT%H:00:00Z', 'now', '-48 hours'), 112),
  ('neon-tunnel', strftime('%Y-%m-%dT%H:00:00Z', 'now', '-240 hours'), 590),
  ('echo-shift', strftime('%Y-%m-%dT%H:00:00Z', 'now', '-1 hours'), 29),
  ('echo-shift', strftime('%Y-%m-%dT%H:00:00Z', 'now', '-48 hours'), 151),
  ('echo-shift', strftime('%Y-%m-%dT%H:00:00Z', 'now', '-240 hours'), 280),
  ('pulse-trace', strftime('%Y-%m-%dT%H:00:00Z', 'now', '-1 hours'), 44),
  ('pulse-trace', strftime('%Y-%m-%dT%H:00:00Z', 'now', '-48 hours'), 206),
  ('pulse-trace', strftime('%Y-%m-%dT%H:00:00Z', 'now', '-240 hours'), 130);
