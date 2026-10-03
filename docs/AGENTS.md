# AGENTS.md — context for coding agents (Claude Code, Copilot, etc.)

## Project
Hisaab Dost: offline expense tracker for one specific friend. Local Gemma via Ollama parses messy Hinglish text/UPI SMS
into structured expenses. See docs/PRD.md and docs/ARCHITECTURE.md.

## Hard rules
1. **No outbound network calls** except to `http://localhost:11434` (Ollama). No analytics, no CDN fonts, no telemetry.
2. **LLM never does arithmetic or date math.** Totals, runway, dates are computed in code.
3. **Validate all LLM output with Zod.** Retry once, then fall back to manual entry.
4. **Never auto-save parsed rows.** Always show a preview and require confirm.
5. Amounts are positive numbers in INR. Currency symbol is display-only.
6. TypeScript strict mode. No `any` in lib/.
7. Keep it small: no auth, no ORM, no state libraries beyond React state.
8. Model name and Ollama URL come from env: `OLLAMA_MODEL`, `OLLAMA_URL`.

## Commands
- `npm run dev` — app on :3000
- `npm run test` — parser golden-set eval (needs Ollama running)
- `ollama serve` / `ollama pull $OLLAMA_MODEL`

## Style
- Small functions, early returns, descriptive names
- UI: big input box, thumb-friendly, readable on a laptop in a hostel room; dark mode optional
- Copy tone: warm, short, Hinglish-friendly microcopy where the friend prefers it

## Definition of done per task
Builds, typechecks, works with Wi-Fi off, and has one line added to docs/TASKS.md progress log.

## Do not
- Add dependencies without a reason in the PR/commit message
- Change categories without updating src/lib/categories.ts, prompts and eval/golden.json together
- Reuse code or data from any previous project; this is a new build
