import type {
  DiagnosticIssue,
  ModelOption,
  VersionRecord,
} from "../types";

export const models: ModelOption[] = [
  { name: "Claude", identifier: "claude", available: true },
  { name: "GPT-4", identifier: "gpt-4", available: false },
  { name: "Gemini Pro", identifier: "gemini-pro", available: true },
  { name: "Llama 3", identifier: "llama-3", available: true },
];

export const defaultDiagnosticsPrompt =
  "Act as an expert analyst and review this document. Tell me what is wrong with it and how to fix the structure so it is more professional for a stakeholder presentation next week.";

export const defaultComparisonPrompt =
  "Act as a helpful travel agent. I want to plan a 5-day trip to Tokyo in October. Provide a detailed itinerary focusing on sushi and historical shrines. Include estimated costs for each day and advice on using the JR pass. Ensure the tone is professional yet welcoming. I also need suggestions for hotels in Shinjuku area.";

export const defaultDiagnosticsIssues: DiagnosticIssue[] = [
  {
    id: "issue-audience",
    label: "Vague",
    title: "Target Audience Definition",
    description:
      "The prompt mentions \"stakeholder presentation\" but doesn't specify the level of technical knowledge or specific interests of these stakeholders.",
    suggestion:
      "\"Explicitly state if the stakeholders are C-suite executives, technical leads, or general management.\"",
  },
  {
    id: "issue-scope",
    label: "Unclear",
    title: "Scope of \"Review\"",
    description:
      "\"Tell me what is wrong\" is a broad directive. The AI might focus on grammar when you need strategy, or vice versa.",
    suggestion:
      "\"Specify dimensions for review: logical flow, data accuracy, or visual layout.\"",
  },
  {
    id: "issue-constraint",
    label: "Optimization",
    title: "Constraint Specification",
    description:
      "The time constraint \"next week\" is irrelevant to the model but implies urgency that could be better handled by formatting requests.",
    suggestion:
      "\"Request the output in a checklist format or a structured slide-by-slide outline.\"",
  },
];

export const defaultDiagnosticsVersions: VersionRecord[] = [
  {
    id: "diag-v1",
    label: "Version 1",
    content:
      "Act as a senior communications strategist reviewing a stakeholder presentation for executive sponsors and cross-functional leads. Identify weaknesses in the document's structure, narrative flow, and level of evidence. Explain what is not working, why it reduces executive confidence, and how to reorganize the content for a clearer, more professional presentation. Return your review as a slide-by-slide checklist with practical revisions.",
  },
  {
    id: "diag-v2",
    label: "Version 2",
    content:
      "Review this document as a presentation advisor preparing material for a stakeholder readout. Evaluate whether the deck is logically structured for senior leadership, highlight unclear transitions, missing evidence, and any sections that feel too tactical, then recommend a revised outline. Format the response with: key issues, strategic impact, and exact structural fixes for each section.",
  },
];

export const defaultComparisonVersions: VersionRecord[] = [
  {
    id: "travel-v1",
    label: "Version 1",
    content:
      "Act as a specialized Tokyo travel consultant. I want to plan a comprehensive 5-day itinerary for Tokyo in late October (Autumn foliage peak). Provide a detailed itinerary focusing on authentic Edomae-style sushi experiences and significant Shinto shrines. Include estimated costs for each day and a cost-benefit analysis of the JR Pass vs. Suica cards. Ensure the tone is professional yet enthusiastic. I also need luxury and boutique hotel suggestions specifically within the Shinjuku and Shibuya districts.",
  },
  {
    id: "travel-v2",
    label: "Version 2",
    content:
      "Act as an upscale Japan itinerary designer. Build a five-day Tokyo plan for the final week of October with a balanced mix of premium sushi counters, historic shrine visits, and efficient neighborhood routing. Break each day into morning, afternoon, and evening segments, estimate costs, and recommend whether the traveler should rely on JR Pass coverage or recharge a Suica card. Keep the tone warm, polished, and concierge-like, and recommend standout hotels in Shinjuku, Shibuya, and Ginza.",
  },
];

export function sleep(ms = 700) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function createIssue(
  id: string,
  label: string,
  title: string,
  description: string,
  suggestion: string,
): DiagnosticIssue {
  return { id, label, title, description, suggestion };
}

export function runMockDiagnosis(prompt: string): DiagnosticIssue[] {
  const normalized = prompt.toLowerCase();
  const issues: DiagnosticIssue[] = [];

  if (!/\b(audience|stakeholder|customer|executive|team)\b/.test(normalized)) {
    issues.push(
      createIssue(
        "audience",
        "Missing",
        "Audience Context",
        "The prompt does not make clear who the answer should be optimized for, which can lead to the wrong level of detail.",
        "\"State the intended reader or decision-maker so the output can target the right level of detail and tone.\"",
      ),
    );
  }

  if (!/\b(checklist|outline|table|bullet|format)\b/.test(normalized)) {
    issues.push(
      createIssue(
        "format",
        "Unclear",
        "Output Shape",
        "The request describes the goal but not the shape of the deliverable, so the result may be hard to scan or reuse.",
        "\"Specify the response format, for example a checklist, outline, or sectioned recommendation.\"",
      ),
    );
  }

  if (/\b(asap|urgent|next week|tomorrow)\b/.test(normalized)) {
    issues.push(
      createIssue(
        "timing",
        "Optimization",
        "Timing Signal",
        "Time pressure is mentioned, but it is not translated into a presentation-friendly output requirement.",
        "\"Replace urgency cues with concrete delivery requirements such as executive summary first, then section-by-section fixes.\"",
      ),
    );
  }

  if (!/\b(tone|voice|style|professional|friendly|formal)\b/.test(normalized)) {
    issues.push(
      createIssue(
        "tone",
        "Vague",
        "Tone Requirements",
        "The prompt does not define how polished or assertive the answer should sound.",
        "\"Clarify the desired tone so the response style matches the final audience.\"",
      ),
    );
  }

  if (issues.length === 0) {
    issues.push(
      createIssue(
        "refinement",
        "Optimization",
        "Further Refinement",
        "The prompt is workable, but it can still benefit from more explicit constraints and success criteria.",
        "\"Add acceptance criteria, output sections, and audience context to make the result more reliable.\"",
      ),
    );
  }

  return issues.slice(0, 3);
}

function optimizeStakeholderPrompt(versionIndex: number) {
  const versions = [
    "Act as a senior communications strategist reviewing a stakeholder presentation for executive sponsors and cross-functional leads. Identify weaknesses in the document's structure, narrative flow, and level of evidence. Explain what is not working, why it reduces executive confidence, and how to reorganize the content for a clearer, more professional presentation. Return your review as a slide-by-slide checklist with practical revisions.",
    "Review this document as a presentation advisor preparing material for a stakeholder readout. Evaluate whether the deck is logically structured for senior leadership, highlight unclear transitions, missing evidence, and any sections that feel too tactical, then recommend a revised outline. Format the response with: key issues, strategic impact, and exact structural fixes for each section.",
    "You are an executive presentation coach. Analyze this document for stakeholder readiness, focusing on clarity of storyline, prioritization of insights, and whether each section supports an informed decision. Point out structural weaknesses, recommend a stronger narrative sequence, and provide a professional outline that could be used to rebuild the presentation.",
  ];

  return versions[versionIndex % versions.length];
}

function optimizeTravelPrompt(versionIndex: number) {
  const versions = [
    "Act as a specialized Tokyo travel consultant. I want to plan a comprehensive 5-day itinerary for Tokyo in late October (Autumn foliage peak). Provide a detailed itinerary focusing on authentic Edomae-style sushi experiences and significant Shinto shrines. Include estimated costs for each day and a cost-benefit analysis of the JR Pass vs. Suica cards. Ensure the tone is professional yet enthusiastic. I also need luxury and boutique hotel suggestions specifically within the Shinjuku and Shibuya districts.",
    "Act as an upscale Japan itinerary designer. Build a five-day Tokyo plan for the final week of October with a balanced mix of premium sushi counters, historic shrine visits, and efficient neighborhood routing. Break each day into morning, afternoon, and evening segments, estimate costs, and recommend whether the traveler should rely on JR Pass coverage or recharge a Suica card. Keep the tone warm, polished, and concierge-like, and recommend standout hotels in Shinjuku, Shibuya, and Ginza.",
    "Act as a Tokyo destination specialist for a first-time premium traveler. Create a five-day late-October itinerary that blends heritage shrines, refined sushi experiences, evening neighborhood walks, and realistic transportation choices. Include daily budgets, hotel suggestions in well-connected districts, and practical advice on when a transit pass is worthwhile versus when IC-card travel is simpler.",
  ];

  return versions[versionIndex % versions.length];
}

export function runMockOptimization(
  prompt: string,
  versionIndex: number,
  issues?: DiagnosticIssue[],
) {
  const normalized = prompt.toLowerCase();

  if (normalized.includes("stakeholder presentation")) {
    return optimizeStakeholderPrompt(versionIndex);
  }

  if (normalized.includes("tokyo") || normalized.includes("jr pass")) {
    return optimizeTravelPrompt(versionIndex);
  }

  const audienceHint = issues?.[0]?.title ?? "target reader";
  return [
    "Act as a senior prompt strategist.",
    `Rewrite the request so it is optimized for the ${audienceHint.toLowerCase()}.`,
    "Clarify the objective, constraints, desired tone, and exact output structure.",
    "Return only the final rewritten prompt as polished plain text.",
    "",
    `Original request: ${prompt.trim()}`,
  ].join("\n");
}
