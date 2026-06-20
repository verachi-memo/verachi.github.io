---
target: landing-page plan section
total_score: 28
p0_count: 0
p1_count: 2
timestamp: 2026-06-20T06-58-45Z
slug: src-index-html-plans
---
# Landing Plan Section Critique

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Featured Pro state is visible, but the decision state is not summarized. |
| 2 | Match System / Real World | 3 | Free, Pro, Enterprise are familiar, but terms like semantic RAG and File Search are implementation-level. |
| 3 | User Control and Freedom | 3 | Self-serve vs Enterprise is clear; users still cannot easily compare without reading all rows. |
| 4 | Consistency and Standards | 3 | Cards use a consistent detail grammar; Pro order on mobile is sensible. |
| 5 | Error Prevention | 2 | CTA labels and plan differences do not prevent choosing the wrong path quickly. |
| 6 | Recognition Rather Than Recall | 2 | Dense long cards force recall, especially on mobile. |
| 7 | Flexibility and Efficiency | 2 | No fast path for users who already know they need AI, non-AI, or procurement. |
| 8 | Aesthetic and Minimalist Design | 3 | On-brand and legible, but too much table content sits inside each card. |
| 9 | Error Recovery | 3 | Links are low-risk, though Pro trial semantics should be clearer. |
| 10 | Help and Documentation | 2 | The section does not explain plan choice in a concise decision rule. |
| **Total** | | **28/40** | **Solid surface, weak chooser.** |

## Anti-Patterns Verdict

**LLM assessment**: The section does not look badly AI-generated. It is calm, legible, and aligned with the Editorial Ledger system. The main template tell is the three equal pricing cards with long feature rows, which makes it feel more like a SaaS default than the rest of the page.

**Deterministic scan**: `detect.mjs --json src/index.html` found 2 page-wide issues: `em-dash-overuse` with 20 em dashes in body text, and `numbered-section-markers` from the 01/02/03/10 sequence. These are not specific to the pricing section, but they reinforce the broader editorial-template risk.

**Visual overlays**: No reliable user-visible overlay was created. Browser mutation/injection was not available through the read-only browser evaluation surface, so the fallback signal was static CLI detector output plus browser screenshots/metrics.

## Overall Impression

The section looks trustworthy, but it asks users to read too much before they can choose. The biggest opportunity is to turn the cards from mini comparison tables into a fast chooser: one decisive line per plan, then only the rows that change the decision.

## What's Working

- The Free / Pro / Enterprise model is understandable, and Pro has a clear visual emphasis.
- The integrated detail rows removed duplicate checklist noise and fit the border-led design system.
- The final note correctly clarifies self-serve vs Enterprise, which supports the product principle of not hiding the real action.

## Priority Issues

**[P1] The cards are too dense for a pricing decision**

Why it matters: Each card is roughly 700-760px tall and reads like a compact table. Users scan pricing sections to answer one question: which path is mine? Here they have to compare five rows across three cards.

Fix: Keep the top third of each card as the chooser: plan, price, primary user, primary unlock, CTA. Reduce the row list to 3 decision-critical rows or move implementation details elsewhere.

Suggested command: `$impeccable distill #pricing`

**[P1] Plan differentiation is too abstract**

Why it matters: Free is described as durable project memory, Pro as Verachi Intelligence, and Enterprise as procurement. That is directionally right, but the concrete switching rule is buried in rows.

Fix: Add a plain decision line to each card, e.g. Free for cited records without AI, Pro for AI answers over connected sources, Enterprise for custom governance and limits.

Suggested command: `$impeccable clarify #pricing`

**[P2] Mobile comparison becomes memory work**

Why it matters: On mobile, Pro appears first, then Free, then Enterprise, but the section is about 2,800px tall. A user cannot compare rows side by side and must remember prior cards while scrolling.

Fix: Add a compact mobile-first chooser before the cards, or shorten each mobile card to the key differentiator plus CTA, with details available lower on the page.

Suggested command: `$impeccable adapt #pricing`

**[P2] Some row copy leaks implementation or internal framing**

Why it matters: `5 users for MVP`, `semantic RAG`, `File Search`, and model names slow the decision down. Engineering leaders may appreciate precision, but pricing cards should not make them parse architecture.

Fix: Replace internal or vendor-specific detail with user-facing outcomes unless it is a procurement requirement. Put model/vendor details in FAQ or security docs.

Suggested command: `$impeccable clarify #pricing`

**[P3] The cookie banner can cover the pricing reassurance note**

Why it matters: The note is the final trust clarification for self-serve vs Enterprise. In the desktop viewport, the analytics banner sits over that area and steals attention.

Fix: Add enough bottom spacing when the consent banner is visible, or move the reassurance note above the card grid where it cannot be covered.

Suggested command: `$impeccable audit #pricing`

## Persona Red Flags

**Engineering Lead**: Wants to know whether the team can start without AI or needs Pro. The card rows make that answer slower than necessary, and `MVP` reads like internal product staging.

**Security / Procurement Buyer**: Enterprise says security review and procurement, but the card does not point to concrete evidence or a security page. They may still need to hunt.

**First-Time Evaluator**: Terms like Verachi Intelligence, semantic RAG, and File Search appear before the user has a crisp plan-selection rule. That raises cognitive load.

## Minor Observations

- `Start free trial` should only stay if there is a real Pro trial. Otherwise use a label that matches the signup flow.
- `Most popular` is plausible, but without usage proof it is a weak badge. `Recommended for AI` would be more honest if Pro is the intended path.
- The price hierarchy is strong; do not redesign the whole section before simplifying the copy.

## Questions to Consider

- What is the one sentence that makes a user choose Free vs Pro?
- Does Enterprise need to be a full peer card, or a shorter procurement path beside the self-serve plans?
- Which details actually change the buying decision at this point in the page?
