import { listItems } from "@/lib/items";
import Dashboard from "./dashboard";

export const dynamic = "force-dynamic";

export default function Home() {
  return <Dashboard items={listItems()} />;
}
