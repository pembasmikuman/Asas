// Backup file format. Pure: runs in the browser and under `bun test` (no FileReader, no Buffer).

export type Backup<T> = {
  version: 1;
  exported_at: string;
  items: (Omit<T, "image"> & { image: string | null })[];
};

export async function blobToDataUrl(b: Blob): Promise<string> {
  const bytes = new Uint8Array(await b.arrayBuffer());
  let bin = "";
  // Chunked so String.fromCharCode doesn't blow the argument limit on big photos.
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return `data:${b.type || "application/octet-stream"};base64,${btoa(bin)}`;
}

export function dataUrlToBlob(url: string): Blob {
  const m = /^data:([^;,]*);base64,(.*)$/.exec(url);
  if (!m) throw new Error("Bad photo in backup file");
  const bin = atob(m[2]);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: m[1] });
}

export async function toBackup<T extends { image: Blob | null }>(items: T[], now = new Date()): Promise<Backup<T>> {
  const out: Backup<T>["items"] = [];
  for (const it of items) out.push({ ...it, image: it.image ? await blobToDataUrl(it.image) : null });
  return { version: 1, exported_at: now.toISOString(), items: out };
}

/** Parse a backup file's text back into items with Blob photos. Throws on anything that isn't one. */
export function fromBackup<T extends { id: number; name: string; image: Blob | null; created_at: string }>(text: string): T[] {
  const data = JSON.parse(text);
  const ok = data?.version === 1 && Array.isArray(data.items) &&
    data.items.every((i: any) => typeof i?.id === "number" && typeof i?.name === "string" && typeof i?.created_at === "string");
  if (!ok) throw new Error("Not an Asas backup file");
  return data.items.map((i: any) => ({ ...i, image: i.image ? dataUrlToBlob(i.image) : null }));
}
