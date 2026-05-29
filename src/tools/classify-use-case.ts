/**
 * Tool: classify_use_case
 *
 * Classify an AI use-case description against EU AI Act + AU AI Safety
 * Standard. Provides risk-tier classification with reasoning. The
 * heavy lifting (interpretive reasoning) is done by the client model;
 * this tool provides the structured framework + Annex III categories
 * + enforcement dates.
 */

import { z } from "zod";

// Annex III high-risk categories — Article 6 + Annex III of EU AI Act
const ANNEX_III_CATEGORIES = [
  {
    point: "1",
    title: "Biometrics",
    sub: ["remote biometric identification", "biometric categorisation", "emotion recognition"],
    triggers: ["biometric", "facial recognition", "fingerprint", "iris", "voice identification", "emotion detect"],
  },
  {
    point: "2",
    title: "Critical infrastructure",
    sub: ["safety components in road traffic", "water/gas/heating/electricity supply"],
    triggers: ["traffic", "water supply", "electricity grid", "energy grid", "pipeline", "critical infrastructure"],
  },
  {
    point: "3",
    title: "Education and vocational training",
    sub: ["access to education", "evaluation of learning outcomes", "detecting prohibited behaviour"],
    triggers: ["education", "student", "exam", "admission", "assessment of student", "academic"],
  },
  {
    point: "4(a)",
    title: "Employment — recruitment",
    sub: ["recruitment", "selection", "filtering applications", "evaluating candidates"],
    triggers: ["recruitment", "hiring", "cv screening", "resume", "candidate ranking", "applicant"],
  },
  {
    point: "4(b)",
    title: "Employment — management",
    sub: ["work-related decisions", "task allocation", "promotion", "termination"],
    triggers: ["promotion", "termination", "performance review", "task allocation", "worker monitoring"],
  },
  {
    point: "5(a)",
    title: "Access to essential public services",
    sub: ["public assistance benefits", "healthcare", "essential public services eligibility"],
    triggers: ["welfare", "social benefit", "public assistance", "healthcare eligibility", "centrelink"],
  },
  {
    point: "5(b)",
    title: "Creditworthiness assessment",
    sub: ["credit scoring", "creditworthiness evaluation"],
    triggers: ["credit score", "creditworthiness", "loan decision", "credit decision", "lending"],
  },
  {
    point: "5(c)",
    title: "Risk assessment + pricing — life and health insurance",
    sub: ["actuarial pricing for life/health insurance"],
    triggers: ["insurance pricing", "actuarial", "life insurance", "health insurance risk"],
  },
  {
    point: "5(d)",
    title: "Emergency response evaluation",
    sub: ["dispatching/prioritising emergency calls", "triage"],
    triggers: ["emergency call", "triage", "ambulance dispatch", "police dispatch", "emergency response"],
  },
  {
    point: "6",
    title: "Law enforcement",
    sub: ["polygraph-like systems", "predictive policing", "evaluating evidence reliability", "profiling for criminal investigation"],
    triggers: ["law enforcement", "predictive policing", "criminal investigation", "evidence assessment"],
  },
  {
    point: "7",
    title: "Migration, asylum, border control",
    sub: ["polygraph-like in asylum", "risk assessment for migration", "examination of applications"],
    triggers: ["visa", "migration", "asylum", "border control", "immigration"],
  },
  {
    point: "8",
    title: "Administration of justice + democratic processes",
    sub: ["researching/interpreting facts and law", "influencing election outcomes"],
    triggers: ["judicial", "court decision", "electoral", "election"],
  },
];

// Article 5 prohibited practices
const PROHIBITED_TRIGGERS = [
  { practice: "subliminal manipulation", triggers: ["subliminal", "manipulative", "exploit unconscious"] },
  { practice: "exploitation of vulnerabilities", triggers: ["exploit vulnerability", "exploit children", "exploit elderly"] },
  { practice: "social scoring", triggers: ["social scoring", "social credit", "trustworthiness scoring of citizens"] },
  { practice: "real-time remote biometric identification in public", triggers: ["real-time facial recognition in public", "live biometric surveillance"] },
  { practice: "emotion recognition in workplace/education", triggers: ["emotion detection in workplace", "emotion recognition in education"] },
  { practice: "biometric categorisation by protected characteristics", triggers: ["biometric categorisation by race", "biometric categorisation by gender"] },
];

export const ClassifyUseCaseInputSchema = z.object({
  description: z.string().min(20).describe(
    "Free-text AI use-case description. Be specific about: what the AI does, who it affects, what decisions it influences, what data it uses. Minimum 20 chars."
  ),
  jurisdictions: z.array(z.enum(["EU", "AU", "US", "INTL"])).default(["EU"]).describe(
    "Jurisdictions to classify against. Default: EU AI Act only. Pass ['EU','AU'] for dual-framework classification."
  ),
});

export type ClassifyUseCaseInput = z.infer<typeof ClassifyUseCaseInputSchema>;

export async function classifyUseCaseHandler(rawInput: unknown) {
  const input = ClassifyUseCaseInputSchema.parse(rawInput);
  const lower = input.description.toLowerCase();

  // EU AI Act classification
  const prohibitedHits = PROHIBITED_TRIGGERS.filter(p =>
    p.triggers.some(t => lower.includes(t))
  );
  const annexHits = ANNEX_III_CATEGORIES.filter(c =>
    c.triggers.some(t => lower.includes(t))
  );

  const euClassification = {
    framework: "EU AI Act (Regulation EU 2024/1689)",
    risk_tier: prohibitedHits.length
      ? "prohibited"
      : annexHits.length
      ? "high-risk"
      : "limited-risk-or-minimal",
    prohibited_practices: prohibitedHits.map(p => p.practice),
    annex_iii_matches: annexHits.map(c => ({
      point: `Annex III point ${c.point}`,
      title: c.title,
      sub_categories: c.sub,
    })),
    obligations_applicable: prohibitedHits.length
      ? ["Article 5 — banned"]
      : annexHits.length
      ? [
          "Article 9 — Risk Management System",
          "Article 10 — Data and data governance",
          "Article 11 + Annex IV — Technical documentation",
          "Article 12 — Record-keeping (audit logs)",
          "Article 13 — Transparency to deployers",
          "Article 14 — Human oversight",
          "Article 15 — Accuracy, robustness, cybersecurity",
          "Article 27 — Fundamental Rights Impact Assessment (deployers)",
        ]
      : ["Article 50 — transparency obligations (if interacts with humans / generates content)"],
    enforcement_date: prohibitedHits.length
      ? "2 Feb 2025 (prohibited practices in force)"
      : annexHits.length
      ? "2 Aug 2026 (high-risk system obligations)"
      : "2 Aug 2026 for limited-risk transparency; varies for other tiers",
    confidence_note:
      "Pattern-matched classification — for borderline cases (especially Annex III point 4 employment, 5(a) essential services, 5(b) credit), have qualified counsel review the specific use-case context.",
  };

  // AU AI Safety classification (heuristic)
  const auClassification = input.jurisdictions.includes("AU")
    ? {
        framework: "AU Voluntary AI Safety Standard (DISR Aug 2024) + proposed Mandatory Guardrails",
        voluntary_status: "All 10 guardrails (G1-G10) apply voluntarily today",
        mandatory_risk_tier:
          prohibitedHits.length || annexHits.length
            ? "likely high-risk under proposed Mandatory Guardrails"
            : "likely low-risk under proposed Mandatory Guardrails",
        guardrails_to_implement: ["G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8", "G9", "G10"],
        binding_australian_overlap: [
          "If APRA-regulated (ADI/super/insurer): CPS 230 + CPS 234 obligations apply NOW regardless of AI Act status",
          "If personal information involved: OAIC Privacy Act + APPs 1-13",
          "If federal agency use: DTA AI Assurance Framework (mandatory)",
          "If SOCI-regulated: ASD Essential Eight ML2-ML3 expected",
        ],
        mandatory_timeline: "Mandatory Guardrails legislation expected 2026-2027",
        source_url: "https://hellouchit.com/writing/au-ai-safety-decoded.html",
      }
    : null;

  return {
    query: input,
    classifications: [euClassification, ...(auClassification ? [auClassification] : [])],
    next_step_suggestion:
      prohibitedHits.length
        ? "🚨 Use-case may fall under Article 5 prohibited practices. Halt deployment + seek EU AI Act qualified counsel before proceeding."
        : annexHits.length
        ? "Use-case is likely high-risk. Recommended sequence: (1) run classify_use_case to lock the tier, (2) walk_playbook('eu-ai-act-12-weeks') to get the 12-week implementation path, (3) lookup_control for each Article 9-15 requirement."
        : "Use-case appears limited-risk or minimal-risk. Article 50 transparency obligations may still apply if it interacts with humans or generates content visible to users.",
    disclaimer:
      "This is pattern-matched scaffolding, not legal classification. EU AI Act risk-tier determinations under Annex III often turn on use-case context — qualified counsel sign-off required for defensible written assessment.",
  };
}

export const classifyUseCaseTool = {
  name: "classify_use_case",
  description: [
    "Classify an AI use-case under EU AI Act (Annex III + Article 5) and optionally AU AI Safety Standard.",
    "Returns: risk tier, matching Annex III categories with sub-points, applicable Articles 9-15 obligations, enforcement date, and a recommended next-step sequence (which other tools to call).",
    "Use for: initial classification of a new use-case, dual-jurisdiction analysis (EU + AU), or generating a structured input for the human-counsel-review handoff.",
    "Not a substitute for legal counsel — borderline cases (especially employment, essential services, credit) need qualified review.",
  ].join("\n\n"),
  inputSchema: ClassifyUseCaseInputSchema,
};
