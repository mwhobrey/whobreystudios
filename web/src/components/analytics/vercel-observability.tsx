"use client";

import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

/**
 * Vercel Web Analytics + Speed Insights.
 * Active on Vercel deployments; inert locally (no extra config required).
 * Enable both products in the Vercel project dashboard after deploy.
 */
export function VercelObservability() {
  return (
    <>
      <Analytics />
      <SpeedInsights />
    </>
  );
}
