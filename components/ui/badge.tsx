import * as React from "react";
import { cn } from "@/lib/utils";

export type StateType =
  | "DRAFT"
  | "AUTHORIZED"
  | "HELD"
  | "DELIVERED"
  | "REVISION_REQUESTED"
  | "DISPUTED"
  | "SETTLED";

export type ReliabilityTier = "TRUSTED" | "GOOD" | "FAIR" | "CAUTION" | "NEW";

export interface StateBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  state: StateType;
}

export function StateBadge({ state, className, ...props }: StateBadgeProps) {
  const getBadgeStyles = (state: StateType) => {
    switch (state) {
      case "DRAFT":
        return "bg-[#F5F2ED] text-[#1C1C1C]";
      case "AUTHORIZED":
      case "HELD":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-orange-100 text-orange-800";
      case "REVISION_REQUESTED":
        return "bg-yellow-100 text-yellow-800";
      case "DISPUTED":
        return "bg-red-100 text-red-800";
      case "SETTLED":
        return "bg-green-100 text-green-800";
      default:
        return "bg-[#F5F2ED] text-[#1C1C1C]";
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider",
        getBadgeStyles(state),
        className
      )}
      {...props}
    >
      {state.replace("_", " ")}
    </div>
  );
}

export interface ReliabilityBadgeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  tier: ReliabilityTier;
}

export function ReliabilityBadge({
  tier,
  className,
  ...props
}: ReliabilityBadgeProps) {
  const getValidationStyles = (tier: ReliabilityTier) => {
    switch (tier) {
      case "TRUSTED":
        return "bg-green-100 text-green-800";
      case "GOOD":
        return "bg-blue-100 text-blue-800";
      case "FAIR":
        return "bg-yellow-100 text-yellow-800";
      case "CAUTION":
        return "bg-orange-100 text-orange-800";
      case "NEW":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTooltipTitle = (tier: ReliabilityTier) => {
    switch (tier) {
      case "TRUSTED":
        return "Consistently high delivery success rate and positive feedback.";
      case "GOOD":
        return "Solid transaction history with minimal issues.";
      case "FAIR":
        return "Average reliability; some issues or revisions in the past.";
      case "CAUTION":
        return "Noticeable history of revisions or disputes. Proceed with care.";
      case "NEW":
        return "No sufficient transaction history yet.";
      default:
        return "";
    }
  };

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium uppercase tracking-wider cursor-help",
        getValidationStyles(tier),
        className
      )}
      title={getTooltipTitle(tier)}
      {...props}
    >
      {tier}
    </div>
  );
}
