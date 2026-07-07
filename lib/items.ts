import { db } from "./db";
import { scoreItem, type Verdict } from "./score";

export type Item = {
  id: number; name: string; brand: string | null; image_path: string | null; category: string;
  sentimental: 0 | 1;
  use_year4: "no" | "maybe" | "yes" | null;
  used_90d: 0 | 1 | null; passion: 0 | 1 | null;
  for_looks: 0 | 1 | null; replaceable: 0 | 1 | null;
  score: number | null; verdict: Verdict | null; created_at: string;
};

export function listItems(): Item[] {
  return db.prepare("SELECT * FROM items ORDER BY created_at DESC").all() as Item[];
}

export function getItem(id: number): Item | undefined {
  return db.prepare("SELECT * FROM items WHERE id = ?").get(id) as Item | undefined;
}

export function deleteItem(id: number): void {
  db.prepare("DELETE FROM items WHERE id = ?").run(id);
}

export function createItem(input: {
  name: string; brand: string | null; category: string; image_path: string | null;
}): Item {
  const info = db.prepare(
    "INSERT INTO items (name, brand, category, image_path) VALUES (?, ?, ?, ?)"
  ).run(input.name, input.brand, input.category, input.image_path);
  return getItem(Number(info.lastInsertRowid))!;
}

export function updateItem(id: number, input: {
  name: string; brand: string | null; category: string; image_path: string | null;
  sentimental: boolean; use_year4: "no" | "maybe" | "yes"; used_90d: boolean;
  passion: boolean; for_looks: boolean; replaceable: boolean;
}): Item {
  const { score, verdict } = scoreItem({
    use_year4: input.use_year4, used_90d: input.used_90d, passion: input.passion,
    for_looks: input.for_looks, replaceable: input.replaceable,
    sentimental: input.sentimental,
  });
  db.prepare(`
    UPDATE items SET name=?, brand=?, category=?, image_path=?, sentimental=?,
      use_year4=?, used_90d=?, passion=?, for_looks=?, replaceable=?,
      score=?, verdict=? WHERE id=?
  `).run(
    input.name, input.brand, input.category, input.image_path, input.sentimental ? 1 : 0,
    input.use_year4, input.used_90d ? 1 : 0, input.passion ? 1 : 0,
    input.for_looks ? 1 : 0, input.replaceable ? 1 : 0, score, verdict, id
  );
  return getItem(id)!;
}
