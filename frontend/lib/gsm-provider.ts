import "server-only";

import { emailHtml, notify, siteUrl } from "@/lib/email";
import { formatMoney, PRICING_CURRENCY, toMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { decryptSensitiveValue } from "@/lib/sensitive-data";
import { creditWallet } from "@/lib/wallet";

/*
 * Client for GSM Theme / DHRU Fusion compatible provider APIs.
 *
 * Configuration (environment):
 *   GSM_API_URL          Provider API URL from its dashboard, e.g. https://example.org/public
 *   GSM_API_ENDPOINT     Optional full endpoint; defaults to `${GSM_API_URL}/api/index.php`.
 *   GSM_API_USERNAME     Provider account username.
 *   GSM_API_KEY          Provider API access key.
 *   GSM_PARAMS_BASE64    "1" to base64-encode XML parameters (some DHRU servers expect it).
 *   GSM_MARKUP_PERCENT   Profit margin applied on provider cost when syncing (default 20).
 *   GSM_MIN_PROFIT       Minimum profit per order in USD (default 0.50).
 */

export class ProviderError extends Error {
  /** True when the provider definitely refused the request (safe to refund). */
  constructor(message: string, readonly rejected: boolean) {
    super(message);
  }
}

// Services that remove theft protection or lock screens without proof of ownership
// are never imported or sold. Matching is case-insensitive on name, group and info.
const BLOCKED_PATTERNS = [
  /activation\s*lock/i,
  /icloud\s*(remove|removal|bypass|unlock|off)/i,
  /(remove|bypass|unlock)\s*icloud/i,
  /fmi\s*off/i,
  /find\s*my\s*(iphone|device)?\s*(off|remove|removal|bypass)/i,
  /passcode/i,
  /hello\s*(screen)?\s*bypass/i,
  /(bypass|remove)\s*hello/i,
  /\bmdm\s*(bypass|remove|removal)/i,
  /\bfrp\b.*(bypass|remove|unlock)|(bypass|remove|unlock).*\bfrp\b/i,
  /blacklist(ed)?\s*(clean|remove|removal|unlock)/i,
  /(lost|stolen)\s*(mode|device|unlock)/i,
  /\bbypass\b/i,
];

export function isBlockedService(...texts: (string | null | undefined)[]) {
  const haystack = texts.filter(Boolean).join(" ");
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(haystack));
}

function config() {
  const base = process.env.GSM_API_URL?.replace(/\/$/, "");
  const username = process.env.GSM_API_USERNAME;
  const key = process.env.GSM_API_KEY;
  if (!base || !username || !key) return null;
  return {
    endpoint: process.env.GSM_API_ENDPOINT || `${base}/api/index.php`,
    username,
    key,
    base64: process.env.GSM_PARAMS_BASE64 === "1",
  };
}

export function isProviderConfigured() {
  return config() !== null;
}

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[char]!);

function toXml(parameters: Record<string, string | number>) {
  const body = Object.entries(parameters)
    .map(([key, value]) => `<${key}>${escapeXml(String(value))}</${key}>`)
    .join("");
  return `<PARAMETERS>${body}</PARAMETERS>`;
}

type ApiResponse = { SUCCESS?: unknown; ERROR?: { MESSAGE?: string }[] };

async function call(action: string, parameters?: Record<string, string | number>) {
  const settings = config();
  if (!settings) throw new ProviderError("Provider API is not configured.", false);

  const form = new URLSearchParams({
    username: settings.username,
    apiaccesskey: settings.key,
    action,
    requestformat: "JSON",
  });
  if (parameters) {
    const xml = toXml(parameters);
    form.set("parameters", settings.base64 ? Buffer.from(xml).toString("base64") : xml);
  }

  let response: Response;
  try {
    response = await fetch(settings.endpoint, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(25_000),
      cache: "no-store",
    });
  } catch {
    // Network failure or timeout: the provider may or may not have received it.
    throw new ProviderError("The provider did not answer in time.", false);
  }

  const data = (await response.json().catch(() => null)) as ApiResponse | null;
  if (!data) throw new ProviderError(`Unexpected provider response (HTTP ${response.status}).`, false);
  if (data.ERROR?.length) {
    throw new ProviderError(data.ERROR[0]?.MESSAGE || "Provider returned an error.", true);
  }
  return data.SUCCESS;
}

export async function getProviderAccount() {
  const success = (await call("accountinfo")) as { AccountInfo?: { credit?: string; currency?: string; mail?: string } }[];
  return success?.[0]?.AccountInfo ?? null;
}

// ---------------------------------------------------------------------------
// Service sync
// ---------------------------------------------------------------------------

type ProviderService = {
  SERVICEID: number | string;
  SERVICETYPE?: string;
  SERVICENAME: string;
  CREDIT: number | string;
  TIME?: string;
  INFO?: string;
  CUSTOM?: { allow?: string; customname?: string };
  "Requires.Custom"?: { fieldname?: string }[] | Record<string, { fieldname?: string }>;
};
type ProviderGroup = { GROUPNAME: string; GROUPTYPE?: string; SERVICES?: Record<string, ProviderService> };

function salePrice(cost: ReturnType<typeof toMoney>) {
  const markup = toMoney(process.env.GSM_MARKUP_PERCENT || "20").div(100);
  const minProfit = toMoney(process.env.GSM_MIN_PROFIT || "0.50");
  const withMarkup = cost.times(markup.plus(1));
  const price = withMarkup.minus(cost).lt(minProfit) ? cost.plus(minProfit) : withMarkup;
  return price.toDecimalPlaces(2, 2 /* ROUND_CEIL */);
}

function categoryFor(groupType: string | undefined, name: string) {
  if (/rent/i.test(name)) return "TOOL_RENTAL";
  return groupType === "IMEI" ? "IMEI" : "SERVER_CREDIT";
}

function customFieldName(service: ProviderService) {
  const required = service["Requires.Custom"];
  const list = Array.isArray(required) ? required : required ? Object.values(required) : [];
  return list[0]?.fieldname || (service.CUSTOM?.allow === "1" ? service.CUSTOM.customname : undefined) || null;
}

const slugify = (value: string) =>
  value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 70);

export type SyncSummary = { created: number; updated: number; blocked: number; deactivated: number };

/** Imports/updates every allowed provider service. Blocked ones are never stored as active. */
export async function syncProviderServices(): Promise<SyncSummary> {
  const success = (await call("imeiservicelist")) as { LIST?: Record<string, ProviderGroup> }[];
  const groups = Object.values(success?.[0]?.LIST ?? {});
  const summary: SyncSummary = { created: 0, updated: 0, blocked: 0, deactivated: 0 };
  const seen = new Set<string>();
  const now = new Date();

  for (const group of groups) {
    for (const service of Object.values(group.SERVICES ?? {})) {
      const externalId = String(service.SERVICEID);
      const name = service.SERVICENAME?.trim();
      if (!name) continue;

      if (isBlockedService(name, group.GROUPNAME, service.INFO)) {
        summary.blocked += 1;
        continue; // Not marked as seen, so an existing copy gets deactivated below.
      }
      seen.add(externalId);

      const cost = toMoney(service.CREDIT || 0);
      const fieldName = customFieldName(service);
      const inputType = group.GROUPTYPE === "IMEI" || service.SERVICETYPE === "IMEI" ? "IMEI" : fieldName ? "USERNAME" : "NONE";
      const existing = await prisma.gsmService.findUnique({ where: { externalId } });

      if (existing) {
        await prisma.gsmService.update({
          where: { id: existing.id },
          data: {
            providerCost: cost,
            customFieldName: fieldName,
            inputType,
            estimatedTime: service.TIME || existing.estimatedTime,
            syncedAt: now,
            ...(existing.priceLocked ? {} : { price: salePrice(cost) }),
          },
        });
        summary.updated += 1;
      } else {
        await prisma.gsmService.create({
          data: {
            externalId,
            name: name.slice(0, 190),
            slug: `${slugify(name) || "service"}-${externalId}`,
            description: service.INFO?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 2000) || null,
            category: categoryFor(group.GROUPTYPE, name),
            provider: group.GROUPNAME?.slice(0, 120) || null,
            inputType,
            estimatedTime: service.TIME || "Instant",
            price: salePrice(cost),
            providerCost: cost,
            customFieldName: fieldName,
            status: "ACTIVE",
            syncedAt: now,
          },
        });
        summary.created += 1;
      }
    }
  }

  // Provider removed (or we blocked) a service: stop selling it.
  const stale = await prisma.gsmService.updateMany({
    where: { externalId: { not: null, notIn: [...seen] }, status: "ACTIVE" },
    data: { status: "INACTIVE" },
  });
  summary.deactivated = stale.count;
  return summary;
}

// ---------------------------------------------------------------------------
// Orders
// ---------------------------------------------------------------------------

/** Sends a paid order to the provider. Never throws: problems are stored on the order. */
export async function submitOrderToProvider(orderId: number) {
  const order = await prisma.gsmServiceOrder.findUnique({
    where: { id: orderId },
    include: { service: true },
  });
  if (!order || order.externalReference || order.status !== "PENDING" || !order.service.externalId) return;
  if (!isProviderConfigured()) return;

  const parameters: Record<string, string | number> = { ID: order.service.externalId };
  if (order.imei) parameters.IMEI = decryptSensitiveValue(order.imei);
  if (order.accountUsername && order.service.customFieldName) {
    parameters.CUSTOMFIELD = Buffer.from(
      JSON.stringify({ [order.service.customFieldName]: order.accountUsername }),
    ).toString("base64");
  }

  try {
    const success = (await call("placeimeiorder", parameters)) as { REFERENCEID?: number | string }[];
    const reference = success?.[0]?.REFERENCEID;
    if (reference === undefined || reference === null) {
      throw new ProviderError("Provider accepted the order without a reference.", false);
    }
    await prisma.gsmServiceOrder.update({
      where: { id: order.id },
      data: { externalReference: String(reference), status: "PROCESSING", submitError: null, lastCheckedAt: new Date() },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown provider error.";
    const insufficientProviderBalance = /balance|credit/i.test(message);
    if (error instanceof ProviderError && error.rejected && !insufficientProviderBalance) {
      await rejectAndRefund(order.id, `Provider refused the order: ${message}`);
      return;
    }
    // Ambiguous failure or our provider balance is too low: keep the customer's
    // order pending so an admin can retry instead of risking a duplicate order.
    await prisma.gsmServiceOrder.update({
      where: { id: order.id },
      data: { submitError: message.slice(0, 500) },
    });
  }
}

const POLL_INTERVAL_MS = 2 * 60 * 1000;

/** Checks provider status for processing orders; throttled per order. */
export async function refreshProviderOrders(where: { userId?: string } = {}, limit = 20) {
  if (!isProviderConfigured()) return;
  const due = await prisma.gsmServiceOrder.findMany({
    where: {
      ...where,
      status: "PROCESSING",
      externalReference: { not: null },
      OR: [{ lastCheckedAt: null }, { lastCheckedAt: { lt: new Date(Date.now() - POLL_INTERVAL_MS) } }],
    },
    orderBy: { lastCheckedAt: "asc" },
    take: limit,
    select: { id: true, externalReference: true },
  });

  for (const order of due) {
    try {
      const success = (await call("getimeiorder", { ID: order.externalReference! })) as { STATUS?: number | string; CODE?: string }[];
      const status = Number(success?.[0]?.STATUS);
      const code = (success?.[0]?.CODE ?? "").toString().replace(/<br\s*\/?>/gi, "\n").replace(/<[^>]+>/g, "").trim();

      if (status === 4) {
        const done = await prisma.gsmServiceOrder.updateMany({
          where: { id: order.id, status: "PROCESSING" },
          data: { status: "COMPLETED", result: code.slice(0, 2000) || "Completed", lastCheckedAt: new Date() },
        });
        if (done.count === 1) await notifyCustomer(order.id);
      } else if (status === 3) {
        await rejectAndRefund(order.id, code || "Rejected by provider.");
      } else {
        await prisma.gsmServiceOrder.update({ where: { id: order.id }, data: { lastCheckedAt: new Date() } });
      }
    } catch (error) {
      await prisma.gsmServiceOrder.update({ where: { id: order.id }, data: { lastCheckedAt: new Date() } });
      console.error("GSM provider status check failed.", { orderId: order.id, error: String(error) });
    }
  }
}

/** Rejects an unfinished order and returns the customer's money exactly once. */
async function rejectAndRefund(orderId: number, reason: string) {
  const refunded = await prisma.$transaction(async (tx) => {
    const order = await tx.gsmServiceOrder.findUnique({ where: { id: orderId }, include: { service: { select: { name: true } } } });
    if (!order) return false;
    const claim = await tx.gsmServiceOrder.updateMany({
      where: { id: orderId, refundedAt: null, status: { in: ["PENDING", "PROCESSING"] } },
      data: { status: "REJECTED", result: reason.slice(0, 2000), refundedAt: new Date(), lastCheckedAt: new Date() },
    });
    if (claim.count !== 1) return false;
    await creditWallet(tx, {
      userId: order.userId,
      currency: PRICING_CURRENCY.gsmService,
      amount: order.price,
      type: "REFUND",
      description: `Refund for GSM service order #${order.id}: ${order.service.name}`,
      referenceType: "GSM_SERVICE_ORDER",
      referenceId: String(order.id),
    });
    return true;
  });
  if (refunded) await notifyCustomer(orderId);
}

async function notifyCustomer(orderId: number) {
  const order = await prisma.gsmServiceOrder.findUnique({
    where: { id: orderId },
    select: { status: true, result: true, price: true, currency: true, user: { select: { email: true } }, service: { select: { name: true } } },
  });
  if (!order) return;
  const lines = order.status === "COMPLETED"
    ? [`Your GSM order #${orderId} (${order.service.name}) is completed.`, ...(order.result ? [`Result: ${order.result}`] : [])]
    : [`Your GSM order #${orderId} (${order.service.name}) was rejected. ${formatMoney(order.price, order.currency)} was returned to your balance.`, ...(order.result ? [`Reason: ${order.result}`] : [])];
  await notify({
    to: order.user.email,
    subject: `GSM order #${orderId}: ${order.status}`,
    text: `${lines.join("\n")}\n${siteUrl()}/account/services`,
    html: emailHtml(lines, { label: "View my orders", url: `${siteUrl()}/account/services` }),
  });
}
