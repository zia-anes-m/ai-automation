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
import { AlertCircle, RefreshCw } from 'lucide-react';

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

  // Connection State: 'connecting' | 'connected' | 'disconnected'
  const [connectionState, setConnectionState] = useState('connecting');
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
  const reconnectTimeoutRef = useRef(null);
  const retryCountRef = useRef(0);

  const apiUrl = getApiUrl();
  const wsUrl = getWsUrl();

  // Load scenarios and agent configs from backend
  useEffect(() => {
    const fetchScenariosUrl = `${apiUrl}/api/scenarios`;
    const fetchHistoryUrl = `${apiUrl}/api/history`;

    console.log(`[AGENT-SYNC] Fetching scenarios from ${fetchScenariosUrl}`);

    fetch(fetchScenariosUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.scenarios && data.scenarios.length > 0) {
          console.log(`[AGENT-SYNC] Loaded ${data.scenarios.length} scenarios from backend`);
          setScenarios(data.scenarios);
          setSelectedScenario(data.scenarios[0]);
          setTaskPrompt(data.scenarios[0].prompt);
        }
      })
      .catch((err) => {
        console.warn('[AGENT-SYNC] Backend scenarios API unavailable, initialized with default benchmark scenarios:', err.message);
      });

    fetch(fetchHistoryUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (data.history) setHistoryList(data.history);
      })
      .catch((err) => {
        console.warn('[AGENT-SYNC] History API unavailable:', err.message);
      });
  }, [apiUrl]);

  // WebSocket Connection Management
  const connectWebSocket = useCallback(() => {
    if (wsRef.current && (wsRef.current.readyState === WebSocket.OPEN || wsRef.current.readyState === WebSocket.CONNECTING)) {
      return;
    }

    setConnectionState('connecting');
    console.log(`[AGENT-SYNC WS] Connecting to ${wsUrl}`);

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log(`[AGENT-SYNC WS] Successfully connected to ${wsUrl}`);
        setConnectionState('connected');
        setConnectionErrorMsg(null);
        retryCountRef.current = 0;
      };

      ws.onclose = (event) => {
        console.warn(`[AGENT-SYNC WS] Connection closed (code: ${event.code}, reason: "${event.reason || 'None'}").`);
        setConnectionState('disconnected');
        wsRef.current = null;

        // Schedule auto-reconnect with exponential backoff (min 2.5s, max 15s)
        const delay = Math.min(15000, Math.pow(1.5, retryCountRef.current) * 2500);
        retryCountRef.current += 1;
        
        if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = setTimeout(() => {
          connectWebSocket();
        }, delay);
      };

      ws.onerror = (error) => {
        console.error(`[AGENT-SYNC WS] Error connecting to ${wsUrl}:`, error);
        setConnectionState('disconnected');
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);

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
            // Confetti upon consensus
            try {
              confetti({
                particleCount: 60,
                spread: 60,
                origin: { y: 0.65 },
                colors: ['#6366f1', '#06b6d4', '#8b5cf6', '#10b981']
              });
            } catch (e) {}
            // Update history
            if (msg.summary) {
              setHistoryList((prev) => [msg.summary, ...prev.filter((h) => h.sessionId !== msg.summary.sessionId)]);
            }
          } else if (msg.type === 'single_agent_chunk') {
            setSingleOutputChunk(msg.accumulated);
          } else if (msg.type === 'comparison_complete') {
            setIsRunningComparison(false);
            setComparisonData(msg.comparison);
          } else if (msg.type === 'error') {
            console.error('[AGENT-SYNC WS] Server error payload:', msg.message);
            setConnectionErrorMsg(`Execution Error: ${msg.message}`);
            setIsRunning(false);
            setIsRunningComparison(false);
          }
        } catch (e) {
          console.error('[AGENT-SYNC WS] Error parsing message payload:', e);
        }
      };
    } catch (err) {
      console.error('[AGENT-SYNC WS] Failed to initialize WebSocket:', err);
      setConnectionState('disconnected');
    }
  }, [wsUrl]);

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connectWebSocket]);

  const handleSelectScenario = (sc) => {
    setSelectedScenario(sc);
    setTaskPrompt(sc.prompt);
  };

  const handleSaveApiKeys = (newKeys) => {
    setApiKeys(newKeys);
    localStorage.setItem('agentsync_keys', JSON.stringify(newKeys));
  };

  // Start Pipeline Execution
  const handleStartExecution = () => {
    if (!taskPrompt.trim() || isRunning) return;

    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setConnectionErrorMsg(`Backend server is currently offline or unreachable at ${wsUrl}. Please ensure your backend is deployed and VITE_WS_URL is set.`);
      return;
    }

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

    try {
      wsRef.current.send(JSON.stringify({
        type: 'start_task',
        sessionId: newSessionId,
        taskPrompt,
        provider,
        apiKey: activeKey
      }));
    } catch (err) {
      console.error('[AGENT-SYNC] Failed to send start_task message:', err);
      setIsRunning(false);
      setConnectionErrorMsg('Failed to send task to backend.');
    }
  };

  const handleAbortExecution = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && currentSessionId) {
      wsRef.current.send(JSON.stringify({
        type: 'abort_task',
        sessionId: currentSessionId
      }));
    }
    setIsRunning(false);
    setCurrentAgent(null);
  };

  const handleRunComparison = () => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      setConnectionErrorMsg(`Backend server is currently offline or unreachable at ${wsUrl}.`);
      return;
    }

    setConnectionErrorMsg(null);
    setIsRunningComparison(true);
    setSingleOutputChunk('');

    const activeKey = provider === 'anthropic' ? apiKeys.anthropic : provider === 'gemini' ? apiKeys.gemini : apiKeys.openai;

    try {
      wsRef.current.send(JSON.stringify({
        type: 'run_comparison',
        sessionId: currentSessionId || `session_${Date.now()}`,
        taskPrompt,
        provider,
        apiKey: activeKey
      }));
    } catch (err) {
      console.error('[AGENT-SYNC] Failed to send run_comparison message:', err);
      setIsRunningComparison(false);
      setConnectionErrorMsg('Failed to run comparison on backend.');
    }
  };

  const handleExportPlan = () => {
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
  };

  const handleLoadSession = (item) => {
    setTaskPrompt(item.taskPrompt);
    setOutputs(item.outputs || {});
    setCurrentSessionId(item.sessionId);
    setActiveTab('plan');
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-slate-100 flex flex-col justify-between bg-grid-pattern relative">
      
      {/* Background radial ambient illumination */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_60%_at_50%_-20%,rgba(99,102,241,0.12),rgba(255,255,255,0))]" />

      <div className="relative z-10">
        {/* Navigation */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          connectionState={connectionState}
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
                onClick={() => {
                  setConnectionErrorMsg(null);
                  connectWebSocket();
                }}
                className="px-2.5 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-medium text-[11px] flex items-center gap-1 transition-all flex-shrink-0"
              >
                <RefreshCw className="w-3 h-3" /> Retry Connection
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
          <span className="text-slate-500">Structured Message Passing • Full Reasoning Transparency</span>
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
