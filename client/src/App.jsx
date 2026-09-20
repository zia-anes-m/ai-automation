import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import Navbar from './components/Navbar';
import TaskInput from './components/TaskInput';
import AgentPipelineFlow from './components/AgentPipelineFlow';
import AgentCard from './components/AgentCard';
import SynthesizerPlanView from './components/SynthesizerPlanView';
import ComparisonView from './components/ComparisonView';
import HistoryModal from './components/HistoryModal';
import SettingsModal from './components/SettingsModal';

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
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [taskPrompt, setTaskPrompt] = useState('');
  
  const [provider, setProvider] = useState('simulation');
  const [apiKeys, setApiKeys] = useState(() => {
    try {
      const saved = localStorage.getItem('agentsync_keys');
      return saved ? JSON.parse(saved) : { anthropic: '', gemini: '', openai: '' };
    } catch {
      return { anthropic: '', gemini: '', openai: '' };
    }
  });

  const [isConnected, setIsConnected] = useState(false);
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

  // Load scenarios and agent configs from backend
  useEffect(() => {
    fetch('/api/scenarios')
      .then((res) => res.json())
      .then((data) => {
        if (data.scenarios && data.scenarios.length > 0) {
          setScenarios(data.scenarios);
          setSelectedScenario(data.scenarios[0]);
          setTaskPrompt(data.scenarios[0].prompt);
        }
      })
      .catch((err) => console.log('Using fallback local scenario dataset', err));

    fetch('/api/history')
      .then((res) => res.json())
      .then((data) => {
        if (data.history) setHistoryList(data.history);
      })
      .catch((err) => console.log(err));
  }, []);

  // Initialize WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;

    function connect() {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 3000);
      };

      ws.onerror = () => {
        setIsConnected(false);
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
            setHistoryList((prev) => [msg.summary, ...prev.filter((h) => h.sessionId !== msg.summary.sessionId)]);
          } else if (msg.type === 'single_agent_chunk') {
            setSingleOutputChunk(msg.accumulated);
          } else if (msg.type === 'comparison_complete') {
            setIsRunningComparison(false);
            setComparisonData(msg.comparison);
          }
        } catch (e) {
          console.error('Error parsing WS message', e);
        }
      };
    }

    connect();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

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

    const newSessionId = `session_${Date.now()}`;
    setCurrentSessionId(newSessionId);
    setIsRunning(true);
    setOutputs({});
    setStreamingChunks({});
    setComparisonData(null);
    setSingleOutputChunk('');
    setActiveTab('pipeline');

    const activeKey = provider === 'anthropic' ? apiKeys.anthropic : provider === 'gemini' ? apiKeys.gemini : apiKeys.openai;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'start_task',
        sessionId: newSessionId,
        taskPrompt,
        provider,
        apiKey: activeKey
      }));
    }
  };

  const handleAbortExecution = () => {
    if (wsRef.current && currentSessionId) {
      wsRef.current.send(JSON.stringify({
        type: 'abort_task',
        sessionId: currentSessionId
      }));
    }
    setIsRunning(false);
    setCurrentAgent(null);
  };

  const handleRunComparison = () => {
    setIsRunningComparison(true);
    setSingleOutputChunk('');

    const activeKey = provider === 'anthropic' ? apiKeys.anthropic : provider === 'gemini' ? apiKeys.gemini : apiKeys.openai;

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'run_comparison',
        sessionId: currentSessionId || `session_${Date.now()}`,
        taskPrompt,
        provider,
        apiKey: activeKey
      }));
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
          isConnected={isConnected}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenHistory={() => setIsHistoryOpen(true)}
          hasPlan={!!outputs.synthesizer}
          onExport={handleExportPlan}
        />

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
