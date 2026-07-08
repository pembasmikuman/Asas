import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";

const dataDir = path.join(process.cwd(), "data");
mkdirSync(dataDir, { recursive: true });

const g = globalThis as unknown as { __asasDb?: Database.Database };
export const db = g.__asasDb ?? new Database(path.join(dataDir, "asas.db"));
g.__asasDb = db;

db.exec(`
  CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT,
    image_path TEXT,
    image_pos TEXT DEFAULT '50% 50%',
    category TEXT NOT NULL,
    sentimental INTEGER NOT NULL DEFAULT 0,
    use_year4 TEXT,
    used_90d INTEGER,
    passion INTEGER,
    for_looks INTEGER,
    replaceable INTEGER,
    score INTEGER,
    verdict TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// ponytail: migrate DBs created before `brand` existed; ignore if already there
try {
  db.exec("ALTER TABLE items ADD COLUMN brand TEXT");
} catch {}

// ponytail: image framing (object-position) column; ignore if already there
try {
  db.exec("ALTER TABLE items ADD COLUMN image_pos TEXT DEFAULT '50% 50%'");
} catch {}
