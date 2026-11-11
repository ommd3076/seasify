import React, { useState } from 'react';
import {
  Layers,
  Activity,
  ShieldCheck,
  Table as TableIcon,
  Play,
  Plus,
  Check,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

export const AutomataLabScreen: React.FC = () => {
  const [selectedTokens, setSelectedTokens] = useState<string[]>([
    'Rise',
    'Hold',
    'Hold',
    'Fall',
  ]);

  const removeToken = (index: number) => {
    setSelectedTokens((prev) => prev.filter((_, i) => i !== index));
  };

  const addToken = (token: string) => {
    setSelectedTokens((prev) => [...prev, token]);
  };

  const traceGraphData = [
    { time: '14:00', level: 2.12 },
    { time: '14:26', level: 2.65 },
    { time: '15:08', level: 2.70 },
    { time: '15:46', level: 2.72 },
    { time: '16:12', level: 2.50 },
    { time: '16:40', level: 2.25 },
  ];

  return (
    <div data-testid="screen-automata-lab" className="space-y-6">
      <div data-testid="screen-pattern-engine" className="space-y-6">
        {/* Top 3 Metric Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Card 1: Active Rule Set (Charcoal Card, 4 cols) */}
          <div className="lg:col-span-4 bg-[#242424] text-white rounded-[28px] p-6 border border-[#383838] shadow-panel flex flex-col justify-between min-h-[170px]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white leading-tight">
                  Active Rule Set
                </h3>
                <p className="text-xs text-[#9CA3AF] mt-0.5">
                  Automata rules for tide-event patterns
                </p>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-[#333333] border border-[#444444] text-xs font-semibold text-white flex items-center gap-1.5 cursor-pointer">
                <span>Coastal v2.3</span>
                <span className="text-[10px] text-gray-400">⌄</span>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-3">
              <div className="w-10 h-10 rounded-2xl bg-[#333333] text-[#A5F5A6] flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-sm font-bold text-white">
                  4 states • 6 transitions
                </div>
                <div className="text-xs text-[#9CA3AF] flex items-center gap-1 mt-0.5">
                  <span>Normal / Elevated / Recovery (+1)</span>
                  <span className="text-[10px]">ⓘ</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Matched Sequences (Surface Card, 4 cols) */}
          <div className="lg:col-span-4 bg-surface rounded-[28px] p-6 border border-border shadow-panel flex flex-col justify-between min-h-[170px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#242424] text-white flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <path d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                    <path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary-text leading-tight">
                    Matched Sequences
                  </h3>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Detected pattern instances
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-2">
              <div className="text-4xl font-black font-sans text-primary-text tracking-tight">
                128
              </div>
              <div className="text-right">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#DCFADC] text-[#156024]">
                  <span>↑</span>
                  <span>+24.3%</span>
                </span>
                <span className="text-[11px] text-secondary-text block mt-0.5">
                  vs. previous 30 days
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Pattern Confidence (Surface Card, 4 cols) */}
          <div className="lg:col-span-4 bg-surface rounded-[28px] p-6 border border-border shadow-panel flex flex-col justify-between min-h-[170px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#242424] text-white flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-primary-text leading-tight">
                    Pattern Confidence
                  </h3>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Average match confidence
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-baseline justify-between mb-2">
                <div className="text-4xl font-black font-sans text-primary-text tracking-tight">
                  0.92
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#EBE0FE] text-[#784FD8]">
                    High
                  </span>
                  <span className="text-xs text-secondary-text">ⓘ</span>
                </div>
              </div>

              {/* Confidence Progress Bar */}
              <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                <div className="h-full bg-[#A5F5A6] rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Automata State Flow Graph (~65%) and Transition Table (~35%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* State Flow Graph (8 cols) */}
          <div className="lg:col-span-8 bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7 flex flex-col justify-between min-h-[340px]">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-[#227C34]"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  >
                    <path d="M2 9c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                    <path d="M2 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-text leading-tight">
                    Pattern: Elevated Tide Event
                  </h3>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Automata state flow and sequence matching
                  </p>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-surface-muted border border-border text-xs font-semibold text-primary-text flex items-center gap-1.5 cursor-pointer">
                <span>View: State Flow</span>
                <span className="text-[10px] text-secondary-text">⌄</span>
              </div>
            </div>

            {/* Directed Graph Diagram */}
            <div className="relative w-full h-56 flex items-center justify-center overflow-visible">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 640 220">
                {/* Entry arrow */}
                <line x1="20" y1="90" x2="60" y2="90" stroke="#171A18" strokeWidth="2.5" />
                <polygon points="60,86 68,90 60,94" fill="#171A18" />

                {/* State S0 (Normal, Mint circle) */}
                <circle cx="110" cy="90" r="38" fill="#DCFADC" stroke="#68DD79" strokeWidth="2.5" />
                <path d="M100 80c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="#227C34" strokeWidth="2" fill="none" />
                <text x="110" y="98" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#171A18">
                  Normal
                </text>
                <text x="110" y="114" textAnchor="middle" fontSize="11" fill="#737A75" fontWeight="600">
                  S₀
                </text>

                {/* Edge: S0 -> S1 (Rise) */}
                <line x1="148" y1="90" x2="232" y2="90" stroke="#171A18" strokeWidth="2" />
                <polygon points="232,86 240,90 232,94" fill="#171A18" />
                <rect x="168" y="72" width="52" height="18" rx="9" fill="#F7F9F6" stroke="#D9DEDA" />
                <text x="194" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#171A18">
                  ↑ Rise
                </text>

                {/* State S1 (Elevated 1, Lavender circle) */}
                <circle cx="280" cy="90" r="38" fill="#EBE0FE" stroke="#C5A8F8" strokeWidth="2.5" />
                <path d="M275 80l10 -6m0 0h-6m6 0v6" stroke="#784FD8" strokeWidth="2" fill="none" strokeLinecap="round" />
                <text x="280" y="98" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#171A18">
                  Elevated
                </text>
                <text x="280" y="114" textAnchor="middle" fontSize="11" fill="#737A75" fontWeight="600">
                  S₁
                </text>

                {/* Edge: S1 -> S1 (Hold) */}
                <line x1="318" y1="90" x2="402" y2="90" stroke="#171A18" strokeWidth="2" />
                <polygon points="402,86 410,90 402,94" fill="#171A18" />
                <rect x="338" y="72" width="52" height="18" rx="9" fill="#F7F9F6" stroke="#D9DEDA" />
                <text x="364" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#171A18">
                  ≈ Hold
                </text>

                {/* State S1 (Elevated 2, Lavender circle) */}
                <circle cx="450" cy="90" r="38" fill="#EBE0FE" stroke="#C5A8F8" strokeWidth="2.5" />
                <path d="M445 80l10 -6m0 0h-6m6 0v6" stroke="#784FD8" strokeWidth="2" fill="none" strokeLinecap="round" />
                <text x="450" y="98" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#171A18">
                  Elevated
                </text>
                <text x="450" y="114" textAnchor="middle" fontSize="11" fill="#737A75" fontWeight="600">
                  S₁
                </text>

                {/* Edge: S1 -> S2 (Fall) */}
                <line x1="488" y1="90" x2="552" y2="90" stroke="#171A18" strokeWidth="2" />
                <polygon points="552,86 560,90 552,94" fill="#171A18" />
                <rect x="502" y="72" width="46" height="18" rx="9" fill="#F7F9F6" stroke="#D9DEDA" />
                <text x="525" y="85" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#171A18">
                  ↓ Fall
                </text>

                {/* State S2 (Recovery, Mint accepting double-ring circle) */}
                <circle cx="600" cy="90" r="38" fill="#DCFADC" stroke="#68DD79" strokeWidth="2.5" />
                <circle cx="600" cy="90" r="33" fill="none" stroke="#68DD79" strokeWidth="1.5" />
                <path d="M590 80c2-2 4-2 6 0s4 2 6 0 4-2 6 0" stroke="#227C34" strokeWidth="2" fill="none" />
                <text x="600" y="98" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#171A18">
                  Recovery
                </text>
                <text x="600" y="114" textAnchor="middle" fontSize="11" fill="#737A75" fontWeight="600">
                  S₂
                </text>

                {/* Reset feedback arrow underneath */}
                <path
                  d="M 600 130 C 600 185, 110 185, 110 134"
                  fill="none"
                  stroke="#9CA3AF"
                  strokeWidth="1.8"
                  strokeDasharray="4 4"
                />
                <polygon points="106,134 110,126 114,134" fill="#9CA3AF" />

                {/* Reset label pill */}
                <rect x="290" y="172" width="120" height="22" rx="11" fill="#F7F9F6" stroke="#D9DEDA" />
                <text x="350" y="187" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#737A75">
                  Reset (stabilized)
                </text>
              </svg>
            </div>
          </div>

          {/* Transition Table (4 cols) */}
          <div className="lg:col-span-4 bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7 flex flex-col justify-between min-h-[340px]">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                  <TableIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-text leading-tight">
                    Transition Table
                  </h3>
                  <p className="text-xs text-secondary-text mt-0.5">
                    State transitions and matching rules
                  </p>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-border/80 text-secondary-text">
                      <th className="pb-2 font-semibold">Current State</th>
                      <th className="pb-2 font-semibold">Event (Input)</th>
                      <th className="pb-2 font-semibold">Next State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    <tr className="hover:bg-surface-muted/40 transition">
                      <td className="py-2.5 font-bold text-primary-text">Normal (S₀)</td>
                      <td className="py-2.5 text-secondary-text font-mono">Rise (Δh ≥ +0.30 m)</td>
                      <td className="py-2.5 font-bold text-[#784FD8]">Elevated (S₁)</td>
                    </tr>
                    <tr className="hover:bg-surface-muted/40 transition">
                      <td className="py-2.5 font-bold text-[#784FD8]">Elevated (S₁)</td>
                      <td className="py-2.5 text-secondary-text font-mono">Hold (|Δh| &lt; 0.10 m)</td>
                      <td className="py-2.5 font-bold text-[#784FD8]">Elevated (S₁)</td>
                    </tr>
                    <tr className="hover:bg-surface-muted/40 transition">
                      <td className="py-2.5 font-bold text-[#784FD8]">Elevated (S₁)</td>
                      <td className="py-2.5 text-secondary-text font-mono">Fall (Δh ≤ -0.25 m)</td>
                      <td className="py-2.5 font-bold text-[#227C34]">Recovery (S₂)</td>
                    </tr>
                    <tr className="hover:bg-surface-muted/40 transition">
                      <td className="py-2.5 font-bold text-[#227C34]">Recovery (S₂)</td>
                      <td className="py-2.5 text-secondary-text font-mono">Stabilize (|Δh| &lt; 0.10 m)</td>
                      <td className="py-2.5 font-bold text-primary-text">Normal (S₀)</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Rule Summary Callout */}
            <div className="mt-4 pt-3 border-t border-border/60">
              <div className="flex items-center gap-1.5 text-xs text-secondary-text mb-1">
                <span className="font-bold text-primary-text">Rule Summary</span>
                <span>ⓘ</span>
              </div>
              <div className="p-2.5 rounded-xl bg-surface-muted text-xs font-mono font-bold text-primary-text">
                Pattern: Normal → Elevated → Elevated → Recovery
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row: Event Stream Trace (~58%) & Sequence Simulator (~42%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Event Stream Trace (7 cols) */}
          <div className="lg:col-span-7 bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-text leading-tight">
                    Event Stream Trace
                  </h3>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Recent tide events with automata state trace
                  </p>
                </div>
              </div>

              <div className="px-3.5 py-1.5 rounded-full bg-surface-muted border border-border text-xs font-semibold text-primary-text flex items-center gap-1.5 cursor-pointer">
                <span>Latest Match</span>
                <span className="text-[10px] text-secondary-text">⌄</span>
              </div>
            </div>

            {/* Synchronized Matrix */}
            <div className="space-y-2 mb-4">
              {/* Event Row */}
              <div className="flex items-center text-xs">
                <span className="w-16 font-bold text-secondary-text">Event</span>
                <div className="flex-1 grid grid-cols-6 gap-2">
                  <div className="p-1 rounded-full bg-surface-muted text-center text-secondary-text font-bold text-xs">—</div>
                  <div className="p-1 rounded-full bg-[#DCFADC] text-[#156024] text-center font-bold text-xs">Rise</div>
                  <div className="p-1 rounded-full bg-[#EBE0FE] text-[#784FD8] text-center font-bold text-xs">Hold</div>
                  <div className="p-1 rounded-full bg-[#EBE0FE] text-[#784FD8] text-center font-bold text-xs">Hold</div>
                  <div className="p-1 rounded-full bg-[#DCFADC] text-[#156024] text-center font-bold text-xs">Fall</div>
                  <div className="p-1 rounded-full bg-surface-muted text-secondary-text text-center font-bold text-xs">Stabilize</div>
                </div>
              </div>

              {/* State Row */}
              <div className="flex items-center text-xs">
                <span className="w-16 font-bold text-secondary-text">State</span>
                <div className="flex-1 grid grid-cols-6 gap-2">
                  <div className="p-1 rounded-full bg-[#DCFADC] text-[#156024] text-center font-bold text-xs">S₀</div>
                  <div className="p-1 rounded-full bg-[#EBE0FE] text-[#784FD8] text-center font-bold text-xs">S₁</div>
                  <div className="p-1 rounded-full bg-[#EBE0FE] text-[#784FD8] text-center font-bold text-xs">S₁</div>
                  <div className="p-1 rounded-full bg-[#EBE0FE] text-[#784FD8] text-center font-bold text-xs">S₁</div>
                  <div className="p-1 rounded-full bg-[#DCFADC] text-[#156024] text-center font-bold text-xs">S₂</div>
                  <div className="p-1 rounded-full bg-[#DCFADC] text-[#156024] text-center font-bold text-xs">S₀</div>
                </div>
              </div>
            </div>

            {/* Level (m) Curve Chart */}
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-secondary-text block mb-1">Level (m)</span>
              <div className="h-32 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={traceGraphData} margin={{ top: 5, right: 15, left: -25, bottom: 0 }}>
                    <XAxis dataKey="time" stroke="#737A75" tick={{ fill: '#737A75', fontSize: 10 }} />
                    <YAxis domain={[2.0, 2.8]} ticks={[2.0, 2.2, 2.4, 2.6]} stroke="#737A75" tick={{ fill: '#737A75', fontSize: 10 }} />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="level"
                      stroke="#68DD79"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#FFFFFF', stroke: '#68DD79', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Sequence Simulator (5 cols) */}
          <div className="lg:col-span-5 bg-surface rounded-[28px] border border-border shadow-panel p-6 sm:p-7 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-[#DCFADC] text-[#227C34] flex items-center justify-center shrink-0">
                  <Play className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-primary-text leading-tight">
                    Sequence Simulator
                  </h3>
                  <p className="text-xs text-secondary-text mt-0.5">
                    Test event sequences against active rules
                  </p>
                </div>
              </div>

              {/* Input Events Token Builder */}
              <div className="mb-4">
                <div className="flex items-center gap-1.5 text-xs text-secondary-text mb-2">
                  <span className="font-bold text-primary-text">Input Events</span>
                  <span>ⓘ</span>
                </div>

                <div className="flex flex-wrap items-center gap-2 p-2 rounded-20 bg-surface-muted/70 border border-border">
                  {selectedTokens.map((t, idx) => (
                    <span
                      key={idx}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        t === 'Rise' || t === 'Fall'
                          ? 'bg-[#DCFADC] text-[#156024]'
                          : 'bg-[#EBE0FE] text-[#784FD8]'
                      }`}
                    >
                      <span>{t}</span>
                      <button
                        onClick={() => removeToken(idx)}
                        className="text-[10px] hover:text-black font-bold ml-0.5"
                      >
                        ✕
                      </button>
                    </span>
                  ))}

                  {/* Add Event Token Dropdown Button */}
                  <button
                    onClick={() => {
                      const next = prompt('Add token (Rise, Hold, Fall, Stabilize):', 'Hold');
                      if (next) addToken(next);
                    }}
                    className="px-3 py-1 rounded-full border border-dashed border-border bg-white text-xs font-bold text-primary-text hover:bg-surface-muted transition flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Result Box */}
            <div className="p-4 rounded-[22px] bg-[#DCFADC] border border-[#A5F5A6] text-[#156024]">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2 font-bold text-sm text-[#171A18]">
                  <span className="w-4 h-4 rounded-full bg-[#359D45] text-white flex items-center justify-center text-[10px]">
                    ✔
                  </span>
                  <span>Pattern matched</span>
                </div>

                <span className="px-2.5 py-0.5 rounded-full bg-white text-[11px] font-bold text-[#171A18] shadow-xs">
                  Confidence 0.94
                </span>
              </div>

              <div className="text-xs text-[#227C34] font-medium mt-1">
                Normal → Elevated → Elevated → Recovery
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomataLabScreen;
