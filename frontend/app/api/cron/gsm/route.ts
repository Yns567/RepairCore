import { timingSafeEqual } from "crypto";
import { refreshProviderOrders, syncProviderServices } from "@/lib/gsm-provider";

export const maxDuration = 60;

// Called by Vercel Cron or an external scheduler (e.g. cron-job.org) with
// `Authorization: Bearer <CRON_SECRET>`. Add `?sync=1` to also refresh prices.
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const provided = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  if (!secret || provided.length !== secret.length || !timingSafeEqual(Buffer.from(provided), Buffer.from(secret))) {
    return new Response("Unauthorized", { status: 401 });
  }

  await refreshProviderOrders({}, 40);
  const summary = new URL(request.url).searchParams.get("sync") === "1" ? await syncProviderServices() : null;
  return Response.json({ ok: true, summary });
}
