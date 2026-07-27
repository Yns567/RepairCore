import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../lib/generated/prisma/index.js";

const baseUrl = "http://127.0.0.1:3001";
const email = `repaircore-smoke-${Date.now()}@example.invalid`;
const password = `Smoke-${crypto.randomUUID()}!`;
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const cookies = new Map();
let userId;

function absorbCookies(response) {
  const values =
    typeof response.headers.getSetCookie === "function"
      ? response.headers.getSetCookie()
      : [response.headers.get("set-cookie")].filter(Boolean);

  for (const value of values) {
    const pair = value.split(";", 1)[0];
    const separator = pair.indexOf("=");
    if (separator > 0) cookies.set(pair.slice(0, separator), pair.slice(separator + 1));
  }
}

function cookieHeader() {
  return [...cookies].map(([name, value]) => `${name}=${value}`).join("; ");
}

try {
  const user = await prisma.user.create({
    data: {
      name: "RepairCore smoke test",
      email,
      hashedPassword: await bcrypt.hash(password, 12),
      wallet: { create: { balance: 25, currency: "USD" } },
    },
  });
  userId = user.id;

  const csrfResponse = await fetch(`${baseUrl}/api/auth/csrf`);
  absorbCookies(csrfResponse);
  const { csrfToken } = await csrfResponse.json();

  const signInResponse = await fetch(`${baseUrl}/api/auth/callback/credentials`, {
    method: "POST",
    redirect: "manual",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Cookie: cookieHeader(),
    },
    body: new URLSearchParams({
      csrfToken,
      email,
      password,
      callbackUrl: `${baseUrl}/account`,
    }),
  });
  absorbCookies(signInResponse);

  if (![200, 302, 303].includes(signInResponse.status) || ![...cookies.keys()].some((name) => name.includes("session-token"))) {
    throw new Error(`Credential sign-in failed with status ${signInResponse.status}.`);
  }

  const service = await prisma.gsmService.findUniqueOrThrow({
    where: { slug: "imei-device-information-check" },
  });
  const orderPayload = {
    serviceId: service.id,
    requestId: crypto.randomUUID(),
    expectedPrice: service.price.toString(),
    imei: "490154203237518",
    deviceModel: "Smoke test device",
    notes: "",
    authorizationConfirmed: true,
  };
  const orderResponse = await fetch(`${baseUrl}/api/service-orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader(),
    },
    body: JSON.stringify(orderPayload),
  });
  const orderResult = await orderResponse.json();
  if (orderResponse.status !== 201 || !orderResult.id) {
    throw new Error(`Service order failed with status ${orderResponse.status}: ${JSON.stringify(orderResult)}`);
  }

  const retryResponse = await fetch(`${baseUrl}/api/service-orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader(),
    },
    body: JSON.stringify(orderPayload),
  });
  const retryResult = await retryResponse.json();
  if (retryResponse.status !== 200 || retryResult.id !== orderResult.id || retryResult.existing !== true) {
    throw new Error("Idempotent order retry created an unexpected result.");
  }

  const [order, wallet] = await Promise.all([
    prisma.gsmServiceOrder.findUniqueOrThrow({ where: { id: orderResult.id } }),
    prisma.wallet.findUniqueOrThrow({ where: { userId } }),
  ]);

  if (!order.imei?.startsWith("v1:")) throw new Error("IMEI was not encrypted at rest.");
  if (Number(wallet.balance) !== 25 - Number(service.price)) throw new Error("Wallet debit did not match the service price.");

  const historyResponse = await fetch(`${baseUrl}/account/services`, {
    headers: { Cookie: cookieHeader() },
  });
  const historyHtml = await historyResponse.text();
  if (
    historyResponse.status !== 200 ||
    !historyHtml.includes(service.name) ||
    historyHtml.includes("No service orders yet")
  ) {
    throw new Error(
      `Customer service-order history did not render the new order (status ${historyResponse.status}, URL ${historyResponse.url}).`,
    );
  }
  if (historyHtml.includes("490154203237518") || !historyHtml.includes("7518")) {
    throw new Error("Customer IMEI masking did not pass the privacy check.");
  }

  console.log("GSM smoke test passed: sign-in, idempotent encrypted order, single wallet debit and masked history.");
} finally {
  if (userId) {
    await prisma.gsmServiceOrder.deleteMany({ where: { userId } });
    await prisma.user.delete({ where: { id: userId } }).catch(() => undefined);
  }
  await prisma.$disconnect();
}
