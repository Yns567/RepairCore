import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getWallet } from "@/lib/wallet";

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user;
  const userId = user?.id;

  if (!user || !userId) {
    redirect("/login?next=/account");
  }

  const [orderCount, subscriptionCount, activeSubscriptionCount, serviceOrderCount, wallet] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.subscription.count({ where: { userId } }),
    prisma.subscription.count({
      where: { userId, status: "ACTIVE", endDate: { gt: new Date() } },
    }),
    prisma.gsmServiceOrder.count({ where: { userId } }),
    getWallet(userId),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm font-semibold text-blue-400">MY ACCOUNT</p>
      <h1 className="mt-2 text-3xl font-bold text-white">
        Welcome{user.name ? `, ${user.name}` : ""}
      </h1>
      <p className="mt-2 text-slate-400">Manage your orders, software access, and learning purchases.</p>

      <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <AccountStat label="Orders" value={orderCount} detail="View purchase history" href="/orders" />
        <AccountStat label="Software plans" value={subscriptionCount} detail={`${activeSubscriptionCount} currently active`} href="/account/subscriptions" />
        <AccountStat label="GSM services" value={serviceOrderCount} detail="Track service requests" href="/account/services" />
        <AccountStat label="Learning" value="Courses" detail="Continue learning and enroll" href="/lerning" />
        <AccountStat label="Store balance" value={`${wallet.balance.toString()} ${wallet.currency}`} detail="View balance history" href="/account/wallet" />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <p className="text-sm text-slate-400">Signed in as</p>
        <p className="mt-1 font-semibold text-white">{user.email}</p>
      </div>
    </main>
  );
}

function AccountStat({ label, value, detail, href }: { label: string; value: number | string; detail: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-slate-800 bg-[#111827] p-6 transition hover:-translate-y-0.5 hover:border-blue-500">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      <p className="mt-3 text-sm text-blue-400">{detail} →</p>
    </Link>
  );
}
