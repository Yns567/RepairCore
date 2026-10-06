import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { getT } from "@/lib/i18n/server";
import { formatMoney } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { getWallets } from "@/lib/wallet";

export default async function AccountPage() {
  const session = await auth();
  const user = session?.user;
  const userId = user?.id;

  if (!user || !userId) {
    redirect("/login?next=/account");
  }

  const [orderCount, subscriptionCount, activeSubscriptionCount, serviceOrderCount, wallets, { t }] = await Promise.all([
    prisma.order.count({ where: { userId } }),
    prisma.subscription.count({ where: { userId } }),
    prisma.subscription.count({
      where: { userId, status: "ACTIVE", endDate: { gt: new Date() } },
    }),
    prisma.gsmServiceOrder.count({ where: { userId } }),
    getWallets(userId),
    getT(),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <p className="text-sm font-semibold text-blue-400">{t("account.kicker")}</p>
      <h1 className="mt-2 text-3xl font-bold text-white">
        {user.name ? t("account.welcomeName", { name: user.name }) : t("account.welcome")}
      </h1>
      <p className="mt-2 text-slate-400">{t("account.subtitle")}</p>

      <div className="mt-9 grid gap-5 sm:grid-cols-2 xl:grid-cols-5">
        <AccountStat label={t("account.orders")} value={orderCount} detail={t("account.ordersDetail")} href="/orders" />
        <AccountStat label={t("account.plans")} value={subscriptionCount} detail={t("account.plansDetail", { count: activeSubscriptionCount })} href="/account/subscriptions" />
        <AccountStat label={t("account.services")} value={serviceOrderCount} detail={t("account.servicesDetail")} href="/account/services" />
        <AccountStat label={t("account.learning")} value={t("account.learningValue")} detail={t("account.learningDetail")} href="/learning" />
        <AccountStat label={t("account.balance")} value={wallets.map((wallet) => formatMoney(wallet.balance, wallet.currency)).join(" · ")} detail={t("account.balanceDetail")} href="/account/wallet" />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <p className="text-sm text-slate-400">{t("account.signedInAs")}</p>
        <p className="mt-1 font-semibold text-white">{user.email}</p>
      </div>
    </main>
  );
}

function AccountStat({ label, value, detail, href }: { label: string; value: number | string; detail: string; href: string }) {
  return (
    <Link href={href} className="rounded-2xl border border-slate-800 bg-[#111827] p-6 transition hover:-translate-y-0.5 hover:border-blue-500">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-white" dir="auto">{value}</p>
      <p className="mt-3 text-sm text-blue-400">{detail}</p>
    </Link>
  );
}
