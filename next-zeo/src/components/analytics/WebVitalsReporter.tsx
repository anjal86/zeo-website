"use client";

import { useReportWebVitals } from 'next/web-vitals';
import { trackEvent } from '../../lib/analytics';

const CORE_WEB_VITALS = new Set(['CLS', 'FCP', 'INP', 'LCP', 'TTFB']);

export default function WebVitalsReporter() {
  useReportWebVitals((metric) => {
    if (!CORE_WEB_VITALS.has(metric.name)) return;

    const value = metric.name === 'CLS' ? Math.round(metric.value * 1000) : Math.round(metric.value);

    trackEvent({
      action: `web_vital_${metric.name.toLowerCase()}`,
      category: 'performance',
      label: metric.rating,
      value,
      nonInteraction: true,
    });
  });

  return null;
}
