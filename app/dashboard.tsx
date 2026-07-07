"use client";
import Link from "next/link";
import { useState } from "react";
import type { Item } from "@/lib/items";
import { CATEGORIES, CAT_ICON } from "@/lib/categories";

const FILTERS = ["all", "keep", "maybe", "leave", "new"] as const;
const DOT: Record<string, string> = { keep: "var(--keep)", maybe: "var(--maybe)", leave: "var(--leave)" };

export default function Dashboard({ items }: { items: Item[] }) {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("all");
  const [cat, setCat] = useState<string>("all");
  const [catOpen, setCatOpen] = useState(false);
  const assessed = items.filter((i) => i.verdict).length;
  const shown = items.filter((i) => {
    const verdictOk = filter === "all" ? true : filter === "new" ? !i.verdict : i.verdict === filter;
    const catOk = cat === "all" ? true : i.category === cat;
    return verdictOk && catOk;
  });

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
        <span className="display" style={{ fontSize: 22 }}>Asas</span>
        <span style={{ fontSize: 13, color: "var(--muted)" }}>{assessed} / {items.length} assessed</span>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            fontSize: 13, fontWeight: 500, padding: "6px 12px", borderRadius: 999,
            border: "none", cursor: "pointer", whiteSpace: "nowrap",
            background: filter === f ? "var(--primary)" : "transparent",
            color: filter === f ? "#fff" : "var(--muted)",
          }}>{f === "all" ? "All" : f === "new" ? "New" : f[0].toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      <button type="button" onClick={() => setCatOpen(true)} style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%",
        height: 44, padding: "0 12px", marginBottom: 14, background: "var(--card)", border: "1px solid var(--hairline)",
        borderRadius: 10, fontSize: 14, color: "var(--body)", cursor: "pointer",
      }}>
        <span>{cat === "all" ? "🗂️ All categories" : `${CAT_ICON[cat] ?? "📦"} ${cat}`}</span>
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
          {(["all", ...CATEGORIES] as string[]).map((c) => (
            <button key={c} type="button" onClick={() => { setCat(c); setCatOpen(false); }} style={{
              display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 6px",
              background: c === cat ? "var(--card)" : "#fff",
              border: `1px solid ${c === cat ? "var(--primary)" : "var(--hairline)"}`,
              borderRadius: 12, cursor: "pointer",
            }}>
              <span style={{ fontSize: 26, lineHeight: 1 }}>{c === "all" ? "🗂️" : CAT_ICON[c] ?? "📦"}</span>
              <span style={{ fontSize: 11, color: "var(--body)", textAlign: "center" }}>{c === "all" ? "All" : c}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
        {shown.map((i) => (
          <Link key={i.id} href={`/items/${i.id}`} style={{
            border: "1px solid var(--hairline)", borderRadius: 12, overflow: "hidden", textDecoration: "none", color: "inherit",
          }}>
            <div style={{ height: 96, background: "var(--card)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {i.image_path
                ? <img src={i.image_path} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <span style={{ color: "var(--muted)", fontSize: 12 }}>no image</span>}
            </div>
            <div style={{ padding: "8px 10px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
              <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                <span style={{ fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name}</span>
                {i.brand && <span style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.brand}</span>}
              </span>
              {i.verdict
                ? <span className="dot" style={{ background: DOT[i.verdict] }} />
                : <span style={{ fontSize: 11, color: "var(--muted)", border: "1px solid var(--hairline)", borderRadius: 999, padding: "1px 7px" }}>New</span>}
            </div>
          </Link>
        ))}
      </div>

      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 420, pointerEvents: "auto", padding: "0 16px" }}>
          <Link href="/items/new" className="btn-primary" style={{ textDecoration: "none" }}>+ Add item</Link>
        </div>
      </div>
    </div>
  );
}
