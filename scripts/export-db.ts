// One-off migration: turn the old laptop SQLite data into a backup file the phone app can Restore.
// Run: bun scripts/export-db.ts   (writes data/asas-backup.json)
import { Database } from "bun:sqlite";
import path from "node:path";
import { toBackup } from "../lib/backup";
import type { Item } from "../lib/items";

const root = path.join(import.meta.dir, "..");
const db = new Database(path.join(root, "data/asas.db"), { readonly: true });
type Row = Omit<Item, "image"> & { image_path: string | null };
const rows = db.query("SELECT * FROM items").all() as Row[];

const items: Item[] = [];
for (const { image_path, ...row } of rows) {
  // Only files a row points at; public/uploads also holds orphans from removed photos.
  const image = image_path ? Bun.file(path.join(root, "public", image_path)) : null;
  if (image && !(await image.exists())) throw new Error(`Item ${row.id}: missing photo ${image_path}`);
  // SQLite datetime('now') is UTC "YYYY-MM-DD HH:MM:SS"; make it ISO so it sorts with new items.
  const created_at = /^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d$/.test(row.created_at) ? row.created_at.replace(" ", "T") + ".000Z" : row.created_at;
  items.push({ ...row, created_at, image });
}

const out = path.join(root, "data/asas-backup.json");
await Bun.write(out, JSON.stringify(await toBackup(items)));
console.log(`Wrote ${out}: ${items.length} items, ${items.filter((i) => i.image).length} photos`);
