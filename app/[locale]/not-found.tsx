import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24">
      <h1 className="font-serif text-5xl text-forest">Not found</h1>
      <p className="mt-4 text-muted">This page is not in the atelier.</p>
      <Link href="/" className="mt-6 inline-block text-forest underline">
        Home
      </Link>
    </div>
  );
}
