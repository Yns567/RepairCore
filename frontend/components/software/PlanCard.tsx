import { getT } from "@/lib/i18n/server";
import SubscribeButton from "./SubscribeButton";

type PlanCardProps = {
  id: number;
  name: string;
  softwareName: string;
  description: string | null;
  price: string;
  billingPeriod: string;
  isRental: boolean;
};

export default async function PlanCard({
  id,
  name,
  softwareName,
  description,
  price,
  billingPeriod,
  isRental,
}: PlanCardProps) {
  const { t, tKey } = await getT();
  return (
    <div className="flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#111827] p-6 shadow-lg transition-all hover:-translate-y-1 hover:border-blue-500">
      <div>
        <div className="flex items-center justify-between">
          <span className="rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white">
            {softwareName}
          </span>
          {isRental && (
            <span className="rounded-full bg-amber-600 px-3 py-1 text-xs font-semibold text-white">
              {t("software.rental")}
            </span>
          )}
        </div>

        <h3 className="mt-4 text-xl font-bold text-white">{name}</h3>

        {description && (
          <p className="mt-2 text-sm text-slate-400">{description}</p>
        )}
      </div>

      <div className="mt-6">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-blue-400" dir="ltr">${price}</span>
          <span className="text-sm text-slate-500">
            / {tKey(`period.${billingPeriod}`, billingPeriod)}
          </span>
        </div>

        <SubscribeButton planId={id} />
      </div>
    </div>
  );
}
