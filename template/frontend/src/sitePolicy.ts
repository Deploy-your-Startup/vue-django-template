import policy from "./data/site-policy.json";

export { policy };
export const isPolicyReady =
  policy.reviewed === true &&
  Number.isInteger(policy.revision) &&
  policy.revision > 0 &&
  [
    policy.operatorName,
    policy.operatorAddress,
    policy.contactEmail,
    policy.privacyNotice,
  ].every((value) => value.trim().length > 0);
export const hasAnalyticsConsent =
  policy.analytics === "consent" && isPolicyReady;
