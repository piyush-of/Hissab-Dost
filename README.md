# Hisaab Dost (हिसाब दोस्त) ☕💸
> **A private, offline expense companion for hostel students.** Built for Priya.  
> Powered by **Google Gemma** via **Ollama**, **Next.js**, and **SQLite**. Zero outbound cloud calls.

---

## 🌟 The Story: Built for Priya
Priya is a college student living in a hostel on a monthly family allowance. She tracks expenses in notes or texts to her own number, but:
1. She loses track at month-end when wanting to buy something special (like a new dress) only to find her allowance gone.
2. She speaks in **Hinglish** (*"chai 20, auto 60, canteen lunch 80, rohit ko 500 udhaar"*).
3. Normal finance apps demand tedious form taps and send her intimate financial data to third-party ad networks.
4. **The single number she actually wants to know:** *"Will my allowance last until the end of the month, and what is my safe daily limit?"*

**Hisaab Dost** solves this:
- **Speech or Quick Text**: Tap mic or type messy Hinglish / paste UPI SMS alerts.
- **Local Gemma AI**: Extracts structured expenses locally on her laptop via Ollama.
- **Strict Code Math**: Calculations and runway predictions are computed in pure TypeScript/SQL—never hallucinations by an LLM.
- **Preview & Edit Before Save**: One-tap confirm with duplicate detection prevents mistakes.
- **100% Offline & Private**: Zero external network requests. Works even with Wi-Fi off.

---

## 🚀 5-Command Quickstart

```bash
# 1. Clone repository
git clone https://github.com/piyush/Hisaab-Dost.git
cd Hisaab-Dost

# 2. Install dependencies
npm install

# 3. Pull Gemma model in Ollama (if not already present)
ollama pull gemma4:12b

# 4. Seed initial hostel data (optional)
npx tsx scripts/seed.ts

# 5. Start the offline app
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛠️ CLI Quick Parse
You can parse expenses directly from your terminal:

```bash
npm run parse "chai 20, auto 60, mess 3500"
```

Output:
```json
[
  {
    "amount": 20,
    "item": "chai",
    "category": "chai_snacks",
    "days_ago": 0,
    "spent_on": "2026-10-04",
    "needs_review": false,
    "source": "text"
  },
  {
    "amount": 60,
    "item": "auto",
    "category": "transport",
    "days_ago": 0,
    "spent_on": "2026-10-04",
    "needs_review": false,
    "source": "text"
  }
]
```

---

## 🏗️ Architecture & Key Design Decisions

```
Messy Text / Voice / SMS 
   → POST /api/parse 
   → Local Gemma via Ollama (JSON Schema constraint)
   → Zod Schema Validation (Retry on error)
   → days_ago converted to ISO Date in Code
   → Editable Preview Table (with Duplicate Detection)
   → One-tap Confirm → SQLite (better-sqlite3 with WAL mode)
   → Dashboard: Strict Code/SQL Runway & Safe Daily Allowance Math
   → Gemma Weekly Insight: Phrases the pre-calculated numbers warmly
```

1. **LLM parses and phrases; code does the math**: Small language models botch arithmetic. Totals, percentages, and runway math are calculated strictly in code.
2. **Preview before save**: Never trust raw LLM output directly into SQLite without user verification.
3. **`days_ago` relative offsets**: Small models get calendar dates wrong; LLM extracts `0` (today), `1` (kal), `2` (parso), and code maps them accurately.
4. **Zero external telemetry**: Absolute privacy for personal financial logs.

---

## 🧪 Golden Eval Set & Accuracy
A golden dataset of 20 real hostel scenarios (`eval/golden.json`) testing Hinglish verbs, UPI SMS debits, typos, relative dates, and noise rejection (OTPs, credits).

Run the eval:
```bash
npm run eval
```

---

## 📜 License
MIT License. Free and open source.
