# Seasify — Automata Theory & Mathematical Foundations

**Formal Academic Paper:** Coastal Water-Level Pattern Recognition and Anomaly Analysis Using Finite Automata  
**Author:** Seasify Research & Computational Science Team  

---

## 1. Formal Model Definition

In Seasify, recurring oceanographic anomaly signatures (such as coastal storm surge setups, meteorological seiches, and negative tide blowouts) are modeled as deterministic finite automata (DFA).

Formally, each pattern recognizer is a 5-tuple:
\[
M = (Q, \Sigma, \delta, q_0, F)
\]
Where:
- **$Q$** is a finite, non-empty set of machine states representing hydrographic conditions (e.g., Normal Baseline, Influx Phase, Surge Plateau, Recovery Phase).
- **$\Sigma$** is the finite input alphabet of discretized water-level residual symbols.
- **$\delta: Q \times \Sigma \to Q$** is the deterministic transition function mapping a state and an input symbol to the next state.
- **$q_0 \in Q$** is the unique start state (typically representing unperturbed astronomical conditions).
- **$F \subseteq Q$** is the set of accepting (final) states identifying that an anomaly pattern has been formally recognized.

---

## 2. Signal Discretization & Alphabet $\Sigma$

Raw water-level readings are continuous time-series real numbers:
\[
r(t) = H_{\text{observed}}(t) - H_{\text{predicted}}(t) \quad [\text{meters}]
\]
\[
v_r(t) = \frac{r(t) - r(t - \Delta t)}{\Delta t} \quad [\text{meters/hour}]
\]

Because finite automata require a discrete, finite alphabet, Seasify employs a deterministic encoder mapping $(r(t), v_r(t))$ into concrete and high-level symbols.

### 2.1 Two-Dimensional Discretization Grid

1. **Residual Category ($R$):**
   - $H$ (Higher than expected): $r(t) > +T_{\text{pos}}$ (default: $+0.20$ m)
   - $N$ (Normal baseline): $-T_{\text{neg}} \le r(t) \le +T_{\text{pos}}$
   - $L$ (Lower than expected): $r(t) < -T_{\text{neg}}$ (default: $-0.20$ m)

2. **Trend / Rate-of-Change Category ($V$):**
   - $R$ (Rising): $v_r(t) \ge +V_{\text{thresh}}$ (default: $+0.20$ m/hr)
   - $S$ (Steady): $-V_{\text{thresh}} < v_r(t) < +V_{\text{thresh}}$
   - $F$ (Falling): $v_r(t) \le -V_{\text{thresh}}$ (default: $-0.20$ m/hr)

3. **Combined 9-Symbol Alphabet + Telemetry GAP:**
\[
\Sigma = \{ L:F,\; L:S,\; L:R,\; N:F,\; N:S,\; N:R,\; H:F,\; H:S,\; H:R,\; \text{GAP} \}
\]

### 2.2 Boundary Hysteresis
To prevent high-frequency chatter between discrete symbols when water levels fluctuate near threshold boundaries, an empirical hysteresis band $\varepsilon = 0.02$ m is applied:
- A transition out of $H$ requires $r(t) \le T_{\text{pos}} - \varepsilon$.
- A transition out of $L$ requires $r(t) \ge T_{\text{neg}} + \varepsilon$.

---

## 3. Thompson NFA Construction

For user-defined or regular expression rules, Seasify constructs non-deterministic finite automata (NFA) with $\varepsilon$-transitions using Thompson's construction:

1. **Elementary Symbol:** $s_0 \xrightarrow{a} s_1$
2. **Concatenation ($A \cdot B$):** Epsilon transition from each accepting state of $A$ to the start state of $B$:
   \[
   \forall q_f \in F_A,\quad \delta(q_f, \varepsilon) = \{ q_{0,B} \}
   \]
3. **Alternation ($A \mid B$):** New start state $s_0$ branching via $\varepsilon$ to $q_{0,A}$ and $q_{0,B}$, and accepting states connecting to a new unified accepting state $s_f$:
   \[
   \delta(s_0, \varepsilon) = \{ q_{0,A}, q_{0,B} \},\quad \forall q \in F_A \cup F_B, \; \delta(q, \varepsilon) = \{ s_f \}
   \]
4. **Kleene Star ($A^*$):**
   \[
   \delta(s_0, \varepsilon) = \{ q_{0,A}, s_f \},\quad \forall q \in F_A, \; \delta(q, \varepsilon) = \{ q_{0,A}, s_f \}
   \]
5. **Plus Repetition ($A^+$):** $A \cdot A^*$

---

## 4. Subset Construction (NFA $\to$ DFA Determinization)

To ensure linear-time $O(N)$ execution across observation streams, NFAs are determinized into equivalent DFAs via subset construction.

### Mathematical Definitions

1. **Epsilon Closure:**
   $\varepsilon\text{-closure}(T)$ is the set of all NFA states reachable from any state in $T$ using only $\varepsilon$-transitions:
   \[
   \varepsilon\text{-closure}(T) = T \cup \bigcup_{q \in T} \bigcup_{p \in \delta(q, \varepsilon)} \varepsilon\text{-closure}(\{p\})
   \]

2. **Move Function:**
   $\text{move}(T, a)$ is the set of all NFA states reachable from state set $T$ on input symbol $a$:
   \[
   \text{move}(T, a) = \bigcup_{q \in T} \delta(q, a)
   \]

3. **DFA State Formulation:**
   - Initial DFA state: $D_0 = \varepsilon\text{-closure}(\{ q_{0,\text{NFA}} \})$
   - Transitions for each alphabet symbol $a \in \Sigma$:
     \[
     \delta_{\text{DFA}}(U, a) = \varepsilon\text{-closure}(\text{move}(U, a))
     \]
   - A DFA state $U$ is accepting ($U \in F_{\text{DFA}}$) if $U \cap F_{\text{NFA}} \neq \emptyset$.

---

## 5. DFA Minimization with Distinct Output Labels

Seasify implements partition-refinement minimization (Hopcroft's algorithm).

### Partition Invariant
Crucially, when multiple patterns are monitored simultaneously, accepting states that recognize different patterns $P_i \neq P_j$ must **not** be merged.
The initial partition $P_0$ is structured as:
\[
P_0 = \{ Q \setminus F,\; F_{P_1},\; F_{P_2},\; \dots,\; F_{P_k} \}
\]
Where each subset $F_{P_m}$ contains only accepting states associated with pattern $P_m$. Partition refinement is then iteratively executed until no further state splits occur.

---

## 6. Predefined Oceanographic Recognizers

Seasify incorporates 6 mathematically defined DFAs:

### 1. Elevated Surge with Atypical Recovery (`abnormal_recovery`)
- **States:** $Q = \{ S_0 (\text{Normal}), S_1 (\text{Elevated}), S_2 (\text{Recovery}) \}$
- **Start:** $S_0$, **Accepting:** $F = \{ S_2 \}$
- **Transition Table:**
  | Current State | Input Symbol | Next State | Oceanographic Condition |
  |---|---|---|---|
  | $S_0$ | `Rise` | $S_1$ | $\Delta h \ge +0.20$ m/hr or residual $> +0.20$ m |
  | $S_0$ | `Normal` | $S_0$ | Residual within baseline band |
  | $S_1$ | `Hold` | $S_1$ | Elevated plateau ($|\Delta h| < 0.10$ m/hr) |
  | $S_1$ | `Fall` | $S_2$ | Ebb discharge ($\Delta h \le -0.20$ m/hr) [Accepting] |
  | $S_2$ | `Stabilize` | $S_0$ | Water level returns to astronomical normal |

### 2. Sustained Storm Surge Setup (`sustained_elevated`)
- **Rule:** $S_0 \xrightarrow{\text{Rise}} S_1 \xrightarrow{\text{Hold}} S_2$ (Surge confirmed on sample 3)
- Models wind stress setup over shallow shelves.

### 3. Sustained Low-Water Blowout (`sustained_depressed`)
- **Rule:** $S_0 \xrightarrow{\text{Fall}} S_1 \xrightarrow{\text{Low}} S_2$ (Blowout confirmed)
- Models intense offshore gale winds evacuating bays.

### 4. Rapid Surge Influx (`rapid_rise`)
- **Rule:** $S_0 \xrightarrow{\text{Rise}} S_1$ ($v_r \ge +0.20$ m/hr)
- Identifies squall line and frontal wave surges.

### 5. Resonant Harbor Seiche (`oscillatory`)
- **Rule:** $S_0 \xrightarrow{\text{Rise}} S_1 \xrightarrow{\text{Fall}} S_2 \xrightarrow{\text{Rise}} S_3$
- Identifies harmonic standing waves and basin resonance.

### 6. Telemetry Outage Gap (`record_gap`)
- **Rule:** $S_0 \xrightarrow{\text{Gap}} S_1$ ($\Delta t > 30$ min)
- Suspends anomaly evaluation to prevent false triggers during sensor downtime.

---

## 7. Verification: Accepted vs. Rejected Sequences

| Sequence Tested | DFA Pattern | Result | Rationale |
|---|---|---|---|
| `[Rise, Hold, Hold, Fall]` | `abnormal_recovery` | **ACCEPTED** (State $S_2$) | Classic storm surge pulse and discharge curve |
| `[Rise, Hold, Fall, Stabilize]` | `abnormal_recovery` | **ACCEPTED** (State $S_0$ via $S_2$) | Complete pulse through recovery and stabilization |
| `[Rise, Rise, Rise]` | `abnormal_recovery` | **REJECTED** (State $S_1$) | Uninterrupted rise without falling recovery phase |
| `[Normal, Normal, Normal]` | `abnormal_recovery` | **REJECTED** (State $S_0$) | Quiescent baseline, no surge |
| `[Rise, Fall, Rise]` | `oscillatory` | **ACCEPTED** (State $S_3$) | Dual-cycle standing wave oscillation |
| `[Hold, Hold, Hold]` | `sustained_elevated` | **ACCEPTED** (State $S_2$) | 3 consecutive samples exceeding positive threshold |
