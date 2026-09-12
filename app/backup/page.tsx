"use client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { listItems, replaceAll, type Item } from "@/lib/items";
import { toBackup, fromBackup } from "@/lib/backup";
import { shrinkImage } from "@/lib/image";
import { TigerRing } from "../mascot";

export default function BackupScreen() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [ready, setReady] = useState<File | null>(null);
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => { listItems().then((i) => setCount(i.length), () => setCount(null)); }, []);

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
      router.push("/"); // the dashboard reloads from IndexedDB on mount
    } catch (err) {
      alert(`Restore failed, nothing was changed: ${err}`);
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button onClick={() => router.back()} aria-label="Back" className="press" style={{
          width: 40, height: 40, borderRadius: "50%", background: "var(--card)", border: "2px solid var(--outline)",
          color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
        }}>‹</button>
        <TigerRing mood="thinking" size={54} border="var(--gold)" borderWidth={3} bg="var(--card)" float />
      </div>

      <h1 className="anton rise" style={{ fontSize: 42, lineHeight: 0.95, textTransform: "uppercase", color: "#fff", marginBottom: 8 }}>
        Backup
        <br />
        &amp; restore
      </h1>
      <p className="rise" style={{ ["--i" as string]: 1, color: "var(--muted-2)", fontSize: 14, fontWeight: 700, marginBottom: 20 }}>
        Your items only live inside this phone&apos;s browser. A backup file is the only other copy.
      </p>

      <div className="rise" style={{
        ["--i" as string]: 2,
        background: "var(--cream)", borderRadius: 20, padding: "16px 18px", color: "var(--cream-ink)", marginBottom: 20,
      }}>
        <div style={{ color: "var(--orange)", fontWeight: 900, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          On this phone
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 10 }}>
          <span className="anton" style={{ fontSize: 40, lineHeight: 1 }}>{count ?? "—"}</span>
          <span style={{ fontSize: 20, color: "var(--cream-muted)" }}>items</span>
        </div>
        <p style={{ fontSize: 13, fontWeight: 700, color: "var(--cream-muted)", lineHeight: 1.45 }}>
          Clearing Safari&apos;s data, or a new phone, wipes all of it. Save a backup file now and then, and keep it somewhere you can find again.
        </p>
      </div>

      {busy ? (
        <div className="pill btn-primary" style={{ background: "var(--chip)", boxShadow: "none", cursor: "default" }}>{busy}</div>
      ) : ready ? (
        <>
          <button type="button" className="pill btn-primary btn-gold" onClick={() => saveBackup(ready)}>Save backup file</button>
          <p style={{ color: "var(--muted)", fontSize: 12, fontWeight: 700, textAlign: "center", marginTop: 10 }}>
            {ready.name}
          </p>
        </>
      ) : (
        <button type="button" className="pill btn-primary btn-gold" onClick={makeBackup}>Make backup</button>
      )}

      <div style={{ borderTop: "1px solid var(--card-border)", marginTop: 28, paddingTop: 20 }}>
        <button type="button" className="pill btn-primary btn-outline" disabled={!!busy} onClick={() => fileRef.current?.click()}>
          Restore from a file
        </button>
        <p style={{ color: "var(--muted)", fontSize: 12, fontWeight: 700, textAlign: "center", marginTop: 10, lineHeight: 1.45 }}>
          This wipes what is on the phone right now and puts the backup in its place.
        </p>
      </div>

      <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={(e) => e.target.files?.[0] && restore(e.target.files[0])} />
    </div>
  );
}
