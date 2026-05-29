# CISA Secure Software Self-Attestation in 90 days

> Week-by-week playbook for federal contractors and their suppliers to satisfy OMB M-22-18 + M-23-16 attestation under the NIST Secure Software Development Framework (SSDF, SP 800-218). Three phases, twelve named gates, the SBOM + provenance substrate, and the diagnostic to re-run at week 13.
>
> Source: https://hellouchit.com/playbooks/cisa-attestation-90-days.html
> Author: Uchit Vyas — hellouchit.com
> License: free to read and cite with attribution

---

# CISA secure-software _self-attestation_, in 90 days.

If you sell software to a US federal agency — directly or through a prime — the CISA attestation form is a contract gate. Skip it and the procurement pauses. Bluff it and you've signed a false statement against the False Claims Act. This is the substrate-first path to a defensible attestation in 12 weeks.

**Audience** Engineering + security + procurement-legal lead on a software product sold (or about to be sold) to a US federal agency. **Pre-req** Working CI/CD pipeline. One representative product chosen for the first attestation.

**End state** Per-build provenance with SLSA L2+ · SBOMs published per release · vulnerability disclosure policy live · signed Common Form 3201-NEW ready for the agency portal · third-party software inventory mapped to the same attestation chain. Pass an external SSDF practice-mapping review.

**Re-run diagnostic at week 13** [SSDF Practice Coverage diagnostic](</tools/ssdf-coverage.html>)

Phase 1

Weeks 1–4

## Discovery & _scope_.

You can't attest to what you can't name. Phase 1 inventories every shippable artifact, identifies which falls under the attestation, and decides scope per product line.

Week 1

### Inventory every artifact that ships to the agency — _every binary, container, package, script_.

Include the helper CLIs your support team uses on-site. Include the firmware updates your hardware ships with. Include the JavaScript bundles your "SaaS" delivers to the browser.

  * **Per artifact:** name · build system · maintainer team · release cadence · agency exposure (direct sale · prime sub · embedded component)
  * **Per artifact:** SSDF in-scope? CISA scope covers software developed by you, software developed by 3rd parties and integrated, and significant updates. Cloud services consumed are mostly out of scope.

**Gate 1 · Artifact catalogue published**

Single source-of-truth visible to security, engineering, procurement-legal. If procurement doesn't see it, you'll be attesting to the wrong thing.

Week 2

### Map each artifact to OMB M-22-18 + M-23-16 attestation scope.

OMB Memo M-22-18 (Sep 2022) requires the attestation. M-23-16 (Jun 2023) clarified scope: third-party software the agency uses is in scope; major version updates require re-attestation; "agency-developed" software is out.

  * **In-scope today:** all software developed after 2022-09-14 (or last major version since)
  * **Repository to register attestation:** CISA Repository for Software Attestation and Artifacts (RSAA) — agency may also require direct Common Form submission
  * **Common Form 3201-NEW:** the actual form is single-page; the underlying SSDF practice mapping is the work

**Gate 2 · Scope signed**

In-scope artifacts confirmed by procurement-legal. Out-of-scope artifacts documented with reason ("third-party SaaS · vendor will attest").

**Avoid —** the wishful-scoping trap ("our installer isn't really software"). The agency's view of scope wins.

Week 3

### Map SSDF practices to your current pipeline — _evidence-based_, not aspirational.

NIST SP 800-218 SSDF v1.1 has 4 groups · 19 practices · 42 tasks. Most teams already do 60-70%; the gaps are usually provenance + tamper-detection.

  * **PO (Prepare Organization):** roles · environments · supply-chain risk · security requirements
  * **PS (Protect Software):** archive each release with integrity verification · maintain provenance for each component
  * **PW (Produce Well-Secured Software):** secure design · threat modelling · standard secure-coding · code review · automated testing · vulnerability scanning
  * **RV (Respond to Vulnerabilities):** intake · triage · disclosure · root-cause to prevent recurrence

**Gate 3 · Practice gap-map published**

For each SSDF task: practice description · current evidence (link/screenshot/log) · gap (if any) · remediation owner · target date. Reviewed by security + engineering jointly.

Week 4

### Stand up the supply-chain security team — or name the owner.

Phase 2 substrate work needs a team that owns supply-chain end-to-end, not "security reviews the PR." The function sits at the platform layer.

  * **Smallest workable shape:** 1 platform/build engineer + 0.5 security architect + 0.25 procurement-legal partner
  * **Funding model:** permanent infrastructure investment; the attestation re-runs on every major version
  * **Reports to:** engineering (with dotted line to security)

**Gate 4 · Team funded + reporting line agreed**

Headcount approved. Weekly stand-up scheduled. Quarterly SSDF practice-review on the calendar.

**Avoid —** the [SBOM Shelfware](</anti-patterns/#sbom-shelfware>) anti-pattern — generating SBOMs but never wiring them to KEV alerts. Generation alone is not attestation.

Phase 2

Weeks 5–8

## Build the _substrate_.

The eight weeks where you stop documenting policy and start signing artifacts. Build provenance, SBOM, vulnerability response — the three loops that turn SSDF compliance into a build-time property.

Week 5

### Achieve SLSA L2+ build provenance.

SLSA (Supply-chain Levels for Software Artifacts) gives you the provenance vocabulary the attestation form expects. L2 = hosted build platform + signed provenance. L3 = isolated, hardened, hermetic. Most teams should target L2 in 90 days and L3 within 12 months.

  * **Hosted CI candidates with SLSA L2+ out of the box:** GitHub Actions (via slsa-github-generator) · GitLab Ultimate · Google Cloud Build · CircleCI · Buildkite
  * **Provenance attestation:** in-toto + Sigstore Rekor for transparency log
  * **Non-negotiables:** every release artifact has an attached, signed, machine-readable provenance attestation

**Gate 5 · Provenance published for every release**

`cosign verify-attestation` succeeds on a random sample of 5 production releases. Transparency log entries reachable. Signature roots documented for the agency.

Week 6

### SBOM per release — _CycloneDX or SPDX_ — published to the consuming agency.

The attestation form (and CISA RSAA) expect an SBOM accompanying each in-scope release. SBOM-only is shelfware unless paired with KEV monitoring (Phase 2, week 7).

  * **Generators:** Syft (Anchore) · cdxgen (OWASP) · npm/pip/maven native exporters · Trivy SBOM mode
  * **Format choice:** CycloneDX is the safer default for federal (NTIA explicitly cited); SPDX is acceptable
  * **Distribution:** publish alongside the release binary; sign it; reference it in the provenance attestation
  * **Storage:** OCI registry as SBOM media-type · GitHub Releases · vendor portal

**Gate 6 · SBOM verified consumable by agency tooling**

The federal customer's SBOM-consumption tool (or `bomctl` / `cyclonedx-cli`) successfully parses and enumerates components from a random release. No private/test/dev components leaking.

**Avoid —** the [SBOM Shelfware](</anti-patterns/#sbom-shelfware>) — SBOMs generated but never wired to CISA KEV alerts. The attestation requires "monitor for newly discovered vulnerabilities" (PW.4.2 / RV.1.1) — generation alone fails the practice.

Week 7

### Wire SBOMs to CISA KEV + EPSS + per-service ownership alerts.

The vulnerability-response practice (RV.1) requires you to know about CVEs in your components, prioritise by exploitation evidence, and route to the owning team within an SLA.

  * **Feeds:** CISA Known Exploited Vulnerabilities catalogue (refreshed daily) · NVD/OSV CVE feed · EPSS exploit-prediction scores
  * **Routing:** alert goes to the service owner (CODEOWNERS or service-catalogue lookup), NOT a central security inbox
  * **SLA:** KEV-listed CVE in production = patch or compensating control within 14 days (CISA BOD 22-01 for federal use; private-sector contractor SLA can be tighter)
  * **Tools:** Dependency-Track (OWASP) · Snyk · GitHub Dependabot Security · OSV-Scanner

**Gate 7 · KEV alert flows end-to-end on a real CVE**

A KEV-listed CVE in a dependency of the attested product triggered an owner-level alert within 24h and was patched within SLA. Evidence captured for the attestation.

Week 8

### Vulnerability disclosure policy (VDP) — _public, monitored, responsive_.

SSDF practice RV.1.1 + RV.1.2 require an intake channel for externally-reported vulnerabilities, with documented triage and response. Without this you cannot honestly attest to RV.

  * **Standards-conformant VDP:** ISO 29147 (disclosure) + ISO 30111 (handling) · CISA's VDP Platform if you qualify
  * **Public surface:** `/security.txt` per RFC 9116 · `/vulnerability-disclosure` page · HackerOne or Bugcrowd if you can fund the bounty
  * **Triage SLA:** acknowledge in 5 business days · initial-assessment in 10 · status updates every 30
  * **Internal CSIRT or named DRI:** the buck stops with one person

**Gate 8 · VDP receives + processes a test report end-to-end**

Submit a synthetic-but-realistic report to your own VDP. Acknowledged within SLA. Triaged. Closed with documented decision. Process timed.

Phase 3

Weeks 9–12

## Attestation, third-party, recurrence.

Phase 3 turns the substrate into a signed, defensible attestation — and extends it across third-party software in your bill of materials.

Week 9

### Map every gate evidence to the Common Form 3201-NEW lines.

The Common Form is short (a few SSDF-practice attestations + signatures). The defensibility lives in the evidence dossier you keep ready for an agency request or False Claims Act subpoena.

  * **Per Common Form line:** the SSDF task it maps to · the evidence artifact (URL, log, screenshot, contract) · the date evidence was captured · the next-recapture date
  * **Evidence dossier format:** structured directory tree (one folder per SSDF practice) versioned in a private repo with restricted access
  * **Signing authority:** company officer authorised to bind the company (CTO/CISO/CEO depending on the structure)

**Gate 9 · Evidence dossier reviewed**

External (or independent internal-audit) review of the dossier: are the evidence artifacts current, authentic, sufficient? Any 'gap' findings become Phase-3-week-11 work.

Week 10

### Third-party software — _attestation flow-down_.

OMB M-23-16 makes you responsible for third-party software you integrate. If your dependency vendor doesn't attest, you can't fully attest. Federal Acquisition Regulation (FAR) clauses are catching up.

  * **Per third-party component in your SBOM:** vendor name · last attestation date · scope of their attestation · gap if any
  * **Outreach template:** request the vendor's Common Form attestation (date · scope · signatory). Track responses.
  * **Risk-acceptance route:** if a critical dependency does NOT attest, document compensating controls (additional hardening, sandboxing, isolation) and risk-accept at executive level
  * **Inventory living in:** the same SBOM tooling, enriched with attestation metadata fields

**Gate 10 · Third-party attestation matrix published**

For every in-scope third-party component: attestation present, in-progress, or risk-accepted. No silent 'unknown' rows.

Week 11

### Remediate the dossier gaps surfaced in week 9.

The findings from gate 9 close here. The pattern is: never sign with open findings unless explicitly risk-accepted at appropriate level. False Claims Act exposure is too high.

  * **Per finding:** owner · remediation plan · target date · evidence of closure
  * **Risk-acceptance pattern:** if a SSDF practice cannot be fully met by sign-date, document scope of limitation, compensating control, and acceptance signatory at appropriate level
  * **Update the Common Form draft:** any practice partially met needs an explicit qualifier

**Gate 11 · All findings closed or formally risk-accepted**

Every finding either remediated with new evidence captured, or risk-accepted with appropriate sign-off. Dossier ready to support the attestation.

Week 12

### Sign + submit + plan for recurrence.

The Common Form gets signed. It enters the CISA RSAA repository (and/or the agency's required portal). Then you immediately start the next cycle's calendar.

  * **Signature:** wet-ink or compliant e-signature, by the authorised officer. The signature attests to the SSDF practices, not the marketing claims.
  * **Submission:** CISA Repository for Software Attestation and Artifacts (RSAA) when published; otherwise direct to the agency's contracting officer
  * **Recurrence triggers:** every major version release · annually · on material change to development practices · on M&A integration
  * **Calendar the next cycle:** Phase 1 re-discovery in 6 months, full re-attestation in 12 months, or earlier per change triggers

**Gate 12 · Attestation submitted + recurrence calendared**

Signed Common Form in the agency portal. Confirmation of receipt logged. Next attestation cycle on the calendar with owner.

## End of _week 13_.

If you've completed the gates honestly, you've moved from _Documenting_ to _Attesting_ on the SSDF maturity scale — a position the SSDF practice review will recognise. The remaining work (any agency-specific overlays, FedRAMP if applicable, evolving FAR clauses) builds on this substrate rather than re-doing it.

[Re-run SSDF Coverage diagnostic →](</tools/ssdf-coverage.html>) [All playbooks](</playbooks/>) [Talk through specifics](</#contact>)
