import { describe, it, expect, beforeEach } from 'vitest';
import {
  tokenizePattern,
  PatternParser,
  compileASTToNFA,
  parsePatternRuleToNFA,
  ASTNode,
} from '@/engine/automata/regexParser';
import { determinizeNFA } from '@/engine/automata/determinize';
import { resetStateCounter } from '@/engine/automata/nfa';

describe('Regex Pattern Parser & Compiler', () => {
  beforeEach(() => {
    resetStateCounter();
  });

  describe('tokenizePattern', () => {
    it('returns empty array for empty or whitespace string', () => {
      expect(tokenizePattern('')).toEqual([]);
      expect(tokenizePattern('   \t  \n ')).toEqual([]);
    });

    it('tokenizes identifiers and punctuation', () => {
      const tokens = tokenizePattern('Rise Hold Fall');
      expect(tokens).toEqual(['Rise', 'Hold', 'Fall']);
    });

    it('tokenizes operators and parentheses', () => {
      const tokens = tokenizePattern('(Rise | Fall)* + ?');
      expect(tokens).toEqual(['(', 'Rise', '|', 'Fall', ')', '*', '+', '?']);
    });

    it('tokenizes complex compound symbols like H:R and L:F', () => {
      const tokens = tokenizePattern('(H:R | H:S)+ L:F?');
      expect(tokens).toEqual(['(', 'H:R', '|', 'H:S', ')', '+', 'L:F', '?']);
    });
  });

  describe('PatternParser (Recursive Descent AST)', () => {
    it('parses empty token list into default symbol', () => {
      const parser = new PatternParser([]);
      const ast = parser.parse();
      expect(ast).toEqual({ type: 'Symbol', value: 'Normal' });
    });

    it('parses a single symbol', () => {
      const parser = new PatternParser(['Rise']);
      const ast = parser.parse();
      expect(ast).toEqual({ type: 'Symbol', value: 'Rise' });
    });

    it('parses implicit concatenation of factors', () => {
      // Rise Hold Fall
      const parser = new PatternParser(['Rise', 'Hold', 'Fall']);
      const ast = parser.parse();
      expect(ast).toEqual({
        type: 'Concat',
        left: {
          type: 'Concat',
          left: { type: 'Symbol', value: 'Rise' },
          right: { type: 'Symbol', value: 'Hold' },
        },
        right: { type: 'Symbol', value: 'Fall' },
      });
    });

    it('parses alternation (union |)', () => {
      // Rise | Fall
      const parser = new PatternParser(['Rise', '|', 'Fall']);
      const ast = parser.parse();
      expect(ast).toEqual({
        type: 'Union',
        left: { type: 'Symbol', value: 'Rise' },
        right: { type: 'Symbol', value: 'Fall' },
      });
    });

    it('respects operator precedence (*, +, ? over Concat over Union)', () => {
      // Rise Hold* | Fall
      // Should be parsed as: (Rise (Hold*)) | Fall
      const parser = new PatternParser(['Rise', 'Hold', '*', '|', 'Fall']);
      const ast = parser.parse();

      expect(ast.type).toBe('Union');
      if (ast.type === 'Union') {
        expect(ast.left).toEqual({
          type: 'Concat',
          left: { type: 'Symbol', value: 'Rise' },
          right: {
            type: 'Star',
            expr: { type: 'Symbol', value: 'Hold' },
          },
        });
        expect(ast.right).toEqual({ type: 'Symbol', value: 'Fall' });
      }
    });

    it('parses parenthesized sub-expressions', () => {
      // (Rise | Hold)+ Fall
      const parser = new PatternParser(['(', 'Rise', '|', 'Hold', ')', '+', 'Fall']);
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'Concat',
        left: {
          type: 'Plus',
          expr: {
            type: 'Union',
            left: { type: 'Symbol', value: 'Rise' },
            right: { type: 'Symbol', value: 'Hold' },
          },
        },
        right: { type: 'Symbol', value: 'Fall' },
      });
    });

    it('parses optional operator (?)', () => {
      // Rise Hold?
      const parser = new PatternParser(['Rise', 'Hold', '?']);
      const ast = parser.parse();

      expect(ast).toEqual({
        type: 'Concat',
        left: { type: 'Symbol', value: 'Rise' },
        right: {
          type: 'Optional',
          expr: { type: 'Symbol', value: 'Hold' },
        },
      });
    });

    it('throws descriptive error on unexpected tokens', () => {
      // Missing closing parenthesis: (Rise | Hold
      const unclosed = new PatternParser(['(', 'Rise', '|', 'Hold']);
      expect(() => unclosed.parse()).toThrow(/Expected token '\)'/);

      // Unexpected trailing token: Rise )
      const trailing = new PatternParser(['Rise', ')']);
      expect(() => trailing.parse()).toThrow(/Unexpected trailing token/);

      // Operator in primary position: *Rise
      const badOperator = new PatternParser(['*', 'Rise']);
      expect(() => badOperator.parse()).toThrow(/Unexpected token '\*'/);
    });
  });

  describe('compileASTToNFA & parsePatternRuleToNFA', () => {
    // Helper to evaluate if string sequence is accepted by a DFA
    const dfaAccepts = (dfa: ReturnType<typeof determinizeNFA>, symbols: string[]): boolean => {
      let state = dfa.startState;
      for (const sym of symbols) {
        const tr = dfa.transitions.find(t => t.from === state && t.symbol === sym);
        if (!tr) return false;
        state = tr.to;
      }
      return dfa.acceptingStates.has(state);
    };

    it('compiles ASTNode of all types into valid Thompson NFA', () => {
      const ast: ASTNode = {
        type: 'Concat',
        left: {
          type: 'Union',
          left: { type: 'Symbol', value: 'A' },
          right: { type: 'Symbol', value: 'B' },
        },
        right: {
          type: 'Star',
          expr: { type: 'Symbol', value: 'C' },
        },
      };

      const nfa = compileASTToNFA(ast, 'test_pattern');
      expect(nfa.states.size).toBeGreaterThan(0);
      expect(nfa.alphabet.has('A')).toBe(true);
      expect(nfa.alphabet.has('B')).toBe(true);
      expect(nfa.alphabet.has('C')).toBe(true);
      expect(Array.from(nfa.acceptingStates.values())[0]).toBe('test_pattern');
    });

    it('compiles rule string: "Rise Hold+ Fall" into DFA matching correct language', () => {
      const nfa = parsePatternRuleToNFA('Rise Hold+ Fall', 'surge_pulse');
      const dfa = determinizeNFA(nfa);

      // Matches
      expect(dfaAccepts(dfa, ['Rise', 'Hold', 'Fall'])).toBe(true);
      expect(dfaAccepts(dfa, ['Rise', 'Hold', 'Hold', 'Fall'])).toBe(true);
      expect(dfaAccepts(dfa, ['Rise', 'Hold', 'Hold', 'Hold', 'Fall'])).toBe(true);

      // Rejections
      expect(dfaAccepts(dfa, ['Rise', 'Fall'])).toBe(false); // + requires at least one Hold
      expect(dfaAccepts(dfa, ['Rise', 'Hold'])).toBe(false); // Missing Fall
      expect(dfaAccepts(dfa, ['Hold', 'Fall'])).toBe(false); // Missing Rise
      expect(dfaAccepts(dfa, ['Rise', 'Hold', 'Fall', 'Fall'])).toBe(false);
    });

    it('compiles rule with optional operator: "Rise Hold? Fall"', () => {
      const nfa = parsePatternRuleToNFA('Rise Hold? Fall', 'rapid_surge');
      const dfa = determinizeNFA(nfa);

      // With Hold
      expect(dfaAccepts(dfa, ['Rise', 'Hold', 'Fall'])).toBe(true);
      // Without Hold (0 occurrences)
      expect(dfaAccepts(dfa, ['Rise', 'Fall'])).toBe(true);

      // More than 1 Hold is rejected
      expect(dfaAccepts(dfa, ['Rise', 'Hold', 'Hold', 'Fall'])).toBe(false);
    });

    it('compiles complex nested rule: "(Rise | High)+ (Fall | Stabilize)"', () => {
      const nfa = parsePatternRuleToNFA('(Rise | High)+ (Fall | Stabilize)', 'complex_pulse');
      const dfa = determinizeNFA(nfa);

      expect(dfaAccepts(dfa, ['Rise', 'Fall'])).toBe(true);
      expect(dfaAccepts(dfa, ['High', 'Stabilize'])).toBe(true);
      expect(dfaAccepts(dfa, ['Rise', 'High', 'Rise', 'Fall'])).toBe(true);

      expect(dfaAccepts(dfa, ['Fall'])).toBe(false);
      expect(dfaAccepts(dfa, ['Rise', 'Rise'])).toBe(false);
    });
  });
});
