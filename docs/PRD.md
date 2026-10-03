# PRD — Hisaab Dost

## Problem
Priya loses track of where money goes. Existing apps need tapping through forms, push data to someone else's server,
or assume tidy English input. Real spending talk is messy: "chai 20, auto 60, mess 3500, ola 140 udhaar to Piyush".

## Target user (fill after interview)
- Name: Priya
- Situation: Hostel Student Fully dependent on Family
- Device: Windows, RAM: 16 GB  <- decides which Gemma size you can run
- Language:  Hinglish 
- Why they'd distrust a normal app: privacy, ads, forgetfulness, too many taps

## Friend interview (15 min, write answers verbatim)
1. Last time you wondered "where did my money go?" What happened?
ans - At the end of the month when I want to Buy a new dress then i got realize that all money has gone .
2. How do you track spending today (if at all)? Why does it fail?
Ans- By writing in the notepad or sometimes texting on my own phone number, it usually fails due to randomness nad sometime i forgot to even write.
3. What are the 5 things you spend on most?
Ans Junk Food , canteen clothes,shopping and small payment 
4. Would you rather type, speak, or paste SMS? In which language?
Ans i would love to speak more than type in  HINGLISH
5. What would make you stop using it after 3 days?
Ans laziness to open every time and managing every time by own dynamacially
6. Does it bother you if the data lives on a company server? Why?
Ans Because its my personal Data and i would like to keep it Private
7. What number do you actually want to know? (e.g. "will my allowance last?")
Ans The money i can spend to last safely until end of the month

## Core user stories
1. As Priya, I type one messy line and see structured entries I can confirm.
2. I paste several UPI/bank SMS lines and get entries in one go.
3. I see how much I've spent this month by category.
4. I see whether my money will last until month end at the current pace.
5. I get a short, kind weekly summary in my own language mix.
6. My data stays on my laptop and works with Wi-Fi off.

## MVP scope (must ship)
- Free-text quick add with preview and edit before saving
- Local SQLite storage
- Dashboard: month total, categories, recent entries, runway
- Local LLM via Ollama (Gemma), structured JSON output validated with Zod
- Delete/edit entry, CSV export

## Stretch (only if time)
- UPI SMS batch paste
- Weekly summary in Hinglish
- Voice input via local whisper.cpp
- Shared-expense "udhaar" tracking (who owes whom)

## Non-goals
Auth, cloud sync, bank API integration, mobile app, multi-user, charts library gymnastics.

## Success criteria
- Parser gets >= 85% of golden-set lines fully right (report the real number, whatever it is)
- Friend logs at least one real day with it
- Works with network disabled
- Post contains a real friend reaction

## Why open-weight / local matters (the post's core argument)
- Financial data stays on the device
- Zero running cost, no API key, no rate limits
- Works offline (hostel Wi-Fi, load-shedding)
- Swappable models and prompts tuned to the friend's slang
- Be honest: where did a closed model likely do better? (accuracy on weird input, speed) and what did you do about it?
