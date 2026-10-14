# Public legal information and privacy

Edit `frontend/src/data/site-policy.json` with publication-approved operator data. Never copy a private
address from unrelated sources. `operatorName`, `operatorAddress`, `contactEmail`,
`additionalImprint` and `privacyNotice` are rendered as text, not HTML.
The notice must describe this project's actual hosting/logging, contact handling,
authentication, analytics and other providers: purposes, legal bases, recipients,
transfers, retention, rights and complaint/contact routes. A generic placeholder
is not a reviewed notice. Confirm applicable operator/register details.

Set `reviewed: true` only after reviewing the complete configuration. Draft pages
remain explicitly labelled. Run `startup doctor --project-dir .` with a CLI
revision supporting site policies. This checks configuration presence and types;
it does not certify legal compliance or verify production behaviour.

`startup bootstrap --site-policy /absolute/path/to/operator.json` can install a
reviewed public configuration with compatible CLI/template revisions. Existing
operator policy files are preserved by Copier updates. No additional account is
needed. Template updates do not deploy, and shared deployment sync does not add
these application files.

## Analytics and consent

CookieConsent by Orest Bida (`vanilla-cookieconsent` 3.1.0, MIT) ships in the
application bundle, with its CSS. No hosted CMP, CDN request or account is needed.
Use `analytics: "off"` to disable optional tracking. `analytics: "consent"` still
requires complete reviewed disclosures and both Umami runtime values.
The default is off; no banner is necessary when optional analytics is unavailable.
Never insert a second tracker directly into HTML or bypass `loadKpis`.

When available, accept/reject have equal prominence, and the footer opens
preferences. Choice is stored in `site_consent` for 180 days. Withdrawal sets
Umami's local `umami.disabled` flag and reloads to discard registered listeners.
Reacceptance clears that flag. Already transmitted data is not deleted by
withdrawal. Do Not Track blocks loading even after consent. Increment `revision`
when purposes or consent-relevant processing change.

## Verification

`mise run e2e:privacy` runs real browser/application integration on disposable
frontend copies, with synthetic public operator data. Only the external Umami
service is replaced by a local script/collector boundary. Cases cover initial
blocking, rejection and persistence, acceptance and persistence, withdrawal,
Do Not Track, public legal links, disabled analytics and unreviewed policies.
The normal full-stack E2E suite retains application/funnel checks.

Remaining checks: actual deployed Umami collection/retention and provider
configuration, live HTTPS cookie attributes, mobile/assistive-technology review,
and operator-specific legal completeness. A local stand-in does not prove the
production Umami service's behaviour.
