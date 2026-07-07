import { notFound } from "next/navigation";
import { getItem } from "@/lib/items";
import ItemForm from "../item-form";

export const dynamic = "force-dynamic";

export default async function EditItem({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const item = getItem(Number(id));
  if (!item) notFound();
  return <ItemForm item={item} />;
}
