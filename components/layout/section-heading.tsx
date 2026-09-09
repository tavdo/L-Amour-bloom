export function SectionHeading({
  children,
  as: Tag = "h2",
}: {
  children: React.ReactNode;
  as?: "h1" | "h2";
}) {
  return (
    <Tag className="font-serif text-3xl tracking-wide text-forest md:text-4xl">
      <span className="inline-flex items-center gap-4 bg-forest/20 px-5 py-2.5 backdrop-blur-xl ring-1 ring-white/40 [clip-path:polygon(0_0,calc(100%-14px)_0,100%_14px,100%_100%,0_100%)]">
        {children}
      </span>
    </Tag>
  );
}
