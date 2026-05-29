# Anti-patterns — 15 named failure modes

> Fifteen recurring failure modes in enterprise tech delivery (Inline Prompt, Eval-Set That Never Runs, AI CoE Trap, Vault Theatre, SBOM Shelfware, PDF Principles, etc.) — each with the trigger that produces it, why it bites, and the substrate move that closes it.
>
> Source: https://hellouchit.com/anti-patterns/
> Author: Uchit Vyas — hellouchit.com
> License: free to read and cite with attribution

---

# The things that quietly stop _working_.

Fifteen named anti-patterns I’ve watched recur across regulated- industry engagements — in enterprise architecture, platform engineering & DevSecOps, applied GenAI, data, and operating-model design. Each one: **where it appears, why it’s bad, what to do instead**. Forward to the colleague who can’t yet name what’s going wrong. 

Where it appears

An architecture function publishes a 70-page principles document. Linked from a wiki nobody opens. Cited only by the architects who wrote it. Delivery teams have never read it.

Why it’s bad

Principles that aren’t encoded in platform defaults or policy-as-code **don’t exist**. The PDF creates the illusion of governance while the substrate stays unenforced.

_Tell: when teams violate “principles” routinely without consequence, the PDF is theatre._

What to do instead

Encode your top 3 principles as policy-as-code (OPA / Kyverno / Conftest), platform templates (Backstage scaffolders), or admission controllers. **Subtract the rest.** A principle nobody can violate without warning is a principle. Everything else is rhetoric.

**Related** [EA Operating Model Diagnostic](</tools/ea-operating-model.html>) · [The encoded enterprise architect](</writing/encoded-enterprise-architect.html>)

[#pdf-principles](<#pdf-principles>)

Where it appears

EA function exists to chair design reviews. Engineers must “present to architecture” before they can build. The reviews produce opinions, rarely decisions. Teams learn to route around the gate.

Why it’s bad

EA-as-gate breeds resentment and creates two systems: the official one and the one that ships. The function’s output becomes performance, not impact.

_Tell: design reviews where the answer is mostly “no” or “please come back with more detail.”_

What to do instead

Replace the review board with an **enablement clinic**. The answer is never “no.” It’s “here’s the template,” or “here’s the ADR you should write,” or “here’s the exception process and what it costs.” Approval queues become paving queues.

**Related** [EA Diagnostic](</tools/ea-operating-model.html>) · [The encoded enterprise architect](</writing/encoded-enterprise-architect.html>)

[#architect-as-reviewer](<#architect-as-reviewer>)

Where it appears

A beautiful capability model exists in LeanIX / Ardoq / a Visio file. Architects update it quarterly. The CFO doesn’t consult it for investment decisions. Product managers don’t consult it for roadmap decisions. The capability model is a project artefact, not a living instrument.

Why it’s bad

An uncoupled capability model is overhead. Worse, it creates a false sense of EA maturity.

_Tell: ask the CFO when they last looked at the capability model. The answer is “never.”_

What to do instead

Tie capability investment to **outcome metrics** the business already reports. Run every major investment decision through the capability lens, visibly. If the model doesn’t survive that, simplify it until it does.

**Related** [EA Diagnostic](</tools/ea-operating-model.html>) · [4-Discipline Stack](</4-discipline-stack/>)

[#capability-model-theatre](<#capability-model-theatre>)

Where it appears

Enterprise creates a Chief AI Officer + AI CoE separate from platform engineering. CoE does great work on model selection, evals, use-case ideation. CoE owns nothing in the substrate — identity, observability, deployment pipelines — that real production AI requires.

Why it’s bad

AI ships only as fast as the substrate underneath it. CoE-as-parallel-to-platform spends quarters waiting on platform team for the controls regulators require. By the time the substrate exists, the use-case window has closed.

_Tell: AI roadmap dates always slip on dependencies the CoE can’t deliver itself._

What to do instead

Fund AI substrate **inside platform engineering** , not parallel to it. CoE owns model selection, evals, use-case sourcing. Platform owns gateway, observability, audit-evidence, identity. Same paved path serves both.

**Related** [Platform engineering is the AI moat](</writing/platform-engineering-ai-moat.html>) · [GenAI Readiness Diagnostic](</tools/genai-readiness.html>) · [Regulated GenAI Platform RA](</reference-architectures/regulated-genai-platform.html>)

[#ai-coe-trap](<#ai-coe-trap>)

Where it appears

Executive team attends an AI workshop. Then another. Then a third. Vendor pitches, demos, capability tours. No production use-case is named. No sponsor is assigned. No budget is allocated. Repeat for six quarters.

Why it’s bad

Workshop tourism feels like progress because it produces calendar events and slide decks. It produces no shipped capability. By the time the org commits, competitors have shipped use-cases two years deep.

_Tell: count the workshops. Compare to count of named production use-cases with sponsors. If the ratio is >3:1, it’s tourism._

What to do instead

Cap the next workshop at **one**. Use it to name a use-case, name a sponsor, name a measurable outcome and a 90-day milestone. [Apply the 9 controls](</writing/genai-9-controls.html>). Ship. The substrate built for use-case 1 carries use-cases 2–10 for free.

**Related** [GenAI Readiness Diagnostic](</tools/genai-readiness.html>) · [The 9 controls](</writing/genai-9-controls.html>)

[#ai-workshop-tourism](<#ai-workshop-tourism>)

Where it appears

Engineering org adopts DORA / SPACE / DX metrics because someone read the book. Numbers go on a dashboard. Targets are set. Nothing changes about how engineering is funded, prioritised or rewarded. The numbers become inputs to an annual ritual nobody acts on.

Why it’s bad

Metrics that don’t change behaviour are noise. Worse: tracked-but-unused metrics breed cynicism (“they want us to game the deploy-frequency number”).

_Tell: ask the team how the metric changes what gets prioritised this sprint. If the answer is “it doesn’t,” it’s cargo cult._

What to do instead

Pick **one or two metrics** tied to a real decision: “if MTTR exceeds 24h on three deploys in a row, feature work pauses until reliability work catches up.” Make the metric’s consequence concrete, automatic and visible. Subtract the rest.

**Related** [SRE Diagnostic](</tools/sre-programme.html>) · [Error Budget calculator](</tools/calculators/error-budget.html>)

[#kpi-cargo-cult](<#kpi-cargo-cult>)

Where it appears

Org “moved secrets to the vault.” Engineers proudly cite this in audits. Applications still pull **static long-lived credentials** from the vault at startup. The credentials sit in env vars for the lifetime of the workload, then sit in logs, then sit in CI artefacts, then sit in incident war-room screenshots.

Why it’s bad

Vaulted-static is still static. The credential is the vulnerability, not its storage. Snowflake 2024 (100+ breaches via stuffed credentials) was a vault-theatre incident at scale.

_Tell: ask “how long is the credential valid?” If the answer is >1 hour, it’s static._

What to do instead

**Workload identity** — OIDC, SPIFFE, AWS IAM Roles, GCP Workload Identity Federation, Azure Federated Credentials. Short-lived (minutes), identity-bound, can’t be exfiltrated meaningfully because they expire before they can be used externally.

**Related** [DevSecOps Diagnostic](</tools/devsecops-maturity.html>) · [DevSecOps is supply chain](</writing/devsecops-is-supply-chain.html>) · [SLSA L3+ Paved Path RA](</reference-architectures/devsecops-paved-path.html>)

[#vault-theatre](<#vault-theatre>)

Where it appears

Org emits SBOMs per artefact (CycloneDX, SPDX) because procurement asked. The SBOMs land in a folder. Nothing reads them. CVEs in the dependency graph never reach a service owner. When a critical CVE drops, security still spends weeks doing manual application-to-service mapping.

Why it’s bad

SBOMs are **infrastructure for the alert-to-owner loop**. Without that loop, they’re compliance theatre and double the storage bill.

_Tell: ask how a Log4Shell-class CVE would flow from disclosure to remediation. If the answer involves “manual triage,” the SBOMs are shelfware._

What to do instead

Wire SBOMs to a graph store ([GUAC](<https://guac.sh/>), [OWASP Dependency-Track](<https://dependencytrack.org/>)). Wire [CISA KEV](<https://www.cisa.gov/known-exploited-vulnerabilities-catalog>) \+ [GitHub Advisory Database](<https://github.com/advisories>) alerts to the service owner directly — not to a central inbox. **The loop is the asset; the SBOM is the input.**

**Related** [DevSecOps Diagnostic](</tools/devsecops-maturity.html>) · [SLSA L3+ Paved Path RA](</reference-architectures/devsecops-paved-path.html>)

[#sbom-shelfware](<#sbom-shelfware>)

Where it appears

Security programme’s top-3 line items are SAST consolidation, DAST rollout, container scanning. Workload identity, signed provenance, SBOM-to-owner are absent or scheduled for next year. The roadmap mirrors the AppSec vendor market.

Why it’s bad

2024 incidents that defined the year (XZ Utils, Snowflake, Polyfill, CrowdStrike) were not findings on a SAST report. The vendor markets are selling 2018’s problem.

_Tell: ask what would have caught XZ Utils. If the answer is more SAST scans, the roadmap is misaligned with the threat._

What to do instead

Treat AppSec hygiene as **baseline** , not headline. Move the headline to supply chain: workload identity, signed provenance (SLSA L3+), SBOM-to-owner alerting, policy-as-code at deploy. Those are what regulators & attackers both care about now.

**Related** [DevSecOps is supply chain](</writing/devsecops-is-supply-chain.html>) · [DevSecOps Diagnostic](</tools/devsecops-maturity.html>)

[#sast-as-strategy](<#sast-as-strategy>)

Where it appears

Platform team built a beautiful paved path. Backstage templates, observability defaults, security baked in. No squad uses it. Squads keep rolling their own pipelines. The platform team is hurt; the platform’s adoption metric is invisible because nobody tracks it.

Why it’s bad

A paved path that nobody chose is just another tool stack. Worse: the platform team feels successful (they shipped the path) while engineering velocity stays unchanged.

_Tell: count adoption per capability per quarter. If a capability is <30% adopted 6 months in, it’s not paved — it’s parked._

What to do instead

Survey 10 developers. Ask what they route around and why. **Fix that first** , not what the platform team thinks should be next. Treat platform-as-a-product: adoption is the only metric that matters; sunset what isn’t adopted.

**Related** [Platform Engineering Diagnostic](</tools/platform-engineering.html>) · [Platform Engineering IDP RA](</reference-architectures/platform-engineering-idp.html>)

[#paved-path-no-adoption](<#paved-path-no-adoption>)

Where it appears

Production GenAI feature’s prompts are hard-coded as Python / Go / TypeScript string literals. Whoever last edited them owns them. No versioning, no review, no eval gate. When the model misbehaves, nobody can attribute the regression to a prompt change because there’s no change log.

Why it’s bad

A prompt is a configuration that determines model behaviour. Treating it as a string literal in code makes it un-versionable, un-reviewable and un-rollback-able. [OWASP LLM01](<https://owasp.org/www-project-top-10-for-large-language-model-applications/>) failure modes hide here.

_Tell: ask “what changed in the prompt last week?” If the answer requires git-archaeology, the prompt is inline._

What to do instead

**Prompt registry** with semver, owners, per-version evals. Production traces tagged with the prompt version that produced them. Treat prompts as code: PR review, change log, rollback path. [LangSmith](<https://docs.smith.langchain.com/>), [Promptfoo](<https://www.promptfoo.dev/>), Langfuse all do this.

**Related** [GenAI Readiness Diagnostic](</tools/genai-readiness.html>) · [The 9 controls](</writing/genai-9-controls.html>)

[#inline-prompt-pattern](<#inline-prompt-pattern>)

Where it appears

Org wrote an eval set of 50 cases when launching the GenAI feature. The eval set lives in a repo. The CI pipeline doesn’t run it. Engineers don’t know it exists. When prompts change, deploys ship without an eval gate.

Why it’s bad

An eval set that doesn’t gate deploys is documentation of intent, not enforcement of quality. The most common GenAI production regressions land via prompt or model-version changes that an eval set would have caught.

_Tell: ask what would happen to a deploy whose prompt change drops a critical eval score by 30%. If the answer is “it would ship,” the eval set is decorative._

What to do instead

**Eval-regression-gated deploys.** CI runs the eval set on every prompt or model change. Critical-metric regression blocks merge. Once landed: add shadow evals on production traffic to catch data-drift the pre-deploy suite misses.

**Related** [GenAI Readiness Diagnostic](</tools/genai-readiness.html>) · [The 9 controls](</writing/genai-9-controls.html>) · [Regulated GenAI Platform RA](</reference-architectures/regulated-genai-platform.html>)

[#eval-set-never-runs](<#eval-set-never-runs>)

Where it appears

Production GenAI workload uses `model: latest` (or equivalent floating reference) instead of a pinned semantic version. Model provider silently ships a behaviour change. Production suddenly produces different outputs. Nobody can attribute the regression because there’s no version change log.

Why it’s bad

Both Anthropic and OpenAI shipped breaking model changes in 2024 that broke prompts in production for orgs using floating references. The fix isn’t complaining to the provider; the fix is pinning.

_Tell: grep your code for “latest”, “stable”, “current”, “default”. Each hit is an incident waiting to happen._

What to do instead

**Pin model versions semantically per environment.** Dev → mid-tier; staging → version-matching-prod; prod → fully pinned. Track [OpenAI](<https://platform.openai.com/docs/deprecations>) / [Anthropic](<https://docs.anthropic.com/en/docs/about-claude/models>) deprecation schedules; promote new versions through the eval gate before prod.

**Related** [GenAI Readiness Diagnostic](</tools/genai-readiness.html>) · [GenAI Cost calculator](</tools/calculators/genai-cost.html>)

[#model-as-latest](<#model-as-latest>)

Where it appears

Org labels its data programme “data mesh” because the book is popular. Domain teams now own their data products. There’s no shared catalogue. No lineage. No contracts. No access governance. The mesh is sociotechnically just “decentralised silos.”

Why it’s bad

Data mesh without substrate — catalogue, lineage, contracts, governance — is just [the data-lake problem rebranded](<https://martinfowler.com/bliki/DataLake.html>). Domain teams now own incompatible interpretations of “customer.”

_Tell: ask three product teams for the customer count. Three different numbers from three different sources._

What to do instead

Build the **shared substrate first** : catalogue (DataHub / OpenMetadata / Atlas / Unity), lineage ([OpenLineage](<https://openlineage.io/>)), data contracts, access governance, PII classification. Then domain ownership of data products on top. Order matters; the substrate is the “mesh” part of data mesh.

**Related** [Modern Data Platform RA](</reference-architectures/modern-data-platform.html>)

[#data-mesh-no-substrate](<#data-mesh-no-substrate>)

Where it appears

Org adopts a lakehouse (Databricks, Snowflake, BigQuery + Iceberg). Bronze zone fills with raw ingest from everywhere — CDC, exports, SaaS sync, vendor file drops. No Silver discipline. No Gold zone. No domain ownership. Lakehouse = warehouse + lake’s worst attributes combined.

Why it’s bad

Lakehouse tooling doesn’t enforce the Bronze/Silver/Gold discipline; the team has to. Without it, you’re paying lakehouse prices for swamp performance and credibility damage when BI / ML / AI consume conflicting data.

_Tell: count tables in Gold zone vs Bronze. Healthy ratio: 1 Gold for every 5–10 Bronze. Swamp ratio: 0 Gold, 500 Bronze._

What to do instead

**Zone discipline + domain ownership**. Bronze is immutable + append-only (audit value). Silver is conformed, contracted, quality-checked. Gold is consumable, domain-owned, with SLAs. Every table’s zone is visible in the catalogue. Sunset Bronze that doesn’t earn promotion to Silver within an agreed window.

**Related** [Modern Data Platform RA](</reference-architectures/modern-data-platform.html>)

[#lakehouse-as-swamp](<#lakehouse-as-swamp>)

Spotted an anti-pattern that should be here? Reply to [Letters](</letters/>) or [get in touch](</#contact>). The list grows quarterly with the patterns that recur most often in engagement.
