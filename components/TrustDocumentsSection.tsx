import { FileCheck2 } from "lucide-react";
import { TRUST_DOCUMENTS, type TrustDocument } from "@/lib/public-content";

type TrustDocumentsSectionProps = {
  documents?: TrustDocument[];
};

export function TrustDocumentsSection({ documents = TRUST_DOCUMENTS }: TrustDocumentsSectionProps) {
  return (
    <section id="dokumen-kepercayaan" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
      <div className="max-w-2xl">
        <h2 className="text-3xl font-bold tracking-[-0.04em] text-foreground sm:text-4xl">Dokumen dan kepercayaan</h2>
        <p className="mt-3 text-base leading-7 text-muted-foreground">Dokumen usaha akan kami tampilkan bertahap setelah siap diverifikasi.</p>
      </div>

      <div className="mt-8 grid gap-3 sm:mt-10 md:grid-cols-3 md:gap-4">
        {documents.map((document) => (
          <article key={document.id} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <FileCheck2 className="h-5 w-5 text-emerald-700 dark:text-emerald-300" aria-hidden="true" />
            <h3 className="mt-5 text-lg font-bold tracking-tight text-foreground">{document.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{document.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
