# Cloud cost from Aware → Controlled in 90 days

> Week-by-week playbook for taking cloud spend from "we see the bill" (Aware) to "the bill cannot surprise us" (Controlled) — across AWS, Azure, and GCP. Three phases, twelve named gates, the FinOps + governance substrate, and the diagnostic to re-run at week 13.
>
> Source: https://hellouchit.com/playbooks/cloud-cost-aware-to-controlled.html
> Author: Uchit Vyas — hellouchit.com
> License: free to read and cite with attribution

---

# Cloud cost — from _Aware_ to _Controlled_ in 90 days.

Most organisations sit at FinOps Foundation's "Crawl" maturity for years. They see the bill (Aware), they react to surprises (Aware++), but they don't enforce guardrails (Controlled). This is the substrate-first path to Controlled in 12 weeks — without slowing engineering or starting a FinOps cargo cult.

**Audience** Cloud platform + finance + engineering-leadership lead with multi-account/multi-subscription footprint. **Pre-req** ≥6 months of billing data, native CSP cost-management tooling enabled (Cost Explorer / Azure Cost Management / GCP Billing Console).

**End state** Tagging enforced at deploy-time · per-product cost attribution to ≥95% of spend · anomaly detection routes to service owner not central inbox · commitment portfolio (RIs, Savings Plans, CUDs) optimised quarterly · cost shows up in the same PR review as code changes. Pass an external FinOps Foundation maturity review at Walk/Run.

**Re-run diagnostic at week 13** [Cloud Cost Maturity diagnostic](</tools/cloud-cost-maturity.html>)

Phase 1

Weeks 1–4

## Visibility & _allocation_.

You cannot control what you cannot attribute. Phase 1 turns raw billing into per-product, per-team, per-environment cost — and surfaces the spend that nobody owns.

Week 1

### Enable the CSP-native cost-management primitives — _all of them_.

Most teams enable Cost Explorer / Cost Management and stop there. The free primitives include budgets, anomaly detection, recommendations, and detailed billing exports. Turn them all on first; pay for third-party tools only after exhausting the natives.

  * **AWS:** Cost Explorer · AWS Budgets · Cost Anomaly Detection · Cost and Usage Report (CUR) v2.0 export to S3 · Compute Optimizer · Trusted Advisor
  * **Azure:** Azure Cost Management · Cost Alerts · Azure Advisor cost recs · Cost Management export to Storage · Anomaly Insights
  * **GCP:** Cloud Billing reports · Budgets + Alerts · Recommender · BigQuery billing export · Active Assist

**Gate 1 · Native cost surfaces live in every account/subscription/project**

CUR / Cost Management Export / Billing Export landing in a queryable destination (S3 / Storage / BigQuery). Budgets exist for every account. Anomaly detection enabled.

Week 2

### Inventory every account, subscription, project — and who owns each.

You can't tag what you don't enumerate. The pattern is to start with a 'cloud financial control plane' inventory and back-fill ownership.

  * **Per account/subscription/project:** name · owner (named person and/or team) · environment (prod/non-prod) · purpose · CSP root id
  * **Orphans:** any account with spend but no clear owner — these are the riskiest (no one watches them)
  * **Multi-CSP:** treat each CSP separately; reconciliation lives in the unified view layer (Phase 1 week 4)

**Gate 2 · Account/subscription/project inventory with named owner ≥95%**

Spreadsheet (or service catalogue entry) with every account and a named owner for ≥95% of spend. Orphan accounts get owners by end of week.

**Avoid —** the FinOps-only-finance trap. Finance can build the spreadsheet but engineering must claim each account; without that the inventory rots.

Week 3

### Tagging policy — _enforced at deploy time_, not retrofitted.

The single biggest lever for cost attribution. Tag policy must be: small (3-5 mandatory keys), enforced (not advisory), and inheritable (so existing resources backfill).

  * **Mandatory tags:** `product` · `environment` · `owner_team` · `cost_center` · optional `data_classification`
  * **Enforcement points:** Service Control Policies (AWS Organizations) · Azure Policy · GCP Organization Policy · Terraform module wrappers · Terraform validate hooks · OPA/Conftest in CI
  * **Retroactive cleanup:** AWS Resource Groups Tag Editor · Azure Resource Graph queries · GCP Asset Inventory
  * **Pattern:** new resources deploy-time blocked without tags; existing resources get 30 days then alerts go to owner

**Gate 3 · ≥95% of spend correctly tagged**

CUR / billing export shows < 5% of cost in 'untagged'. Tagging compliance dashboard live; trend visible weekly to engineering leadership.

**Avoid —** the [Vault Theatre](</anti-patterns/#vault-theatre>) cousin: tagging-theatre. Tags that exist but aren't enforced are worse than no tags — they create the illusion of attribution while spend keeps drifting.

Week 4

### Unified cost view + per-product allocation report.

The free CSP cost views fragment when you go multi-account or multi-CSP. A unified view ('one dashboard') is the deliverable engineering leadership actually consumes.

  * **Free path:** CUR + Azure exports + GCP BigQuery exports → unified BigQuery / Athena / Synapse + Looker / Quicksight / Power BI dashboards
  * **Commercial path:** CloudHealth · Apptio Cloudability · Vantage · Spot · Densify (~$50K-$500K/yr depending on spend)
  * **Per-product allocation report:** cost for product X (across services, accounts, envs) — refreshed daily
  * **Showback (not chargeback yet):** every product team sees their cost trend; no internal billing yet

**Gate 4 · Unified per-product dashboard reviewed by engineering leadership**

Monthly engineering all-hands references the dashboard. Product teams see their own spend trend in their team channel.

Phase 2

Weeks 5–8

## Build the _substrate_.

The eight weeks where you stop reacting to bills and start automating the guardrails. Anomaly response, commitment portfolio, rightsizing — the three loops that turn cost from a monthly surprise into a continuous-engineering signal.

Week 5

### Anomaly detection routed to service owner, _not central inbox_.

The default AWS Anomaly Detection / Azure Cost Alert / GCP Budget Alert dumps to a single email. The pattern is to route by tag → service owner → ack within 24h.

  * **Routing rule:** anomaly on tag `product=X` → alert in #product-X-channel, on-call PagerDuty for owner team
  * **Threshold:** $X above 7-day baseline OR > 20% increase, whichever is higher (tunable; avoid alert fatigue)
  * **Acknowledgement SLA:** 24h to acknowledge, 5 business days to explain or remediate
  * **Tools:** AWS Anomaly Detection + EventBridge + Lambda routing · Azure Action Groups · GCP Pub/Sub from Budget alerts · Cloudability / Vantage alerting

**Gate 5 · 3 consecutive anomaly alerts acknowledged within 24h by named owner**

Real alerts, real acknowledgements, real explanations. No alerts going to /dev/null or central inbox.

Week 6

### Commitment portfolio — _Reserved Instances / Savings Plans / Committed Use Discounts_ — quarterly rebalanced.

Commitment is the single biggest cost lever (typically 30-50% savings on baseline compute) and the easiest to break (over-commit to wrong family, get stuck for 1-3 years).

  * **Inventory:** current RIs / Savings Plans / CUDs · expiry dates · utilisation % · break-even points
  * **Strategy:** Compute Savings Plans (most flexible) for ≥70% of stable baseline · EC2 Instance Savings Plans for predictable family · RIs only for very stable infra
  * **Refresh cadence:** quarterly review of commitment portfolio · expiring commitments reviewed 60 days ahead
  * **Tools:** AWS Cost Optimization Hub · Azure Reservation Recommendations · GCP CUD Analysis · third-party: ProsperOps, Spot

**Gate 6 · Commitment utilisation ≥95% across portfolio**

Underutilised commitments are real losses. Aim for 95-98% utilisation; > 98% means under-committed. Quarterly review on the calendar.

**Avoid —** the long-tail RI trap — locking 3-year all-upfront RIs on the current generation of instance just because the discount is highest. Compute Savings Plans usually beat the math.

Week 7

### Rightsizing recommendations wired to the team that can act on them.

CSP-native rightsizers (Compute Optimizer / Azure Advisor / Active Assist) produce recommendations daily. They mostly get ignored because they land in a central inbox.

  * **Routing pattern:** filter recommendations by tag → push to product-team Jira/Linear backlog or dashboard
  * **Auto-apply for low-risk:** unattached EBS volumes · idle load balancers · stopped instances · empty S3 buckets · orphan public IPs — automate cleanup with Cloud Custodian or AWS Trusted Advisor automation
  * **Manual-review for instance/VM rightsizing:** team reviews monthly; decision logged
  * **Approve before delete pattern:** for storage / data the team is unsure about, 7-day notification before automated deletion

**Gate 7 · ≥80% of unattached/idle resources cleaned monthly**

Cloud Custodian policies running. Monthly cleanup report shows compounding savings. Team reviews rightsizing recs in their own backlog.

Week 8

### Cost shows up in the same PR as code changes — _shift-left_.

The hardest cultural lever. Engineering teams treat cost as a runtime property they discover monthly, not a design property they reason about pre-merge. Closing this gap is what separates Controlled from Aware.

  * **Per-PR cost diff tools:** Infracost (Terraform/OpenTofu) · Brainboard · cdk-cost · custom CDK wrappers
  * **CI integration:** comment on PR showing $X/month delta from this change; fail PR if delta > threshold without justification
  * **Pricing API caching:** use Infracost's pricing-API cache or AWS Pricing API (free) to avoid per-PR API cost
  * **Cost budget per service:** in the service catalogue · displayed alongside SLOs · breaches go to the team

**Gate 8 · PR cost-diff comments live for ≥3 in-scope services**

Real PRs show real $/month deltas. At least one PR has been adjusted or held based on the cost signal.

Phase 3

Weeks 9–12

## Governance, automation, recurrence.

Phase 3 turns the substrate into governance that re-asserts itself without humans. Policies as code, scheduled non-prod, executive cadence, and the inevitable third-party / SaaS cost sprawl.

Week 9

### Policy-as-code guardrails — _OPA / Cloud Custodian / Sentinel_ — enforce the patterns.

The patterns from phases 1-2 must encode into automated policies, otherwise the next reorg loses them.

  * **High-value policies:** untagged-resource block · oversized-instance block · public-S3-bucket block · unattached-EBS auto-delete · no-internet-egress in dev · no-spend without budget
  * **Engines:** OPA + Conftest (in CI) · Cloud Custodian (runtime) · Hashicorp Sentinel (Terraform Enterprise) · AWS Config Rules · Azure Policy · GCP Org Policy
  * **Exception pattern:** every policy violation needs either auto-block, alert-only with named exception, or one-time grant with expiry

**Gate 9 · Policy violations trend down month-over-month for 3 months**

Dashboard tracking each policy's violation count over time. Trend is down. New violations get a human-readable why.

Week 10

### Scheduled stop/start for non-prod — _the biggest unclaimed saving_.

Dev/staging environments running 24/7 burn 70% of their cost on idle. The fix is well known and rarely implemented.

  * **Pattern:** dev VMs/clusters stop at 19:00 local, start at 08:00; weekends off; ~65% saving
  * **Tools:** AWS Instance Scheduler · Azure Automation runbooks · GCP Cloud Scheduler + Functions · Cloud Custodian schedules
  * **Override mechanism:** team can request 'keep running tonight' via Slack/Teams bot for late-night work
  * **Per-team opt-in:** new teams default-enrolled; explicit opt-out goes to engineering leadership for approval

**Gate 10 · ≥80% of dev/staging compute on a stop/start schedule**

Compute Optimizer / Cost Explorer shows non-prod compute hours-utilised dropping by ~50%. Team opt-outs documented.

Week 11

### Quarterly executive FinOps cadence — _decisions not dashboards_.

The metric-without-decision trap. A quarterly meeting with the right inputs and the wrong format produces no behaviour change.

  * **Inputs:** unit economics per product (cost per request, per user, per transaction) · trend vs revenue · commitment utilisation · top 5 efficiency opportunities · top 5 risks
  * **Decisions on the agenda:** kill a product? rebalance commitments? change a team's cost-budget? approve a tagging-non-compliance exception?
  * **Attendees:** CTO/VP Eng · CFO/Finance partner · 3-5 product engineering leads · platform team lead
  * **Cadence:** quarterly first, monthly if you find decisions worth making

**Gate 11 · 1 measurable decision per quarterly cadence**

Each quarterly meeting produces ≥1 spend-change decision (re-allocate budget · cancel a service · approve commitment change · etc). If no decisions surface, the cadence is wasted.

Week 12

### Third-party SaaS + AI inference — _the new cost surface_.

Cloud bills used to be 80%+ of tech spend. Now SaaS + AI inference can rival cloud. The same FinOps loops apply — visibility, attribution, anomaly, commitment.

  * **SaaS visibility:** unify via SaaS-management platforms (Zylo · Productiv · BetterCloud · Vendr) or a SaaS register in your service catalogue
  * **AI inference cost:** per-API-call cost tracking · per-product attribution · token-budget per service · cache-hit-rate as a cost metric
  * **AI gateway pattern:** route all LLM calls through Portkey · LiteLLM · AWS Bedrock · Azure OpenAI gateway · attach cost-attribution metadata at the gateway
  * **Caching as cost-control:** model output caching, embedding caching · the cheapest call is the one you don't make

**Gate 12 · SaaS + AI inference cost tracked at same fidelity as cloud cost**

Per-product attribution exists for both. Anomaly detection covers both. Same showback/chargeback model.

## End of _week 13_.

If you've completed the gates honestly, you've moved from FinOps Foundation's Crawl maturity to Walk (with several Run-level practices). The next cycle is chargeback (if your org culture supports it), unit-economics maturation, and the engineering-as-product-of-cost cultural shift.

[Re-run Cloud Cost Maturity diagnostic →](</tools/cloud-cost-maturity.html>) [All playbooks](</playbooks/>) [Talk through specifics](</#contact>)
