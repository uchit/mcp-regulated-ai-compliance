# EU AI Act high-risk readiness in 12 weeks

> Week-by-week playbook for taking a high-risk AI use-case from Piloting to EU AI Act Articles 9–15 ready by 2 Aug 2026. Three phases, twelve named gates, explicit anti-patterns to avoid, tooling examples, and the diagnostic to re-run at week 13.
>
> Source: https://hellouchit.com/playbooks/eu-ai-act-12-weeks.html/
> Author: Uchit Vyas — hellouchit.com
> License: free to read and cite with attribution

---

# EU AI Act _high-risk_ , in 12 weeks.

If you're shipping (or about to ship) an AI use-case classified high-risk under [EU AI Act Annex III](<https://artificialintelligenceact.eu/>), this is the substrate-first path to ready by **2 Aug 2026**. Twelve weeks. Three phases. Twelve named gates.

**Audience** Engineering + product + risk lead on a high-risk AI use-case (credit scoring · employment screening · biometrics · law-enforcement · critical infrastructure · healthcare triage) **Pre-req** 1+ AI use-case in production or pre-launch. NIST AI RMF read.

**End state** Per-decision audit pipeline · prompt registry + eval-gated CI · layered tested guardrails · model + data cards · risk classification + impact assessment signed. Pass an external Art. 9-15 review.

**Re-run diagnostic at week 13** [GenAI Readiness diagnostic](</tools/genai-readiness.html>)

Phase 1

Weeks 1–4

## Triage & _classify_.

You can't comply with what you haven't named. Phase 1 catalogues every AI use-case, classifies each per the EU AI Act risk tiers, and surfaces the ones that need the substrate work in phases 2–3.

Week 1

### Inventory every AI use-case — _actually every one_.

Include the proof-of-concepts on a single laptop. Include the third-party tools your teams use that have AI features turned on. Include the GenAI plugins in your existing SaaS (Salesforce Einstein, Microsoft Copilot, etc.).

  * **Per use-case:** name · owner · current stage (POC / pilot / production) · estimated user reach · data sensitivity
  * **Per use-case:** AI Act role — are you _provider_ (built it), _deployer_ (use it), or both?

**Gate 1 · Catalogue published**

Single source-of-truth visible to risk, legal, product, and engineering leadership. If risk + legal don't see it, the catalogue doesn't exist.

Week 2

### Classify each use-case by AI Act risk tier.

Walk every use-case against [EU AI Act Annex III](<https://artificialintelligenceact.eu/>) (high-risk areas) and Art. 5 (prohibited). Most use-cases will be _limited_ or _minimal_ ; the high-risk ones drive the playbook.

  * **High-risk Annex III categories:** biometric identification · critical-infra safety components · education/vocational training · employment HR · essential services (credit, insurance, public benefits) · law enforcement · migration · justice/democracy
  * **General-purpose AI (GPAI) systemic-risk:** separate obligations from Art. 51-55 (less likely to apply to deployers; matters for providers of foundation models)

**Gate 2 · Tier signed**

Risk-tier per use-case signed off by risk + legal. Document the reasoning, not just the verdict. Annex III judgements are sometimes argued.

**Avoid —** the wishful-thinking classification ("our use-case isn't _really_ credit scoring even though it informs credit decisions"). Regulator's view, not yours.

Week 3

### Per high-risk use-case: AI risk + impact assessment.

EU AI Act Art. 9 (risk management system) + Art. 27 (fundamental rights impact assessment, for deployers in some cases) need an artefact you can hand to a regulator.

  * **Risk assessment:** identified risks · affected populations · severity + likelihood · mitigations · residual risk
  * **Impact assessment (FRIA where required):** who's affected · how decisions affect them · redress route · oversight mechanism
  * **Map to NIST AI RMF** MAP function. Reduces double-work and gives a recognised framework

**Gate 3 · Assessments published**

One assessment per high-risk use-case. Reviewed by a multi-disciplinary panel (engineering · risk · legal · product · ideally a domain expert).

Week 4

### Stand up the GenAI platform team — or name the owner.

The substrate work in phases 2–3 needs a team. Without a named owner the work scatters across feature teams and never lands.

  * **Smallest workable shape:** 1 platform engineer + 1 ML engineer + 0.5 risk/governance partner. Bigger orgs need more
  * **Funding model:** not project-funded. The substrate is permanent infrastructure
  * **Reports to:** engineering, with dotted line to risk. Not the AI CoE if one exists (see anti-pattern)

**Gate 4 · Team funded + reporting line agreed**

Headcount approved, calendar invites for weekly stand-up + monthly steering exist. Without these the team is theatre.

**Avoid —** the [AI CoE Trap](</anti-patterns/#ai-coe-trap>). The CoE doesn't own platform substrate; the platform team does.

Phase 2

Weeks 5–8

## Build the _substrate_.

The eight weeks where you stop architecting and start shipping. Substrate first; one feature on it second. The order matters — gateway and prompt registry come before evals can be meaningful.

Week 5

### Stand up an AI gateway — _buy_ , don't build.

The gateway is where the audit pipeline lives. Build only if you have a 5+ engineer platform team and sovereignty needs that rule out commercial. (See the [AI gateway decision tree](</decisions/ai-gateway.html>).)

  * **Candidates:** Portkey · LiteLLM (managed) · AWS Bedrock + Guardrails · Azure AI Foundry · GCP Vertex AI
  * **Non-negotiables:** per-decision logging · pluggable guardrails · model-version pinning · cost attribution
  * **Verify before signing:** data-residency · zero-retention DPA · audit-log export format

**Gate 5 · Gateway routing 100% of LLM calls for high-risk use-case**

Direct provider calls are now blocked at network egress (or PR-time at minimum). One use-case migrated end-to-end; second use-case starts later.

Week 6

### Prompt registry + eval-gated CI.

Prompts move out of code into a versioned registry. Evals run on every change. Merge blocks on critical regression.

  * **Registry candidates:** Langfuse · LangSmith · Promptfoo (good for the eval side specifically)
  * **Eval set:** 50–100 known-answer cases per use-case. Domain expert reviews; stored in git
  * **CI gate:** PR that changes a prompt runs the eval; merge blocked if critical-eval score drops >X%

**Gate 6 · Zero inline prompts in production code**

Source-tree scan finds none. PR linter catches new ones. The [inline-prompt anti-pattern](</anti-patterns/#inline-prompt-pattern>) is closed for this use-case.

**Avoid —** the [eval-set-that-never-runs](</anti-patterns/#eval-set-never-runs>). If the set isn't gating CI it doesn't exist.

Week 7

### Layered guardrails — tested _adversarially_ , not theoretically.

Input + output guardrails at the gateway layer. Tested with an adversarial prompt suite. False-positive + false-negative rate tracked.

  * **Input side:** prompt-injection detection · PII detection · jailbreak patterns — OWASP LLM01 + LLM02 coverage
  * **Output side:** structured-output validation · content safety · groundedness check · leak detection
  * **Tools:** NeMo Guardrails · Guardrails AI · Bedrock Guardrails · Azure AI Content Safety · Lakera Guard · Llama Guard
  * **Adversarial test suite:** Garak (NVIDIA) · PyRIT (Microsoft) for red-team automation

**Gate 7 · Adversarial suite passes acceptance threshold**

Critical attacks (top-3 OWASP LLM) blocked. False-positive rate documented (because over-blocking is its own problem). Suite scheduled weekly.

Week 8

### Per-decision audit pipeline + retention.

EU AI Act Art. 12 (logging) becomes operational. Every high-risk decision is replay-able.

  * **Per request, persisted:** prompt · retrieved context · model + version · guardrails applied · output · confidence · latency · cost
  * **Signed + immutable:** append-only store (object-lock or hash-chain). Tamper-detection on retrieval
  * **Retention:** EU AI Act says ≥6 months for high-risk (Art. 12). Most banks/healthcare regulators want longer; default to 7 years
  * **Replay-able:** dev can reconstruct any decision given the audit record + frozen model version

**Gate 8 · Replay test passes**

Random sample of 5 production decisions reconstructed by a dev who didn't make the original requests, byte-equivalent answers. Audit log is real.

Phase 3

Weeks 9–12

## Documentation, oversight, conformity.

Phase 3 is the documentation, governance, and pre-conformity work that turns a working substrate into a regulator-defensible system. Less code; more artefacts.

Week 9

### Model card + data card per high-risk use-case.

  * **Model card:** training/fine-tuning data summary · eval results (with hold-out methodology) · intended use · limitations · ethical considerations
  * **Data card:** sources · consent basis · refresh cadence · known biases · de-identification approach
  * **Templates:** Google Model Card Toolkit · Hugging Face model-card spec · NVIDIA Model Card++ · custom YAML in repo if simpler
  * **Versioned with the model:** not a separate Confluence page that drifts

**Gate 9 · Cards published + reviewed**

Risk + legal + a domain expert read them. Edits are tracked. Card lives in the repo with the model.

Week 10

### Technical documentation pack (Art. 11 / Annex IV).

If you're a provider, this is the regulator-facing package. If you're a deployer, you assemble equivalent records for your supervisory authority.

  * **General description:** intended purpose · users · context · how it's been verified
  * **Detailed description:** system design · key design choices · data requirements · pre-determined changes · validation procedures
  * **Monitoring + post-market plan:** what you log · what you alert on · how you respond to incidents
  * **Conformity declaration draft:** standards applied (ISO 42001, harmonised standards as they emerge)

**Gate 10 · Doc pack peer-reviewed**

External or independent-internal reviewer can navigate the doc pack and answer questions about the system without help. Doc pack quality predicts conformity-assessment outcome.

Week 11

### Human oversight mechanism (Art. 14) made _operational_.

'A human can override' isn't oversight. 'A human approves high-risk decisions above a threshold' is.

  * **Triggers documented:** confidence threshold · risk tier · regulator-defined categories — what flags a decision for human review
  * **Reviewer queue:** SLA (typically <24h for service decisions) · reviewer trained · audit trail of approval/override
  * **Override metrics:** rate · direction (over-reliance vs second-guessing) · review by week
  * **Engine candidates:** Temporal (long-running approval) · ServiceNow workflow · custom queue + UI

**Gate 11 · Oversight tested on prod traffic**

Real flagged decisions actually go through human review. SLA tracked. No silent bypass route exists.

Week 12

### External or independent-internal pre-conformity review.

Before regulator looks, your friendly external looks. The cost of finding a gap now versus during a real conformity assessment is 100×.

  * **Scope:** Art. 9 (RMS) · Art. 10 (data) · Art. 11 (docs) · Art. 12 (logging) · Art. 13 (transparency) · Art. 14 (oversight) · Art. 15 (accuracy/robustness/cybersec)
  * **Reviewer:** external assurance firm OR an independent internal-audit function. Not the team that built it
  * **Output:** findings register · remediation plan with owners · target dates
  * **For providers:** identify your notified body (if route requires) and confirm assessment timeline

**Gate 12 · Findings closed or formally accepted**

Every finding either remediated, scheduled with owner + date, or formally risk-accepted with sign-off at appropriate level. No silent open items.

## End of _week 13_.

If you've completed the gates honestly, you've moved from _Piloting_ to _Operating_ on the maturity tier scale — the substrate that EU AI Act Art. 9–15 actually expects. The remaining work (notified-body conformity assessment if you're a provider; deployer obligations if you're a deployer) sits on top of this, not before it.

[Re-run GenAI Readiness diagnostic →](</tools/genai-readiness.html>) [All playbooks](</playbooks/>) [Talk through specifics](</#contact>)
