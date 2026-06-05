import { getDb } from './connection.js'

export function initSchema(): void {
  const db = getDb()

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS mistakes (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      subject TEXT NOT NULL CHECK(subject IN ('politics','math','english','specialty')),
      title TEXT NOT NULL DEFAULT '',
      question_text TEXT NOT NULL DEFAULT '',
      question_images TEXT NOT NULL DEFAULT '[]',
      answer_text TEXT NOT NULL DEFAULT '',
      answer_images TEXT NOT NULL DEFAULT '[]',
      source_book TEXT NOT NULL DEFAULT '',
      source_chapter TEXT NOT NULL DEFAULT '',
      source_problem_num TEXT NOT NULL DEFAULT '',
      knowledge_points TEXT NOT NULL DEFAULT '[]',
      notes TEXT NOT NULL DEFAULT '',
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      mastered INTEGER NOT NULL DEFAULT 0,
      review_count INTEGER NOT NULL DEFAULT 0,
      last_reviewed_at INTEGER,
      next_review_at INTEGER,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_mistakes_user_id ON mistakes(user_id);
    CREATE INDEX IF NOT EXISTS idx_mistakes_subject ON mistakes(user_id, subject);
    CREATE INDEX IF NOT EXISTS idx_mistakes_created ON mistakes(user_id, created_at DESC);
  `)
}
