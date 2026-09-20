import React from 'react';
import { 
  CheckCircle2, 
  Loader2, 
  ArrowRight, 
  ShieldAlert, 
  Compass, 
  Terminal, 
  Sparkles,
  Layers,
  Cpu
} from 'lucide-react';

const AGENT_STAGES = [
  { 
    id: 'planner', 
    name: 'Planner Agent', 
    round: 'Round 1', 
    role: 'Decomposition & Scoping', 
    icon: Compass, 
    badgeColor: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    activeColor: 'border-indigo-500/80 ring-1 ring-indigo-500/40 bg-indigo-950/20'
  },
  { 
    id: 'executor', 
    name: 'Executor Agent', 
    round: 'Round 2', 
    role: 'Technical Architecture', 
    icon: Terminal, 
    badgeColor: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    activeColor: 'border-cyan-500/80 ring-1 ring-cyan-500/40 bg-cyan-950/20'
  },
  { 
    id: 'critic', 
    name: 'Critic Agent', 
    round: 'Round 3', 
    role: 'Adversarial Risk Audit', 
    icon: ShieldAlert, 
    badgeColor: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
    activeColor: 'border-rose-500/80 ring-1 ring-rose-500/40 bg-rose-950/20'
  },
  { 
    id: 'synthesizer', 
    name: 'Synthesizer Agent', 
    round: 'Round 4', 
    role: 'Consensus Blueprint', 
    icon: Sparkles, 
    badgeColor: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
    activeColor: 'border-violet-500/80 ring-1 ring-violet-500/40 bg-violet-950/20'
  },
];

export default function AgentPipelineFlow({ currentAgent, outputs, isRunning }) {
  const completedCount = Object.keys(outputs || {}).length;
  const progressPercent = Math.min(100, Math.round((completedCount / 4) * 100));

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="studio-card rounded-2xl p-4 border border-white/[0.07]">
        
        {/* Header telemetry banner */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3.5 pb-2.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-300 font-mono flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Agent Message Passing Protocol
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
              Sequential Deliberation Pipeline
            </span>
          </div>

          <div className="flex items-center gap-3">
            {isRunning ? (
              <div className="flex items-center gap-2 text-xs font-medium text-indigo-300">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                <span>Round {completedCount + 1} of 4 in progress...</span>
              </div>
            ) : completedCount === 4 ? (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-400">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Consensus Reached (100%)</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 font-mono">
                Pipeline Ready
              </span>
            )}
          </div>
        </div>

        {/* 4-Agent Pipeline Sequence Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
          {AGENT_STAGES.map((ag, idx) => {
            const isDone = !!outputs[ag.id];
            const isCurrent = currentAgent === ag.id && isRunning;
            const isPending = !isDone && !isCurrent;
            const Icon = ag.icon;

            return (
              <div
                key={ag.id}
                className={`relative flex items-center p-3 rounded-xl border transition-all duration-200 ${
                  isCurrent
                    ? `${ag.activeColor} shadow-md`
                    : isDone
                      ? 'bg-obsidian-850/90 border-white/[0.12] text-slate-200'
                      : 'bg-obsidian-950/40 border-white/[0.04] opacity-50'
                }`}
              >
                {/* Agent Icon Badge */}
                <div className={`p-2 rounded-lg border ${ag.badgeColor} mr-3 flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white truncate">
                      {ag.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 ml-1">
                      {ag.round}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">
                    {ag.role}
                  </p>
                </div>

                {/* Status Indicator */}
                <div className="ml-2 flex-shrink-0">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-indigo-400 animate-spin" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-700 block" />
                  )}
                </div>

                {/* Flow connector arrow for desktop */}
                {idx < 3 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                  </div>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
