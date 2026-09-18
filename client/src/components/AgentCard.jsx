import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  ChevronDown, 
  ChevronUp, 
  AlertCircle, 
  Sparkles, 
  Info, 
  ShieldAlert, 
  Gauge, 
  Clock,
  CheckCircle2,
  Loader2
} from 'lucide-react';

export default function AgentCard({ 
  agentKey, 
  config, 
  data, 
  streamingChunk, 
  isActive, 
  isCompleted 
}) {
  const [showReasoning, setShowReasoning] = useState(false);

  // Confidence color coding as per spec: Green (80%+), Yellow (60-80%), Red (<60%)
  const confidence = data?.confidence || (isActive ? 85 : null);
  const getConfidenceBadge = (val) => {
    if (!val) return null;
    if (val >= 80) return { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30', label: 'High Confidence' };
    if (val >= 60) return { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/30', label: 'Moderate' };
    return { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/30', label: 'Uncertain / Risk Flagged' };
  };

  const badgeStyle = getConfidenceBadge(confidence);
  const rawText = data?.content || streamingChunk || '';

  // Border & Glow Accents based on agent
  const borderClass = isActive 
    ? 'border-purple-500/80 ring-2 ring-purple-500/30 shadow-2xl shadow-purple-900/30'
    : isCompleted
      ? 'border-white/15 shadow-lg shadow-black/40'
      : 'border-white/5 opacity-60';

  return (
    <div className={`glass-panel rounded-2xl border transition-all duration-300 flex flex-col justify-between overflow-hidden ${borderClass}`}>
      
      {/* Card Header */}
      <div className="p-4 border-b border-white/5 bg-cyber-900/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-md"
            style={{ backgroundColor: config.accentBg, border: `1px solid ${config.accentBorder}` }}
          >
            {config.avatar}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-white">
                {config.name}
              </h3>
              {isActive && (
                <span className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                  <Loader2 className="w-3 h-3 animate-spin" /> Thinking...
                </span>
              )}
              {isCompleted && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Done
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {config.role}
            </p>
          </div>
        </div>

        {/* Confidence Gauge Badge */}
        {confidence && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-mono font-bold ${badgeStyle?.bg}`}>
            <Gauge className="w-3.5 h-3.5" />
            <span>{confidence}%</span>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[380px] min-h-[160px] text-xs sm:text-sm text-slate-200">
        {rawText ? (
          <div className="markdown-content">
            <Markdown>{rawText}</Markdown>
            {isActive && (
              <span className="inline-block w-2 h-4 bg-purple-400 animate-pulse ml-1 align-middle" />
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-8">
            <p>Awaiting turn in multi-agent orchestration sequence...</p>
          </div>
        )}
      </div>

      {/* Flagged Risks / Issues Chips */}
      {data?.flaggedIssues && data.flaggedIssues.length > 0 && (
        <div className="px-4 py-2.5 bg-rose-950/20 border-t border-rose-500/20">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Flagged Vulnerabilities & Risks:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {data.flaggedIssues.map((issue, i) => (
              <span 
                key={i} 
                className="text-[10px] px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-300 border border-rose-500/20 font-medium"
              >
                {issue}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Card Footer: Reasoning Transparency (Drill-into-Why) */}
      {data?.reasoning && (
        <div className="border-t border-white/5 bg-cyber-900/40">
          <button
            onClick={() => setShowReasoning(!showReasoning)}
            className="w-full px-4 py-2 flex items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Info className="w-3.5 h-3.5 text-purple-400" />
              Reasoning Transparency Trail
            </span>
            {showReasoning ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {showReasoning && (
            <div className="p-3 bg-cyber-950/80 border-t border-white/5 text-xs text-slate-300 leading-relaxed font-mono">
              <p className="text-[11px] text-purple-300 mb-1 font-semibold">Agent Reasoning Log:</p>
              {data.reasoning}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
