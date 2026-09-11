"use client";
import { useCallback, useEffect, useState } from "react";
import { listItems, type Item } from "@/lib/items";
import Dashboard from "./dashboard";

export default function Home() {
  const [items, setItems] = useState<Item[] | null>(null);
  const load = useCallback(() => { listItems().then(setItems, (err) => alert(`Could not load items: ${err}`)); }, []);

  useEffect(() => {
    navigator.storage?.persist?.(); // ask the browser not to evict our data
    load();
  }, [load]);

  if (!items) return <p style={{ color: "var(--muted)", textAlign: "center", paddingTop: 80, fontWeight: 700 }}>Loading…</p>;
  return <Dashboard items={items} onReload={load} />;
}
