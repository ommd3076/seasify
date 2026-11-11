import { NFA } from './types';
import { concatenateNFAs, createEpsilonNFA, createSymbolNFA, plusNFA, starNFA, unionNFAs } from './nfa';

export type ASTNode =
  | { type: 'Symbol'; value: string }
  | { type: 'Concat'; left: ASTNode; right: ASTNode }
  | { type: 'Union'; left: ASTNode; right: ASTNode }
  | { type: 'Star'; expr: ASTNode }
  | { type: 'Plus'; expr: ASTNode }
  | { type: 'Optional'; expr: ASTNode };

/**
 * Tokenizes regular pattern expression.
 * Tokens: Identifier, '(', ')', '|', '*', '+', '?'
 */
export function tokenizePattern(input: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  const s = input.trim();

  while (i < s.length) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      i++;
      continue;
    }
    if (ch === '(' || ch === ')' || ch === '|' || ch === '*' || ch === '+' || ch === '?') {
      tokens.push(ch);
      i++;
      continue;
    }
    // Read identifier (e.g. Rise, Hold, Fall, H:R, Normal, S0)
    let ident = '';
    while (i < s.length && !/\s|[()|*+?]/.test(s[i])) {
      ident += s[i];
      i++;
    }
    if (ident) {
      tokens.push(ident);
    }
  }

  return tokens;
}

/**
 * Recursive-descent parser for rule expressions:
 * Expression -> Term ('|' Term)*
 * Term -> Factor (Factor)*  (implicit concatenation)
 * Factor -> Primary ('*' | '+' | '?')?
 * Primary -> Identifier | '(' Expression ')'
 */
export class PatternParser {
  private tokens: string[];
  private pos = 0;

  constructor(tokens: string[]) {
    this.tokens = tokens;
  }

  private peek(): string | undefined {
    return this.tokens[this.pos];
  }

  private consume(expected?: string): string {
    const t = this.tokens[this.pos];
    if (expected && t !== expected) {
      throw new Error(`Expected token '${expected}' but found '${t}' at position ${this.pos}`);
    }
    this.pos++;
    return t;
  }

  public parse(): ASTNode {
    if (this.tokens.length === 0) {
      return { type: 'Symbol', value: 'Normal' };
    }
    const node = this.parseExpression();
    if (this.pos < this.tokens.length) {
      throw new Error(`Unexpected trailing token '${this.tokens[this.pos]}' at position ${this.pos}`);
    }
    return node;
  }

  private parseExpression(): ASTNode {
    let node = this.parseTerm();
    while (this.peek() === '|') {
      this.consume('|');
      const right = this.parseTerm();
      node = { type: 'Union', left: node, right };
    }
    return node;
  }

  private parseTerm(): ASTNode {
    let node = this.parseFactor();
    while (
      this.peek() &&
      this.peek() !== '|' &&
      this.peek() !== ')'
    ) {
      const right = this.parseFactor();
      node = { type: 'Concat', left: node, right };
    }
    return node;
  }

  private parseFactor(): ASTNode {
    let node = this.parsePrimary();
    const next = this.peek();
    if (next === '*') {
      this.consume('*');
      node = { type: 'Star', expr: node };
    } else if (next === '+') {
      this.consume('+');
      node = { type: 'Plus', expr: node };
    } else if (next === '?') {
      this.consume('?');
      node = { type: 'Optional', expr: node };
    }
    return node;
  }

  private parsePrimary(): ASTNode {
    const t = this.peek();
    if (t === '(') {
      this.consume('(');
      const expr = this.parseExpression();
      this.consume(')');
      return expr;
    }
    if (t && !/[)|*+?]/.test(t)) {
      return { type: 'Symbol', value: this.consume() };
    }
    throw new Error(`Unexpected token '${t}' at position ${this.pos}`);
  }
}

/**
 * Compiles an AST into a Thompson NFA.
 */
export function compileASTToNFA(node: ASTNode, patternId = 'custom'): NFA {
  switch (node.type) {
    case 'Symbol':
      return createSymbolNFA(node.value, patternId);
    case 'Concat': {
      const left = compileASTToNFA(node.left, patternId);
      const right = compileASTToNFA(node.right, patternId);
      return concatenateNFAs(left, right, patternId);
    }
    case 'Union': {
      const left = compileASTToNFA(node.left, patternId);
      const right = compileASTToNFA(node.right, patternId);
      return unionNFAs(left, right, patternId);
    }
    case 'Star': {
      const expr = compileASTToNFA(node.expr, patternId);
      return starNFA(expr, patternId);
    }
    case 'Plus': {
      const expr = compileASTToNFA(node.expr, patternId);
      return plusNFA(expr, patternId);
    }
    case 'Optional': {
      const expr = compileASTToNFA(node.expr, patternId);
      const empty = createEpsilonNFA(patternId);
      return unionNFAs(expr, empty, patternId);
    }
  }
}

/**
 * Parses a pattern rule string directly into a Thompson NFA.
 */
export function parsePatternRuleToNFA(ruleStr: string, patternId = 'custom'): NFA {
  const tokens = tokenizePattern(ruleStr);
  const parser = new PatternParser(tokens);
  const ast = parser.parse();
  return compileASTToNFA(ast, patternId);
}
