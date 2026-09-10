"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { deleteProductAction } from "../../actions";

export function DeleteProductButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <span className="inline-flex flex-col items-end">
      <button
        type="button"
        className="text-sm text-clay"
        onClick={async () => {
          if (!window.confirm(`Remove “${name}” from the shop?`)) return;
          setError(null);
          try {
            await deleteProductAction(id);
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : "Remove failed");
          }
        }}
      >
        Remove
      </button>
      {error ? <span className="max-w-48 text-right text-xs text-clay">{error}</span> : null}
    </span>
  );
}
