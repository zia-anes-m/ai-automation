import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import TaskInput from './components/TaskInput';
import AgentPipelineFlow from './components/AgentPipelineFlow';
import AgentCard from './components/AgentCard';
import SynthesizerPlanView from './components/SynthesizerPlanView';
import ComparisonView from './components/ComparisonView';
import HistoryModal from './components/HistoryModal';
import SettingsModal from './components/SettingsModal';
import { getApiUrl, getWsUrl } from './config';
import { DEFAULT_SCENARIOS } from './data/defaultScenarios';
import { AlertCircle } from 'lucide-react';

const DEFAULT_AGENTS = {
  planner: {
    id: "planner",
    name: "Planner Agent",
    role: "Task Decomposition & Work Breakdown",
    personality: "Strategic, Structured, Analytical",
    color: "#6366f1",
    accentBg: "rgba(99, 102, 241, 0.08)",
    accentBorder: "rgba(99, 102, 241, 0.22)",
  },
  executor: {
    id: "executor",
    name: "Executor Agent",
    role: "Technical Implementation & System Architecture",
    personality: "Practical, Concrete, Code-Ready",
    color: "#06b6d4",
    accentBg: "rgba(6, 182, 212, 0.08)",
    accentBorder: "rgba(6, 182, 212, 0.22)",
  },
  critic: {
    id: "critic",
    name: "Critic Agent",
    role: "Adversarial Risk Audit & Vulnerability Detection",
    personality: "Skeptical, Exhaustive, Security-Focused",
    color: "#f43f5e",
    accentBg: "rgba(244, 63, 94, 0.08)",
    accentBorder: "rgba(244, 63, 94, 0.22)",
  },
  synthesizer: {
    id: "synthesizer",
    name: "Synthesizer Agent",
    role: "Consensus Authority & Final Blueprint Assembly",
    personality: "Harmonizing, Authoritative, Unified",
    color: "#8b5cf6",
    accentBg: "rgba(139, 92, 246, 0.08)",
    accentBorder: "rgba(139, 92, 246, 0.22)",
  }
};

export default function App() {
  const [activeTab, setActiveTab] = useState('pipeline');
  const [scenarios, setScenarios] = useState(DEFAULT_SCENARIOS);
  const [selectedScenario, setSelectedScenario] = useState(DEFAULT_SCENARIOS[0]);
  const [taskPrompt, setTaskPrompt] = useState(DEFAULT_SCENARIOS[0].prompt);
  
  const [provider, setProvider] = useState('simulation');
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('agentsync_keys');
      return saved ? JSON.parse(saved) : { anthropic: '', gemini: '', openai: '' };
    } catch {
      return { anthropic: '', gemini: '', openai: '' };
    }
  });

  // Connection State: 'connected' | 'connecting' | 'disconnected'
  const [connectionState, setConnectionState] = useState('connecting');
  const [isHttpLive, setIsHttpLive] = useState(false);
  const [connectionErrorMsg, setConnectionErrorMsg] = useState(null);

  const [isRunning, setIsRunning] = useState(false);
  const [currentAgent, setCurrentAgent] = useState(null);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Streaming data
  const [streamingChunks, setStreamingChunks] = useState({});
  const [outputs, setOutputs] = useState({});
  const [historyList, setHistoryList] = useState([]);

  // Comparison State
  const [comparisonData, setComparisonData] = useState(null);
  const [singleOutputChunk, setSingleOutputChunk] = useState('');
  const [isRunningComparison, setIsRunningComparison] = useState(false);

  // Modals
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const wsRef = useRef(null);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef(null);

  const apiUrl = getApiUrl();
  const wsUrl = getWsUrl();

  // Handle inbound agent event (unified across WS and SSE)
  const handleAgentEvent = useCallback((msg) => {
    if (!msg) return;

    if (msg.type === 'agent_start') {
      setCurrentAgent(msg.agentId);
      setStreamingChunks((prev) => ({ ...prev, [msg.agentId]: '' }));
    } else if (msg.type === 'agent_chunk') {
      setStreamingChunks((prev) => ({ ...prev, [msg.agentId]: msg.accumulated }));
    } else if (msg.type === 'agent_complete') {
      setOutputs((prev) => ({ ...prev, [msg.agentId]: msg.message }));
      setStreamingChunks((prev) => ({ ...prev, [msg.agentId]: '' }));
    } else if (msg.type === 'session_complete') {
      setIsRunning(false);
      setCurrentAgent(null);
      try {
        confetti({
          particleCount: 60,
          spread: 60,
          origin: { y: 0.65 },
          colors: ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981']
        });
      } catch (e) {}
      if (msg.summary) {
        setHistoryList((prev) => [msg.summary, ...prev.filter((h) => h.sessionId !== msg.summary.sessionId)]);
      }
    } else if (msg.type === 'single_agent_chunk') {
      setSingleOutputChunk(msg.accumulated);
    } else if (msg.type === 'comparison_complete') {
      setIsRunningComparison(false);
      setComparisonData(msg.comparison);
    } else if (msg.type === 'error') {
      setConnectionErrorMsg(`Server Error: ${msg.message}`);
      setIsRunning(false);
      setIsRunningComparison(false);
    }
  }, []);

  // Load scenarios and agent configs from backend once on mount
  useEffect(() => {
    const fetchScenariosUrl = `${apiUrl}/api/scenarios`;
    const fetchHistoryUrl = `${apiUrl}/api/history`;

    fetch(fetchScenariosUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        setIsHttpLive(true);
        if (data.scenarios && data.scenarios.length > 0) {
          setScenarios(data.scenarios);
          setSelectedScenario(data.scenarios[0]);
          setTaskPrompt(data.scenarios[0].prompt);
        }
      })
      .catch(() => {
        setIsHttpLive(false);
      });

    fetch(fetchHistoryUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.history) setHistoryList(data.history);
      })
      .catch(() => {});
  }, [apiUrl]);

  // Robust WebSocket Connection Lifecycle (Single connection, no redundant reconnection)
  useEffect(() => {
    let isMounted = true;
    let socket = null;
    let reconnectTimeout = null;

    function connect() {
      if (!isMounted) return;
      if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
        return;
      }

      setConnectionState('connecting');

      try {
        const ws = new WebSocket(wsUrl);
        socket = ws;
        wsRef.current = ws;

        ws.onopen = () => {
          if (!isMounted) return ws.close();
          setConnectionState('connected');
          setConnectionErrorMsg(null);
          retryCountRef.current = 0;
        };

        ws.onclose = () => {
          if (!isMounted) return;
          setConnectionState('disconnected');
          wsRef.current = null;

          // Controlled reconnect backoff (max 5 retries, 2-10s interval)
          if (retryCountRef.current < 5) {
            const delay = Math.min(10000, Math.pow(1.5, retryCountRef.current) * 2000);
            retryCountRef.current += 1;

            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            reconnectTimeout = setTimeout(() => {
              if (isMounted) connect();
            }, delay);
          }
        };

        ws.onerror = () => {
          if (!isMounted) return;
          setConnectionState('disconnected');
        };

        ws.onmessage = (event) => {
          if (!isMounted) return;
          try {
            const msg = JSON.parse(event.data);
            handleAgentEvent(msg);
          } catch (e) {
            console.error('[AGENT-SYNC WS] Parse error:', e);
          }
        };
      } catch (err) {
        if (isMounted) setConnectionState('disconnected');
      }
    }

    connect();

    return () => {
      isMounted = false;
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (socket) {
        socket.onopen = null;
        socket.onclose = null;
        socket.onerror = null;
        socket.onmessage = null;
        if (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING) {
          socket.close();
        }
      }
      wsRef.current = null;
    };
  }, [wsUrl, handleAgentEvent]);

  // Determine effective connection state for UI
  const effectiveConnectionState = connectionState === 'connected' ? 'connected' : (isHttpLive ? 'connected' : connectionState);

  const handleSelectScenario = useCallback((sc) => {
    setSelectedScenario(sc);
    setTaskPrompt(sc.prompt);
  }, []);

  const handleSaveApiKeys = useCallback((newKeys) => {
    setApiKeys(newKeys);
    localStorage.setItem('agentsync_keys', JSON.stringify(newKeys));
  }, []);

  // Helper: Read SSE Stream
  const readSSEStream = async (response) => {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop(); // keep remainder

      for (const block of lines) {
        const line = block.trim();
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            handleAgentEvent(data);
          } catch (e) {
            console.error('SSE parse error:', e);
          }
        }
      }
    }
  };

  // Start Pipeline Execution (Strictly single run per click)
  const handleStartExecution = useCallback(async () => {
    if (!taskPrompt.trim() || isRunning) return;

    setConnectionErrorMsg(null);
    const newSessionId = `session_${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setIsRunning(true);
    setOutputs({});
    setStreamingChunks({});
    setComparisonData(null);
    setSingleOutputChunk('');
    setActiveTab('pipeline');

    const activeKey = provider === 'anthropic' ? apiKeys.anthropic : provider === 'gemini' ? apiKeys.gemini : apiKeys.openai;

    // Primary: Real-time WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'start_task',
          sessionId: newSessionId,
          taskPrompt,
          provider,
          apiKey: activeKey
        }));
        return;
      } catch (err) {
        console.warn('WS send failed, falling back to SSE:', err);
      }
    }

    // Resilient Fallback: HTTP Server-Sent Events (SSE) Stream
    try {
      abortControllerRef.current = new AbortController();
      const res = await fetch(`${apiUrl}/api/task/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: newSessionId,
          taskPrompt,
          provider,
          apiKey: activeKey
        }),
        signal: abortControllerRef.current.signal
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await readSSEStream(res);
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Task execution error:', err);
        setConnectionErrorMsg(`Execution error: ${err.message}`);
      }
      setIsRunning(false);
    }
  }, [taskPrompt, isRunning, provider, apiKeys, apiUrl]);

  const handleAbortExecution = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentSessionId) {
      wsRef.current.send(JSON.stringify({
        type: 'abort_task',
        sessionId: currentSessionId
      }));
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsRunning(false);
    setCurrentAgent(null);
  }, [currentSessionId]);

  const handleRunComparison = useCallback(async () => {
    if (isRunningComparison) return;

    setConnectionErrorMsg(null);
    setIsRunningComparison(true);
    setSingleOutputChunk('');

    const activeKey = provider === 'anthropic' ? apiKeys.anthropic : provider === 'gemini' ? apiKeys.gemini : apiKeys.openai;
    const cmpSessionId = currentSessionId || `session_${Date.now()}`;

    // Primary: WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({
          type: 'run_comparison',
          sessionId: cmpSessionId,
          taskPrompt,
          provider,
          apiKey: activeKey
        }));
        return;
      } catch (err) {
        console.warn('WS comparison failed, falling back to HTTP stream:', err);
      }
    }

    // Fallback: HTTP SSE Stream
    try {
      const res = await fetch(`${apiUrl}/api/task/comparison`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: cmpSessionId,
          taskPrompt,
          provider,
          apiKey: activeKey
        })
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      await readSSEStream(res);
    } catch (err) {
      console.error('Comparison error:', err);
      setIsRunningComparison(false);
      setConnectionErrorMsg('Failed to run comparison on server.');
    }
  }, [isRunningComparison, currentSessionId, taskPrompt, provider, apiKeys, apiUrl]);

  const handleExportPlan = useCallback(() => {
    if (!outputs.synthesizer) return;
    const planText = `# AGENT-SYNC Master Consensus Blueprint\n\n**Mission Objective:** ${taskPrompt}\n\n${outputs.synthesizer.content}\n\n---\n\n` +
      `## 1. Planner Agent Breakdown\n${outputs.planner?.content || ''}\n\n---\n\n` +
      `## 2. Executor Agent Architecture\n${outputs.executor?.content || ''}\n\n---\n\n` +
      `## 3. Critic Adversarial Review\n${outputs.critic?.content || ''}`;

    const blob = new Blob([planText], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agentsync-blueprint-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }, [outputs, taskPrompt]);

  const handleLoadSession = useCallback((item) => {
    setTaskPrompt(item.taskPrompt);
    setOutputs(item.outputs || {});
    setCurrentSessionId(item.sessionId);
    setActiveTab('plan');
  }, []);

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col justify-between bg-grid-pattern relative">
      
      {/* Background radial ambient illumination */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.12),rgba(255,255,255,0))]" />

      <div className="relative z-10">
        {/* Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          connectionState={effectiveConnectionState}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          hasPlan={!!outputs.synthesizer}
          onExport={handleExportPlan}
        />

        {/* Offline / Connection Error Banner */}
        {connectionErrorMsg && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-200 text-xs flex items-center justify-between gap-3 shadow-md">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{connectionErrorMsg}</span>
              </div>
              <button
                onClick={() => setConnectionErrorMsg(null)}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium text-[11px] flex items-center gap-1 transition-all flex-shrink-0"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* Studio Task Orchestration Deck */}
        <TaskInput
          scenarios={scenarios}
          selectedScenario={selectedScenario}
          onSelectScenario={handleSelectScenario}
          taskPrompt={taskPrompt}
          setTaskPrompt={setTaskPrompt}
          isRunning={isRunning}
          onStartExecution={handleStartExecution}
          onAbortExecution={handleAbortExecution}
          provider={provider}
          setProvider={setProvider}
        />

        {/* Real-Time Agent Pipeline Telemetry */}
        <AgentPipelineFlow
          currentAgent={currentAgent}
          outputs={outputs}
          isRunning={isRunning}
        />

        {/* Studio Viewport Tabs */}
        {activeTab === 'pipeline' && (
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-14">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {['planner', 'executor', 'critic', 'synthesizer'].map((agentKey) => (
                <AgentCard
                  key={agentKey}
                  agentKey={agentKey}
                  config={DEFAULT_AGENTS[agentKey]}
                  data={outputs[agentKey]}
                  streamingChunk={streamingChunks[agentKey]}
                  isActive={currentAgent === agentKey && isRunning}
                  isCompleted={!!outputs[agentKey]}
                />
              ))}
            </div>
          </main>
        )}

        {activeTab === 'comparison' && (
          <ComparisonView
            comparisonData={comparisonData}
            singleOutputChunk={singleOutputChunk}
            onRunComparison={handleRunComparison}
            isRunningComparison={isRunningComparison}
            multiAgentOutputs={outputs}
          />
        )}

        {activeTab === 'plan' && (
          <SynthesizerPlanView
            planData={outputs.synthesizer}
            onExport={handleExportPlan}
          />
        )}
      </div>

      {/* Enterprise Studio Footer */}
      <footer className="relative z-10 w-full border-t border-white/[0.06] py-4 px-6 text-xs text-slate-500 bg-obsidian-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 font-mono text-[11px]">
          <span className="text-slate-400">AGENT-SYNC Studio • 4-Agent Autonomous Deliberation Protocol</span>
          <span className="text-slate-500">Structured Message Passing • Unified Pipeline</span>
        </div>
      </footer>

      {/* Modals */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={historyList}
        onLoadSession={handleLoadSession}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKeys={apiKeys}
        onSaveApiKeys={handleSaveApiKeys}
      />

    </div>
  );
}
