import { Building2, Handshake, Link2, Megaphone, type LucideIcon } from "lucide-react";
import type { Icon3DName } from "@/components/brand/icon-3d";
import type { MarketCategory } from "@/lib/types";
import type { PartnerKind } from "./filter-params";

export type CategoryConfig = {
  icon: LucideIcon;
  /** Illustrated 3D icon for tiles and headers. */
  icon3d: Icon3DName;
  description: string;
  /** Directory searched on the "Partners" tab. */
  partnerKind: PartnerKind;
  partnerLabel: string;
  partnerNoun: [singular: string, plural: string];
  partnerDescription: string;
  /** Defaults applied to partner filters when the param is absent. */
  partnerDefaults?: Record<string, string>;
};

export const CATEGORY_CONFIG: Record<MarketCategory, CategoryConfig> = {
  sales: {
    icon: Handshake,
    icon3d: "delivery_truck",
    description:
      "Connect with businesses looking for sales representatives, agents, and distributors across different regions.",
    partnerKind: "sales",
    partnerLabel: "Sales partners",
    partnerNoun: ["sales partner", "sales partners"],
    partnerDescription: "Independent reps, sales agents and regional distributors.",
  },
  affiliate: {
    icon: Link2,
    icon3d: "link",
    description: "Discover affiliate programs and collaborate with brands through performance-based marketing.",
    partnerKind: "creator",
    partnerLabel: "Affiliate marketers",
    partnerNoun: ["affiliate marketer", "affiliate marketers"],
    partnerDescription: "Creators who promote products for a commission.",
    partnerDefaults: { creatorType: "Affiliate Marketer" },
  },
  kol: {
    icon: Megaphone,
    icon3d: "megaphone",
    description: "Find brands, paid campaigns, and content collaboration opportunities.",
    partnerKind: "creator",
    partnerLabel: "Creators & KOLs",
    partnerNoun: ["creator", "creators"],
    partnerDescription: "Influencers, UGC creators and product reviewers.",
  },
  agency: {
    icon: Building2,
    icon3d: "busts_in_silhouette",
    description:
      "Partner with agencies that run campaigns, manage creator rosters, and supply sales teams, or find brands looking for agency support.",
    partnerKind: "agency",
    partnerLabel: "Agencies",
    partnerNoun: ["agency", "agencies"],
    partnerDescription: "Influencer, digital, sales outsourcing and affiliate agencies.",
  },
};

export const CATEGORY_ORDER: MarketCategory[] = ["sales", "affiliate", "kol", "agency"];
