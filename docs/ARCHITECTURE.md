# Architecture

## Stack
| Layer | Choice | Why |
|-------|--------|-----|
| App | Next.js (App Router) + TypeScript + Tailwind | Familiar, fast to ship |
| LLM runtime | Ollama on localhost:11434 | Simple REST, structured output support |
| Model | Gemma (e.g. `gemma3:4b`; use 1b if RAM is tight, 12b if strong GPU) | Open weights, qualifies for the Gemma category |
| DB | SQLite via `better-sqlite3` | Single file, zero setup, fully local |
| Validation | Zod | Never trust LLM output |
| Tests | Vitest (parser golden set) | Real accuracy numbers for the post |

Fallback if `better-sqlite3` fails to build: store entries in a JSON file behind the same `lib/db.ts` interface.

## Data flow
```
User text / SMS
   -> POST /api/parse
        -> build prompt (system + today's date + categories)
        -> Ollama /api/chat with `format` = JSON schema, temperature 0
        -> Zod validate -> retry once on failure
        -> resolve days_ago -> ISO date
   <- preview rows (nothing saved yet)
User edits/confirms
   -> POST /api/expenses  -> SQLite
Dashboard
   -> GET /api/summary -> SQL aggregates + runway math (CODE, not LLM)
   -> optional POST /api/weekly -> LLM phrases the numbers
```

## Key design decisions (good material for the post)
1. **LLM parses and phrases; code does the math.** Small models get arithmetic wrong. Totals and runway are SQL/JS.
2. **Preview before save.** A wrong auto-saved expense destroys trust; a one-tap confirm builds it.
3. **Structured output via JSON schema**, plus Zod, plus one retry.
4. **`days_ago` instead of dates.** Small models botch calendars; code converts.
5. **Zero outbound network.** App never calls anything except localhost. Prove it.
6. **Categories are an enum** chosen from the friend interview.

## Schema (SQLite)
```sql
CREATE TABLE IF NOT EXISTS expenses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  amount REAL NOT NULL CHECK (amount > 0),
  item TEXT NOT NULL,
  category TEXT NOT NULL,
  spent_on TEXT NOT NULL,          -- YYYY-MM-DD
  raw_text TEXT,                   -- original input, for debugging/eval
  source TEXT DEFAULT 'text',      -- text | sms
  created_at TEXT DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY, value TEXT NOT NULL
);  -- monthly_budget, tone, language
```

## API routes
| Route | Method | Purpose |
|-------|--------|---------|
| /api/parse | POST {text, source} | LLM -> validated preview rows |
| /api/expenses | GET/POST/DELETE/PATCH | CRUD |
| /api/summary | GET | totals, categories, runway |
| /api/weekly | POST | LLM weekly note from computed numbers |
| /api/export | GET | CSV |

## Folder layout
```
hisaab-dost/
  AGENTS.md  README.md  docs/*.md
  src/app/(pages)/ page.tsx  add/page.tsx  settings/page.tsx
  src/app/api/{parse,expenses,summary,weekly,export}/route.ts
  src/lib/{ollama,parse,db,summary,categories,prompts}.ts
  src/lib/__tests__/parse.eval.test.ts
  eval/golden.json
```

## Failure modes to handle
- Ollama not running -> friendly "Start Ollama" screen with command
- Model not pulled -> show `ollama pull <model>`
- Invalid JSON -> retry once, then manual-entry fallback form
- Amount missing/ambiguous -> mark row "needs review", don't guess
- Duplicate paste -> warn if same amount+item+date exists
