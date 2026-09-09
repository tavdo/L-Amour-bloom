import Image from "next/image";

export function SiteBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      <Image
        src="/brand/shop-interior.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_40%]"
      />
      <div className="absolute inset-0 bg-[#f4efe6]/25" />
      <div className="absolute inset-0 bg-gradient-to-b from-[#f4efe6]/15 via-transparent to-[#f4efe6]/40" />
    </div>
  );
}
