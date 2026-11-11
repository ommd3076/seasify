import React, { useState } from 'react';
import { FormalDFA, AutomataState, AutomataTransition } from '@/types/automata';

interface AutomataGraphProps {
  dfa?: FormalDFA;
  activeStateId?: string;
  highlightTransition?: { from: string; to: string; symbol?: string } | null;
  onSelectState?: (stateId: string) => void;
  className?: string;
}

export const AutomataGraph: React.FC<AutomataGraphProps> = ({
  dfa,
  activeStateId = 'S0',
  highlightTransition,
  onSelectState,
  className = '',
}) => {
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [hoveredTransition, setHoveredTransition] = useState<AutomataTransition | null>(null);

  // Fallback default 3-state surge DFA if none provided
  const states: AutomataState[] = dfa?.states?.length
    ? dfa.states
    : [
        { id: 'S0', label: 'Normal', isStart: true, description: 'Residual within astronomical baseline band (±0.20m)' },
        { id: 'S1', label: 'Elevated', description: 'Water level sustained above positive threshold (>+0.20m)' },
        { id: 'S2', label: 'Surge Confirmed', isAccepting: true, description: 'Surge plateau verified over consecutive samples' },
      ];

  const transitions: AutomataTransition[] = dfa?.transitions?.length
    ? dfa.transitions
    : [
        { from: 'S0', to: 'S1', symbol: 'Rise', label: 'Rise (+0.2m)', conditionDescription: 'Δh ≥ +0.20 m/hr or residual > +0.20 m' },
        { from: 'S0', to: 'S0', symbol: 'Normal', label: 'Normal', conditionDescription: 'Residual within baseline ±0.20m' },
        { from: 'S1', to: 'S1', symbol: 'Hold', label: 'Hold (≈)', conditionDescription: 'Residual sustained > +0.20 m' },
        { from: 'S1', to: 'S2', symbol: 'Hold', label: 'Hold (Sample 2)', conditionDescription: 'Persistent positive anomaly confirmed' },
        { from: 'S1', to: 'S0', symbol: 'Fall', label: 'Fall (-0.2m)', conditionDescription: 'Quick dissipation to baseline' },
        { from: 'S2', to: 'S2', symbol: 'Hold', label: 'Hold (Ongoing)', conditionDescription: 'Prolonged surge setup' },
        { from: 'S2', to: 'S0', symbol: 'Fall', label: 'Recede', conditionDescription: 'Surge recedes to normal astronomical level' },
      ];

  const acceptingStateIds = new Set(
    dfa?.acceptingStates || states.filter((s) => s.isAccepting).map((s) => s.id)
  );

  // Position nodes horizontally or dynamically
  const svgWidth = 620;
  const svgHeight = 280;
  const nodeRadius = 30;

  // Map state ID to (x, y) coordinates
  const statePositions: Record<string, { x: number; y: number }> = {};
  const count = states.length;
  states.forEach((state, idx) => {
    // If standard 3 states: S0 at 120, S1 at 310, S2 at 500, y=140
    if (count <= 3) {
      const spacing = (svgWidth - 200) / Math.max(count - 1, 1);
      statePositions[state.id] = {
        x: 110 + idx * spacing,
        y: 140,
      };
    } else {
      // General layout
      const spacing = (svgWidth - 180) / (count - 1);
      statePositions[state.id] = {
        x: 90 + idx * spacing,
        y: 140 + (idx % 2 === 1 ? -15 : 15),
      };
    }
  });

  return (
    <div className={`relative flex flex-col bg-surface rounded-28px p-5 border border-border shadow-panel select-none ${className}`}>
      {/* Header Info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#68DD79] animate-pulse" />
          <h4 className="text-sm font-bold text-primary-text font-sans">
            {dfa?.name || 'Finite Automata State Diagram'}
          </h4>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-secondary-text">
            <span className="w-3 h-3 rounded-full border-2 border-charcoal inline-block" />
            <span>State</span>
          </span>
          <span className="flex items-center gap-1.5 text-secondary-text">
            <span className="w-3.5 h-3.5 rounded-full border border-charcoal p-[1.5px] inline-flex items-center justify-center">
              <span className="w-2 h-2 rounded-full border border-charcoal inline-block" />
            </span>
            <span>Accepting (F)</span>
          </span>
          <span className="flex items-center gap-1.5 text-secondary-text">
            <span className="w-3 h-3 rounded-full bg-[#A5F5A6] border border-[#68DD79] inline-block" />
            <span>Active State</span>
          </span>
        </div>
      </div>

      {/* SVG Container */}
      <div className="w-full relative overflow-hidden flex items-center justify-center">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-auto max-h-[300px] overflow-visible"
        >
          <defs>
            {/* Arrowhead marker default */}
            <marker
              id="arrow-default"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 9 5 L 0 9 z" fill="#737A75" />
            </marker>

            {/* Arrowhead marker highlighted */}
            <marker
              id="arrow-active"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0.5 L 10 5 L 0 9.5 z" fill="#359D45" />
            </marker>

            {/* Arrowhead marker for hover */}
            <marker
              id="arrow-hover"
              viewBox="0 0 10 10"
              refX="8"
              refY="5"
              markerWidth="7"
              markerHeight="7"
              orient="auto-start-reverse"
            >
              <path d="M 0 0.5 L 10 5 L 0 9.5 z" fill="#8B64DF" />
            </marker>

            {/* State Glow Filter */}
            <filter id="activeStateGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="0" stdDeviation="6" floodColor="#68DD79" floodOpacity="0.65" />
            </filter>
          </defs>

          {/* 1. Start State Pointer */}
          {states.map((s) => {
            if (!s.isStart && s.id !== dfa?.startState && s.id !== 'S0') return null;
            const pos = statePositions[s.id];
            if (!pos) return null;
            return (
              <g key={`start-arrow-${s.id}`} className="transition-all">
                <line
                  x1={pos.x - 70}
                  y1={pos.y}
                  x2={pos.x - nodeRadius - 6}
                  y2={pos.y}
                  stroke="#242424"
                  strokeWidth="2.5"
                  markerEnd="url(#arrow-default)"
                />
                <rect
                  x={pos.x - 85}
                  y={pos.y - 12}
                  width="36"
                  height="24"
                  rx="12"
                  fill="#242424"
                />
                <text
                  x={pos.x - 67}
                  y={pos.y + 4}
                  textAnchor="middle"
                  fill="#FFFFFF"
                  fontSize="10"
                  fontWeight="bold"
                  fontFamily="sans-serif"
                >
                  q₀
                </text>
              </g>
            );
          })}

          {/* 2. Transitions & Arrows */}
          {transitions.map((trans, idx) => {
            const pFrom = statePositions[trans.from];
            const pTo = statePositions[trans.to];
            if (!pFrom || !pTo) return null;

            const isSelf = trans.from === trans.to;
            const isForward = pTo.x > pFrom.x;
            const isBackward = pTo.x < pFrom.x;

            const isHighlighted =
              highlightTransition &&
              highlightTransition.from === trans.from &&
              highlightTransition.to === trans.to &&
              (!highlightTransition.symbol || highlightTransition.symbol === trans.symbol);

            const isHovered = hoveredTransition === trans;

            let strokeColor = '#737A75';
            let strokeWidth = 1.75;
            let marker = 'url(#arrow-default)';

            if (isHighlighted) {
              strokeColor = '#359D45';
              strokeWidth = 3;
              marker = 'url(#arrow-active)';
            } else if (isHovered) {
              strokeColor = '#8B64DF';
              strokeWidth = 2.5;
              marker = 'url(#arrow-hover)';
            }

            if (isSelf) {
              // Self-loop above node
              const loopR = 24;
              const loopTop = pFrom.y - nodeRadius - loopR * 1.5;
              const startX = pFrom.x - 14;
              const endX = pFrom.x + 14;
              const startY = pFrom.y - nodeRadius + 2;
              const endY = pFrom.y - nodeRadius + 2;

              const pathD = `M ${startX} ${startY} C ${pFrom.x - 30} ${loopTop}, ${pFrom.x + 30} ${loopTop}, ${endX} ${endY}`;
              const labelX = pFrom.x;
              const labelY = loopTop + 2;

              return (
                <g
                  key={`trans-self-${idx}`}
                  onMouseEnter={() => setHoveredTransition(trans)}
                  onMouseLeave={() => setHoveredTransition(null)}
                  className="cursor-pointer"
                >
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    markerEnd={marker}
                    className="transition-colors duration-200"
                  />
                  {/* Pill label */}
                  <rect
                    x={labelX - 32}
                    y={labelY - 14}
                    width="64"
                    height="18"
                    rx="9"
                    fill={isHighlighted ? '#E2FBE3' : '#F7F9F6'}
                    stroke={strokeColor}
                    strokeWidth={1}
                  />
                  <text
                    x={labelX}
                    y={labelY}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="monospace"
                    fill={isHighlighted ? '#359D45' : '#242424'}
                  >
                    {trans.label || trans.symbol}
                  </text>
                </g>
              );
            }

            if (isForward) {
              // Forward transition curving slightly upward or downward depending on spacing
              const dx = pTo.x - pFrom.x;
              const arcOffset = dx > 200 ? -38 : -22;
              const midX = (pFrom.x + pTo.x) / 2;
              const midY = (pFrom.y + pTo.y) / 2 + arcOffset;

              // Compute intersection with node circles
              const startX = pFrom.x + nodeRadius * 0.9;
              const startY = pFrom.y - 10;
              const endX = pTo.x - nodeRadius * 0.9;
              const endY = pTo.y - 10;

              const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

              return (
                <g
                  key={`trans-fwd-${idx}`}
                  onMouseEnter={() => setHoveredTransition(trans)}
                  onMouseLeave={() => setHoveredTransition(null)}
                  className="cursor-pointer"
                >
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    markerEnd={marker}
                    className="transition-colors duration-200"
                  />
                  <rect
                    x={midX - 36}
                    y={midY - 16}
                    width="72"
                    height="20"
                    rx="10"
                    fill={isHighlighted ? '#E2FBE3' : '#F7F9F6'}
                    stroke={strokeColor}
                    strokeWidth={1}
                    className="shadow-sm"
                  />
                  <text
                    x={midX}
                    y={midY - 2}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="monospace"
                    fill={isHighlighted ? '#359D45' : '#171A18'}
                  >
                    {trans.label || trans.symbol}
                  </text>
                </g>
              );
            }

            if (isBackward) {
              // Backward transition curving downward
              const midX = (pFrom.x + pTo.x) / 2;
              const midY = Math.max(pFrom.y, pTo.y) + 55;

              const startX = pFrom.x - 10;
              const startY = pFrom.y + nodeRadius * 0.85;
              const endX = pTo.x + 10;
              const endY = pTo.y + nodeRadius * 0.85;

              const pathD = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;

              return (
                <g
                  key={`trans-bwd-${idx}`}
                  onMouseEnter={() => setHoveredTransition(trans)}
                  onMouseLeave={() => setHoveredTransition(null)}
                  className="cursor-pointer"
                >
                  <path
                    d={pathD}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={trans.symbol === 'Fall' || trans.symbol === 'Stabilize' ? '4 3' : undefined}
                    markerEnd={marker}
                    className="transition-colors duration-200"
                  />
                  <rect
                    x={midX - 34}
                    y={midY - 10}
                    width="68"
                    height="18"
                    rx="9"
                    fill={isHighlighted ? '#E2FBE3' : '#F7F9F6'}
                    stroke={strokeColor}
                    strokeWidth={1}
                  />
                  <text
                    x={midX}
                    y={midY + 3}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="600"
                    fontFamily="monospace"
                    fill={isHighlighted ? '#359D45' : '#737A75'}
                  >
                    {trans.label || trans.symbol}
                  </text>
                </g>
              );
            }

            return null;
          })}

          {/* 3. States (Nodes) */}
          {states.map((state) => {
            const pos = statePositions[state.id];
            if (!pos) return null;

            const isActive = activeStateId === state.id;
            const isAccepting = acceptingStateIds.has(state.id);
            const isHovered = hoveredState === state.id;

            return (
              <g
                key={`state-node-${state.id}`}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => onSelectState && onSelectState(state.id)}
                onMouseEnter={() => setHoveredState(state.id)}
                onMouseLeave={() => setHoveredState(null)}
                className="cursor-pointer"
              >
                {/* Active Glow Ring */}
                {isActive && (
                  <circle
                    r={nodeRadius + 6}
                    fill="none"
                    stroke="#68DD79"
                    strokeWidth="3.5"
                    filter="url(#activeStateGlow)"
                    className="animate-pulse"
                  />
                )}

                {/* Outer Node Circle */}
                <circle
                  r={nodeRadius}
                  fill={isActive ? '#E2FBE3' : isHovered ? '#F2F5F1' : '#FFFFFF'}
                  stroke={isActive ? '#359D45' : isHovered ? '#8B64DF' : '#242424'}
                  strokeWidth={isActive ? 2.5 : 2}
                  className="transition-all duration-200"
                />

                {/* Accepting Double Ring */}
                {isAccepting && (
                  <circle
                    r={nodeRadius - 5}
                    fill="none"
                    stroke={isActive ? '#359D45' : '#242424'}
                    strokeWidth={1.75}
                  />
                )}

                {/* State ID (e.g. S0, S1, S2) */}
                <text
                  y={state.label ? -3 : 4}
                  textAnchor="middle"
                  fontSize="14"
                  fontWeight="bold"
                  fontFamily="monospace"
                  fill="#171A18"
                >
                  {state.id}
                </text>

                {/* State Name / Label */}
                {state.label && (
                  <text
                    y={13}
                    textAnchor="middle"
                    fontSize="9.5"
                    fontWeight="600"
                    fontFamily="sans-serif"
                    fill={isActive ? '#359D45' : '#737A75'}
                  >
                    {state.label}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Description Tooltip / Footnote */}
      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs text-secondary-text">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-primary-text">Active State:</span>
          <span className="font-mono px-2 py-0.5 rounded bg-[#E2FBE3] text-[#359D45] font-bold border border-[#A5F5A6]">
            {activeStateId} (
            {states.find((s) => s.id === activeStateId)?.label ||
              (acceptingStateIds.has(activeStateId) ? 'Accepting' : 'Normal')}
            )
          </span>
          {states.find((s) => s.id === activeStateId)?.description && (
            <span className="text-secondary-text text-[11px] truncate max-w-sm hidden md:inline">
              — {states.find((s) => s.id === activeStateId)?.description}
            </span>
          )}
        </div>

        {dfa?.ruleSummary && (
          <span className="font-mono text-[11px] text-gray-500 hidden lg:inline">
            Rule: {dfa.ruleSummary}
          </span>
        )}
      </div>
    </div>
  );
};

export default AutomataGraph;
