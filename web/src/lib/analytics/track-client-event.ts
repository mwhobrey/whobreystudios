"use client";

import { track } from "@vercel/analytics";

/** Custom events for funnel / product metrics — no PII in payloads. */
export type ClientAnalyticsEvent =
  | { name: "intake_category_viewed"; data: { category: string } }
  | { name: "intake_submitted"; data: { category: string; mode: "guest" | "client" } }
  | {
      name: "landing_card_clicked";
      data: { card: "services" | "shop" | "client_portal" | "new_project" };
    };

export function trackClientEvent(event: ClientAnalyticsEvent) {
  track(event.name, event.data);
}
