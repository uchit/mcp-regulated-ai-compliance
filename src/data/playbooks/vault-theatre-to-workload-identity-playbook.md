# Vault Theatre → Workload Identity in 90 days

> Week-by-week playbook for retiring long-lived static credentials in favour of federated workload identity (OIDC). Three phases, twelve named gates, the SPIFFE / cloud-IAM substrate, and the diagnostic to re-run at week 13.
>
> Source: https://hellouchit.com/playbooks/vault-theatre-to-workload-identity.html
> Author: Uchit Vyas — hellouchit.com
> License: free to read and cite with attribution

---

# From _Vault Theatre_ to _Workload Identity_ in 90 days.

Many orgs spent 5+ years on secrets-management — HashiCorp Vault, AWS Secrets Manager, Azure Key Vault, GCP Secret Manager. The audit finding closes. The substrate doesn't. Long-lived credentials still leave the trust boundary on every deploy and live in the runtime as environment variables. Workload identity (short-lived, federated, OIDC-issued tokens) is the substrate that actually closes the audit finding. This is the 12-week path.

**Audience** Platform + security + identity-and-access lead with multi-CSP footprint and ≥1 secrets manager already deployed. **Pre-req** Vault or cloud-native secrets manager in use; CI/CD producing artifacts that consume credentials at runtime.

**End state** Zero long-lived cloud credentials in runtime (CI tokens, app secrets) · all workload-to-cloud auth via federated OIDC / SPIFFE-ID · vault retained only for the small set of irreducible static secrets (legacy SaaS that doesn't speak OIDC) · audit log shows credential exchange at workload-identity boundary · rotation reduced from quarterly to never. Pass an external workload-identity maturity review.

**Re-run diagnostic at week 13** [Identity Maturity diagnostic](</tools/identity-maturity.html>)

Phase 1

Weeks 1–4

## Inventory & _classify_.

You cannot retire what you cannot find. Phase 1 inventories every static credential in your runtime and CI, classifies each by replaceability, and prioritises the migration order.

Week 1

### Inventory every long-lived credential — _everywhere they live_.

Credentials hide in surprising places. The full inventory often surfaces 10× more than the security team expects.

  * **Credential homes to enumerate:** Vault paths · cloud Secrets Manager / Key Vault / Secret Manager · CI/CD secret stores (GitHub Actions secrets · GitLab CI variables · CircleCI contexts · Jenkins credentials) · Kubernetes Secrets · Docker registry credentials · Terraform state · `.env` files in artifacts · application config in S3/Storage · personal `~/.aws/credentials` files on bastion hosts
  * **Per credential:** name · type (AWS IAM access key · API token · OAuth client secret · password · ssh key · pgp key · cert) · owner team · last rotation · last use (CloudTrail / audit logs)
  * **Detection tooling:** TruffleHog · Gitleaks · GitGuardian · cloud-native credential reports (AWS IAM credential report) · vault audit logs

**Gate 1 · Credential inventory published**

Single source-of-truth visible to security + platform + each owning team. Orphan credentials (no owner, no recent use) flagged for week-2 retirement.

Week 2

### Classify each credential — _replaceable now · later · never_.

Not every credential can move to workload identity. The classification drives migration order and the residual-vault scope.

  * **Replaceable NOW (Phase 2-3 target):** any AWS/Azure/GCP access key from a workload that can run inside a CSP · any cross-cloud workload (CSP to other CSP) via OIDC · CI/CD to cloud · K8s workload to cloud · GitHub Actions to AWS/Azure/GCP
  * **Replaceable LATER:** SaaS-to-SaaS where target SaaS supports OIDC but is on the integration backlog
  * **NEVER replaceable today:** legacy SaaS without OIDC support · on-premise systems with static-only auth · database passwords for non-cloud-native databases (use IAM-database-auth for cloud-native: RDS-IAM · Azure AD for SQL · Cloud SQL IAM)
  * **Retirement candidates:** orphan or unused-90+-days credentials → delete this week

**Gate 2 · Classification signed**

Every credential tagged NOW / LATER / NEVER. Orphan credentials deleted. Retirement count published as the gate metric.

**Avoid —** the [Vault Theatre](</anti-patterns/#vault-theatre>) trap — calling Vault adoption 'done' when nothing left the runtime. Vault is a partial pre-requisite; it doesn't close the audit finding by itself.

Week 3

### Identity-provider readiness — _OIDC issuer per workload context_.

Each workload context (CI runner · K8s cluster · serverless platform · CSP IAM) needs an OIDC issuer URL that target trust policies can federate from.

  * **GitHub Actions:** OIDC issuer `https://token.actions.githubusercontent.com` · per-workflow-run JWT
  * **GitLab CI:** OIDC issuer per project; `id_tokens` configurable per job
  * **Kubernetes:** projected-service-account-token (PSAT) · cluster issuer URL (`oidc-issuer-url`) discoverable via `kubectl get --raw /.well-known/openid-configuration`
  * **Cloud-native managed K8s:** EKS IRSA · AKS Workload Identity (GA Mar 2023) · GKE Workload Identity Federation
  * **Cloud-to-cloud:** AWS IAM Roles Anywhere · Azure Workload Identity Federation · GCP Workload Identity Federation
  * **SPIFFE/SPIRE option:** for heterogeneous environments where a unified identity plane is preferred over per-CSP federation

**Gate 3 · Issuer endpoints documented + reachable from each target CSP**

Each in-scope workload context has a documented OIDC discovery URL. Each target CSP IAM can fetch the issuer's JWKS. Test JWT exchange succeeds.

Week 4

### Stand up workload-identity squad — or name the owner.

The substrate work touches IAM, platform, CI/CD, K8s, and every application team. Without a named squad it scatters.

  * **Smallest workable shape:** 1 identity/IAM engineer + 1 platform engineer + 0.25 security architect + 0.25 SRE for incident response
  * **Funding model:** permanent platform investment; the substrate is forever
  * **Reports to:** platform engineering with dotted line to security
  * **First-90-days mission:** the gates in this playbook; nothing else

**Gate 4 · Squad funded + reporting line agreed**

Headcount approved. Weekly stand-up on the calendar. Monthly steering with security + platform leadership.

**Avoid —** the [AI CoE Trap](</anti-patterns/#ai-coe-trap>) cousin — Security CoE owning identity without platform ownership. The platform team must own the substrate; security owns the policy.

Phase 2

Weeks 5–8

## Build the _substrate_.

The eight weeks where you stop talking about workload identity and start migrating real workloads. CI first (highest leverage), K8s second, cross-cloud third.

Week 5

### CI/CD → cloud via OIDC — _the highest-leverage migration_.

GitHub Actions to AWS/Azure/GCP without long-lived secrets is the well-trodden path. Per-workflow-run JWT exchanged for short-lived cloud credentials. Zero stored secrets after migration.

  * **GitHub Actions → AWS:** OIDC trust on IAM role · `aws-actions/configure-aws-credentials@v4` · sub claim binding to `repo:org/repo:ref:refs/heads/main`
  * **GitHub Actions → Azure:** OIDC federated credential on App Registration · `azure/login@v2` with federated-token-file
  * **GitHub Actions → GCP:** Workload Identity Pool + Provider · `google-github-actions/auth@v2` with workload_identity_provider
  * **GitLab CI → cloud:** equivalent path with `id_tokens:` block; trust policy keyed to project/branch
  * **Sub-claim hygiene:** narrowest possible binding (repo + branch + environment); never `repo:*`

**Gate 5 · 100% of CI deploys to in-scope cloud via OIDC**

`grep -r AWS_ACCESS_KEY` in CI configs returns zero hits. CloudTrail / Activity Log shows credentials issued via OIDC, not static-key STS calls.

Week 6

### Kubernetes workloads → cloud via workload identity.

Pods talking to S3/Storage/CloudSQL/Bedrock/etc shouldn't carry static credentials. EKS IRSA, AKS Workload Identity, GKE Workload Identity Federation are the cloud-native paths. SPIFFE/SPIRE if you need cross-environment.

  * **EKS IRSA:** service-account annotation `eks.amazonaws.com/role-arn` · IAM role trust policy keyed to the K8s service-account
  * **AKS Workload Identity:** federated credential on Entra ID App · service-account annotation `azure.workload.identity/client-id`
  * **GKE Workload Identity Federation:** `iam.gke.io/gcp-service-account` annotation · IAM binding for KSA → GSA
  * **SPIFFE/SPIRE:** if cross-cluster / cross-cloud / on-prem workloads need a unified identity plane
  * **Migration pattern:** new workloads default to workload identity from day-1; existing workloads migrated via dual-credential phase (both work for 30 days, then static credential revoked)

**Gate 6 · 100% of in-scope K8s workloads use workload identity**

`kubectl get pods --all-namespaces -o jsonpath` audit shows no static-credential env vars. Cloud IAM audit log shows AssumeRoleWithWebIdentity / federated-token-issued events from KSA principals.

Week 7

### Cross-cloud + cross-system identity — _OIDC federation everywhere_.

AWS-workload-needs-to-call-Azure or GCP-workload-needs-to-call-AWS used to require a long-lived service-account key. Federation (or IAM Roles Anywhere for SPIFFE-style) replaces both.

  * **AWS to Azure:** AWS workload calls Azure via Azure-federated-credential trusting AWS IAM Roles Anywhere or Cognito
  * **Azure to AWS:** Azure Managed Identity issues token · AWS IAM Roles Anywhere validates · AssumeRole
  * **GCP to AWS:** GCP Service Account token · AWS Workload Identity Federation
  * **Any cloud to any cloud via SPIFFE:** SPIRE federation; JWT-SVID issued by source spire-server, validated by target via federation
  * **SaaS to cloud:** if SaaS supports OAuth client-credentials with OIDC, federate it; otherwise add to the residual-static list

**Gate 7 · Cross-cloud workload calls via federated identity**

Identified cross-cloud workload paths converted. Audit log shows STS calls without long-lived static-credential intermediaries.

Week 8

### Vault becomes the residual-static-secrets safe — not the runtime credential source.

The residual scope shrinks from "everything" to "the legacy SaaS that genuinely cannot federate." Vault retains a real purpose; the runtime stops asking it for cloud credentials.

  * **Vault scope post-migration:** legacy SaaS API keys · database passwords (for non-cloud-native DBs) · TLS private keys for IoT/on-prem certificates · the small set of irreducible long-lived secrets
  * **Vault dynamic-secrets path (preferred even for what remains):** Vault issues short-lived database credentials on-demand · Vault auto-rotates SaaS API keys where the SaaS supports it
  * **Vault auth method:** workloads auth to Vault via workload identity (Kubernetes auth · cloud IAM auth) — closing the loop
  * **Audit logging:** every Vault secret read attributable to a workload identity, not a service-account static token

**Gate 8 · Residual-static scope < 20% of original**

The Vault inventory shrunk by ≥80%. Every remaining secret has a justification line in the inventory (legacy SaaS · on-prem · no-OIDC).

Phase 3

Weeks 9–12

## Hardening, monitoring, recurrence.

Phase 3 turns the migration into a maintained property — policies enforce the absence of static creds, monitoring catches drift, and the secrets graveyard gets cleaned up.

Week 9

### Policy-as-code — _ban static credential creation_.

Without enforcement, the next reorg or merger reintroduces static credentials. The pattern is to encode the ban into the platform.

  * **IAM-policy guardrails:** SCP / Azure Policy / GCP Org Policy denying creation of new IAM access keys for in-scope workload accounts
  * **CI guardrail:** PR linter blocks new `AWS_ACCESS_KEY_ID` / `AZURE_CLIENT_SECRET` / `GOOGLE_APPLICATION_CREDENTIALS` envvar references
  * **K8s guardrail:** OPA Gatekeeper / Kyverno policy denying Pod spec with static-credential envvars or volume-mounted secrets to known cloud-credential paths
  * **Exception process:** any new static credential needs explicit security approval with documented justification + expiry

**Gate 9 · Static-credential-creation block enforced + tested**

Attempt to create a new IAM access key in an in-scope account is blocked. New PR with hardcoded `AWS_ACCESS_KEY_ID` is blocked. Exception cases visible to security.

Week 10

### Monitoring — _detect static credential creation + use_.

Even with prevention, someone will introduce a static credential. The detection layer catches it within 24h.

  * **Detection rules:** AWS CloudTrail event `CreateAccessKey` outside the residual scope · Azure Activity Log `ServicePrincipal/Update Password` outside residual scope · GCP `iam.serviceAccountKeys.create`
  * **Usage anomaly:** static-credential STS call from a workload that previously used OIDC — alert as drift
  * **Owner alerting:** alert routes to the workload owner (not central security inbox) within 1 hour
  * **Rotation pattern (residual):** the small residual set still rotates; rotation events logged to the same channel

**Gate 10 · Drift detection live, tested with synthetic violation**

Synthetic 'someone made an access key' event triggered an owner-level alert within SLA. Owner acknowledged. The detection loop is real.

Week 11

### Credential-graveyard cleanup — _delete what migration left behind_.

The migration created orphan credentials: old IAM access keys, deactivated SaaS tokens, Kubernetes Secrets no longer mounted. The graveyard is the audit trail no one wants surfaced.

  * **Cleanup queries:** AWS access keys not used in 90 days · Azure SP credentials not used in 90 days · GCP SA keys not used in 90 days · Vault paths not read in 90 days · K8s Secrets with no owning Pod
  * **Soft-delete pattern:** deactivate first (so a missed dependency surfaces) · hard-delete after 30 days of inactivity
  * **Per-credential closure:** evidence of deletion logged with the originating ticket

**Gate 11 · Credential graveyard < 5% of phase-1 inventory**

Total long-lived credentials in the org has dropped by ≥95%. Remaining justified per the residual-static inventory.

Week 12

### External or independent-internal workload-identity review.

The substrate is real now. A friendly external looks before regulator / auditor does. The cost of finding a gap now versus during a real audit is 10×-100×.

  * **Scope:** credential inventory completeness · classification accuracy · OIDC trust-policy hygiene (sub-claim narrowness) · enforcement-policy coverage · drift detection · residual-scope justification
  * **Reviewer:** external assurance firm OR an independent internal-audit function — not the squad that built it
  * **Output:** findings register · remediation plan with owners · target dates · next review in 12 months

**Gate 12 · Findings closed or formally risk-accepted**

Every finding either remediated or formally risk-accepted at appropriate level. Next review scheduled.

## End of _week 13_.

If you've completed the gates honestly, you've moved from _Vault Theatre_ to _Workload Identity_. The audit finding that wouldn't close — the one about long-lived credentials in runtime — is now genuinely closed. The remaining work (irreducible legacy SaaS, on-prem credential rotation, evolving SPIFFE adoption) builds on this substrate rather than re-doing it.

[Re-run Identity Maturity diagnostic →](</tools/identity-maturity.html>) [All playbooks](</playbooks/>) [Talk through specifics](</#contact>)
