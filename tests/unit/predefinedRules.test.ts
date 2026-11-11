import { describe, it, expect } from 'vitest';
import { PREDEFINED_PATTERNS } from '@/engine/automata/predefinedRules';
import { FormalDFA } from '@/types/automata';
import { DISCRETE_AUTOMATA_VECTORS } from '../fixtures/mockTideData';

describe('Tier 1 & Tier 2 Unit: Predefined Rule Sets (6 Formal Oceanographic DFAs)', () => {
  it('contains exactly 6 formal DFAs covering all coastal storm archetypes', () => {
    expect(PREDEFINED_PATTERNS).toHaveLength(6);
    const ids = PREDEFINED_PATTERNS.map(p => p.id);
    expect(ids).toContain('abnormal_recovery');
    expect(ids).toContain('sustained_elevated');
    expect(ids).toContain('sustained_depressed');
    expect(ids).toContain('rapid_rise');
    expect(ids).toContain('oscillatory');
    expect(ids).toContain('record_gap');
  });

  describe.each(PREDEFINED_PATTERNS)('Formal DFA Specification: %s', (dfa: FormalDFA) => {
    it('has non-empty identifiers, names, and oceanographic descriptions', () => {
      expect(dfa.id.length).toBeGreaterThan(0);
      expect(dfa.name.length).toBeGreaterThan(0);
      expect(dfa.description.length).toBeGreaterThan(15);
      expect(dfa.ruleSummary.length).toBeGreaterThan(5);
    });

    it('has a valid start state that exists in the states list', () => {
      expect(dfa.startState).toBeDefined();
      const startStateObj = dfa.states.find(s => s.id === dfa.startState);
      expect(startStateObj).toBeDefined();
      expect(startStateObj?.isStart).toBe(true);
    });

    it('has at least one accepting state belonging to states list', () => {
      expect(dfa.acceptingStates.length).toBeGreaterThanOrEqual(1);
      for (const accId of dfa.acceptingStates) {
        const stateObj = dfa.states.find(s => s.id === accId);
        expect(stateObj).toBeDefined();
        expect(stateObj?.isAccepting).toBe(true);
      }
    });

    it('all transitions reference valid from and to states', () => {
      const stateIds = new Set(dfa.states.map(s => s.id));
      for (const tr of dfa.transitions) {
        expect(stateIds.has(tr.from)).toBe(true);
        expect(stateIds.has(tr.to)).toBe(true);
        expect(dfa.alphabet).toContain(tr.symbol);
      }
    });
  });

  describe('DFA 1: Abnormal Recovery (Screen 10 Canonical Model)', () => {
    const dfa = PREDEFINED_PATTERNS.find(p => p.id === 'abnormal_recovery')!;

    it('transitions S0 -> S1 (Elevated) on Rise', () => {
      const tr = dfa.transitions.find(t => t.from === 'S0' && t.symbol === 'Rise');
      expect(tr?.to).toBe('S1');
    });

    it('self-loops on S1 during Hold plateau', () => {
      const tr = dfa.transitions.find(t => t.from === 'S1' && t.symbol === 'Hold');
      expect(tr?.to).toBe('S1');
    });

    it('transitions S1 -> S2 (Recovery - Accepting) on Fall', () => {
      const tr = dfa.transitions.find(t => t.from === 'S1' && t.symbol === 'Fall');
      expect(tr?.to).toBe('S2');
      expect(dfa.acceptingStates).toContain('S2');
    });

    it('returns to baseline S0 on Stabilize', () => {
      const tr = dfa.transitions.find(t => t.from === 'S2' && t.symbol === 'Stabilize');
      expect(tr?.to).toBe('S0');
    });
  });

  describe('DFA 2: Sustained Elevated Surge', () => {
    const dfa = PREDEFINED_PATTERNS.find(p => p.id === 'sustained_elevated')!;

    it('transitions S0 -> S1 on Rise or Hold', () => {
      const trRise = dfa.transitions.find(t => t.from === 'S0' && t.symbol === 'Rise');
      const trHold = dfa.transitions.find(t => t.from === 'S0' && t.symbol === 'Hold');
      expect(trRise?.to).toBe('S1');
      expect(trHold?.to).toBe('S1');
    });

    it('transitions S1 -> S2 (Surge Confirmed - Accepting) on subsequent Hold', () => {
      const tr = dfa.transitions.find(t => t.from === 'S1' && t.symbol === 'Hold');
      expect(tr?.to).toBe('S2');
      expect(dfa.acceptingStates).toContain('S2');
    });

    it('resets to normal S0 on rapid Fall', () => {
      const tr = dfa.transitions.find(t => t.from === 'S1' && t.symbol === 'Fall');
      expect(tr?.to).toBe('S0');
    });
  });

  describe('DFA 3: Sustained Depressed Tide (Blowout)', () => {
    const dfa = PREDEFINED_PATTERNS.find(p => p.id === 'sustained_depressed')!;

    it('transitions S0 -> S1 on Fall or Low', () => {
      const tr = dfa.transitions.find(t => t.from === 'S0' && (t.symbol === 'Fall' || t.symbol === 'Low'));
      expect(tr?.to).toBe('S1');
    });

    it('transitions S1 -> S2 (Depression Confirmed - Accepting) on continued Low', () => {
      const tr = dfa.transitions.find(t => t.from === 'S1' && t.symbol === 'Low');
      expect(tr?.to).toBe('S2');
      expect(dfa.acceptingStates).toContain('S2');
    });

    it('recovers to baseline S0 on Rise', () => {
      const tr = dfa.transitions.find(t => t.from === 'S2' && t.symbol === 'Rise');
      expect(tr?.to).toBe('S0');
    });
  });

  describe('DFA 4: Rapid Water-Level Rise', () => {
    const dfa = PREDEFINED_PATTERNS.find(p => p.id === 'rapid_rise')!;

    it('immediately transitions from S0 to accepting state S1 on steep Rise', () => {
      const tr = dfa.transitions.find(t => t.from === 'S0' && t.symbol === 'Rise');
      expect(tr?.to).toBe('S1');
      expect(dfa.acceptingStates).toContain('S1');
    });
  });

  describe('DFA 5: Repeated Residual Oscillation (Seiche)', () => {
    const dfa = PREDEFINED_PATTERNS.find(p => p.id === 'oscillatory')!;

    it('requires multi-cycle alternation S0 -> S1 (Crest) -> S2 (Trough) -> S3 (Resonance - Accepting)', () => {
      const tr1 = dfa.transitions.find(t => t.from === 'S0' && t.symbol === 'Rise');
      const tr2 = dfa.transitions.find(t => t.from === 'S1' && t.symbol === 'Fall');
      const tr3 = dfa.transitions.find(t => t.from === 'S2' && t.symbol === 'Rise');

      expect(tr1?.to).toBe('S1');
      expect(tr2?.to).toBe('S2');
      expect(tr3?.to).toBe('S3');
      expect(dfa.acceptingStates).toContain('S3');
    });
  });

  describe('DFA 6: Telemetry Observation Gap', () => {
    const dfa = PREDEFINED_PATTERNS.find(p => p.id === 'record_gap')!;

    it('transitions to accepting state S1 on Gap telemetry loss', () => {
      const tr = dfa.transitions.find(t => t.from === 'S0' && t.symbol === 'Gap');
      expect(tr?.to).toBe('S1');
      expect(dfa.acceptingStates).toContain('S1');
    });

    it('returns to reporting state S0 when Normal data resumes', () => {
      const tr = dfa.transitions.find(t => t.from === 'S1' && t.symbol === 'Normal');
      expect(tr?.to).toBe('S0');
    });
  });
});
