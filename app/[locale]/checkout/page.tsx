import { getShippingRegions } from "@/lib/catalog";
import { CheckoutForm } from "./checkout-form";
import { SetupHint } from "@/components/setup-hint";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  let regions;
  try {
    regions = await getShippingRegions();
  } catch {
    return <SetupHint />;
  }
  return <CheckoutForm regions={regions} />;
}
