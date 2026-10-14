import * as CookieConsent from "vanilla-cookieconsent";
import "vanilla-cookieconsent/dist/cookieconsent.css";
import { hasAnalyticsConsent, policy } from "./sitePolicy";
import { loadKpis, isKpisConfigured } from "./kpis";

export const hasConsentSettings = hasAnalyticsConsent && isKpisConfigured;

export async function initializeConsent(): Promise<void> {
  if (!hasConsentSettings) return;
  await CookieConsent.run({
    mode: "opt-in",
    revision: policy.revision,
    hideFromBots: false,
    cookie: { name: "site_consent", expiresAfterDays: 180 },
    guiOptions: {
      consentModal: {
        layout: "bar",
        position: "bottom",
        equalWeightButtons: true,
      },
      preferencesModal: { equalWeightButtons: true },
    },
    categories: { necessary: { enabled: true, readOnly: true }, analytics: {} },
    onConsent: () => {
      if (CookieConsent.acceptedCategory("analytics")) loadKpis();
    },
    onChange: ({ changedCategories }) => {
      if (!changedCategories.includes("analytics")) return;
      // Reload discards the tracker's event listeners, timers and SPA hooks.
      // Umami checks this local opt-out flag before any further collection.
      if (!CookieConsent.acceptedCategory("analytics")) {
        try {
          window.localStorage.setItem("umami.disabled", "1");
        } finally {
          window.location.reload();
        }
      } else loadKpis();
    },
    language: {
      default: "en",
      translations: {
        en: {
          consentModal: {
            title: "Your privacy choices",
            description:
              "With your permission, we use self-hosted Umami to measure page views and interactions. Optional analytics stays off until you agree. Your choice is saved for 180 days.",
            acceptAllBtn: "Accept analytics",
            acceptNecessaryBtn: "Reject analytics",
            showPreferencesBtn: "Preferences",
            footer:
              '<a href="/impressum">Impressum</a><a href="/privacy">Privacy policy</a>',
          },
          preferencesModal: {
            title: "Privacy preferences",
            acceptAllBtn: "Accept analytics",
            acceptNecessaryBtn: "Reject analytics",
            savePreferencesBtn: "Save preferences",
            closeIconLabel: "Close",
            sections: [
              {
                title: "Necessary",
                description:
                  "Saves your privacy choice. Login and security cookies are used when needed for authentication.",
                linkedCategory: "necessary",
              },
              {
                title: "Analytics",
                description:
                  "Optional self-hosted Umami measures page views and interactions. You can withdraw permission here at any time. Withdrawing reloads this page to stop the tracker.",
                linkedCategory: "analytics",
              },
              {
                title: "More information",
                description: '<a href="/privacy">Privacy policy</a>',
              },
            ],
          },
        },
      },
    },
  });
}

export function showConsentSettings(): void {
  if (hasConsentSettings) CookieConsent.showPreferences();
}
