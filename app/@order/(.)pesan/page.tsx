import { OrderOverlayDialog } from "@/components/OrderOverlayDialog";
import { getActiveMenuItems, getActivePackages } from "@/lib/catalog";
import { resolveOrderIntent } from "@/lib/order-intent";

type InterceptedPesanPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toSearchParams(values: Record<string, string | string[] | undefined>) {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (typeof value === "string") params.set(key, value);
    else if (Array.isArray(value) && value[0]) params.set(key, value[0]);
  });
  return params;
}

export default async function InterceptedPesanPage({ searchParams }: InterceptedPesanPageProps) {
  const [menuItems, packages, resolvedParams] = await Promise.all([
    getActiveMenuItems(),
    getActivePackages(),
    searchParams,
  ]);
  const intent = resolveOrderIntent(toSearchParams(resolvedParams), menuItems, packages);

  return <OrderOverlayDialog menuItems={menuItems} packages={packages} intent={intent} />;
}
