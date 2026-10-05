# Hisaab Dost (हिसाब दोस्त) ☕💸

> **A private, offline expense companion for hostel students. Built for Priya.**
> Powered by **Google Gemma** running locally through **Ollama**, with **Next.js** and **SQLite**.
> No cloud AI API. No analytics. Your expenses stay on your laptop.

*(The GitHub repository is named `Hissab-Dost`; the app is called Hisaab Dost.)*

---

## 🌟 The story: built for Priya

Priya is a college student living in a hostel on a monthly family allowance. She tracks expenses in notes, or by texting herself, but:

1. She loses track by month-end, just when she wants to buy something special, and finds her allowance is gone.
2. She writes the way she speaks, in **Hinglish**: *"chai 20, auto 60, canteen lunch 80, rohit ko 500 udhaar"*.
3. Typical finance apps need lots of taps through forms, and send personal money data to third-party servers.
4. The one thing she actually wants to know: **"Will my allowance last until the end of the month, and what is my safe daily limit?"**

**Hisaab Dost** answers that question:

- **Messy text in:** type Hinglish, or paste a UPI / bank SMS alert.
- **Local Gemma AI:** turns the text into structured expenses on her own laptop via Ollama.
- **Code does the math:** totals, runway and the safe daily limit are calculated in TypeScript/SQL, never by the LLM.
- **Preview before saving:** she can edit every row, and duplicates are flagged before anything is stored.
- **Private by design:** parsing, math and storage all run locally.

---

## 🔒 Why open and local matters here

| Concern | How an open, local model helps |
|---|---|
| **Privacy** | A student's spending history never leaves her machine. There is no account, no server and no ad network. |
| **Cost** | Free to run. No per-request API fees, which matters on a student budget. |
| **Works offline** | Once the model is pulled, parsing works with Wi-Fi off. |
| **Swappable** | Change one environment variable (`OLLAMA_MODEL`) to try a bigger or smaller Gemma model for your hardware. |

> **Note on voice input:** the mic button depends on the browser's speech recognition. Some browsers process speech with an online service, so for strict offline use, type or paste text instead.

---

## 🚀 Quickstart

**Requirements:** [Node.js](https://nodejs.org) **22 or 24 LTS** and [Ollama](https://ollama.com).

```bash
# 1. Clone
git clone https://github.com/piyush-of/Hissab-Dost.git
cd Hissab-Dost

# 2. Install dependencies
npm install

# 3. Pull a Gemma model (default in .env.example is gemma4:12b)
ollama pull gemma4:12b
#    On a laptop with limited RAM, use the smaller model instead:
#    ollama pull gemma4:e4b

# 4. Configure the model
cp .env.example .env.local        # Windows: copy .env.example .env.local
#    then edit OLLAMA_MODEL in .env.local if you use gemma4:e4b

# 5. (Optional) seed sample hostel data
npx tsx scripts/seed.ts

# 6. Start the app
npm run dev
```

Open <http://localhost:3000>. Make sure Ollama is running (`ollama serve`) before you parse anything.

### Configuration

| Variable | Default | Purpose |
|---|---|---|
| `OLLAMA_URL` | `http://localhost:11434` | Where Ollama is running |
| `OLLAMA_MODEL` | `gemma4:12b` | Which Gemma model to use |

### Windows troubleshooting

- **`better-sqlite3` fails with `node-gyp` / "Could not find any Visual Studio"**: use **Node 22 LTS**, and clone the project to a plain folder (for example `C:\dev`) instead of one synced by OneDrive. Then run `npm install` again.
- **Parses time out**: the model may be running on CPU. Check with `ollama ps`, or switch to `gemma4:e4b`.

---

## 🛠️ CLI quick parse

You can parse expenses straight from the terminal:

```bash
npm run parse "chai 20, auto 60, mess 3500"
```

It prints one structured object per expense, each with `amount`, `item`, `category`, `spent_on` (an ISO date computed in code), `needs_review` and `source`. Example (abridged):

```json
{
  "amount": 20,
  "item": "chai",
  "category": "chai_snacks",
  "days_ago": 0,
  "needs_review": false,
  "source": "text"
}
```

---

## 🏗️ Architecture and key design decisions

```
Messy text / SMS (or voice via the browser)
   → POST /api/parse
   → Local Gemma via Ollama (JSON-schema-constrained output)
   → Zod validation (one retry on failure)
   → days_ago converted to an ISO date in code
   → Editable preview table (with duplicate detection)
   → One-tap confirm → SQLite (better-sqlite3, WAL mode)
   → Dashboard: runway and safe-daily-limit math in code/SQL
   → Gemma weekly insight: phrases the pre-computed numbers warmly
```

1. **The LLM parses and phrases; code does the math.** Small language models are unreliable at arithmetic, so totals, percentages and runway are computed in code.
2. **Preview before save.** Raw LLM output is never written to the database without the user confirming it.
3. **Relative dates (`days_ago`).** Small models get calendar dates wrong, so the model extracts `0` (today), `1` (kal), `2` (parso), and code turns that into a real date.
4. **No telemetry.** No analytics or tracking is included.

---

## 🧪 Evaluation

A golden set of 20 realistic hostel inputs (`eval/golden.json`) covers Hinglish phrasing, typos, relative dates, UPI/bank SMS debits, and noise that must be rejected (OTPs and credits).

```bash
npm run eval
```

**Results (Gemma 4 12B via Ollama, run on a student laptop):**

| Metric | Result |
|---|---|
| Line pass rate | **18 / 20 (90%)** |
| Row match recall | **21 / 22 (95%)** |
| Average latency | ~74 s per parse |

**Known limitations:**

- Latency on a laptop with 12B was high (average ~74 s; the first call was slowest), and two cases hit the request timeout. The smaller `gemma4:e4b` model is the recommended option for low-spec machines.
- One test input using the English word "yesterday" (rather than "kal") failed on the date; relative-date handling for English words is the next thing to improve.

Full per-case output is written to `docs/EVAL_RESULTS.md` each time you run the eval.

---

## 📜 License

MIT License. Free and open source.