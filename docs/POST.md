---
title: "Hisaab Dost: A Private Hinglish Expense Companion for Priya, Built on Gemma"
published: false
description: "I built a local-first expense tracker for my friend Priya, a hostel student. Gemma runs on her laptop through Ollama, and her money data never leaves it."
tags: devchallenge, weekendchallenge, hf26challenge, gemma
cover_image:
canonical_url:
---

*Hacktoberfest Weekend Challenge: Build for a Friend*

## Who I built this for

I built **Hisaab Dost** for **Priya**, a friend who lives in a university hostel in India on a monthly allowance from her family. Before writing any code I sat down and interviewed her. Her answers, in her own words:

> **When did you last wonder "where did my money go?"**
> "At the end of the month when I want to buy a new dress then I got realize that all money has gone."
>
> **How do you track spending today, and why does it fail?**
> "By writing in the notepad or sometimes texting on my own phone number, it usually fails due to randomness and sometimes I forgot to even write."
>
> **Type, speak, or paste SMS?**
> "I would love to speak more than type in Hinglish."
>
> **Does it bother you if the data lives on a company server?**
> "Because it's my personal data and I would like to keep it private."
>
> **What number do you actually want to know?**
> "The money I can spend to last safely until end of the month."

That last answer became the whole product: one number, the **safe daily limit** = (budget - spent) / days left.

## What it does

- Type messy Hinglish like `chai 20, auto 60, mess 3500, rohit ko 500 udhaar`, or paste bank/UPI SMS alerts.
- A local Gemma model (via Ollama) turns the text into structured expenses.
- She sees an editable preview, with duplicate warnings, before anything is saved.
- A dashboard shows spending by category and whether her allowance will last. All of that math is plain TypeScript and SQL.
- An optional weekly note, phrased by Gemma from the pre-computed numbers.

Stack: Next.js, SQLite (`better-sqlite3`), Zod, Ollama + Gemma.

## Why open and local mattered

- **Privacy:** her spending (where she eats, who she lends to) is never sent to a cloud AI. That was her own requirement.
- **Cost:** no API key and no per-request bill, which matters on a student budget.
- **Control:** the model and prompts are mine to change. I can swap `gemma4:12b` for `gemma4:e4b` with one environment variable, and tune the prompt for words like *udhaar*, *maggi* and *2 hazaar*.
- **Honest caveat:** the optional mic button uses the browser's speech recognition, which may use an online service. Typing and pasting stay fully local.

## Design decisions

1. **The LLM parses and phrases; code does the math.** Small models are unreliable at arithmetic, so totals, runway and the daily limit never come from the model.
2. **Preview before save.** Raw model output never reaches the database without her confirming it.
3. **`days_ago` instead of dates.** The model outputs 0, 1 or 2 for today, *kal* and *parso*, and code converts that into a real date. While reviewing the code I also found that I was building the date from UTC, which is wrong in India before 5:30 AM, so it now uses local time.
4. **Schema-constrained output plus Zod plus one retry.**

## Honest numbers

I wrote a golden set of 20 realistic inputs (`eval/golden.json`): Hinglish verbs, typos (`autoo 60`), amounts like `1.5k` and `2 hazaar`, UPI/bank SMS debits, and noise that must return nothing (an OTP, a credit alert, a reminder).

Run with Gemma 4 12B on a student laptop:

| Metric | Result |
|---|---|
| Line pass rate | **18 / 20 (90%)** |
| Row match recall | **21 / 22 (95%)** |
| Average latency | **~74 s per parse** |

**What went wrong:**

- **It was slow.** The first parse took 213 s while the model loaded, and one case timed out. The 12B model is too heavy for her laptop, so the fix is the smaller `gemma4:e4b` plus keeping the model loaded between parses.
- **Case 11** (`yesterday cafe cold coffee 120`) came back as `food`; my golden set says `chai_snacks`. Amount and date were correct, so this is a category judgement call.
- **Case 20** was a plain reminder that should return nothing; it failed only because of the timeout.
- Bank SMS with *credited* and OTP messages are correctly ignored (cases 18 and 19), because the SMS prompt only accepts explicit debits.

Where a closed cloud model would likely win: raw speed on weak hardware and odd phrasing. Where open won: privacy, zero cost, and the freedom to change the model and prompt for one specific person.

## What Priya said

[WRITE THIS FROM THE REAL SESSION: sit with her, let her type or speak her own messy line, and paste her exact words here. Do not invent a quote.]

## Links

- Code (MIT): https://github.com/piyush-of/Hissab-Dost
