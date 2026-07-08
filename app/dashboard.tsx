"use client";
import Link from "next/link";
import { useState } from "react";
import type { Item } from "@/lib/items";
import { CATEGORIES, CAT_ICON } from "@/lib/categories";
import { TigerRing } from "./mascot";

const FILTERS = ["all", "keep", "maybe", "leave", "new"] as const;
const DOT: Record<string, string> = { keep: "var(--keep)", maybe: "var(--maybe)", leave: "var(--leave)" };
const FILTER_LABEL: Record<(typeof FILTERS)[number], string> = {
  all: "All", keep: "Keep", maybe: "Maybe", leave: "Let go", new: "New",
};

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

  const pct = items.length ? Math.round((assessed / items.length) * 100) : 0;
  const deg = Math.round((items.length ? assessed / items.length : 0) * 360) + "deg";

  return (
    <div>
      {/* header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div>
          <div className="logo" style={{ fontSize: 34 }}>asas</div>
          <div style={{ color: "#fff", fontWeight: 800, fontSize: 14 }}>Hi! Let&apos;s declutter 👋</div>
        </div>
        <TigerRing mood="wave" size={54} border="var(--orange)" borderWidth={3} bg="var(--card)" float />
      </div>

      {/* progress card */}
      <div style={{
        background: "var(--cream)", borderRadius: 20, padding: "16px 18px", color: "var(--cream-ink)",
        display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16,
      }}>
        <div>
          <div style={{ color: "var(--orange)", fontWeight: 900, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Your progress
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span className="anton" style={{ fontSize: 40, lineHeight: 1 }}>{assessed}</span>
            <span style={{ fontSize: 20, color: "#8FA57F" }}>/ {items.length} assessed</span>
          </div>
        </div>
        <div style={{
          width: 56, height: 56, borderRadius: "50%",
          background: `conic-gradient(var(--keep) ${deg}, #E7D3A6 ${deg})`,
          display: "flex", alignItems: "center", justifyContent: "center", flex: "none",
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%", background: "var(--cream)",
            display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 12,
          }}>
            {pct}%
          </div>
        </div>
      </div>

      {/* filter pills */}
      <div style={{ display: "flex", gap: 8, marginBottom: 14, overflowX: "auto" }}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            fontSize: 13, fontWeight: 800, padding: "7px 15px", borderRadius: 999,
            border: "none", cursor: "pointer", whiteSpace: "nowrap", flex: "none",
            background: filter === f ? "var(--orange)" : "var(--chip)",
            color: filter === f ? "#fff" : "#D8E8D0",
          }}>
            {(f === "keep" || f === "maybe" || f === "leave") && (
              <span className="dot" style={{ width: 8, height: 8, background: DOT[f] }} />
            )}
            {FILTER_LABEL[f]}
          </button>
        ))}
      </div>

      {/* category button */}
      <button type="button" onClick={() => setCatOpen(true)} style={{
        display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%",
        height: 46, padding: "0 14px", marginBottom: 16, background: "var(--card)", border: "1px solid var(--outline)",
        borderRadius: 12, fontSize: 14, color: "#fff", fontWeight: 800, cursor: "pointer",
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
        maxWidth: 420, margin: "0 auto", background: "var(--card)",
        borderRadius: "20px 20px 0 0", padding: "8px 16px 24px",
        transform: catOpen ? "translateY(0)" : "translateY(100%)", transition: "transform .25s ease",
      }}>
        <div style={{ width: 36, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.2)", margin: "8px auto 16px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {(["all", ...CATEGORIES] as string[]).map((c) => {
            const selected = c === cat;
            return (
              <button key={c} type="button" onClick={() => { setCat(c); setCatOpen(false); }} style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 6, padding: "14px 6px",
                background: selected ? "var(--orange)" : "var(--cream)",
                border: selected ? "3px solid var(--gold)" : "3px solid transparent",
                borderRadius: 16, cursor: "pointer",
              }}>
                <span style={{ fontSize: 28, lineHeight: 1 }}>{c === "all" ? "🗂️" : CAT_ICON[c] ?? "📦"}</span>
                <span style={{
                  fontSize: 11, fontWeight: 800, textAlign: "center",
                  color: selected ? "#fff" : "var(--cream-ink)",
                }}>{c === "all" ? "All" : c}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* item grid / empty state */}
      {shown.length === 0 ? (
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
          padding: "40px 0", gap: 12,
        }}>
          <TigerRing mood="snooze" size={112} border="var(--gold)" />
          <div className="anton" style={{ fontSize: 26, color: "#fff" }}>ALL SORTED</div>
          <div style={{ color: "var(--muted)", fontSize: 14 }}>Nothing here — add an item to get started.</div>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 12 }}>
          {shown.map((i) => (
            <Link key={i.id} href={`/items/${i.id}`} style={{
              background: "var(--card)", borderRadius: 18, overflow: "hidden", textDecoration: "none", color: "inherit",
              display: "block",
            }}>
              <div style={{ height: 92, background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {i.image_path
                  ? <img src={i.image_path} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: i.image_pos ?? "50% 50%" }} />
                  : <span style={{ fontSize: 40 }}>{CAT_ICON[i.category] ?? "📦"}</span>}
              </div>
              <div style={{ padding: "9px 11px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 6 }}>
                <span style={{ display: "flex", flexDirection: "column", minWidth: 0 }}>
                  <span style={{ color: "#fff", fontWeight: 900, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name}</span>
                  {i.brand && <span style={{ fontSize: 11, color: "var(--muted)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.brand}</span>}
                </span>
                {i.verdict
                  ? <span className="dot" style={{ width: 12, height: 12, background: DOT[i.verdict], flex: "none" }} />
                  : <span style={{
                      fontSize: 10, fontWeight: 900, color: "var(--cream-ink)", background: "var(--gold)",
                      borderRadius: 999, padding: "2px 8px", flex: "none",
                    }}>NEW</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* FAB */}
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, display: "flex", justifyContent: "center", padding: 16, pointerEvents: "none" }}>
        <div style={{ width: "100%", maxWidth: 420, pointerEvents: "auto", padding: "0 16px" }}>
          <Link href="/items/new" className="pill btn-primary" style={{ textDecoration: "none" }}>+ Add item</Link>
        </div>
      </div>
    </div>
  );
}
