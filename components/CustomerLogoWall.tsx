import { CUSTOMER_ORGANIZATIONS, type CustomerOrganization } from "@/lib/public-content";
import { CustomerLogoTooltip } from "@/components/CustomerLogoTooltip";

type CustomerLogoWallProps = {
  customers?: CustomerOrganization[];
};

export function CustomerLogoWall({ customers = CUSTOMER_ORGANIZATIONS }: CustomerLogoWallProps) {
  return (
    <section id="customer-kami" aria-labelledby="client-kami-title" className="border-y border-border bg-muted/35 py-8 sm:py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h2 id="client-kami-title" className="mb-5 text-2xl font-bold tracking-tight text-foreground sm:mb-6 sm:text-3xl">
          Client Kami
        </h2>
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-5" aria-label="Institusi yang pernah dilayani">
          {customers.map((customer) => (
            <li key={customer.id} className="min-w-0">
              <CustomerLogoTooltip customer={customer} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
