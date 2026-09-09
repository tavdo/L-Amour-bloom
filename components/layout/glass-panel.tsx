import type { ReactNode } from "react";

const glass =
  "bg-forest/15 backdrop-blur-xl ring-1 ring-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]";

export function GlassPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`border-l-[3px] border-gold ${glass} ${className}`}>{children}</div>
  );
}

export function glassClassName(extra = "") {
  return `${glass} ${extra}`;
}
