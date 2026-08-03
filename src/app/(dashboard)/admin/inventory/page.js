import Link from "next/link";
import Inventory from "@/components/Dashboard/Inventory";
import { connectMongodb } from "@lib/mongodb";
import { getStoreSettings } from "@lib/models/StoreSettingModel";
import { getSession } from "@lib/auth";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export const metadata = { title: "Inventory | ShopFusion Admin" };

const page = async () => {
  const session = await getSession();
  if (!session || session.role !== "admin") notFound();

  await connectMongodb();
  const settings = await getStoreSettings();
  const threshold = settings?.lowStockThreshold ?? 5;

  return (
    <div className="flex h-full flex-col">
      <div className="mb-6 flex flex-wrap shrink-0 items-center justify-between gap-4">
        <h1 className="page-title">Inventory</h1>
        <Link href="/admin/settings" className="btn-secondary">
          Low-stock threshold: {threshold}
        </Link>
      </div>
      <div className="min-h-0 flex-1">
        <Inventory threshold={threshold} />
      </div>
    </div>
  );
};

export default page;
