"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Item } from "@/lib/items";
import { scoreItem } from "@/lib/score";
import { CATEGORIES, CAT_ICON } from "@/lib/categories";

const COLOR = { keep: "var(--keep)", maybe: "var(--maybe)", leave: "var(--leave)" } as const;

export default function ItemForm({ item }: { item?: Item }) {
  const router = useRouter();
  const [name, setName] = useState(item?.name ?? "");
  const [brand, setBrand] = useState(item?.brand ?? "");
  const [category, setCategory] = useState(item?.category ?? "clothes");
  const [imagePath, setImagePath] = useState<string | null>(item?.image_path ?? null);
  const [sentimental, setSentimental] = useState(!!item?.sentimental);
  const [useYear4, setUseYear4] = useState<"no" | "maybe" | "yes">(item?.use_year4 ?? "no");
  const [used90d, setUsed90d] = useState(!!item?.used_90d);
  const [passion, setPassion] = useState(!!item?.passion);
  const [forLooks, setForLooks] = useState(!!item?.for_looks);
  const [replaceable, setReplaceable] = useState(!!item?.replaceable);

  const preview = scoreItem({ use_year4: useYear4, used_90d: used90d, passion, for_looks: forLooks, replaceable, sentimental });

  async function upload(file: File) {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const { path } = await res.json();
    setImagePath(path);
  }

  async function save() {
    if (!item) {
      // Add creates an unassessed item (score/verdict null → "New"). Reassess scores it.
      await fetch("/api/items", {
        method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, brand, category, image_path: imagePath }),
      });
    } else {
      await fetch(`/api/items/${item.id}`, {
        method: "PUT", headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, brand, category, image_path: imagePath, sentimental, use_year4: useYear4, used_90d: used90d, passion, for_looks: forLooks, replaceable }),
      });
    }
    router.push("/");
    router.refresh();
  }

  async function remove() {
    if (!item) return;
    if (!confirm(`Remove "${item.name}"? This can't be undone.`)) return;
    await fetch(`/api/items/${item.id}`, { method: "DELETE" });
    router.push("/");
    router.refresh();
  }

  const Seg = ({ value, options, onChange }: { value: string; options: [string, string][]; onChange: (v: any) => void }) => (
    <span style={{ display: "flex", border: "1px solid var(--hairline)", borderRadius: 8, overflow: "hidden", fontSize: 12 }}>
      {options.map(([val, label], idx) => (
        <button key={val} onClick={() => onChange(val)} style={{
          padding: "6px 11px", border: "none", cursor: "pointer",
          borderLeft: idx ? "1px solid var(--hairline)" : "none",
          background: value === val ? "var(--primary)" : "transparent",
          color: value === val ? "#fff" : "var(--muted)",
        }}>{label}</button>
      ))}
    </span>
  );

  const [catOpen, setCatOpen] = useState(false);
  const CategorySelect = () => (
    <>
      <button type="button" onClick={() => setCatOpen(true)} style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%",
        height: 44, padding: "0 12px", marginBottom: 14, background: "var(--card)", border: "1px solid var(--hairline)",
        borderRadius: 10, fontSize: 14, color: "var(--body)", cursor: "pointer",
      }}>
        <span>{CAT_ICON[category] ?? "📦"} {category}</span>
        <span style={{ color: "var(--muted)", fontSize: 11 }}>▼</span>
      </button>

      {/* backdrop */}
      <div onClick={() => setCatOpen(false)} style={{
        position: "fixed", inset: 0, zIndex: 20, background: "rgba(0,0,0,0.4)",
        opacity: catOpen ? 1 : 0, pointerEvents: catOpen ? "auto" : "none", transition: "opacity .2s",
      }} />
      {/* sheet */}
      <div style={{
        position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 21,
        maxWidth: 420, margin: "0 auto", background: "#fff",
        borderRadius: "16px 16px 0 0", padding: "8px 16px 24px",
        transform: catOpen ? "translateY(0)" : "translateY(100%)", transition: "transform .25s ease",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "var(--hairline)", margin: "8px auto 16px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {CATEGORIES.map((c) => (
            <button key={c} type="button" onClick={() => { setCategory(c); setCatOpen(false); }} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 6px",
              background: c === category ? "var(--card)" : "#fff",
              border: `1px solid ${c === category ? "var(--primary)" : "var(--hairline)"}`,
              borderRadius: 12, cursor: "pointer",
            }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>{CAT_ICON[c] ?? "📦"}</span>
              <span style={{ fontSize: 11, color: "var(--body)", textAlign: "center" }}>{c}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 14, color: "var(--body)" }}>{label}</span>{children}
    </div>
  );

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <button onClick={() => router.back()} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer" }}>‹</button>
        {item && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: COLOR[preview.verdict], color: "#fff", fontSize: 13, fontWeight: 600, padding: "5px 12px", borderRadius: 999 }}>
            <span style={{ fontSize: 16 }}>{preview.score}</span>{preview.verdict}
          </span>
        )}
      </div>

      <label style={{ position: "relative", display: "block", height: 150, background: "var(--card)", border: "1px dashed var(--hairline)", borderRadius: 12, marginBottom: 14, overflow: "hidden", cursor: "pointer" }}>
        {imagePath
          ? <img src={imagePath} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <span style={{ display: "flex", height: "100%", alignItems: "center", justifyContent: "center", color: "var(--muted)", fontSize: 12 }}>Capture or upload</span>}
        {imagePath && (
          <button
            aria-label="Remove image"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); setImagePath(null); }}
            style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", border: "none", background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 16, lineHeight: 1, cursor: "pointer" }}
          >×</button>
        )}
        <input type="file" accept="image/*" capture="environment" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
      </label>

      <input placeholder="Brand (optional)" value={brand} onChange={(e) => setBrand(e.target.value)} style={{ marginBottom: 10 }} />
      <input placeholder="Winter jacket" value={name} onChange={(e) => setName(e.target.value)} style={{ marginBottom: 10 }} />
      <CategorySelect />

      {item && (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <Row label="Use in 4th Year?"><Seg value={useYear4} onChange={setUseYear4} options={[["no", "No"], ["maybe", "Maybe"], ["yes", "Yes"]]} /></Row>
        <Row label="Used last 90 days?"><Seg value={used90d ? "y" : "n"} onChange={(v) => setUsed90d(v === "y")} options={[["n", "No"], ["y", "Yes"]]} /></Row>
        <Row label="Talk about it with passion?"><Seg value={passion ? "y" : "n"} onChange={(v) => setPassion(v === "y")} options={[["n", "No"], ["y", "Yes"]]} /></Row>
        <Row label="Kept just for looks?"><Seg value={forLooks ? "y" : "n"} onChange={(v) => setForLooks(v === "y")} options={[["n", "No"], ["y", "Yes"]]} /></Row>
        <Row label="Easily replaced?"><Seg value={replaceable ? "y" : "n"} onChange={(v) => setReplaceable(v === "y")} options={[["n", "No"], ["y", "Yes"]]} /></Row>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 6, borderTop: "1px solid var(--hairline)" }}>
          <span style={{ fontSize: 14, color: "var(--body)" }}>Sentimental</span>
          <button onClick={() => setSentimental(!sentimental)} style={{ width: 38, height: 22, borderRadius: 999, border: "1px solid var(--hairline)", background: sentimental ? "var(--primary)" : "#fff", position: "relative", cursor: "pointer" }}>
            <span style={{ position: "absolute", top: 2, left: sentimental ? 18 : 2, width: 16, height: 16, borderRadius: "50%", background: sentimental ? "#fff" : "var(--muted)", transition: "left .15s" }} />
          </button>
        </div>
      </div>
      )}

      <button className="btn-primary" style={{ marginTop: 16 }} onClick={save}>Save</button>
      {item && (
        <button onClick={remove} style={{ display: "block", width: "100%", marginTop: 10, height: 40, background: "none", border: "none", color: "var(--leave)", fontSize: 14, fontWeight: 500, cursor: "pointer" }}>Remove item</button>
      )}
    </div>
  );
}
