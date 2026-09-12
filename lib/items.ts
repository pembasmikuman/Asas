import { scoreItem, type Verdict } from "./score";

export type Item = {
  id: number; name: string; brand: string | null; image: Blob | null; image_pos: string | null; category: string;
  sentimental: 0 | 1;
  use_year4: "no" | "maybe" | "yes" | null;
  used_90d: 0 | 1 | null; passion: 0 | 1 | null;
  for_looks: 0 | 1 | null; replaceable: 0 | 1 | null;
  score: number | null; verdict: Verdict | null; created_at: string;
};

export type ItemBasics = { name: string; brand: string | null; category: string; image: Blob | null; image_pos: string | null };
export type ItemAnswers = {
  sentimental: boolean; use_year4: "no" | "maybe" | "yes"; used_90d: boolean;
  passion: boolean; for_looks: boolean; replaceable: boolean;
};

// All data lives in this browser's IndexedDB: database "asas", one store "items" keyed by id.
const STORE = "items";
let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  return (dbPromise ??= new Promise((resolve, reject) => {
    const req = indexedDB.open("asas", 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id", autoIncrement: true });
    req.onsuccess = () => {
      req.result.onclose = () => { dbPromise = null; }; // iOS can drop the connection when backgrounded
      resolve(req.result);
    };
    req.onerror = () => { dbPromise = null; reject(req.error); };
  }));
}

/** Resolve once the transaction has committed (so writes are on disk), reject if it aborts. */
function done(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = tx.onabort = () => reject(tx.error);
  });
}

/** Run one request in its own transaction and return its result after commit. */
async function run<T>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const tx = (await openDb()).transaction(STORE, mode);
  const req = fn(tx.objectStore(STORE));
  await done(tx);
  return req.result;
}

// Last known copy of each item, so opening one from the dashboard can paint on the
// first frame instead of waiting a read. Lives for the page's lifetime only.
const seen = new Map<number, Item>();
export const peekItem = (id: number): Item | undefined => seen.get(id);

export async function listItems(): Promise<Item[]> {
  const all = await run("readonly", (s) => s.getAll() as IDBRequest<Item[]>);
  for (const it of all) seen.set(it.id, it);
  return all.sort((a, b) => b.created_at.localeCompare(a.created_at) || b.id - a.id);
}

export async function getItem(id: number): Promise<Item | undefined> {
  const item = await run("readonly", (s) => s.get(id) as IDBRequest<Item | undefined>);
  if (item) seen.set(id, item);
  return item;
}

export async function deleteItem(id: number): Promise<void> {
  await run("readwrite", (s) => s.delete(id));
  seen.delete(id);
}

export async function createItem(input: ItemBasics): Promise<Item> {
  // If tsc complains here, annotate `const draft: Omit<Item, "id">`. Never loosen `Item` or cast to any.
  const draft: Omit<Item, "id"> = {
    ...input, sentimental: 0, use_year4: null, used_90d: null, passion: null,
    for_looks: null, replaceable: null, score: null, verdict: null, created_at: new Date().toISOString(),
  };
  const id = await run("readwrite", (s) => s.add(draft) as IDBRequest<number>);
  const item = { ...draft, id };
  seen.set(id, item);
  return item;
}

export async function updateItem(id: number, input: ItemBasics & ItemAnswers): Promise<Item> {
  const existing = await getItem(id);
  if (!existing) throw new Error(`Item ${id} not found`);
  const { score, verdict } = scoreItem(input);
  const item: Item = {
    ...existing,
    name: input.name, brand: input.brand, category: input.category, image: input.image, image_pos: input.image_pos,
    sentimental: input.sentimental ? 1 : 0, use_year4: input.use_year4, used_90d: input.used_90d ? 1 : 0,
    passion: input.passion ? 1 : 0, for_looks: input.for_looks ? 1 : 0, replaceable: input.replaceable ? 1 : 0,
    score, verdict,
  };
  await run("readwrite", (s) => s.put(item));
  seen.set(id, item);
  return item;
}

/** Wipe everything and write these items with their own ids, in one transaction (all or nothing). */
export async function replaceAll(items: Item[]): Promise<void> {
  const tx = (await openDb()).transaction(STORE, "readwrite");
  const s = tx.objectStore(STORE);
  s.clear();
  for (const it of items) s.put(it);
  await done(tx);
  seen.clear();
}
