"use client";
import { useRef, useState } from "react";
import { listItems, replaceAll, type Item } from "@/lib/items";
import { toBackup, fromBackup } from "@/lib/backup";
import { shrinkImage } from "@/lib/image";

const btn = {
  flex: 1, height: 40, borderRadius: 999, border: "2px solid var(--outline)", background: "var(--card)",
  color: "#fff", fontSize: 13, fontWeight: 800, cursor: "pointer",
} as const;

export default function BackupBar({ onRestored }: { onRestored: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [ready, setReady] = useState<File | null>(null);

  // Tap 1: build the file. iOS only opens the share sheet straight from a tap,
  // so building (which takes a moment) and sharing are separate taps.
  async function makeBackup() {
    setBusy("Making backup…");
    try {
      const data = await toBackup(await listItems());
      const name = `asas-backup-${new Date().toISOString().slice(0, 10)}.json`;
      setReady(new File([JSON.stringify(data)], name, { type: "application/json" }));
    } catch (err) {
      alert(`Backup failed: ${err}`);
    } finally {
      setBusy(null);
    }
  }

  // Tap 2: hand the file to the share sheet (Save to Files), or download it where sharing files isn't supported.
  async function saveBackup(file: File) {
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file] });
      } else {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(file);
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 10_000);
      }
      setReady(null);
    } catch (err) {
      if ((err as Error).name !== "AbortError") alert(`Could not save backup: ${err}`);
    }
  }

  async function restore(file: File) {
    try {
      const items = fromBackup<Item>(await file.text());
      if (!confirm(`Replace everything on this phone with the ${items.length} items in this backup?`)) return;
      setBusy("Restoring…");
      for (const it of items) if (it.image) it.image = await shrinkImage(it.image); // one at a time on purpose
      await replaceAll(items);
      alert(`Restored ${items.length} items.`);
      onRestored();
    } catch (err) {
      alert(`Restore failed, nothing was changed: ${err}`);
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
      {busy ? (
        <span style={{ ...btn, display: "flex", alignItems: "center", justifyContent: "center", cursor: "default" }}>{busy}</span>
      ) : ready ? (
        <button type="button" style={{ ...btn, background: "var(--gold)", color: "var(--cream-ink)", border: "none" }} onClick={() => saveBackup(ready)}>
          Save backup file
        </button>
      ) : (
        <>
          <button type="button" style={btn} onClick={makeBackup}>Make backup</button>
          <button type="button" style={btn} onClick={() => fileRef.current?.click()}>Restore</button>
        </>
      )}
      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} />
    </div>
  );
}
