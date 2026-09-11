import { test, expect } from "bun:test";
import { toBackup, fromBackup, blobToDataUrl, dataUrlToBlob } from "./backup";

type T = { id: number; name: string; image: Blob | null; score: number | null; created_at: string };

const bytes = new Uint8Array(70_000).map((_, i) => (i * 37) % 256); // > one 0x8000 chunk

test("blob survives base64 round trip byte for byte", async () => {
  const blob = new Blob([bytes], { type: "image/jpeg" });
  const back = dataUrlToBlob(await blobToDataUrl(blob));
  expect(back.type).toBe("image/jpeg");
  expect(new Uint8Array(await back.arrayBuffer())).toEqual(bytes);
});

test("toBackup then fromBackup keeps ids, fields and photos", async () => {
  const items: T[] = [
    { id: 7, name: "Jacket", image: new Blob([bytes], { type: "image/jpeg" }), score: 62, created_at: "2026-09-11T00:00:00.000Z" },
    { id: 91, name: "Mug", image: null, score: null, created_at: "2026-09-11T00:00:00.000Z" },
  ];
  const text = JSON.stringify(await toBackup(items, new Date("2026-09-11T00:00:00Z")));
  const parsed = JSON.parse(text);
  expect(parsed.version).toBe(1);
  expect(parsed.exported_at).toBe("2026-09-11T00:00:00.000Z");
  expect(typeof parsed.items[0].image).toBe("string");

  const back = fromBackup<T>(text);
  expect(back.map((i) => [i.id, i.name, i.score])).toEqual([[7, "Jacket", 62], [91, "Mug", null]]);
  expect(new Uint8Array(await back[0].image!.arrayBuffer())).toEqual(bytes);
  expect(back[1].image).toBeNull();
});

test("fromBackup rejects files that are not Asas backups", () => {
  expect(() => fromBackup("{}")).toThrow("Not an Asas backup file");
  expect(() => fromBackup(JSON.stringify({ version: 1, items: [{ name: "no id" }] }))).toThrow("Not an Asas backup file");
  expect(() => fromBackup("not json")).toThrow();
});

test("fromBackup rejects an item missing created_at", () => {
  const text = JSON.stringify({ version: 1, items: [{ id: 1, name: "Jacket", image: null }] });
  expect(() => fromBackup<T>(text)).toThrow("Not an Asas backup file");
});
