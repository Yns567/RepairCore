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
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-6 md:py-12">
      <p className="text-sm font-semibold text-blue-400">{t("account.kicker")}</p>
      <h1 className="mt-2 text-2xl font-bold md:text-3xl text-white">
        {user.name ? t("account.welcomeName", { name: user.name }) : t("account.welcome")}
      </h1>
      <p className="mt-2 text-slate-400">{t("account.subtitle")}</p>

      <div className="mt-6 grid grid-cols-2 gap-3 md:mt-9 md:gap-5 xl:grid-cols-5">
        <AccountStat className="col-span-2 xl:col-span-1" label={t("account.balance")} value={wallets.map((wallet) => formatMoney(wallet.balance, wallet.currency)).join(" · ")} detail={t("account.balanceDetail")} href="/account/wallet" />
        <AccountStat label={t("account.orders")} value={orderCount} detail={t("account.ordersDetail")} href="/orders" />
        <AccountStat label={t("account.services")} value={serviceOrderCount} detail={t("account.servicesDetail")} href="/account/services" />
        <AccountStat label={t("account.plans")} value={subscriptionCount} detail={t("account.plansDetail", { count: activeSubscriptionCount })} href="/account/subscriptions" />
        <AccountStat label={t("account.learning")} value={t("account.learningValue")} detail={t("account.learningDetail")} href="/learning" />
      </div>

      <div className="mt-8 rounded-2xl border border-slate-800 bg-[#111827] p-6">
        <p className="text-sm text-slate-400">{t("account.signedInAs")}</p>
        <p className="mt-1 font-semibold text-white">{user.email}</p>
      </div>
    </main>
  );
}

function AccountStat({ label, value, detail, href, className = "" }: { label: string; value: number | string; detail: string; href: string; className?: string }) {
  return (
    <Link href={href} className={`rounded-xl border border-slate-800 bg-[#111827] p-4 transition hover:-translate-y-0.5 hover:border-blue-500 md:rounded-2xl md:p-6 ${className}`}>
      <p className="text-xs text-slate-400 md:text-sm">{label}</p>
      <p className="mt-1.5 text-xl font-bold text-white md:mt-2 md:text-3xl" dir="auto">{value}</p>
      <p className="mt-2 text-xs text-blue-400 md:mt-3 md:text-sm">{detail}</p>
    </Link>
  );
}
