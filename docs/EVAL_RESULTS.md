# Hisaab Dost — Parser Golden Eval Report
Date: 2026-10-05
Model: Gemma (local via Ollama)

## Overall Metrics
- **Line Pass Accuracy:** 18/20 (**90%**)
- **Row-Level Recall:** 21/22 (**95%**)
- **Average Latency:** 74039 ms per parse

## Test Cases Breakdown
| # | Status | Input | Expected | Output | Latency |
|---|--------|-------|----------|--------|---------|
| 1 | ✅ PASS | `chai 20, auto 60, mess 3500` | `[{"amount":20,"category":"chai_snacks","days_ago":0},{"amount":60,"category":"transport","days_ago":0},{"amount":3500,"category":"rent_mess","days_ago":0}]` | `[{"amount":20,"category":"chai_snacks","days_ago":0},{"amount":60,"category":"transport","days_ago":0},{"amount":3500,"category":"rent_mess","days_ago":0}]` | 213039ms |
| 2 | ✅ PASS | `kal maggi 40 aur parso recharge 239` | `[{"amount":40,"category":"chai_snacks","days_ago":1},{"amount":239,"category":"recharge_bills","days_ago":2}]` | `[{"amount":40,"category":"chai_snacks","days_ago":1},{"amount":239,"category":"recharge_bills","days_ago":2}]` | 63141ms |
| 3 | ✅ PASS | `rohit ko 500 udhaar diye` | `[{"amount":500,"category":"lent_money","days_ago":0}]` | `[{"amount":500,"category":"lent_money","days_ago":0}]` | 37634ms |
| 4 | ✅ PASS | `canteen lunch 80 and auto 40` | `[{"amount":80,"category":"food","days_ago":0},{"amount":40,"category":"transport","days_ago":0}]` | `[{"amount":80,"category":"food","days_ago":0},{"amount":40,"category":"transport","days_ago":0}]` | 67388ms |
| 5 | ✅ PASS | `shopping kurti 1.5k` | `[{"amount":1500,"category":"shopping","days_ago":0}]` | `[{"amount":1500,"category":"shopping","days_ago":0}]` | 51121ms |
| 6 | ✅ PASS | `stationery xerox 45rs` | `[{"amount":45,"category":"education","days_ago":0}]` | `[{"amount":45,"category":"education","days_ago":0}]` | 56373ms |
| 7 | ✅ PASS | `kal movie ticket ₹250 liya` | `[{"amount":250,"category":"entertainment","days_ago":1}]` | `[{"amount":250,"category":"entertainment","days_ago":1}]` | 33406ms |
| 8 | ✅ PASS | `parso paracetamol medicine 65` | `[{"amount":65,"category":"health","days_ago":2}]` | `[{"amount":65,"category":"health","days_ago":2}]` | 45995ms |
| 9 | ✅ PASS | `autoo 60, maggie 40` | `[{"amount":60,"category":"transport","days_ago":0},{"amount":40,"category":"chai_snacks","days_ago":0}]` | `[{"amount":60,"category":"transport","days_ago":0},{"amount":40,"category":"chai_snacks","days_ago":0}]` | 59537ms |
| 10 | ✅ PASS | `hostel room rent 2 hazaar` | `[{"amount":2000,"category":"rent_mess","days_ago":0}]` | `[{"amount":2000,"category":"rent_mess","days_ago":0}]` | 40597ms |
| 11 | ❌ FAIL | `yesterday cafe cold coffee 120` | `[{"amount":120,"category":"chai_snacks","days_ago":1}]` | `[{"amount":120,"category":"food","days_ago":1}]` | 119560ms |
| 12 | ✅ PASS | `samosa chai kharcha 35` | `[{"amount":35,"category":"chai_snacks","days_ago":0}]` | `[{"amount":35,"category":"chai_snacks","days_ago":0}]` | 44135ms |
| 13 | ✅ PASS | `metro card recharge 200` | `[{"amount":200,"category":"transport","days_ago":0}]` | `[{"amount":200,"category":"transport","days_ago":0}]` | 60585ms |
| 14 | ✅ PASS | `sneha ko book ke liye 300 diye` | `[{"amount":300,"category":"lent_money","days_ago":0}]` | `[{"amount":300,"category":"lent_money","days_ago":0}]` | 64787ms |
| 15 | ✅ PASS | `Dear Customer, A/C ending 4091 debited by Rs.150.00 on 03-Oct-26 at SWIGGY UPI ref 938210.` | `[{"amount":150,"category":"food","days_ago":0}]` | `[{"amount":150,"category":"food","days_ago":0}]` | 76162ms |
| 16 | ✅ PASS | `Paid Rs.30.00 to Sharma Chai Point via PhonePe on 04 Oct 2026. Txn ID T26100412.` | `[{"amount":30,"category":"chai_snacks","days_ago":0}]` | `[{"amount":30,"category":"chai_snacks","days_ago":0}]` | 69714ms |
| 17 | ✅ PASS | `INR 450.00 debited from A/C XX7812 on 04-10-26 towards UBER INDIA. Avail Bal: Rs.4200.00` | `[{"amount":450,"category":"transport","days_ago":0}]` | `[{"amount":450,"category":"transport","days_ago":0}]` | 73827ms |
| 18 | ✅ PASS | `Your OTP for login to NetBanking is 482910. Do not share this OTP with anyone.` | `[]` | `[]` | 30360ms |
| 19 | ✅ PASS | `Rs. 5000.00 credited to your A/C XX4091 by UPI/Piyush. Avail Bal: Rs. 8450.00` | `[]` | `[]` | 33397ms |
| 20 | ❌ FAIL | `Just a reminder: please bring your college id card tomorrow` | `[]` | `[{"error":"TimeoutError: The operation was aborted due to timeout"}]` | 240018ms |
