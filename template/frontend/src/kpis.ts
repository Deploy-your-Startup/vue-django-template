declare global {
  interface Window {
    KPIS_SCRIPT_URL?: string;
    KPIS_WEBSITE_ID?: string;
  }
}

export function loadKpis(): void {
  if (
    !window.KPIS_SCRIPT_URL ||
    !window.KPIS_WEBSITE_ID ||
    document.querySelector("script[data-website-id]")
  )
    return;
  const script = document.createElement("script");
  script.defer = true;
  script.src = window.KPIS_SCRIPT_URL;
  script.dataset.websiteId = window.KPIS_WEBSITE_ID;
  script.dataset.doNotTrack = "true";
  document.head.appendChild(script);
}
