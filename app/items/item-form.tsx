"use client";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import type { Item } from "@/lib/items";
import { scoreItem } from "@/lib/score";
import { CATEGORIES, CAT_ICON } from "@/lib/categories";
import { TigerRing } from "../mascot";

const VERDICT = {
  keep: { bg: "var(--keep)", ink: "#123D1C", label: "Keep" },
  maybe: { bg: "var(--maybe)", ink: "#235E2D", label: "Maybe" },
  leave: { bg: "var(--leave)", ink: "#fff", label: "Let go" },
} as const;

const VERDICT_MSG = {
  keep: "this one's a keeper!",
  maybe: "could go either way.",
  leave: "maybe time to let go.",
} as const;

const SAVED_BG = {
  keep: "linear-gradient(160deg,#52D98C 0%,#2FAE6C 55%,#1F7F4F 100%)",
  maybe: "linear-gradient(160deg,#FBD07A 0%,#F6A821 55%,#D98A12 100%)",
  leave: "linear-gradient(160deg,#F98E6B 0%,#F0562E 55%,#C13F1C 100%)",
} as const;

const SAVED_HEADLINE = { keep: "It's a keeper!", maybe: "Worth a maybe", leave: "Time to let go" } as const;
const SAVED_TEXT_COLOR = { keep: "#123D1C", maybe: "#123D1C", leave: "#fff" } as const;

function savedSubtext(v: "keep" | "maybe" | "leave", n: string) {
  const label = n || "This item";
  if (v === "keep") return `${label} is staying right where it is.`;
  if (v === "maybe") return `${label} is on the fence.`;
  return `${label} — time to let it go.`;
}

export default function ItemForm({ item }: { item?: Item }) {
  const router = useRouter();
  const [name, setName] = useState(item?.name ?? "");
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [category, setCategory] = useState(item?.category ?? "clothes");
  const [imagePath, setImagePath] = useState<string | null>(item?.image_path ?? null);
  const [imagePos, setImagePos] = useState(item?.image_pos ?? "50% 50%");
  const [uploading, setUploading] = useState(false);
  const [reframing, setReframing] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const panRef = useRef<{ x: number; y: number; px: number; py: number } | null>(null);
  const [sentimental, setSentimental] = useState(!!item?.sentimental);
  const [useYear4, setUseYear4] = useState<"no" | "maybe" | "yes">(item?.use_year4 ?? "no");
  const [used90d, setUsed90d] = useState(!!item?.used_90d);
  const [passion, setPassion] = useState(!!item?.passion);
  const [forLooks, setForLooks] = useState(!!item?.for_looks);
  const [replaceable, setReplaceable] = useState(!!item?.replaceable);
  const [saved, setSaved] = useState<ReturnType<typeof scoreItem> | null>(null);

  const preview = scoreItem({ use_year4: useYear4, used_90d: used90d, passion, for_looks: forLooks, replaceable, sentimental });

  async function upload(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(`upload failed (${res.status}): ${await res.text()}`);
      const { path } = await res.json();
      setImagePath(path);
      setImagePos("50% 50%");
      setReframing(true); // reframe step right after upload
    } catch (err) {
      alert(String(err));
    } finally {
      setUploading(false);
    }
  }

  // Drag the image to pan which part fills the card (object-position). Original file untouched.
  function panStart(e: React.PointerEvent) {
    const [px, py] = imagePos.split(" ").map((s) => parseFloat(s));
    panRef.current = { x: e.clientX, y: e.clientY, px, py };
    e.currentTarget.setPointerCapture(e.pointerId);
  }
  function panMove(e: React.PointerEvent) {
    const p = panRef.current;
    if (!p) return;
    const el = e.currentTarget as HTMLElement;
    const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
    const nx = clamp(p.px - ((e.clientX - p.x) / el.clientWidth) * 100);
    const ny = clamp(p.py - ((e.clientY - p.y) / el.clientHeight) * 100);
    setImagePos(`${nx}% ${ny}%`);
  }

  async function save() {
    if (!item) {
      // Add creates an unassessed item (score/verdict null → "New"). Reassess scores it.
      await fetch("/api/items", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, brand, category, image_path: imagePath, image_pos: imagePos }),
      });
      router.push("/");
      router.refresh();
    } else {
      await fetch(`/api/items/${item.id}`, {
        method: "PUT", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, brand, category, image_path: imagePath, image_pos: imagePos, sentimental, use_year4: useYear4, used_90d: used90d, passion, for_looks: forLooks, replaceable }),
      });
      setSaved(preview);
    }
  }

  async function remove() {
    if (!item) return;
    if (!confirm(`Remove "${item.name}"? This can't be undone.`)) return;
    await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  const Seg = ({ value, options, onChange }: { value: string; options: [string, string][]; onChange: (v: any) => void }) => (
    <span style={{ display: "flex", border: "2px solid var(--cream-field)", borderRadius: 999, overflow: "hidden" }}>
      {options.map(([val, label], idx) => (
        <button key={val} type="button" onClick={() => onChange(val)} style={{
          padding: "5px 12px", border: "none", cursor: "pointer", fontWeight: 800, fontSize: 12,
          borderLeft: idx ? "2px solid var(--cream-field)" : "none",
          background: value === val ? "var(--keep)" : "transparent",
          color: value === val ? "#123D1C" : "#8A9B7C",
        }}>{label}</button>
      ))}
    </span>
  );

  const [catOpen, setCatOpen] = useState(false);
  const CategorySelect = () => (
    <>
      <button type="button" onClick={() => setCatOpen(true)} style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%",
        height: 46, padding: "0 14px", marginBottom: 14, background: "var(--card)", border: "1px solid var(--outline)",
        borderRadius: 12, fontSize: 15, fontWeight: 800, color: "#fff", cursor: "pointer",
      }}>
        <span>{CAT_ICON[category] ?? "📦"} {category}</span>
        <span style={{ color: "var(--faint)", fontSize: 11 }}>▼</span>
      </button>

      {/* backdrop */}
      <div onClick={() => setCatOpen(false)} style={{
        position: "fixed", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.4)",
        opacity: catOpen ? 1 : 0, pointerEvents: catOpen ? "auto" : "none", transition: "opacity .2s",
      }} />
      {/* sheet */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 21,
        maxWidth: 420, margin: "0 auto", background: "var(--card)",
        borderRadius: "20px 20px 0 0", padding: "8px 16px 24px",
        transform: catOpen ? "translateY(0)" : "translateY(100%)", transition: "transform .25s ease",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", margin: "8px auto 16px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {CATEGORIES.map((c) => {
            const selected = c === category;
            return (
              <button key={c} type="button" onClick={() => { setCategory(c); setCatOpen(false); }} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 6px",
                background: selected ? "var(--orange)" : "var(--cream)",
                border: selected ? "3px solid var(--gold)" : "1px solid var(--cream-line)",
                color: selected ? "#fff" : "var(--cream-ink)",
                borderRadius: 16, cursor: "pointer",
              }}>
                <span style={{ fontSize: 26, lineHeight: 1 }}>{CAT_ICON[c] ?? "📦"}</span>
                <span style={{ fontSize: 11, fontWeight: 700, textAlign: "center" }}>{c}</span>
              </button>
            );
          })}
        </div>
      </div>
    </>
  );

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14, fontWeight: 700, color: "var(--cream-ink)" }}>{label}</span>{children}
    </div>
  );

  return (
    <>
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <button onClick={() => router.back()} style={{
            width: 40, height: 40, borderRadius: "50%", background: "var(--card)", border: "2px solid var(--outline)",
            color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
          }}>‹</button>
          {item && (
            <span style={{
              display: "inline-flex", alignItems: "center", gap: 8, background: VERDICT[preview.verdict].bg,
              color: VERDICT[preview.verdict].ink, fontSize: 13, fontWeight: 900, padding: "6px 14px 6px 6px", borderRadius: 999,
            }}>
              <span className="anton" style={{
                display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 30, height: 30,
                padding: "0 6px", borderRadius: "50%",
                background: preview.verdict === "leave" ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.16)", fontSize: 14,
              }}>{preview.score}</span>
              {VERDICT[preview.verdict].label}
            </span>
          )}
        </div>

        <div style={{ position: "relative", height: 150, marginBottom: 16 }}>
          {uploading ? (
            <div style={{
              display: "flex", height: "100%", alignItems: "center", justifyContent: "center",
              background: "rgba(18,40,15,0.25)", border: "2px dashed var(--outline)", borderRadius: 16,
              color: "var(--faint)", fontSize: 13, fontWeight: 700,
            }}>Uploading…</div>
          ) : !imagePath ? (
            <button type="button" onClick={() => inputRef.current?.click()} style={{
              display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center",
              background: "rgba(18,40,15,0.25)", border: "2px dashed var(--outline)", borderRadius: 16,
              color: "var(--faint)", fontSize: 13, fontWeight: 700, cursor: "pointer",
            }}>📷 Capture or upload</button>
          ) : reframing ? (
            <div
              onPointerDown={panStart}
              onPointerMove={panMove}
              onPointerUp={() => (panRef.current = null)}
              onPointerLeave={() => (panRef.current = null)}
              style={{ position: "relative", height: "100%", borderRadius: 16, overflow: "hidden", touchAction: "none", cursor: "move" }}
            >
              <img src={imagePath} alt="" draggable={false} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: imagePos, pointerEvents: "none" }} />
              <span className="pill" style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "5px 10px" }}>Drag to reposition</span>
              <button type="button" onClick={() => setReframing(false)} className="pill" style={{ position: "absolute", bottom: 8, right: 8, background: "var(--orange)", color: "#fff", border: "none", fontSize: 12, fontWeight: 800, padding: "7px 16px", cursor: "pointer" }}>Done</button>
            </div>
          ) : (
            <>
              <button type="button" onClick={() => setPreviewOpen(true)} style={{ display: "block", width: "100%", height: "100%", padding: 0, border: "none", borderRadius: 16, overflow: "hidden", cursor: "zoom-in" }}>
                <img src={imagePath} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: imagePos }} />
              </button>
              <button
                type="button"
                aria-label="Remove image"
                onClick={() => { setImagePath(null); setImagePos("50% 50%"); }}
                style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 16, lineHeight: 1, cursor: "pointer" }}
              >×</button>
            </>
          )}
          <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
        </div>

        {previewOpen && imagePath && (
          <div onClick={() => setPreviewOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.9)", display: "flex", flexDirection: "column" }}>
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflow: "hidden" }}>
              <img src={imagePath} alt="" style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }} />
            </div>
            <div onClick={(e) => e.stopPropagation()} style={{ display: "flex", gap: 10, padding: 16, justifyContent: "center" }}>
              <button type="button" className="pill" onClick={() => { setPreviewOpen(false); inputRef.current?.click(); }} style={{ background: "#fff", color: "var(--cream-ink)", border: "none", fontSize: 14, fontWeight: 800, padding: "12px 26px", cursor: "pointer" }}>Replace</button>
              <button type="button" className="pill" onClick={() => setPreviewOpen(false)} style={{ background: "transparent", color: "#fff", border: "2px solid rgba(255,255,255,0.4)", fontSize: 14, fontWeight: 800, padding: "12px 26px", cursor: "pointer" }}>Close</button>
            </div>
          </div>
        )}

        <input placeholder="Brand (optional)" value={brand} onChange={(e) => setBrand(e.target.value)} style={{ marginBottom: 10 }} />
        <input placeholder="Winter jacket" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 10 }} />
        <CategorySelect />

        {item && (
          <div style={{ background: "var(--cream)", borderRadius: 20, padding: "14px 16px", color: "var(--cream-ink)", display: "flex", flexDirection: "column", gap: 11 }}>
            <span style={{ color: "var(--orange)", fontWeight: 900, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>The Quiz</span>
            <Row label="Use in 4th Year?"><Seg value={useYear4} onChange={setUseYear4} options={[["no", "No"], ["maybe", "Maybe"], ["yes", "Yes"]]} /></Row>
            <Row label="Used last 90 days?"><Seg value={used90d ? "y" : "n"} onChange={(v) => setUsed90d(v === "y")} options={[["n", "No"], ["y", "Yes"]]} /></Row>
            <Row label="Talk about it with passion?"><Seg value={passion ? "y" : "n"} onChange={(v) => setPassion(v === "y")} options={[["n", "No"], ["y", "Yes"]]} /></Row>
            <Row label="Kept just for looks?"><Seg value={forLooks ? "y" : "n"} onChange={(v) => setForLooks(v === "y")} options={[["n", "No"], ["y", "Yes"]]} /></Row>
            <Row label="Easily replaced?"><Seg value={replaceable ? "y" : "n"} onChange={(v) => setReplaceable(v === "y")} options={[["n", "No"], ["y", "Yes"]]} /></Row>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: "1px solid var(--cream-line)" }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: "var(--cream-ink)" }}>Sentimental</span>
              <button onClick={() => setSentimental(!sentimental)} style={{ width: 46, height: 26, borderRadius: 999, border: "none", background: sentimental ? "var(--orange)" : "var(--cream-field)", position: "relative", cursor: "pointer" }}>
                <span style={{ position: "absolute", top: 3, left: sentimental ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", transition: "left .15s" }} />
              </button>
            </div>
          </div>
        )}

        {item && (
          <div style={{ display: "flex", alignItems: "center", gap: 12, background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 16, padding: "9px 13px", marginTop: 14 }}>
            <TigerRing mood="thinking" size={44} border="var(--gold)" borderWidth={3} bg="var(--forest, #235E2D)" />
            <span style={{ color: "#fff", fontWeight: 800, fontSize: 13 }}>
              Scores <b style={{ color: VERDICT[preview.verdict].bg }}>{preview.score}/100</b> — {VERDICT_MSG[preview.verdict]}
            </span>
          </div>
        )}

        <button className="pill btn-primary" style={{ marginTop: 16 }} onClick={save}>Save</button>
        {item && (
          <button onClick={remove} style={{ display: "block", width: "100%", marginTop: 10, height: 40, background: "none", border: "none", color: "var(--leave)", fontSize: 14, fontWeight: 800, cursor: "pointer" }}>Remove item</button>
        )}
      </div>

      {saved && (
        <div style={{ position: "fixed", inset: 0, zIndex: 40, display: "flex", flexDirection: "column", background: SAVED_BG[saved.verdict] }}>
          <span className="dot" style={{ position: "absolute", top: "12%", left: "18%", width: 8, height: 8, background: "var(--cream)" }} />
          <span className="dot" style={{ position: "absolute", top: "20%", right: "14%", width: 10, height: 10, background: "var(--gold)" }} />
          <span className="dot" style={{ position: "absolute", top: "68%", left: "10%", width: 6, height: 6, background: "#fff" }} />
          <span className="dot" style={{ position: "absolute", top: "76%", right: "20%", width: 9, height: 9, background: "var(--cream)" }} />
          <span className="dot" style={{ position: "absolute", top: "30%", left: "50%", width: 7, height: 7, background: "#fff" }} />
          <span className="dot" style={{ position: "absolute", top: "85%", left: "38%", width: 8, height: 8, background: "var(--gold)" }} />

          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, padding: "0 24px", textAlign: "center" }}>
            <TigerRing mood="celebrate" size={132} border="var(--cream)" borderWidth={5} bg="rgba(255,255,255,0.22)" />
            <h1 className="anton" style={{ fontSize: 40, textTransform: "uppercase", lineHeight: 0.95, color: SAVED_TEXT_COLOR[saved.verdict] }}>
              {SAVED_HEADLINE[saved.verdict]}
            </h1>
            <div style={{ color: SAVED_TEXT_COLOR[saved.verdict] }}>
              <span className="anton" style={{ fontSize: 64 }}>{saved.score}</span>
              <span style={{ fontSize: 22, fontWeight: 800, opacity: 0.6 }}>/100</span>
            </div>
            <p style={{ fontWeight: 700, fontSize: 15, color: SAVED_TEXT_COLOR[saved.verdict], opacity: saved.verdict === "leave" ? 0.9 : 0.75 }}>
              {savedSubtext(saved.verdict, name)}
            </p>
          </div>

          <div style={{ padding: "0 24px 40px", display: "flex", justifyContent: "center" }}>
            <button className="pill" onClick={() => { router.push("/"); router.refresh(); }} style={{
              background: "#123D1C", color: "#fff", fontWeight: 900, padding: "16px 48px", fontSize: 16,
              boxShadow: "0 6px 0 rgba(0,0,0,0.25)", border: "none", cursor: "pointer",
            }}>Done</button>
          </div>
        </div>
      )}
    </>
  );
}
