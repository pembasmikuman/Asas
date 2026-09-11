"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { getItem, type Item } from "@/lib/items";
import ItemForm from "../item-form";

function EditInner() {
  const id = Number(useSearchParams().get("id"));
  const [item, setItem] = useState<Item | null | undefined>(undefined);
  useEffect(() => { getItem(id).then((i) => setItem(i ?? null)).catch(() => setItem(null)); }, [id]);

  const msg = { color: "var(--muted)", textAlign: "center", paddingTop: 80, fontWeight: 700 } as const;
  if (item === undefined) return <p style={msg}>Loading…</p>;
  if (item === null) return <p style={msg}>Item not found.</p>;
  return <ItemForm item={item} />;
}

// useSearchParams needs a Suspense boundary to build under output: "export".
export default function EditItem() {
  return <Suspense><EditInner /></Suspense>;
}
