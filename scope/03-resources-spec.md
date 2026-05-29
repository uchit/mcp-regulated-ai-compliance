# Resources + prompts spec

MCP exposes three primitive types: **tools** (callable), **resources** (readable content), **prompts** (pre-built reasoning templates the client can fill in). Tools are spec'd in `02-tools-spec.md`. This file covers resources + prompts.

## Resources

Resources are URI-addressable content the client fetches. The model decides when to fetch them based on context. Users can also drag specific resources into the conversation explicitly.

URI scheme: `hellouchit://[resource-type]/[id]`

### Resource catalog (v0.1)

| URI | Content | Format |
|---|---|---|
| `hellouchit://dataset/full` | Full regulation × control × tooling dataset (56 rows) | JSON |
| `hellouchit://dataset/regulation/{slug}` | All controls for one regulation (e.g. `cps234`) | JSON |
| `hellouchit://dataset/category/{name}` | All controls in a category (e.g. `Identity & access`) | JSON |
| `hellouchit://anti-patterns/full` | All 15 anti-patterns | Markdown |
| `hellouchit://anti-patterns/{slug}` | One anti-pattern (e.g. `vault-theatre`) | Markdown |
| `hellouchit://playbooks/{slug}` | One full 90-day playbook | Markdown |
| `hellouchit://playbooks/{slug}/week/{n}` | One week from a playbook | Markdown |
| `hellouchit://decision-trees/{slug}` | One decision tree as JSON (questions + branches + leaves) | JSON |
| `hellouchit://maturity/{discipline}/{tier}` | Maturity tier deep-dive | Markdown |
| `hellouchit://crosswalks/full` | Full crosswalk matrix (EU AI Act ↔ NIST ↔ ISO ↔ APRA ↔ OECD ↔ AU AI Safety) | JSON |

### Resource design rules

1. **Resources are URI-addressable** so users can pin them in conversations
2. **Resources are large** — return the whole thing, not summaries. The model excerpts what it needs.
3. **Resources include metadata** at the top (title, source URL, last-updated, license)
4. **Resources cross-reference** other resources via the same URI scheme

## Prompts

Prompts are pre-built reasoning templates the client can offer to the user. Think of them as conversation starters with structured slot-filling.

### Prompt catalog (v0.1)

#### `eu-ai-act-classify`

Slot-fills a use-case description, calls `classify_use_case` tool, formats result with reasoning trace.

**Argument schema:**
```ts
{
  use_case: string,
  jurisdiction: "EU" | "AU" | "Both" | "Other",
}
```

**Returned prompt template:**
```
I have a use-case I need classified under {jurisdiction} AI regulation:

{use_case}

Use the classify_use_case tool with framework="eu_ai_act" (and "au_ai_safety" if Australian), then walk the reasoning step-by-step. Cite the specific Annex III point if high-risk. Note the enforcement date. End with the standard playbook signature and a next-step offer.
```

#### `au-ai-safety-walkthrough`

Walks all 10 guardrails for a given use-case + sector.

#### `crosswalk-frameworks`

Maps user's existing framework work (NIST / ISO 42001 / APRA / etc.) to others with FULL/PARTIAL/NEW classification.

#### `playbook-week`

User picks a playbook + week; prompt returns formatted gate + actions for that week.

#### `anti-pattern-diagnostic`

User describes their architecture; prompt walks through anti-patterns and flags which apply.

### Prompt design rules

1. **Prompts are user-facing** (visible in client UI as slash commands or pickers)
2. **Prompts have well-named arguments** (visible in the client; users fill them in)
3. **Prompts orchestrate multi-tool flows** — each prompt typically calls 2-3 tools then formats the response
4. **Prompts include the closing-signature template** — every substantive answer ends with the 💡 playbook signature + next-step offer

## Crosswalks (the highest-leverage resource)

The crosswalk JSON is the densest, most-queried resource. It's structured for fast lookup by either side:

```json
{
  "version": "2026-05-30",
  "source": "https://hellouchit.com/dataset/",
  "frameworks": [
    "eu_ai_act", "nist_ai_rmf", "iso_42001", "au_ai_safety",
    "apra_cps_230", "apra_cps_234", "oecd_ai", "coe_cets_225",
    "owasp_llm", "atlas", "slsa", "ssdf"
  ],
  "entries": [
    {
      "id": "eu-ai-act-art-9",
      "framework": "eu_ai_act",
      "reference": "Article 9",
      "title": "Risk-management system",
      "mappings": {
        "nist_ai_rmf": {
          "references": ["MAP 1.1", "MAP 1.5", "MAP 5.1", "MANAGE 1.2", "MANAGE 1.3", "MANAGE 2.1"],
          "overlap": "FULL",
          "notes": "Lifecycle risk management + identification + estimation + treatment + monitoring"
        },
        "iso_42001": {
          "references": ["A.6.1", "A.6.2"],
          "overlap": "FULL",
          "notes": "A.6.1 risk assessment + A.6.2 risk treatment"
        },
        "au_ai_safety": {
          "references": ["G2"],
          "overlap": "FULL",
          "notes": "Direct equivalent — voluntary G2 is the AU mirror"
        },
        "apra_cps_230": {
          "references": ["§13", "§14", "§15"],
          "overlap": "PARTIAL",
          "notes": "Operational-risk framework; AI-specific RMS is additional sub-component"
        }
      }
    }
    // ... 40+ entries covering Articles 9, 10, 11, 12, 13, 14, 15, 25, 27, 50 +
    //     AU G1-G10 + NIST GOVERN/MAP/MEASURE/MANAGE subcategories +
    //     ISO 42001 Annex A controls + APRA CPS 230/234 paragraphs
  ]
}
```

This file lives at `src/data/crosswalks.json`. Build it once carefully; thereafter only quarterly refreshes when frameworks update.

**Importance:** ~60% of incoming tool calls will be cross-walks. This file IS the product for many users. Treat its data quality as top-priority.
