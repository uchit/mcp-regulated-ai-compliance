# Tools spec — the 10 tools

The MCP server exposes 10 tools. Each is one TypeScript file in `src/tools/`. v0.1 ships the first 5; v0.2 adds the rest.

## v0.1 tools (must ship)

### 1. `lookup_control` ⭐ reference implementation

**Purpose:** answer "which tool closes [regulation]'s requirement on [surface]?"

**Input:**
```ts
{
  regulation: "cps234" | "eu_ai_act" | "ssdf" | "ai_rmf" | "iso42001" | ... ,  // enum from dataset
  surface?: string,        // e.g. "Cloud · CI/CD · K8s"
  category?: string,       // e.g. "Identity & access"
  sector?: "banks" | "government" | "healthcare" | "critical-infrastructure",
}
```

**Output:**
```ts
{
  matches: [
    {
      control: string,              // e.g. "Workload identity (no static long-lived credentials)"
      category: string,
      surface: string,
      tools: [{ name, type, vendor }],
      evidence_shape: string,
      anti_pattern?: string,        // slug, e.g. "vault-theatre"
      notes: string,
      source_url: string,           // → hellouchit.com/dataset/?ctrl=...
    }
  ],
  total: number,
  query: { ... },                   // echoed back for transparency
}
```

**Implementation:** filter `dataset.json`'s rows by intersection of (regulation, surface keyword, category, sector). Already implemented in `src/tools/lookup-control.ts` as the reference.

---

### 2. `classify_use_case`

**Purpose:** "Take this AI use-case description, classify it under [framework]."

**Input:**
```ts
{
  description: string,             // free-text use-case description
  jurisdictions: Array<"EU" | "AU" | "US" | "INTL">,
  framework?: "eu_ai_act" | "au_ai_safety" | "nist_ai_rmf",   // optional override
}
```

**Output:**
```ts
{
  classifications: [
    {
      framework: "EU AI Act",
      risk_tier: "prohibited" | "high-risk" | "limited-risk" | "minimal-risk" | "GPAI",
      annex_iii_point?: string,    // if high-risk under Annex III
      reasoning: string,           // step-by-step
      obligations: string[],       // e.g. ["Article 9 RMS", "Article 12 logging", ...]
      enforcement_date: string,    // e.g. "2 Aug 2026"
      certainty: "high" | "medium" | "low",
    }
  ],
  cross_framework_alignment: string,  // e.g. "Likely high-risk in both EU and AU"
  next_step_offer: string,            // e.g. "Want me to draft an Article 9 RMS template?"
}
```

**Implementation notes:** This is the heaviest tool. v0.1 can ship with **lookup-only** classification (matches description keywords against known high-risk patterns + Annex III categories from data). v0.5+ can use embedded heuristics. Don't try to make it agentic — let the client model do the heavy reasoning; this tool provides the regulatory scaffolding.

---

### 3. `get_anti_pattern`

**Purpose:** "What's the AI CoE Trap?" or "What anti-pattern is hardcoding prompts in service code?"

**Input:**
```ts
{
  query: string,           // name OR keyword search
  // e.g. "AI CoE Trap" or "inline prompts" or "vault"
}
```

**Output:**
```ts
{
  matches: [
    {
      name: string,           // "AI CoE Trap"
      slug: string,           // "ai-coe-trap"
      where_it_appears: string,
      why_its_bad: string,
      what_to_do_instead: string,
      tell: string,           // diagnostic signal
      source_url: string,     // → hellouchit.com/anti-patterns/#ai-coe-trap
    }
  ],
  total: number,
}
```

**Implementation:** parse `anti-patterns.md`, build slug index at startup, search by name or keyword.

---

### 4. `crosswalk`

**Purpose:** Map a regulation/framework requirement to other frameworks.

**Input:**
```ts
{
  from_framework: string,   // e.g. "EU AI Act"
  from_reference: string,   // e.g. "Article 9" or "Annex III"
  to_frameworks: string[],  // e.g. ["NIST AI RMF", "ISO 42001", "AU AI Safety Standard"]
}
```

**Output:**
```ts
{
  source: { framework, reference, text },
  mappings: [
    {
      framework: "NIST AI RMF",
      references: ["MAP 1.1", "MAP 1.5", "MANAGE 1.2"],
      overlap: "FULL" | "PARTIAL" | "NEW",
      notes: string,
    }
  ],
  gaps: string[],     // e.g. "AU APP 8 cross-border has no direct EU AI Act equivalent"
  source_url: string,
}
```

**Implementation:** static crosswalk table embedded as JSON. Can be built from the playbook cross-walks already documented in your Claude Project Custom Instructions.

---

### 5. `walk_playbook`

**Purpose:** Return the specific gate or week from a 90-day playbook.

**Input:**
```ts
{
  playbook: "eu-ai-act-12-weeks" | "cisa-attestation-90-days" | "cloud-cost-aware-to-controlled" | "vault-theatre-to-workload-identity",
  week?: number,              // 1-12; if omitted, returns full playbook structure
  gate?: number,              // 1-12; alternative to week
}
```

**Output:**
```ts
{
  playbook: { id, title, audience, end_state, diagnostic_to_rerun },
  weeks: [
    {
      week_number: number,
      phase: string,            // "1-4 Triage", "5-8 Substrate", "9-12 Documentation"
      title: string,
      what_to_do: string,
      gate: string,             // "Gate N · …"
      anti_patterns_to_avoid: string[],
      source_url: string,
    }
  ],
}
```

**Implementation:** parse the playbook Markdown files in `src/data/playbooks/` into structured form. Cache the parse at startup.

---

## v0.2 tools (deferred)

### 6. `decision_tree`
Walks one of 7 architecture decision trees (AI gateway / RAG vs fine-tune / OPA vs Kyverno / tenancy / compute platform / sync vs async / monolith vs microservices).

### 7. `score_diagnostic`
Computes maturity-tier score from answers to one of 6 diagnostics. Use case: agent reads a repo, scores it, returns tier + 3 substrate moves.

### 8. `list_regulations`
Returns regulations relevant to a sector/region/category combination.

### 9. `generate_template`
Drafts a regulation-specific template (Article 9 RMS, G1 accountability framework, etc.). Likely too complex; let the client model handle generation, just provide structure via resources.

### 10. `check_compliance`
Runs a quick read against a named regulation. May overlap with classify_use_case; revisit if there's a clear need.

---

## Tool design rules

1. **Pure functions where possible.** No side effects. Same input → same output. Easy to test.
2. **Tools take small, well-typed inputs.** Use enums where the value space is small.
3. **Tools return structured outputs.** Never just a string. Always a JSON object so clients can format it consistently.
4. **Every output includes `source_url`** pointing back to hellouchit.com. This is the entire distribution model.
5. **Tools fail loudly.** Bad input → MCP `isError: true` with a helpful message. Don't return empty results silently.
6. **Tools don't make network calls in v0.1.** Embedded knowledge only.
