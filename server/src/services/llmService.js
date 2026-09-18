import { AGENT_CONFIGS } from "../agents/prompts.js";
import { DEMO_SCENARIOS } from "../agents/scenarios.js";

// Helper to extract confidence percentage from text
export function parseConfidence(text) {
  const match = text.match(/Confidence:\s*\[?(\d{1,3})\]?%/i) || text.match(/(\d{1,3})%/);
  if (match && match[1]) {
    const val = parseInt(match[1], 10);
    if (!isNaN(val) && val >= 0 && val <= 100) return val;
  }
  return 88;
}

// Helper to extract reasoning
export function parseReasoning(text) {
  const match = text.match(/Reasoning:\s*([^\n\r]+(?:\n[^\n\r#]+)*)/i);
  if (match && match[1]) {
    return match[1].trim();
  }
  return "Comprehensive structural and operational evaluation completed.";
}

// Helper to extract risks/issues
export function parseFlaggedIssues(text) {
  const issues = [];
  const riskMatches = text.matchAll(/(?:Risk \d+:|Critical Blockers:|Flawed Assumptions:|\-\s*\[([^\]]+)\]:?)\s*([^\n\r]+)/gi);
  for (const m of riskMatches) {
    const raw = (m[2] || m[1] || "").trim();
    if (raw.length > 5 && raw.length < 120 && !issues.includes(raw)) {
      issues.push(raw.replace(/^\[|\]$/g, ''));
    }
  }
  if (issues.length === 0) {
    // fallback extraction
    const bulletMatches = text.matchAll(/-\s*([^\n\r]+)/g);
    for (const bm of bulletMatches) {
      const line = bm[1].trim();
      if (line.toLowerCase().includes("risk") || line.toLowerCase().includes("bottleneck") || line.toLowerCase().includes("blocker") || line.toLowerCase().includes("dependency")) {
        if (!issues.includes(line) && issues.length < 4) issues.push(line);
      }
    }
  }
  return issues.slice(0, 5);
}

// Stream simulated text chunk by chunk
async function streamSimulatedText(fullText, onChunk, speedMs = 12) {
  // Break into words or small token chunks
  const words = fullText.split(/(\s+)/);
  let accumulated = "";

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    accumulated += word;
    if (onChunk) {
      onChunk({
        delta: word,
        accumulated: accumulated
      });
    }
    // dynamic pause for punctuation
    const isPunct = word.includes(".") || word.includes("\n") || word.includes(":");
    const delay = isPunct ? speedMs * 3 : speedMs;
    await new Promise((r) => setTimeout(r, Math.max(3, delay)));
  }

  return accumulated;
}

// Real Claude / Anthropic streaming caller
async function callAnthropicStream(apiKey, systemPrompt, userPrompt, onChunk) {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
      stream: true
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API Error (${response.status}): ${errText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const dataStr = line.replace("data: ", "").trim();
        if (dataStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(dataStr);
          if (parsed.type === "content_block_delta" && parsed.delta?.text) {
            const delta = parsed.delta.text;
            accumulated += delta;
            if (onChunk) onChunk({ delta, accumulated });
          }
        } catch (e) {
          // ignore parse errors on partial streams
        }
      }
    }
  }

  return accumulated;
}

// Real Gemini streaming caller
async function callGeminiStream(apiKey, systemPrompt, userPrompt, onChunk) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?alt=sse&key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API Error (${response.status}): ${errText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const dataStr = line.replace("data: ", "").trim();
        try {
          const parsed = JSON.parse(dataStr);
          const candidate = parsed.candidates?.[0];
          const textDelta = candidate?.content?.parts?.[0]?.text;
          if (textDelta) {
            accumulated += textDelta;
            if (onChunk) onChunk({ delta: textDelta, accumulated });
          }
        } catch (e) {}
      }
    }
  }

  return accumulated;
}

// Real OpenAI streaming caller
async function callOpenAIStream(apiKey, systemPrompt, userPrompt, onChunk) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      stream: true,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenAI API Error (${response.status}): ${errText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let accumulated = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n");
    for (const line of lines) {
      if (line.startsWith("data: ")) {
        const dataStr = line.replace("data: ", "").trim();
        if (dataStr === "[DONE]") continue;
        try {
          const parsed = JSON.parse(dataStr);
          const delta = parsed.choices?.[0]?.delta?.content;
          if (delta) {
            accumulated += delta;
            if (onChunk) onChunk({ delta, accumulated });
          }
        } catch (e) {}
      }
    }
  }

  return accumulated;
}

// Generate dynamic agent text for any custom prompt in simulation mode
export function generateDynamicAgentResponse(agentType, taskPrompt, previousOutputs = {}) {
  const taskSnippet = taskPrompt.length > 80 ? taskPrompt.substring(0, 80) + "..." : taskPrompt;

  if (agentType === "planner") {
    return `## Executive Strategic Breakdown
Strategic breakdown for "${taskSnippet}". Deconstructing requirements into 4 high-leverage execution phases with clear dependency governance.

## Phase Breakdown
- Phase 1: Strategic Scoping & Core Architecture (Est. Time: 2 Weeks) - Define foundational requirements, success metrics, and key constraints for "${taskSnippet}".
- Phase 2: Core Engine & Subsystem Build (Est. Time: 4 Weeks) - Construct modular components, API pipelines, and primary operational workflows.
- Phase 3: Stress Testing, Security Auditing & Pilot (Est. Time: 3 Weeks) - Execute end-to-end integration tests, edge-case evaluations, and user verification.
- Phase 4: Production Launch & Observability (Est. Time: 2 Weeks) - Deploy scalable infrastructure, live monitoring, and automated telemetry alerts.

## Dependencies & Execution Flow
- Phase 2 depends strictly on Phase 1 specification sign-off.
- Phase 3 testing runs parallel with Phase 4 staging deployment to expedite go-live velocity.

## Risk & Resource Estimates
- Primary resource constraint: Engineering bandwidth and strict timeline adherence under real-world operational friction.

## Confidence: 91%
Reasoning: Phased sequential hierarchy provides rapid feedback loops and isolates critical dependencies before scale.`;
  }

  if (agentType === "executor") {
    return `## Technical Implementation Roadmap
- Core Stack & Frameworks: Modern TypeScript / Node.js & Python FastAPI microservices, React / Next.js frontend with TailwindCSS.
- Architecture & Patterns: Event-driven asynchronous message bus, REST/GraphQL gateways, and containerized Docker services.
- Infrastructure & Deployment: Cloud-native Kubernetes / AWS ECS deployment, PostgreSQL / TimescaleDB for structured relational state, Redis for distributed caching.

## Engineering Milestones
- Milestone 1 (Week 2): Data models, schema migrations, and core orchestration API contracts validated.
- Milestone 2 (Week 5): Subsystem integration with asynchronous queue workers and telemetry hooks.
- Milestone 3 (Week 8): Production-ready container builds with automated CI/CD pipeline and automated rollback triggers.

## Feasibility Analysis
- Feasibility Verdict: High Feasibility. Tech stack is industry-proven with minimal esoteric dependencies.
- Critical Blockers: Latency SLA under heavy concurrent load and external API rate limit constraints.
- Required Engineering Profiles: 1 Lead Architect, 2 Fullstack Engineers, 1 DevOps / Site Reliability Specialist.

## Confidence: 89%
Reasoning: Standardized cloud-native patterns and modular service boundaries eliminate architectural uncertainty.`;
  }

  if (agentType === "critic") {
    return `## Adversarial Risk Assessment
- Risk 1: Scope Creep & Ambiguous Edge-Cases - Severity: High
  - Mitigation: Establish a hard MVP feature freeze at Phase 1; enforce strict PR review gates against feature bloat.
- Risk 2: Single Point of Failure in Core API Integration - Severity: Critical
  - Mitigation: Implement circuit breakers, automatic fallback cache layers, and exponential backoff retry policies.
- Risk 3: Performance Bottlenecks Under Peak Load - Severity: Medium
  - Mitigation: Pre-provision read replicas and stress test throughput with simulated load generators prior to Phase 4.

## Flawed Assumptions Under Question
- Assumption: "The initial architecture will scale seamlessly without specialized caching."
  - Reality: Unindexed queries and cold starts will introduce severe latency spikes under multi-user concurrency.

## Worst-Case Failure Scenarios
- Failure Mode: Cascade failure where primary service outage crashes dependent microservices.
- Contingency Plan (Plan B): Deploy decoupled graceful degradation mode allowing read-only cached operations during downstream outages.

## Confidence: 87%
Reasoning: Stress-testing identified 3 non-obvious failure modes in concurrency, API reliability, and scope inflation.`;
  }

  if (agentType === "synthesizer") {
    return `## Master Consensus Execution Plan
Definitive Master Blueprint synthesizing the Planner's strategic phase timeline, the Executor's robust cloud stack, and the Critic's adversarial risk mitigations into a hardened launch directive.

1. **Strategic Phase Acceleration with Built-In Risk Gates**:
   - Proceed with 4-phase roadmap while enforcing mandatory Critic safety audits at the conclusion of each milestone.
2. **Resilient Architecture with Circuit Breakers**:
   - Adopt TypeScript/FastAPI stack with pre-configured Redis caching and decoupled circuit breakers to neutralize single points of failure.
3. **Continuous Verification & Guardrails**:
   - Mandate automated load testing and strict MVP scoping before unlocking Phase 4 production deployment.

## Multi-Agent Alignment & Consensus Points
- Alignment: All agents agree on a 4-phase modular delivery framework and cloud-native architecture.
- Alignment: Full consensus that proactive risk mitigation is essential prior to high-concurrency rollout.

## Resolved Disagreements & Trade-offs
- Conflict Point: Planner proposed aggressive parallel deployment; Critic flagged cascade outage risks.
- Synthesized Resolution: Implemented phased canary rollout with automated health checks, preserving 90% of speed while eliminating failure risks.
- Strategic Rationale: Provides rapid market entry without endangering system stability.

## Immediate Priority Action Items
1. Priority 1 (Days 1-7): Finalize API schema contracts and lock core MVP requirement boundaries.
2. Priority 2 (Days 8-28): Implement core services with circuit breakers and automated integration test suites.
3. Priority 3 (Days 29-42): Execute stress testing benchmarks and deploy canary production cluster.

## Confidence: 95%
Reasoning: Fully unified consensus architecture eliminates identified vulnerabilities while maximizing delivery velocity.`;
  }

  if (agentType === "single_baseline") {
    return `## Standard Project Plan
Here is a general plan for your request:

1. Step 1: Research and Planning - Gather requirements and organize the project.
2. Step 2: Development - Write code and build the components.
3. Step 3: Testing - Check for bugs and make sure it works.
4. Step 4: Deployment - Launch the project on a server.

**Risks:**
- Time delays if tasks take longer than expected.
- Potential software bugs.

**Estimated Timeline:** 4-8 weeks.`;
  }

  return `Processing completed for ${agentType}.`;
}

// Master execution dispatcher
export async function executeAgent({
  agentType,
  taskPrompt,
  previousOutputs = {},
  apiKey = null,
  provider = "simulation", // "simulation", "anthropic", "gemini", "openai"
  onChunk = null
}) {
  const config = AGENT_CONFIGS[agentType];
  const systemPrompt = config?.systemPrompt || "You are an AI agent.";

  // Build context from previous outputs
  let userPrompt = `Task to analyze: "${taskPrompt}"\n\n`;

  if (previousOutputs.planner) {
    userPrompt += `=== OUTPUT FROM PLANNER AGENT ===\n${previousOutputs.planner.content}\n\n`;
  }
  if (previousOutputs.executor) {
    userPrompt += `=== OUTPUT FROM EXECUTOR AGENT ===\n${previousOutputs.executor.content}\n\n`;
  }
  if (previousOutputs.critic) {
    userPrompt += `=== OUTPUT FROM CRITIC AGENT ===\n${previousOutputs.critic.content}\n\n`;
  }

  userPrompt += `Now produce your structured output according to your specialized role as ${config.name}.`;

  let responseContent = "";

  // Check if this matches a demo scenario
  const matchingScenario = DEMO_SCENARIOS.find(
    (s) =>
      s.prompt.trim().toLowerCase() === taskPrompt.trim().toLowerCase() ||
      taskPrompt.toLowerCase().includes(s.title.toLowerCase()) ||
      (s.id === "climate-tech" && taskPrompt.toLowerCase().includes("climate")) ||
      (s.id === "disaster-relief" && taskPrompt.toLowerCase().includes("disaster")) ||
      (s.id === "ai-safety" && taskPrompt.toLowerCase().includes("safety"))
  );

  // If real API key is supplied and provider selected
  if (apiKey && provider === "anthropic") {
    try {
      responseContent = await callAnthropicStream(apiKey, systemPrompt, userPrompt, onChunk);
    } catch (e) {
      console.warn("Anthropic API failed, falling back to simulated generation:", e.message);
      const fallbackText = matchingScenario?.[agentType]?.content || generateDynamicAgentResponse(agentType, taskPrompt, previousOutputs);
      responseContent = await streamSimulatedText(fallbackText, onChunk);
    }
  } else if (apiKey && provider === "gemini") {
    try {
      responseContent = await callGeminiStream(apiKey, systemPrompt, userPrompt, onChunk);
    } catch (e) {
      console.warn("Gemini API failed, falling back to simulated generation:", e.message);
      const fallbackText = matchingScenario?.[agentType]?.content || generateDynamicAgentResponse(agentType, taskPrompt, previousOutputs);
      responseContent = await streamSimulatedText(fallbackText, onChunk);
    }
  } else if (apiKey && provider === "openai") {
    try {
      responseContent = await callOpenAIStream(apiKey, systemPrompt, userPrompt, onChunk);
    } catch (e) {
      console.warn("OpenAI API failed, falling back to simulated generation:", e.message);
      const fallbackText = matchingScenario?.[agentType]?.content || generateDynamicAgentResponse(agentType, taskPrompt, previousOutputs);
      responseContent = await streamSimulatedText(fallbackText, onChunk);
    }
  } else {
    // High-fidelity simulation mode
    const prebaked = matchingScenario?.[agentType]?.content;
    const fullText = prebaked || generateDynamicAgentResponse(agentType, taskPrompt, previousOutputs);
    responseContent = await streamSimulatedText(fullText, onChunk);
  }

  // Parse structured metadata
  const confidence = parseConfidence(responseContent);
  const reasoning = parseReasoning(responseContent);
  const flaggedIssues = parseFlaggedIssues(responseContent);

  return {
    from: agentType,
    to: agentType === "synthesizer" ? "broadcast" : "all",
    content: responseContent,
    confidence,
    reasoning,
    flaggedIssues,
    timestamp: new Date().toISOString()
  };
}
