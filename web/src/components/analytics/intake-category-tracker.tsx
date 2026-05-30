"use client";

import { useEffect, useRef } from "react";
import { trackClientEvent } from "@/lib/analytics/track-client-event";

/** Fires once when the user reaches intake step 2 for a category. */
export function IntakeCategoryTracker({ category }: { category: string }) {
  const tracked = useRef(false);

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;
    trackClientEvent({ name: "intake_category_viewed", data: { category } });
  }, [category]);

  return null;
}
