import { OrderForm } from "@/components/OrderForm";
import type { PublicMenuItem, PublicPackage } from "@/lib/catalog";

interface QuickOrderFormProps {
  menuItems: PublicMenuItem[];
  packages: PublicPackage[];
}

export function QuickOrderForm({ menuItems, packages }: QuickOrderFormProps) {
  return <OrderForm menuItems={menuItems} packages={packages} draftKey="shanti-order-draft-pesan" />;
}
