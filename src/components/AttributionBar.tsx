"use client";

import type { Attribution } from "@/lib/chronicle";

interface AttributionBarProps {
  attribution: Attribution;
}

export function AttributionBar({ attribution }: AttributionBarProps) {
  const { humanPercentage, maskContributions } = attribution;

  return (
    <div className="attribution-bar flex">
      {/* Human portion */}
      <div
        className="attribution-human transition-all duration-300"
        style={{ width: `${humanPercentage}%` }}
        title={`You: ${humanPercentage.toFixed(1)}%`}
      />

      {/* Mask portions */}
      {maskContributions.map((mask) => (
        <div
          key={mask.maskId}
          className="attribution-mask transition-all duration-300"
          style={{ width: `${mask.percentage}%` }}
          title={`${mask.maskId}: ${mask.percentage.toFixed(1)}%`}
        />
      ))}
    </div>
  );
}
