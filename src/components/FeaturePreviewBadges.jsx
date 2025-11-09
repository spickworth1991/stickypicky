"use client";

import LiveBadge from "@/components/LiveBadge";

export default function FeaturePreviewBadges() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <LiveBadge keyName="views"   label="Views"   color="#22d3ee" />
      <LiveBadge keyName="orders"  label="Orders"  color="#34d399" />
      <LiveBadge keyName="signups" label="Signups" color="#a78bfa" />
    </div>
  );
}
