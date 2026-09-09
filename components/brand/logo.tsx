import Image from "next/image";
import { storeName, storeNameKa } from "@/lib/site";

export const LOGO_SRC = "/brand/lamour-bloom-logo.jpg";

type BrandLogoProps = {
  className?: string;
  priority?: boolean;
};

export function BrandLogo({ className = "h-16 w-auto sm:h-[4.5rem]", priority }: BrandLogoProps) {
  const alt = `${storeName()} — ${storeNameKa()}`;

  return (
    <Image
      src={LOGO_SRC}
      alt={alt}
      width={640}
      height={640}
      priority={priority}
      className={`object-contain ${className}`}
    />
  );
}
