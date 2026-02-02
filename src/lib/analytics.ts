import { supabase } from "@/integrations/supabase/client";

export type AnalyticsEventName =
  | "screen_view"
  | "study_complete"
  | "notification_enabled"
  | "subscription_start";

interface AnalyticsEventPayload {
  event_name: AnalyticsEventName;
  properties?: Record<string, unknown>;
  user_id: string;
}

// Phase 5: fire-and-forget analytics for authenticated users only.
export const trackEvent = async ({
  event_name,
  properties = {},
  user_id,
}: AnalyticsEventPayload) => {
  try {
    await supabase.from("analytics_events").insert({
      event_name,
      properties,
      user_id,
    });
  } catch (error) {
    // Keep analytics failures from breaking UX.
  }
};
