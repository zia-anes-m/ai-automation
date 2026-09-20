import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { DEMO_SCENARIOS } from "../server/src/agents/scenarios.js";
import { AGENT_CONFIGS } from "../server/src/agents/prompts.js";
import { OrchestrationSession } from "../server/src/agents/orchestrator.js";

dotenv.config();

const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

const sessions = new Map();
const sessionHistory = [];

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "AGENT-SYNC Multi-Agent Platform (Vercel Serverless Runtime)",
    timestamp: new Date().toISOString(),
    activeSessions: sessions.size
  });
});

app.get("/api/scenarios", (req, res) => {
  res.json({ scenarios: DEMO_SCENARIOS });
});

app.get("/api/agents", (req, res) => {
  res.json({ agents: AGENT_CONFIGS });
});

app.get("/api/history", (req, res) => {
  res.json({ history: sessionHistory });
});

app.get("/api/session/:id", (req, res) => {
  const session = sessions.get(req.params.id);
  const historic = sessionHistory.find((s) => s.sessionId === req.params.id);
  if (session) {
    res.json({ outputs: session.outputs, history: session.history });
  } else if (historic) {
    res.json({ outputs: historic.outputs, summary: historic });
  } else {
    res.status(404).json({ error: "Session not found" });
  }
});

// SSE Streaming Execution Endpoint
app.post("/api/task/start", async (req, res) => {
  const { taskPrompt, provider, apiKey } = req.body || {};
  const sessionId = req.body?.sessionId || `session_${Date.now()}`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const session = new OrchestrationSession({
    sessionId,
    taskPrompt: taskPrompt || "Test Task",
    provider: provider || "simulation",
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || null,
    emitEvent: (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  });

  sessions.set(sessionId, session);

  try {
    const summary = await session.runMultiAgentPipeline();
    if (summary) {
      sessionHistory.unshift(summary);
      if (sessionHistory.length > 50) sessionHistory.pop();
    }
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
  }

  res.end();
});

// SSE Streaming Comparison Endpoint
app.post("/api/task/comparison", async (req, res) => {
  const { taskPrompt, provider, apiKey } = req.body || {};
  const sessionId = req.body?.sessionId || `session_${Date.now()}`;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const session = new OrchestrationSession({
    sessionId,
    taskPrompt: taskPrompt || "Test Task",
    provider: provider || "simulation",
    apiKey: apiKey || null,
    emitEvent: (event) => {
      res.write(`data: ${JSON.stringify(event)}\n\n`);
    }
  });

  try {
    await session.runSingleAgentComparison();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ type: "error", message: err.message })}\n\n`);
  }

  res.end();
});

export default app;
