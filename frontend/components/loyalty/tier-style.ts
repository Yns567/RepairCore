import { Award, Crown, Gem, Medal } from "lucide-react";

export type TierId = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

/** Colors and icon of each loyalty level, shared by the card, the stack and the level list. */
export const tierStyles: Record<TierId, { card: string; chip: string; icon: typeof Medal }> = {
  BRONZE: {
    card: "from-[#5c2c12] via-[#b26a33] to-[#3b1a08]",
    chip: "border-orange-500/30 bg-orange-500/10 text-orange-300",
    icon: Medal,
  },
  SILVER: {
    card: "from-[#334155] via-[#8a9bb3] to-[#1e293b]",
    chip: "border-slate-400/30 bg-slate-400/10 text-slate-200",
    icon: Award,
  },
  GOLD: {
    card: "from-[#713f12] via-[#d4a017] to-[#5a3410]",
    chip: "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
    icon: Crown,
  },
  PLATINUM: {
    card: "from-[#1e1b4b] via-[#0891b2] to-[#312e81]",
    chip: "border-cyan-500/30 bg-cyan-500/10 text-cyan-300",
    icon: Gem,
  },
};
