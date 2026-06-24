import posthog from "posthog-js";

export function identifyUser(
  userId: string,
  traits?: Record<string, unknown>
) {
  posthog.identify(userId, traits);
}

export function captureEvent(
  event: string,
  properties?: Record<string, unknown>
) {
  posthog.capture(event, properties);
}

export function captureException(
  error: unknown,
  properties?: Record<string, unknown>
) {
  posthog.captureException(error, properties);
}
