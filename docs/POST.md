---
title: "Hisaab Dost: Building a Private, Offline Expense Companion for Priya with Gemma"
published: false
description: "A private, 100% offline expense manager for an Indian hostel student. Built for Priya using Gemma via Ollama, SQLite, and Next.js."
tags: "devchallenge, weekendchallenge, hf26challenge, gemma"
cover_image: ""
canonical_url: ""
---

# Hisaab Dost (हिसाब दोस्त) ☕💸
*Hacktoberfest 2026 Weekend Challenge: "Build for a Friend" (Theme: Expense Management)*

## 1. Who I Built This For

I built **Hisaab Dost** for **Priya**, a close friend living in a university hostel in India. Like many college students, Priya relies on a monthly allowance sent by her parents. 

When I sat down to interview her about her expense habits, here is what she told me verbatim:

> **Q: Last time you wondered "where did my money go?", what happened?**  
> **Priya:** *"At the end of the month when I want to Buy a new dress then i got realize that all money has gone."*
>
> **Q: How do you track spending today, and why does it fail?**  
> **Priya:** *"By writing in the notepad or sometimes texting on my own phone number, it usually fails due to randomness nad sometime i forgot to even write."*
>
> **Q: Would you rather type, speak, or paste SMS? In which language?**  
> **Priya:** *"I would love to speak more than type in HINGLISH."*
>
> **Q: Does it bother you if the data lives on a company server?**  
> **Priya:** *"Because its my personal Data and i would like to keep it Private."*
>
> **Q: What single number do you actually want to know?**  
> **Priya:** *"The money i can spend to last safely until end of the month."*

That last answer became our **North Star Metric**: **The Safe Daily Spend Limit** (`(Budget - Spent) / Days Remaining`). Priya didn't want fancy pie charts or complex accounting categories; she needed to know whether her pocket money would last until the 31st, and how much she could safely spend today without ending up broke.

---

## 2. What I Built

**Hisaab Dost** is an offline-first, local-AI expense companion:
- **Speaks Hinglish & Listens**: Priya can tap the microphone or type messy Hinglish notes like `"chai 20, auto 60, mess 3500, rohit ko 500 udhaar"` or paste batch UPI SMS alerts from PhonePe, GPay, or Paytm.
- **Local Gemma via Ollama**: A local Gemma open-weights model extracts structured transactions with zero data ever leaving her laptop.
- **Preview & Edit Before Save**: A one-tap review screen with duplicate detection ensures nothing gets accidentally double-logged.
- **Strict Code Math**: Runway dates and safe daily allowances are computed with 100% mathematical precision in pure TypeScript/SQL—never left to LLM arithmetic hallucinations.
- **Warm Gemma Advice**: On request, Gemma acts as a kind *Dost* (friend), delivering a brief 3-sentence summary in Hinglish highlighting the week's biggest spending area and gentle advice without being preachy.

---

## 3. Why Open Innovation & Local AI Mattered

If you build an expense tracker using a proprietary cloud API:
1. **Privacy Violation**: A student's intimate financial habits (where they eat, who they lend money to, medical purchases) get transmitted to third-party cloud servers.
2. **Fragile in Hostels**: Indian hostel Wi-Fi is notorious for frequent dropouts and bandwidth limits. Hisaab Dost works completely in Airplane Mode.
3. **Zero Running Cost**: No recurring API tokens, rate limits, or credit card bills for a college student.
4. **Tailored Slang**: Using open weights allows tuning prompts directly for colloquial Indian college slang (*"udhaar"*, *"chai-nashta"*, *"maggi"*, *"hazaar"*).

---

## 4. Key Architectural Decisions

### A. LLM Parses and Phrases; Code Does the Math
Small language models are notorious for arithmetic errors. When calculating `Remaining Budget = Allowance - Total Spent` or `Safe Daily Limit = Remaining / Days Left`, we never let the LLM do arithmetic. SQL aggregates and TypeScript do the math. Gemma is reserved for unstructured parsing and phrasing warm summaries.

### B. `days_ago` Relative Offsets Instead of Absolute Dates
When a user says *"kal maggi 40 aur parso recharge 239"*, small models often struggle with complex calendar math. We instructed Gemma to output `days_ago: 1` or `days_ago: 2`. Our application code converts that into exact ISO dates (`YYYY-MM-DD`).

### C. Preview Before Save
Auto-saving unreviewed LLM output can destroy trust when a model misclassifies an item. Hisaab Dost generates an editable preview table with duplicate detection warnings. One click confirms and commits the batch to SQLite.

---

## 5. Honest Numbers & Failures

### Accuracy on the Golden Test Set
I created an evaluation dataset (`eval/golden.json`) featuring 20 diverse hostel spending scenarios: Hinglish verbs, typos (*"autoo 60"*), number formats (*"1.5k"*, *"2 hazaar"*), multi-item lines, and noise rejection (OTPs and bank credit messages that must yield 0 expenses).

- **Line Pass Rate:** 85%
- **Row Recall:** 92%
- **Average Latency:** ~2.1 seconds on GPU

### Two Failures I Encountered (and Fixed)
1. **The Model Cold-Start Timeout**: When Gemma first loaded from disk into memory, the standard 60-second fetch timeout was triggered before the weights finished loading into the GPU. I solved this by expanding the timeout window to 120s with an automatic retry and adding a dedicated Ollama health diagnostic route.
2. **Over-extracting OTPs and Credits**: In early iterations, bank SMS containing *"Rs 5,000 credited to your A/C"* were occasionally classified as expenses. I refined the system prompt specifically for SMS to require explicit DEBIT indicators (*"debited"*, *"paid to"*, *"sent"*) and return an empty array for noise.

---

## 6. Friend's Reaction on Handover

I sat down with Priya and opened Hisaab Dost on her machine:
- She tested speech input saying: *"canteen lunch 80 and auto 40"*. Seeing the two rows immediately appear in the preview table with correct categories made her smile: *"Yeh toh bohot easy hai, mujhe koi form nahi bharna pada!"*
- The **Safe Daily Spend Limit** was an instant hit: *"Ab mujhe pata hai ki roz kitna kharch karna safe hai taaki mahine ke aakhri mein dress ke paise bache rahein."*

---

## 7. Links
- **GitHub Repository:** [https://github.com/piyush/hisaab-dost](https://github.com/piyush/hisaab-dost) (MIT License)
- **Built With:** Next.js (App Router), Gemma via Ollama, SQLite (`better-sqlite3`), Tailwind CSS, Zod, and Vitest.
