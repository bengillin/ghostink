"use client";

import { useState } from "react";
import type { Attribution, Contributor } from "@/lib/chronicle";

interface AttributionBarProps {
  attribution: Attribution;
  showLegend?: boolean;
}

export function AttributionBar({ attribution, showLegend = true }: AttributionBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { contributors, totalCharacters } = attribution;

  // Ensure we have at least one contributor to display
  const displayContributors = contributors.length > 0 ? contributors : [{
    id: 'user',
    type: 'human' as const,
    name: 'You',
    color: '#34d399',
    characters: 0,
    percentage: 100,
  }];

  return (
    <div className="space-y-2">
      {/* Progress bar */}
      <div
        className="attribution-bar flex cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
        title="Click to expand"
      >
        {displayContributors.map((contributor, index) => (
          <div
            key={contributor.id}
            className="h-full transition-all duration-300 first:rounded-l last:rounded-r"
            style={{
              width: `${Math.max(contributor.percentage, 0.5)}%`,
              backgroundColor: contributor.color,
              marginLeft: index > 0 ? '1px' : 0,
            }}
            title={`${contributor.name}: ${contributor.percentage.toFixed(1)}%`}
          />
        ))}
      </div>

      {/* Legend - compact or expanded */}
      {showLegend && (
        <div className={`flex flex-wrap gap-x-4 gap-y-1 text-xs transition-all ${isExpanded ? 'py-2' : ''}`}>
          {displayContributors.map((contributor) => (
            <ContributorBadge
              key={contributor.id}
              contributor={contributor}
              expanded={isExpanded}
              totalCharacters={totalCharacters}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface ContributorBadgeProps {
  contributor: Contributor;
  expanded: boolean;
  totalCharacters: number;
}

function ContributorBadge({ contributor, expanded, totalCharacters }: ContributorBadgeProps) {
  const { name, color, percentage, characters, type } = contributor;

  return (
    <div className="flex items-center gap-1.5">
      {/* Color dot */}
      <span
        className="w-2 h-2 rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Name and percentage */}
      <span className="text-ghost-muted">
        {name}
      </span>
      <span className="text-ghost-text font-medium">
        {percentage.toFixed(0)}%
      </span>

      {/* Expanded details */}
      {expanded && (
        <span className="text-ghost-muted">
          ({characters.toLocaleString()} chars)
          {type === 'mask' && <span className="ml-1 text-ghost-accent">AI</span>}
        </span>
      )}
    </div>
  );
}

// Compact version for inline display
export function AttributionInline({ attribution }: { attribution: Attribution }) {
  const { contributors } = attribution;

  const humans = contributors.filter(c => c.type === 'human');
  const masks = contributors.filter(c => c.type === 'mask');

  const humanPercent = humans.reduce((sum, c) => sum + c.percentage, 0);
  const maskPercent = masks.reduce((sum, c) => sum + c.percentage, 0);

  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-ghost-human" />
        <span className="text-ghost-muted">You</span>
        <span className="text-ghost-text">{humanPercent.toFixed(0)}%</span>
      </span>

      {masks.map(mask => (
        <span key={mask.id} className="flex items-center gap-1">
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: mask.color }}
          />
          <span className="text-ghost-muted">{mask.name}</span>
          <span className="text-ghost-text">{mask.percentage.toFixed(0)}%</span>
        </span>
      ))}
    </div>
  );
}

// Full breakdown panel (for detailed view)
export function AttributionPanel({ attribution }: { attribution: Attribution }) {
  const { contributors, totalCharacters } = attribution;

  return (
    <div className="panel p-4 space-y-4">
      <div className="panel-header -mx-4 -mt-4 mb-4">Attribution</div>

      {/* Main bar */}
      <div className="space-y-3">
        <div className="attribution-bar h-6 flex rounded-lg overflow-hidden">
          {contributors.map((contributor, index) => (
            <div
              key={contributor.id}
              className="h-full flex items-center justify-center text-xs font-medium text-white transition-all duration-300"
              style={{
                width: `${Math.max(contributor.percentage, 2)}%`,
                backgroundColor: contributor.color,
              }}
            >
              {contributor.percentage >= 10 && `${contributor.percentage.toFixed(0)}%`}
            </div>
          ))}
        </div>

        <p className="text-xs text-ghost-muted text-center">
          {totalCharacters.toLocaleString()} total characters
        </p>
      </div>

      {/* Detailed breakdown */}
      <div className="space-y-2">
        {contributors.map((contributor) => (
          <div
            key={contributor.id}
            className="flex items-center justify-between p-2 rounded bg-ghost-surface"
          >
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: contributor.color }}
              />
              <span className="font-medium">{contributor.name}</span>
              {contributor.type === 'mask' && (
                <span className="text-xs px-1.5 py-0.5 rounded bg-ghost-accent/20 text-ghost-accent">
                  AI
                </span>
              )}
            </div>
            <div className="text-right">
              <div className="font-medium">{contributor.percentage.toFixed(1)}%</div>
              <div className="text-xs text-ghost-muted">
                {contributor.characters.toLocaleString()} chars
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
