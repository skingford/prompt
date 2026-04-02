import type { DiagnosticIssue } from "../types";

const DEFAULT_CHAT_COMPLETIONS_URL = "/api/chat/completions";
const DEFAULT_TEMPERATURE = 0.4;
const DEFAULT_MAX_TOKENS = 480;

interface ChatMessage {
  role: "system" | "user";
  content: string;
}

interface OptimizePromptOptions {
  prompt: string;
  model: string;
  issues?: DiagnosticIssue[];
  onDelta?: (delta: string) => void;
  signal?: AbortSignal;
}

interface StreamChunk {
  choices?: Array<{
    delta?: {
      content?: string;
    };
  }>;
}

export class ChatCompletionError extends Error {}

function getGatewayUrl() {
  return import.meta.env.VITE_CHAT_COMPLETIONS_URL?.trim() || DEFAULT_CHAT_COMPLETIONS_URL;
}

function buildDiagnosticsGuidance(issues?: DiagnosticIssue[]) {
  if (!issues?.length) {
    return "No diagnostics were provided. Improve the prompt using general prompt-engineering best practices.";
  }

  return issues
    .map((issue, index) => {
      return [
        `${index + 1}. ${issue.title}`,
        `Label: ${issue.label}`,
        `Why it matters: ${issue.description}`,
        `Fix direction: ${issue.suggestion}`,
      ].join("\n");
    })
    .join("\n\n");
}

function buildOptimizationMessages(prompt: string, issues?: DiagnosticIssue[]): ChatMessage[] {
  return [
    {
      role: "system",
      content: [
        "You are an expert prompt optimization assistant.",
        "Rewrite prompts so they are clearer, more specific, and easier for another model to execute.",
        "Preserve the user's intent and keep the optimized prompt in the same language as the original unless the original explicitly asks for another language.",
        "Return only the final optimized prompt text with no explanation or markdown fences.",
      ].join(" "),
    },
    {
      role: "user",
      content: [
        "Optimize the following prompt.",
        "Improve structure, constraints, output format, and missing context only when it helps.",
        "",
        "Original prompt:",
        prompt.trim(),
        "",
        "Diagnostics to incorporate:",
        buildDiagnosticsGuidance(issues),
      ].join("\n"),
    },
  ];
}

async function readErrorMessage(response: Response) {
  const rawText = await response.text();

  if (!rawText) {
    return `Gateway request failed with status ${response.status}.`;
  }

  try {
    const parsed = JSON.parse(rawText) as {
      detail?: string;
      error?: string;
      message?: string;
    };

    return parsed.detail || parsed.error || parsed.message || rawText;
  } catch {
    return rawText;
  }
}

function readStreamDelta(rawEvent: string) {
  if (rawEvent === "[DONE]") {
    return null;
  }

  let parsed: StreamChunk;

  try {
    parsed = JSON.parse(rawEvent) as StreamChunk;
  } catch {
    throw new ChatCompletionError("Failed to parse the gateway stream.");
  }

  const content = parsed.choices?.[0]?.delta?.content;

  return content ?? null;
}

export async function optimizePrompt({
  prompt,
  model,
  issues,
  onDelta,
  signal,
}: OptimizePromptOptions) {
  let response: Response;

  try {
    response = await fetch(getGatewayUrl(), {
      method: "POST",
      headers: {
        Accept: "text/event-stream, application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        temperature: DEFAULT_TEMPERATURE,
        max_tokens: DEFAULT_MAX_TOKENS,
        model,
        messages: buildOptimizationMessages(prompt, issues),
        stream: true,
      }),
      signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error;
    }

    throw new ChatCompletionError(
      "Unable to reach the local chat gateway. Restart the Vite server after updating the proxy settings.",
    );
  }

  if (!response.ok) {
    throw new ChatCompletionError(await readErrorMessage(response));
  }

  if (!response.body) {
    throw new ChatCompletionError("The gateway returned an empty response body.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  const parts: string[] = [];
  let buffer = "";
  let eventLines: string[] = [];

  function flushEvent() {
    if (!eventLines.length) {
      return;
    }

    const eventData = eventLines.join("\n");
    eventLines = [];
    const delta = readStreamDelta(eventData);

    if (!delta) {
      return;
    }

    parts.push(delta);
    onDelta?.(delta);
  }

  while (true) {
    const { done, value } = await reader.read();
    buffer += decoder.decode(value, { stream: !done });

    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      if (!line) {
        flushEvent();
        continue;
      }

      if (line.startsWith("data:")) {
        eventLines.push(line.slice(5).trimStart());
      }
    }

    if (done) {
      if (buffer.startsWith("data:")) {
        eventLines.push(buffer.slice(5).trimStart());
      }
      flushEvent();
      break;
    }
  }

  const completion = parts.join("");

  if (!completion.trim()) {
    throw new ChatCompletionError("The gateway returned no completion text.");
  }

  return completion;
}
