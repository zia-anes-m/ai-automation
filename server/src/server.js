import express from "express";
import http from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import { DEMO_SCENARIOS } from "./agents/scenarios.js";
import { AGENT_CONFIGS } from "./agents/prompts.js";
import { OrchestrationSession } from "./agents/orchestrator.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

const PORT = process.env.PORT || 5000;

// Enable CORS and JSON parsing
app.use(cors({ origin: "*" }));
app.use(express.json());

// In-memory session store
const sessions = new Map();
const sessionHistory = [];

// Broadcast helper to WS clients interested in a session
function broadcastSessionEvent(sessionId, event) {
  const payload = JSON.stringify(event);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      if (!client.activeSessionId || client.activeSessionId === sessionId) {
        client.send(payload);
      }
    }
  });
}

// WebSocket connection handling
wss.on("connection", (ws) => {
  ws.activeSessionId = null;

  ws.on("message", async (rawMessage) => {
    try {
      const data = JSON.parse(rawMessage.toString());

      if (data.type === "subscribe") {
        ws.activeSessionId = data.sessionId;
        ws.send(JSON.stringify({ type: "subscribed", sessionId: data.sessionId }));
      } else if (data.type === "start_task") {
        const sessionId = data.sessionId || `session_${Date.now()}`;
        ws.activeSessionId = sessionId;

        const session = new OrchestrationSession({
          sessionId,
          taskPrompt: data.taskPrompt,
          provider: data.provider || "simulation",
          apiKey: data.apiKey || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || null,
          emitEvent: (event) => broadcastSessionEvent(sessionId, event)
        });

        sessions.set(sessionId, session);

        // Run multi-agent pipeline asynchronously
        const summary = await session.runMultiAgentPipeline();
        if (summary) {
          sessionHistory.unshift(summary);
          if (sessionHistory.length > 50) sessionHistory.pop();
        }
      } else if (data.type === "run_comparison") {
        const sessionId = data.sessionId;
        let session = sessions.get(sessionId);
        if (!session) {
          session = new OrchestrationSession({
            sessionId: sessionId || `session_${Date.now()}`,
            taskPrompt: data.taskPrompt || "Test Task",
            provider: data.provider || "simulation",
            apiKey: data.apiKey || null,
            emitEvent: (event) => broadcastSessionEvent(sessionId, event)
          });
          sessions.set(sessionId, session);
        }
        await session.runSingleAgentComparison();
      } else if (data.type === "abort_task") {
        const session = sessions.get(data.sessionId);
        if (session) {
          session.abort();
        }
      }
    } catch (err) {
      ws.send(JSON.stringify({ type: "error", message: err.message }));
    }
  });

  ws.send(JSON.stringify({ type: "connected", message: "AGENT-SYNC WebSocket Connected" }));
});

// REST API Endpoints
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "AGENT-SYNC Multi-Agent Platform",
    timestamp: new Date().toISOString()
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

// Download/Export Endpoint
app.get("/api/export/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const session = sessions.get(sessionId) || sessionHistory.find((s) => s.sessionId === sessionId);

  if (!session) {
    return res.status(404).send("Session not found");
  }

  const format = req.query.format || "markdown";
  const outputs = session.outputs || {};

  if (format === "json") {
    res.setHeader("Content-Disposition", `attachment; filename="agent-sync-${sessionId}.json"`);
    res.setHeader("Content-Type", "application/json");
    return res.json(session);
  }

  // Markdown Export
  let md = `# AGENT-SYNC Multi-Agent Execution Plan\n\n`;
  md += `**Task:** ${session.taskPrompt}\n`;
  md += `**Generated:** ${new Date().toISOString()}\n\n`;
  md += `---\n\n`;

  if (outputs.synthesizer) {
    md += `## Final Master Consensus Plan (Synthesizer Agent)\n\n${outputs.synthesizer.content}\n\n---\n\n`;
  }
  if (outputs.planner) {
    md += `## Strategic Breakdown (Planner Agent)\n\n${outputs.planner.content}\n\n---\n\n`;
  }
  if (outputs.executor) {
    md += `## Technical Architecture (Executor Agent)\n\n${outputs.executor.content}\n\n---\n\n`;
  }
  if (outputs.critic) {
    md += `## Adversarial Risk Review (Critic Agent)\n\n${outputs.critic.content}\n\n---\n\n`;
  }

  res.setHeader("Content-Disposition", `attachment; filename="agent-sync-${sessionId}.md"`);
  res.setHeader("Content-Type", "text/markdown");
  res.send(md);
});

// Start Server
server.listen(PORT, () => {
  console.log(`🚀 AGENT-SYNC Orchestration Server running on http://localhost:${PORT}`);
  console.log(`📡 WebSocket endpoint live at ws://localhost:${PORT}/ws`);
});
