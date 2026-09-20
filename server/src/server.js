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

// Dynamic CORS Configuration
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((s) => s.trim())
  : [
      "https://autonomous-ai-agents.vercel.app",
      "http://localhost:5173",
      "http://localhost:3000",
      "http://localhost:5000"
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Log rejected origins for diagnostic visibility
        console.warn(`[CORS] Request from origin ${origin} accepted under permissive fallback.`);
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
  })
);

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

// WebSocket connection handling & heartbeat
wss.on("connection", (ws, req) => {
  const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  console.log(`[WS] New client connected from ${clientIp}`);

  ws.isAlive = true;
  ws.activeSessionId = null;

  ws.on("pong", () => {
    ws.isAlive = true;
  });

  ws.on("message", async (rawMessage) => {
    try {
      const data = JSON.parse(rawMessage.toString());

      if (data.type === "subscribe") {
        ws.activeSessionId = data.sessionId;
        ws.send(JSON.stringify({ type: "subscribed", sessionId: data.sessionId }));
      } else if (data.type === "start_task") {
        const sessionId = data.sessionId || `session_${Date.now()}`;
        ws.activeSessionId = sessionId;
        console.log(`[TASK] Initiating 4-Agent Pipeline for session: ${sessionId} (Engine: ${data.provider || 'simulation'})`);

        const session = new OrchestrationSession({
          sessionId,
          taskPrompt: data.taskPrompt,
          provider: data.provider || "simulation",
          apiKey: data.apiKey || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || null,
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
        console.log(`[BENCHMARK] Running side-by-side comparison for session: ${sessionId}`);
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
        console.log(`[TASK] Aborting session: ${data.sessionId}`);
        const session = sessions.get(data.sessionId);
        if (session) {
          session.abort();
        }
      }
    } catch (err) {
      console.error("[WS] Error processing client message:", err.message);
      ws.send(JSON.stringify({ type: "error", message: err.message }));
    }
  });

  ws.on("close", (code, reason) => {
    console.log(`[WS] Client disconnected (code: ${code}, reason: "${reason.toString() || 'Normal closure'}")`);
  });

  ws.on("error", (err) => {
    console.error("[WS] Client connection error:", err.message);
  });

  // Initial welcome message
  ws.send(JSON.stringify({ 
    type: "connected", 
    message: "AGENT-SYNC Multi-Agent Server Connected",
    timestamp: new Date().toISOString()
  }));
});

// Periodic heartbeat to prevent cloud load balancer timeouts (every 30s)
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on("close", () => {
  clearInterval(interval);
});

// REST API Endpoints
app.get("/", (req, res) => {
  res.json({
    status: "online",
    service: "AGENT-SYNC Multi-Agent Platform Server",
    version: "2.4.0",
    websocket: "/ws",
    endpoints: {
      health: "/api/health",
      scenarios: "/api/scenarios",
      agents: "/api/agents",
      history: "/api/history"
    }
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "AGENT-SYNC Multi-Agent Platform",
    timestamp: new Date().toISOString(),
    activeSessions: sessions.size,
    connectedClients: wss.clients.size
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
  console.log(`🚀 AGENT-SYNC Orchestration Server running on port ${PORT}`);
  console.log(`📡 WebSocket endpoint live at ws://localhost:${PORT}/ws`);
});
