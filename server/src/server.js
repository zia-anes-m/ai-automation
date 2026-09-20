import express from "express";
import http from "http";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import { DEMO_SCENARIOS } from "./agents/scenarios.js";
import { AGENT_CONFIGS } from "./agents/prompts.js";
import { OrchestrationSession } from "./agents/orchestrator.js";

dotenv.config();

// Global safety handlers so server process NEVER exits unexpectedly
process.on("uncaughtException", (err) => {
  console.error("[SERVER] Uncaught exception:", err.message);
});

process.on("unhandledRejection", (reason) => {
  console.error("[SERVER] Unhandled promise rejection:", reason);
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistDir = path.resolve(__dirname, "../../client/dist");

const app = express();
const server = http.createServer(app);

// Direct WebSocket Server attached to HTTP server
const wss = new WebSocketServer({ noServer: true });

const PORT = process.env.PORT || 5000;

// Permissive CORS for localhost & production
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// In-memory session store
const sessions = new Map();
const sessionHistory = [];
let activePipelineCount = 0;

// Safe Broadcast helper: sends event to all connected clients interested in session
function broadcastSessionEvent(sessionId, event) {
  const payload = JSON.stringify(event);
  wss.clients.forEach((client) => {
    if (client.readyState === 1) { // WebSocket.OPEN
      if (!client.activeSessionId || client.activeSessionId === sessionId) {
        try {
          client.send(payload);
        } catch (err) {
          // Socket closed during send — ignore safely
        }
      }
    }
  });
}

// WebSocket Connection Lifecycle
wss.on("connection", (ws) => {
  ws.activeSessionId = null;
  console.log(`[WS] Client connected (Total active clients: ${wss.clients.size})`);

  ws.on("message", async (rawMessage) => {
    try {
      const data = JSON.parse(rawMessage.toString());

      if (data.type === "subscribe") {
        ws.activeSessionId = data.sessionId;
        try {
          ws.send(JSON.stringify({ type: "subscribed", sessionId: data.sessionId }));
        } catch (e) {}
      } else if (data.type === "start_task") {
        const sessionId = data.sessionId || `session_${Date.now()}`;
        ws.activeSessionId = sessionId;

        console.log(`\n=============================================================`);
        console.log(`[PIPELINE] Received request: sessionId=${sessionId}`);
        console.log(`[PIPELINE] Task: "${(data.taskPrompt || "").substring(0, 70)}..."`);
        console.log(`[PIPELINE] Engine: ${data.provider || "simulation"}`);
        console.log(`=============================================================`);

        // If an existing session for this sessionId is currently running, ignore duplicate
        if (sessions.has(sessionId) && sessions.get(sessionId).isRunning) {
          console.warn(`[PIPELINE] Session ${sessionId} is already running. Ignoring duplicate.`);
          return;
        }

        const session = new OrchestrationSession({
          sessionId,
          taskPrompt: data.taskPrompt,
          provider: data.provider || "simulation",
          apiKey: data.apiKey || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY || null,
          emitEvent: (event) => broadcastSessionEvent(sessionId, event)
        });

        session.isRunning = true;
        sessions.set(sessionId, session);
        activePipelineCount++;

        try {
          const summary = await session.runMultiAgentPipeline();
          if (summary) {
            sessionHistory.unshift(summary);
            if (sessionHistory.length > 50) sessionHistory.pop();
          }
        } finally {
          session.isRunning = false;
          activePipelineCount = Math.max(0, activePipelineCount - 1);
          console.log(`\n[PIPELINE] COMPLETE: sessionId=${sessionId}`);
          console.log(`[PIPELINE] IDLE — Waiting for next user request.\n`);
        }
      } else if (data.type === "run_comparison") {
        const sessionId = data.sessionId || `cmp_${Date.now()}`;
        console.log(`[BENCHMARK] Running comparison for session: ${sessionId}`);

        let session = sessions.get(sessionId);
        if (!session) {
          session = new OrchestrationSession({
            sessionId,
            taskPrompt: data.taskPrompt || "Test Task",
            provider: data.provider || "simulation",
            apiKey: data.apiKey || null,
            emitEvent: (event) => broadcastSessionEvent(sessionId, event)
          });
          sessions.set(sessionId, session);
        }

        await session.runSingleAgentComparison();
        console.log(`[BENCHMARK] Comparison complete for session: ${sessionId}`);
      } else if (data.type === "abort_task") {
        console.log(`[PIPELINE] Abort requested for session: ${data.sessionId}`);
        const session = sessions.get(data.sessionId);
        if (session) {
          session.abort();
        }
      }
    } catch (err) {
      console.error("[WS] Error handling client message:", err.message);
      try {
        ws.send(JSON.stringify({ type: "error", message: err.message }));
      } catch (e) {}
    }
  });

  ws.on("close", () => {
    console.log(`[WS] Client disconnected (Remaining clients: ${wss.clients.size})`);
  });

  ws.on("error", (err) => {
    console.error("[WS] Socket error:", err.message);
  });

  // Welcome handshake
  try {
    ws.send(JSON.stringify({ 
      type: "connected", 
      message: "AGENT-SYNC Multi-Agent Server Connected",
      timestamp: new Date().toISOString()
    }));
  } catch (e) {}
});

// Upgrade handler: Exclusively handle /ws
server.on("upgrade", (request, socket, head) => {
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname === "/ws") {
      wss.handleUpgrade(request, socket, head, (ws) => {
        wss.emit("connection", ws, request);
      });
    } else {
      socket.destroy();
    }
  } catch (e) {
    socket.destroy();
  }
});

// -------------------------------------------------------------
// REST API Endpoints
// -------------------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({
    status: "online",
    service: "AGENT-SYNC Multi-Agent Platform",
    timestamp: new Date().toISOString(),
    activeSessions: sessions.size,
    activePipelines: activePipelineCount,
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

// -------------------------------------------------------------
// Serve React Static Build (client/dist) with SPA fallback
// -------------------------------------------------------------
if (fs.existsSync(clientDistDir)) {
  app.use(express.static(clientDistDir));

  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api") || req.path.startsWith("/ws")) {
      return next();
    }
    res.sendFile(path.join(clientDistDir, "index.html"));
  });
} else {
  app.get("/", (req, res) => {
    res.send("AGENT-SYNC server running. Run 'npm run build' to build the client.");
  });
}

// -------------------------------------------------------------
// Start Server
// -------------------------------------------------------------
server.listen(PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`🚀 AGENT-SYNC Server running on: http://localhost:${PORT}`);
  console.log(`📡 WebSocket endpoint live at: ws://localhost:${PORT}/ws`);
  console.log(`📁 Serving client from: ${clientDistDir}`);
  console.log(`=============================================================\n`);
});
