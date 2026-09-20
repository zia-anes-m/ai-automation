import React, { useState } from 'react';
import Markdown from 'react-markdown';
import { 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Info, 
  ShieldAlert, 
  Gauge, 
  CheckCircle2,
  Loader2,
  Copy,
  Check,
  Terminal,
  FileText,
  Compass,
  Cpu
} from 'lucide-react';

const AGENT_ICONS = {
  planner: Compass,
  executor: Terminal,
  critic: ShieldAlert,
  synthesizer: Sparkles
};

export default function AgentCard({ 
  agentKey, 
  config, 
  data, 
  streamingChunk, 
  isActive, 
  isCompleted 
}) {
  const [activeTab, setActiveTab] = useState('output'); // 'output' | 'reasoning'
  const [copied, setCopied] = useState(false);

  // Confidence color coding
  const confidence = data?.confidence || (isActive ? 88 : null);
  const getConfidenceBadge = (val) => {
    if (!val) return null;
    if (val >= 80) return { bg: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', label: 'High' };
    if (val >= 60) return { bg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', label: 'Moderate' };
    return { bg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', label: 'Risk Flagged' };
  };

  const badgeStyle = getConfidenceBadge(confidence);
  const rawText = data?.content || streamingChunk || '';

  const handleCopy = () => {
    if (!rawText) return;
    navigator.clipboard.writeText(rawText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const IconComponent = AGENT_ICONS[agentKey] || Sparkles;

  // Refined border and elevation classes
  const borderClass = isActive 
    ? 'border-indigo-500/60 ring-1 ring-indigo-500/30 shadow-surface-elevated bg-obsidian-850'
    : isCompleted
      ? 'border-white/[0.12] shadow-surface-subtle bg-obsidian-900'
      : 'border-white/[0.05] bg-obsidian-950/60 opacity-60';

  return (
    <div className={`rounded-2xl border transition-all duration-200 flex flex-col justify-between overflow-hidden ${borderClass}`}>
      
      {/* Card Header */}
      <div className="p-3.5 sm:p-4 border-b border-white/[0.06] bg-obsidian-900/80 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div 
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ 
              backgroundColor: config.accentBg || 'rgba(99, 102, 241, 0.1)', 
              border: `1px solid ${config.accentBorder || 'rgba(99, 102, 241, 0.25)'}` 
            }}
          >
            <IconComponent className="w-4 h-4" style={{ color: config.color || '#818cf8' }} />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-xs sm:text-sm text-white truncate">
                {config.name}
              </h3>
              {isActive && (
                <span className="flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> Live Stream
                </span>
              )}
              {isCompleted && (
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> Verified
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 truncate">
              {config.role}
            </p>
          </div>
        </div>

        {/* Right Header Toolbar */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {confidence && (
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-mono font-medium ${badgeStyle?.bg}`}>
              <Gauge className="w-3 h-3" />
              <span>{confidence}%</span>
            </div>
          )}

          {rawText && (
            <button
              onClick={handleCopy}
              title="Copy Agent Output"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Viewport */}
      <div className="p-4 flex-1 overflow-y-auto max-h-[380px] min-h-[170px] text-xs sm:text-sm">
        {rawText ? (
          activeTab === 'output' ? (
            <div className="markdown-content">
              <Markdown>{rawText}</Markdown>
              {isActive && (
                <span className="inline-block w-1.5 h-3.5 bg-indigo-400 animate-stream-cursor ml-1 align-middle" />
              )}
            </div>
          ) : (
            <div className="text-xs font-mono text-slate-300 leading-relaxed space-y-2 p-2 rounded-lg bg-obsidian-950/70 border border-white/[0.05]">
              <p className="text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">Internal Decision Trace:</p>
              <p className="text-slate-300">{data?.reasoning || 'No internal trace recorded.'}</p>
            </div>
          )
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-500 text-xs py-10">
            <span className="w-2 h-2 rounded-full bg-slate-700 mb-2" />
            <p>Awaiting sequence trigger in multi-agent deliberation...</p>
          </div>
        )}
      </div>

      {/* Flagged Risks / Adversarial Callouts */}
      {data?.flaggedIssues && data.flaggedIssues.length > 0 && (
        <div className="px-4 py-2.5 bg-rose-950/20 border-t border-rose-500/15">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-400 mb-1.5">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Adversarial Audit Flags ({data.flaggedIssues.length}):</span>
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

      {/* Card Footer: Drill into Reasoning */}
      {data?.reasoning && (
        <div className="border-t border-white/[0.06] bg-obsidian-950/40">
          <button
            onClick={() => setActiveTab(activeTab === 'output' ? 'reasoning' : 'output')}
            className="w-full px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Info className="w-3 h-3 text-indigo-400" />
              {activeTab === 'output' ? 'View Decision Trail & Reasoning' : 'Back to Deliberation Output'}
            </span>
            <span className="text-[10px] font-mono text-slate-500 uppercase">
              {activeTab === 'output' ? 'Inspect' : 'Close'}
            </span>
          </button>
        </div>
      )}

    </div>
  );
}
