export type AnalyticsEvent = {
  action: string;
  category: 'engagement' | 'conversion' | 'performance';
  label?: string;
  value?: number;
  nonInteraction?: boolean;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function trackEvent({ action, category, label, value, nonInteraction }: AnalyticsEvent) {
  if (typeof window === 'undefined' || typeof window.gtag !== 'function') return;

  window.gtag('event', action, {
    event_category: category,
    event_label: label,
    value,
    non_interaction: nonInteraction,
  });
}
