import { acceptedCategory, validConsent } from "vanilla-cookieconsent";
import { hasAnalyticsConsent } from "./sitePolicy";

declare global {
  interface Window {
    KPIS_SCRIPT_URL?: string;
    KPIS_WEBSITE_ID?: string;
  }
}

export const isKpisConfigured = Boolean(
  window.KPIS_SCRIPT_URL && window.KPIS_WEBSITE_ID,
);

export function loadKpis(): void {
  if (
    !hasAnalyticsConsent ||
    !validConsent() ||
    !acceptedCategory("analytics") ||
    !isKpisConfigured ||
    navigator.doNotTrack === "1" ||
    document.querySelector("script[data-website-id]")
  )
    return;
  window.localStorage.removeItem("umami.disabled");
  const script = document.createElement("script");
  script.defer = true;
  script.src = window.KPIS_SCRIPT_URL!;
  script.dataset.websiteId = window.KPIS_WEBSITE_ID!;
  script.dataset.doNotTrack = "true";
  document.head.appendChild(script);
}
