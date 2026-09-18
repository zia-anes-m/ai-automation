import React from 'react';
import { CheckCircle2, Loader2, ArrowRight, Shield, Compass, Cog, Sparkles } from 'lucide-react';

const AGENT_ORDER = [
  { id: 'planner', name: 'Planner', round: 1, role: 'Task Decomposition', icon: Compass, color: 'border-blue-500 text-blue-400 bg-blue-500/10' },
  { id: 'executor', name: 'Executor', round: 2, role: 'Implementation Details', icon: Cog, color: 'border-emerald-500 text-emerald-400 bg-emerald-500/10' },
  { id: 'critic', name: 'Critic', round: 3, role: 'Risk Identification', icon: Shield, color: 'border-rose-500 text-rose-400 bg-rose-500/10' },
  { id: 'synthesizer', name: 'Synthesizer', round: 4, role: 'Consensus Builder', icon: Sparkles, color: 'border-purple-500 text-purple-400 bg-purple-500/10' },
];

export default function AgentPipelineFlow({ currentAgent, outputs, isRunning }) {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
      <div className="glass-panel p-4 rounded-2xl border border-white/10">
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Message Passing Protocol & Routing Flow
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              AgentMessage (Round 1-4)
            </span>
          </div>

          {isRunning && (
            <div className="flex items-center gap-1.5 text-xs text-purple-400 font-medium animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Real-Time Orchestration in Progress...</span>
            </div>
          )}
        </div>

        {/* 4 Agent Pipeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
          {AGENT_ORDER.map((ag, idx) => {
            const isDone = !!outputs[ag.id];
            const isCurrent = currentAgent === ag.id && isRunning;
            const isPending = !isDone && !isCurrent;
            const Icon = ag.icon;

            return (
              <div
                key={ag.id}
                className={`relative flex items-center p-3 rounded-xl border transition-all duration-300 ${
                  isCurrent
                    ? 'bg-purple-950/40 border-purple-500/80 shadow-lg shadow-purple-900/30 scale-[1.02] ring-1 ring-purple-400'
                    : isDone
                      ? 'bg-cyber-900/80 border-emerald-500/30 text-slate-200'
                      : 'bg-cyber-950/40 border-white/5 opacity-50'
                }`}
              >
                {/* Agent Icon Badge */}
                <div className={`p-2.5 rounded-lg border ${ag.color} mr-3 flex-shrink-0`}>
                  <Icon className="w-4 h-4" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">
                      {ag.name}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      R{ag.round}
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
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  ) : (
                    <span className="w-2 h-2 rounded-full bg-slate-700 block" />
                  )}
                </div>

                {/* Flow Arrow to next item (desktop) */}
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
