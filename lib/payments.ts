import { createHash, createPublicKey, verify } from "node:crypto";
import { getPrisma } from "@/lib/db";
import { paymentsMode, siteUrl } from "@/lib/site";
import type { PaymentProvider } from "@/generated/prisma";

const BOG_DEFAULT_PUBLIC_KEY = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAu4RUyAw3+CdkS3ZNILQh
zHI9Hemo+vKB9U2BSabppkKjzjjkf+0Sm76hSMiu/HFtYhqWOESryoCDJoqffY0Q
1VNt25aTxbj068QNUtnxQ7KQVLA+pG0smf+EBWlS1vBEAFbIas9d8c9b9sSEkTrr
TYQ90WIM8bGB6S/KLVoT1a7SnzabjoLc5Qf/SLDG5fu8dH8zckyeYKdRKSBJKvhx
tcBuHV4f7qsynQT+f2UYbESX/TLHwT5qFWZDHZ0YUOUIvb8n7JujVSGZO9/+ll/g
4ZIWhC1MlJgPObDwRkRd8NFOopgxMcMsDIZIoLbWKhHVq67hdbwpAq9K9WMmEhPn
PwIDAQAB
-----END PUBLIC KEY-----`;

export class PaymentConfigurationError extends Error {}

type CreatePaymentInput = {
  orderId: string;
  orderNumber: string;
  totalGelMajor: number;
  locale: string;
  description: string;
  basket: { productId: string; quantity: number; unitPriceGelMajor: number }[];
};

export type PaymentRedirect = {
  redirectUrl: string;
  providerOrderId: string;
};

export async function startPayment(
  provider: PaymentProvider,
  input: CreatePaymentInput,
): Promise<PaymentRedirect> {
  if (paymentsMode() === "mock") {
    return {
      providerOrderId: `mock_${input.orderId}`,
      redirectUrl: `${siteUrl()}${input.locale === "ka" ? "/ka" : ""}/pay/mock/${input.orderId}`,
    };
  }

  if (provider === "BOG") {
    return createBogOrder(input);
  }
  return createTbcPayment(input);
}

async function createBogOrder(
  input: CreatePaymentInput,
): Promise<PaymentRedirect> {
  const token = await getBogAccessToken();
  const origin = siteUrl();
  const response = await fetch(
    `${bogApiBase()}/payments/v1/ecommerce/orders`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "Accept-Language": input.locale === "ka" ? "ka" : "en",
      },
      body: JSON.stringify({
        callback_url: `${origin}/api/webhooks/bog`,
        external_order_id: input.orderId,
        capture: "automatic",
        purchase_units: {
          currency: "GEL",
          total_amount: input.totalGelMajor,
          basket: input.basket.map((item) => ({
            product_id: item.productId,
            quantity: item.quantity,
            unit_price: item.unitPriceGelMajor,
          })),
        },
        redirect_urls: {
          success: `${origin}/order/${input.orderId}?payment=success`,
          fail: `${origin}/order/${input.orderId}?payment=fail`,
        },
      }),
    },
  );

  if (!response.ok) {
    const text = await response.text();
    throw new PaymentConfigurationError(
      `BOG create order failed (${response.status}): ${text}`,
    );
  }

  const data = (await response.json()) as {
    id: string;
    _links?: { redirect?: { href?: string } };
  };

  const redirectUrl = data._links?.redirect?.href;
  if (!redirectUrl) {
    throw new PaymentConfigurationError("BOG response missing redirect URL");
  }

  return { providerOrderId: data.id, redirectUrl };
}

async function getBogAccessToken(): Promise<string> {
  const clientId = process.env.BOG_CLIENT_ID;
  const clientSecret = process.env.BOG_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new PaymentConfigurationError("BOG_CLIENT_ID / BOG_CLIENT_SECRET missing");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const oauthUrl =
    process.env.BOG_OAUTH_URL?.replace(/\/$/, "") ||
    "https://oauth2.bog.ge/auth/realms/bog/protocol/openid-connect/token";
  const response = await fetch(oauthUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    throw new PaymentConfigurationError(`BOG auth failed (${response.status})`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

function bogApiBase(): string {
  return process.env.BOG_API_BASE_URL?.replace(/\/$/, "") || "https://api.bog.ge";
}

export function verifyBogCallbackSignature(
  rawBody: Buffer,
  signatureHeader: string | null,
): boolean {
  if (!signatureHeader) return false;
  const pem = process.env.BOG_CALLBACK_PUBLIC_KEY || BOG_DEFAULT_PUBLIC_KEY;
  const key = createPublicKey(pem);
  const signature = Buffer.from(signatureHeader, "base64");
  return verify("RSA-SHA256", rawBody, key, signature);
}

async function createTbcPayment(
  input: CreatePaymentInput,
): Promise<PaymentRedirect> {
  const accessToken = await getTbcAccessToken();
  const apiKey = process.env.TBC_API_KEY;
  if (!apiKey) {
    throw new PaymentConfigurationError("TBC_API_KEY missing");
  }

  const origin = siteUrl();
  const response = await fetch(`${tbcApiBase()}/v1/tpay/payments`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: {
        currency: "GEL",
        total: input.totalGelMajor,
      },
      returnurl: `${origin}/order/${input.orderId}`,
      callbackUrl: `${origin}/api/webhooks/tbc`,
      language: input.locale === "ka" ? "KA" : "EN",
      merchantPaymentId: input.orderNumber,
      preAuth: false,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new PaymentConfigurationError(
      `TBC create payment failed (${response.status}): ${text}`,
    );
  }

  const data = (await response.json()) as {
    payId: string;
    links?: { uri: string; rel: string }[];
  };

  const redirectUrl = data.links?.find((link) => link.rel === "approval_url")?.uri;
  if (!redirectUrl) {
    throw new PaymentConfigurationError("TBC response missing approval URL");
  }

  return { providerOrderId: data.payId, redirectUrl };
}

async function getTbcAccessToken(): Promise<string> {
  const clientId = process.env.TBC_CLIENT_ID;
  const clientSecret = process.env.TBC_CLIENT_SECRET;
  const apiKey = process.env.TBC_API_KEY;
  if (!clientId || !clientSecret || !apiKey) {
    throw new PaymentConfigurationError(
      "TBC_CLIENT_ID / TBC_CLIENT_SECRET / TBC_API_KEY missing",
    );
  }

  const body = new URLSearchParams({
    client_Id: clientId,
    client_secret: clientSecret,
  });

  const response = await fetch(`${tbcApiBase()}/v1/tpay/access-token`, {
    method: "POST",
    headers: {
      apikey: apiKey,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body,
  });

  if (!response.ok) {
    throw new PaymentConfigurationError(`TBC auth failed (${response.status})`);
  }

  const data = (await response.json()) as { access_token: string };
  return data.access_token;
}

export async function fetchTbcPaymentStatus(payId: string): Promise<string> {
  const accessToken = await getTbcAccessToken();
  const apiKey = process.env.TBC_API_KEY!;
  const response = await fetch(`${tbcApiBase()}/v1/tpay/payments/${payId}`, {
    headers: {
      apikey: apiKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!response.ok) {
    throw new Error(`TBC get payment failed (${response.status})`);
  }
  const data = (await response.json()) as { status?: string };
  return data.status ?? "Unknown";
}

function tbcApiBase(): string {
  return process.env.TBC_API_BASE_URL?.replace(/\/$/, "") || "https://api.tbcbank.ge";
}

export function tbcCallbackAllowed(ip: string | null): boolean {
  const allow = (process.env.TBC_CALLBACK_IPS ?? "")
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  if (allow.length === 0) return true;
  if (!ip) return false;
  return allow.includes(ip);
}

export function idempotencyKey(provider: PaymentProvider, raw: string): string {
  return `${provider}:${createHash("sha256").update(raw).digest("hex")}`;
}

export async function recordPaymentEvent(input: {
  provider: PaymentProvider;
  idempotencyKey: string;
  payload: unknown;
  orderId?: string;
}): Promise<boolean> {
  const prisma = getPrisma();
  try {
    await prisma.paymentEvent.create({
      data: {
        provider: input.provider,
        idempotencyKey: input.idempotencyKey,
        payload: input.payload as object,
        orderId: input.orderId,
      },
    });
    return true;
  } catch (error) {
    if (
      typeof error === "object" &&
      error &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return false;
    }
    throw error;
  }
}

export async function markOrderPaid(orderId: string, providerOrderId?: string) {
  const prisma = getPrisma();
  await prisma.order.updateMany({
    where: {
      id: orderId,
      paymentStatus: { not: "COMPLETED" },
    },
    data: {
      status: "PAID",
      paymentStatus: "COMPLETED",
      paidAt: new Date(),
      ...(providerOrderId ? { providerOrderId } : {}),
    },
  });
}

export async function markOrderFailed(orderId: string) {
  const prisma = getPrisma();
  await prisma.order.updateMany({
    where: {
      id: orderId,
      paymentStatus: { not: "COMPLETED" },
    },
    data: {
      status: "FAILED",
      paymentStatus: "FAILED",
    },
  });
}
