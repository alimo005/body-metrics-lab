# CALCULATION-SPEC.md — BodyMetrics Lab

Scientific and numerical specification for the six calculators. It is the single source for every formula, constant, category, range, rounding rule, validation limit and reference test case. Calculator code in `src/calculators/` must implement exactly what is written here and nothing else. Page text, layout and interaction are in `DESIGN-SPEC.md`.

Updated 2026-11-22 on branch `rebuild` after the owner's final methodological decisions. Documentation only; no application code exists yet.

## 0. How to read this file

### 0.1 Status labels

| Label | Meaning |
|---|---|
| **VERIFIED** | I read the actual source text (page, PDF, database record) and checked the value, sign and unit against it. The source ID says which. A published abstract retrieved from a bibliographic database record counts as a read source only for what the abstract itself states ("abstract level"); anything the abstract does not state stays unverified. |
| **VERIFIED BY REPRODUCTION** | The formula text itself was not read in a primary source, but the formula reproduces the official source's published numbers (cells listed). |
| **SECONDARY** | Seen in a secondary reference (review, commentary). Allowed only where the owner approved it, and always labelled as secondary on the page. |
| **UNVERIFIED** | The actual source could not be checked, or sources conflict. Must not be implemented. States what evidence is missing. |
| **HELD** | The owner decided not to include the item for now. Recorded so it is not lost. Must not be implemented. |
| **POLICY** | A product or engineering decision made by the owner (not a scientific fact). |

Nothing in this file comes from memory. A value I recalled but could not confirm is listed only as UNVERIFIED and never used.

### 0.2 Source types

| Type | Meaning |
|---|---|
| **P** | Primary research: the original paper or report that produced the formula. |
| **O** | Official guidance or publication: a government agency, intergovernmental body, national academy or expert-body document, including its official tables. |
| **S** | Secondary reference: a review, commentary or later paper that reports someone else's formula. |

### 0.3 Final status of the six calculators

> **Version 1 scope (owner decision 2026-11-25):** only BMI, BMR & TDEE and Body Fat are built and published. Ideal Weight (section 5), Macros (section 6) and Water Intake (section 7) are **deferred to Version 2**; their specifications below are kept unchanged and are not implemented, and no page or link exists for them in Version 1.


| Calculator | Methodology | Status |
|---|---|---|
| BMI | CDC/WHO formula, CDC adult categories, classification on the unrounded value | **READY.** All numbers VERIFIED. |
| BMR & TDEE | REE: Mifflin–St Jeor (P). TEE: National Academies 2023 equations (O), 4 categories × 2 sexes | **READY.** All 8 TEE equations and the REE equations VERIFIED against the **published abstract** of Mifflin et al. 1990 (primary source, abstract level; the full text was not read). Eligibility is 19–78 inclusive for both results. The REE unit (kcal/day) is secondary-supported only. |
| Body Fat | Classic Hodgdon and Beckett (1984) circumference equations, inches, log10 | **READY, VERIFIED BY REPRODUCTION** against all 1,996 numeric cells of the Navy BCA 2016 guide tables, and consistent with the 144 cells printed as limits (independent re-extraction 2026-11-24; the earlier figure of 1,991 was a count error). The 1984 reports themselves are UNVERIFIED (unreadable). Matching the tables does not establish direct verification of the original reports. |
| Ideal Weight | Robinson 1983 (P, exact coefficients) and Devine 1974 (S) | **READY** for these two. Miller **UNVERIFIED/HELD**; Hamwi **HELD**. |
| Macros | Atwater 4/4/9, percentage split, adult reference ranges with caveat | **READY.** |
| Water Intake | EFSA and US National Academies total-water reference values, shown separately | **READY.** No age input; the page shows "For adults aged 19 and over." |

Remaining UNVERIFIED and HELD items are listed in section 8.

### 0.4 Source register

All sources accessed 2026-11-20 to 2026-11-22. "Read by": **me** = I read or extracted the source text myself (plain web requests, public APIs or downloaded PDFs); **agent** = a delegated fetch agent read it and its key numbers were re-checked in this task by me or by reproduction.

| ID | Type | Source | URL | Read by |
|---|---|---|---|---|
| S1 | O | CDC, "Adult BMI Categories" (page dated 19 Mar 2024) | https://www.cdc.gov/bmi/adult-calculator/bmi-categories.html | me (re-read 2026-11-22) |
| S2 | O | CDC, "Adult BMI Calculator" (page dated June 2024) | https://www.cdc.gov/bmi/adult-calculator/index.html | me (re-read) |
| S3 | O | CDC, "BMI Frequently Asked Questions" (28 Jun 2024) | https://www.cdc.gov/bmi/faq/index.html | me (re-read) |
| S4 | O | CDC, "Child and Teen BMI Calculator" (26 Jun 2024) | https://www.cdc.gov/bmi/child-teen-calculator/index.html | agent |
| S5 | O | WHO, "Obesity and overweight" fact sheet (dated 7 Oct 2026) | https://www.who.int/news-room/fact-sheets/detail/obesity-and-overweight | me (re-read) |
| S6 | P | Mifflin MD, St Jeor ST, Hill LA, Scott BJ, Daugherty SA, Koh YO. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr 1990;51(2):241–247. doi:10.1093/ajcn/51.2.241, PMID 2305711 (PubMed record, abstract) | https://pubmed.ncbi.nlm.nih.gov/2305711/ | me (NCBI API) |
| S7 | O | National Academies of Sciences, Engineering, and Medicine. *Dietary Reference Intakes for Energy.* National Academies Press, 2023. doi:10.17226/26818. Summary Table S-1; Chapter 5 Tables 5-4 (PAL categories), 5-5 (TEE equations), 5-6 (fit), worked example; Appendix G (model code) | Summary https://www.nationalacademies.org/read/26818/chapter/2 · Chapter 5 https://www.nationalacademies.org/read/26818/chapter/7 · Appendix G https://www.nationalacademies.org/read/26818/chapter/18 | me (raw page text, all 8 equations compared in 3 places) |
| S8 | O | US Navy, Guide 4 "The Body Composition Assessment (BCA)", JAN 2016 (copy hosted by the US Public Health Service): measurement procedure and percent body fat lookup tables (men Tables pp. 16–17, women pp. 18–19) | https://dcp.psc.gov/ccmis/pdf_docs/Body%20Composition%20Assessment%20(BCA)%202016.pdf | me (text extracted from the downloaded PDF) |
| S9 | P | Hodgdon JA, Beckett MB. *Prediction of percent body fat for U.S. Navy men from body circumferences and height* (Naval Health Research Center Report 84-11, DTIC ADA143890, 1984) and *… for U.S. Navy women …* (Report 84-29, DTIC ADA146456, 1984). Report numbers are from DTIC listings seen in search results. | https://apps.dtic.mil/sti/pdfs/ADA143890.pdf · https://apps.dtic.mil/sti/pdfs/ADA146456.pdf | **not readable** (HTTP 403) |
| S10 | P | Robinson JD, Lupkiewicz SM, Palenik L, Lopez LM, Ariet M. Determination of ideal body weight for drug dosage calculations. Am J Hosp Pharm 1983;40(6):1016–1019. PMID 6869387 (abstract) | https://pubmed.ncbi.nlm.nih.gov/6869387/ | me (NCBI API) |
| S11 | S | "Ideal body weight: a commentary", Clin Nutr ESPEN 2021;46, doi:10.1016/j.clnesp.2021.09.746 (PMC8646317), Table 1 "IBW predictive formulas" (peer-reviewed secondary source) | https://pmc.ncbi.nlm.nih.gov/articles/PMC8646317/ | me (NCBI API full text) |
| S12 | S | Pai MP, Paloucek FP. The origin of the "ideal" body weight equations. Ann Pharmacother 2000;34(9):1066–1069. PMID 10981254 (abstract only; the equation table is unreadable) | https://pubmed.ncbi.nlm.nih.gov/10981254/ | me (NCBI API) |
| S13 | O | FAO, *Food energy – methods of analysis and conversion factors*, FAO Food and Nutrition Paper 77 (2003), chapter 3 section 3.5.1 | https://www.fao.org/4/y5022e/y5022e04.htm | me (re-read) |
| S14 | O | National Academies (IOM/FNB), "Dietary Reference Intakes: Macronutrients" summary table (adapted from the DRI macronutrient report, 2002/2005) | https://www.nationalacademies.org/cdn/materials/9fb9fae1-63a0-4048-88ad-3f972639149a | me (text extracted from the PDF) |
| S15 | O | National Academies of Sciences, Engineering, and Medicine. *Rethinking the Acceptable Macronutrient Distribution Range for the 21st Century: A Letter Report.* National Academies Press, 2024. doi:10.17226/27957 (PubMed 39680697). Chapter 6 "Recommendations and Considerations"; Table 3-1 | https://www.nationalacademies.org/publications/27957 · https://pubmed.ncbi.nlm.nih.gov/39680697/ | agent |
| S16 | O | Institute of Medicine, *Dietary Reference Intakes for Water, Potassium, Sodium, Chloride, and Sulfate* (2005), chapter 4 "Water" | https://www.nationalacademies.org/read/10925/chapter/6 | me (re-read) |
| S17 | O | EFSA NDA Panel, Scientific Opinion on Dietary Reference Values for water, EFSA Journal 2010;8(3):1459, doi:10.2903/j.efsa.2010.1459 — read through EFSA's own summary documents: "Dietary Reference Values for nutrients: Summary report" (2017), water section, and "Summary of Dietary Reference Values" tables (Jan 2017). The opinion itself on the publisher's site returned HTTP 403. | https://www.efsa.europa.eu/sites/default/files/2017_09_DRVs_summary_report.pdf · https://www.efsa.europa.eu/sites/default/files/assets/DRV_Summary_tables_jan_17.pdf | me (text extracted from the PDFs) |
| S18 | S | Frankenfield D, Roth-Yousey L, Compher C. Comparison of predictive equations for resting metabolic rate in healthy nonobese and obese adults: a systematic review. J Am Diet Assoc 2005;105(5):775–789. PMID 15883556 (abstract) | https://pubmed.ncbi.nlm.nih.gov/15883556/ | me (NCBI API) |
| S19 | S | Potter AW et al. Circumference-based predictions of body fat revisited: preliminary results from a US Marine Corps body composition survey. Front Physiol 2022. doi:10.3389/fphys.2022.868627. **Not used for any equation:** it prints the women's equation without the hip term. Used only for qualitative limitations. | https://www.frontiersin.org/articles/10.3389/fphys.2022.868627/full | agent |
| S20 | S | Shah B, Sucher K, Hollenbeck CB. Comparison of ideal body weight equations and published height-weight tables with body mass index tables for healthy adults in the United States. Nutr Clin Pract 2006;21(3):312–319. PMID 16772549 (abstract) | https://pubmed.ncbi.nlm.nih.gov/16772549/ | me (NCBI API) |
| S21 | S | "Predicting Equations and Resting Energy Expenditure Changes in Overweight Adults", Slovenian Journal of Public Health 2020, doi:10.2478/sjph-2020-0005 (PMC7478086). Used only to confirm that the Mifflin–St Jeor equations are calculated in kcal per day. | https://pmc.ncbi.nlm.nih.gov/articles/PMC7478086/ | me (NCBI API full text) |
| S22 | S | "Predicting resting energy expenditure in young adults", Obesity Research & Clinical Practice, online 2015 (doi:10.1016/j.orcp.2015.07.002), print issue May–June 2016 according to the PMC record (PMC5867535; PMC record title and ID re-checked through the NCBI API 2026-11-23). The page cites it as 2016. Used only to confirm the unit (REE prediction equations in kcal/day). | https://pmc.ncbi.nlm.nih.gov/articles/PMC5867535/ | me (NCBI API full text) |
| S23 | O | NIST Special Publication 811, *Guide for the Use of the International System of Units*, Appendix B "Conversion factors" (pages B.8 and B.9): inch, pound (avoirdupois), US fluid ounce | https://www.nist.gov/pml/special-publication-811/nist-guide-si-appendix-b-conversion-factors/nist-guide-si-appendix-b8 | me |

### 0.5 How the key items were verified in this round

- **National Academies TEE equations (S7).** I downloaded the three relevant pages of the actual 2023 report and compared all eight equations (four activity categories for men and for women) in **three separate locations**: Summary Table S-1, Chapter 5 Table 5-5 and Appendix G (model code). Every coefficient, sign, unit (kcal/day, years, kg, cm), age range ("19 years and above") and the four PAL cut-offs (Table 5-4) agree in all locations. The report's worked example (22-year-old woman, 165 cm, 63 kg, low active → 2,275 kcal/day) was reproduced (2,275.37), and the "average active adult" prediction values of Table 5-8 were reproduced for both sexes (women 2,281.1; men 2,929.1 against 2,930 printed, which is a rounding effect of the printed average inputs).
- **Mifflin–St Jeor REE equations (S6).** Verified from the **published abstract of the original 1990 paper** (a primary source): I retrieved the PubMed record (PMID 2305711) through the NCBI API and read the abstract, which prints both the unrounded regression and the simplified sex-specific equations used here. They were **not** verified from secondary sources. The **full text was not read** (publisher page HTTP 403), so anything the abstract does not state is not verified from the paper itself; the result unit (kcal/day) rests on two secondary papers (S21, S22).
- **Navy equations (S8).** The guide prints lookup tables, not equations. I extracted the text of all four table pages and compared every cell with the equations in section 4.3 (rounded to a whole number). **Corrected 2026-11-24 after an independent re-extraction from the downloaded guide (SHA-256 `fea12d79…68cc`): 1,996 of 1,996 numeric cells matched exactly** (men p. 16: 424, men p. 17: 492, women p. 18: 520, women p. 19: 560) **and all 144 cells printed as limits were consistent** (104 "<" cells for men, 40 ">" cells for women, checked as inequalities). The earlier counts (1,991 in total, 555 for page 19) were a count error. The extracted values are stored in `src/calculators/fixtures/` with their provenance and the extraction script, and are checked by an automated test. The guide's own text confirms the calculation order for women (waist + hip − neck) and for men (abdomen − neck), in inches.
- **CDC numbers (S1–S3), WHO (S5), FAO factors (S13), National Academies water chapter (S16)** were re-read directly in this round. **S14 (reference ranges)** and **S17 (EFSA)** were extracted from the PDFs by me.

### 0.6 Verification log: sources that could not be read
No workaround that bypasses a site's access controls was used.
- DTIC reports ADA143890 and ADA146456, DoDI 1308.3: HTTP 403.
- Navy BCA guides on mynavyhr.navy.mil (JAN 2023, FEB 2025 and others) and navyreserve.navy.mil: HTTP 403. Only the 2016 edition (S8) was readable. Search listings show newer editions exist (a FEB 2025 file and a DEC 2025 file with a "Maximum Waist for Height" screening table), so the Navy's current procedure has changed; this was not verified.
- EFSA opinion on the Wiley site and a CORE mirror: HTTP 403 (EFSA's own summary PDFs were readable).
- PubMed web pages (cookie wall; the NCBI API worked), PMC article pages (bot check; NCBI API full text worked for open articles), ResearchGate copy of S12: HTTP 403.
- Pai & Paloucek 2000 (S12) equation table; the Miller 1983 letter (Am J Hosp Pharm 1983;40:1622, 1625; its PubMed record has no abstract); the Devine 1974 paper (not indexed in PubMed).
- WHO Global Database on BMI and WHO Technical Report Series 894/854.

---

## 1. Global rules (apply to all calculators)

### 1.1 Architecture
- Pure TypeScript functions in `src/calculators/<slug>.ts`: no DOM access, no I/O, no storage. Inputs and outputs are plain typed objects. UI wiring is separate.
- Every function has unit tests built from the reference cases in this file. All reference cases, boundary cases and invalid-input cases must pass before a page can be released.
- Internal values keep full floating-point precision. Rounding happens only where this file says so.

### 1.2 Unit conversions (standard definitions)
| Constant | Value |
|---|---|
| 1 inch | 2.54 cm exactly |
| 1 foot | 12 inches |
| 1 pound | 0.45359237 kg exactly |
| 1 US fluid ounce | 29.5735295625 mL exactly |
| 1 L | 1000 mL |

These are definitions, not measurements. **Checked against NIST (S23):** NIST Special Publication 811, Appendix B (pages B.8 and B.9) lists inch = 2.54 E-02 m, pound (avoirdupois) = 4.535 924 E-01 kg and US fluid ounce = 2.957 353 E-05 m³, which agree with the values above to the seven digits NIST prints. The remaining digits (0.45359237 kg; 29.5735295625 mL) are the defining values; the fluid-ounce value follows from the exact inch and the US gallon of 231 cubic inches (231 × 16.387064 cm³ ÷ 128), and those extra digits were not read on the NIST page. Cite NIST SP 811 in the Methods text.

### 1.3 Input validation (owner-approved technical boundaries) — POLICY

**METRIC-ONLY POLICY (owner decision 2026-11-26, Version 1).** All three calculators (BMI, BMR & TDEE, Body Fat) accept **metric units only**: height, neck, waist and hip in **cm**, weight in **kg**; energy results in **kcal/day**. There is **no** Metric/Imperial toggle, no feet, inches or pounds field, no imperial display option and no other unit selector. Numbers are typed with **English digits and a decimal point only** (for example `178`, `84.5`); unit text inside a number field (`84 cm`), feet-and-inches notation (`5'10`), Arabic-Indic digits and the Arabic decimal separator are **not** accepted and give a clear message. **Accepted: English digits `0-9` and the period `.` as the only decimal separator** (for example `178`, `84.5`, `5.25`; a leading or trailing period such as `.5` is also read as a number). **Rejected, with the clear "digits and a decimal point only" message: a comma decimal (`84,5`; owner decision 2026-11-26, final), any other separator, Arabic-Indic digits, a plus sign, exponent form, spaces inside the number, and unit text.** Surrounding spaces are ignored. A leading minus sign is read only so that a negative value gets the same message. The internal inch conversion that the Navy body-fat equations require (`inches = cm / 2.54`, 4.3) is **not** a user-facing unit and stays. Imperial reference cases elsewhere in this file (BMI B1, B8–B16, R4, R5; TDEE T7; body fat F8; ideal weight) are kept as **historical**, labelled "not implemented in Version 1"; they are not tests of any public interface.

**Order of operations (mandatory):** read the raw text → parse the number (English digits and a period only) → **validate against the metric limits** (the typed value is already cm or kg) → calculate. (The earlier imperial conversion step was removed with the metric-only policy.)

| Input | Technical limit |
|---|---|
| Height | 100–250 cm |
| Weight | 20–500 kg |
| Age | whole number, 1–120 |
| Neck, waist, hip | 10–250 cm |
| Energy (macros, Version 2) | 500–10,000 kcal/day |
| Macro percentages (Version 2) | 0–100% each, total exactly 100% |


These are **technical validation boundaries** that catch typos and unit mix-ups. They are **not medical thresholds, safety limits, or recommended or healthy ranges** and must never be described as such. Numbers must be finite, positive and parsed from decimal text with English digits and a period as the only decimal separator (see the metric-only policy above). Empty, `NaN`, zero, negative and out-of-range values show an inline error next to the field and produce no result. Boundary values are inclusive (100 cm and 250 cm are valid; 99.99 and 250.01 are not).

**Calculator eligibility (POLICY, enforced after the limits above):**
| Calculator | Eligibility rule |
|---|---|
| BMI | age ≥ 20 for an adult result or category; age < 20 shows the under-20 notice only |
| BMR & TDEE (Mifflin REE and National Academies TEE) | age 19–78 inclusive |
| Body Fat | age ≥ 18 (website policy; no age input is needed for the calculation itself; the page states the rule) |
| Ideal Weight | height ≥ 152.4 cm (5 ft) |
| Water Intake | adults only. **There is no age input** (owner decision). The page shows the notice "For adults aged 19 and over." |
| Macros | no age rule |

Eligibility rules are policies of this website. They are not medical statements and must never be shown as medical safety limits.

### 1.4 Rounding
- Display rounding is "round half up" at the stated number of decimals, implemented with integer scaling plus a tiny epsilon (for example `Math.round((x + 1e-9) * 10) / 10`). Test the half cases listed below, because binary floating point can misplace `.5` and `.05` values.
- Decimals: BMI, body-fat %, kg and fl oz one decimal; kcal, grams, mL and pounds (ideal weight uses one decimal) as stated per calculator.
- **Rounding must never change a classification, an eligibility decision or a calculation.** Classification, validation and eligibility use the exact (unrounded) value; rounding is applied last, to the displayed text only.

### 1.5 Privacy
No input or result is stored, logged, sent or placed in a URL. No analytics event carries a health value.

### 1.6 Required tests for every calculator
1. All reference cases in this file.
2. **Boundary values** for every limit and threshold: exactly on, just below, just above.
3. **Invalid inputs:** empty, text, `NaN`, negative, zero, out of range, inconsistent (for example waist smaller than neck).
4. **Both sexes tested separately** wherever the method has sex-specific constants, and (BMI) a test proving that sex does not change the result.
5. **Metric-only interface:** no imperial toggle, no feet, inches or pounds field in any public calculator (page-level test); decimal metric values work; non-metric or non-ASCII text is rejected with a clear message.
6. **Rounding:** tests that prove display rounding does not change a classification (BMI boundary cases) and that half cases round up.
7. A test that rereads the constants from this file's tables, or a comment in code referencing the section number, so a change in either is noticed.

### 1.7 Release gate
A calculator page may be indexed only when every status in section 0.3 for it is READY, the tests above pass, and every formula, constant and source link on the page matches this file.

---

## 2. BMI — `/calculators/bmi/`

### 2.1 Scope
Adult BMI for people aged **20 and older** (S1, S2). Result: BMI value, CDC category, and the weight range corresponding to the Healthy Weight category for the entered height.

### 2.2 Inputs
| Input | Unit | Notes |
|---|---|---|
| Age | years | whole number; decides eligibility (2.4) |
| Sex | male / female | **kept visible; has no effect on any BMI value, category, range or message** |
| Height | cm | limits in 1.3 |
| Weight | kg | limits in 1.3 |

### 2.3 Formula — VERIFIED (S3, S1; WHO S5)
- Metric: `BMI = weight (kg) / [height (m)]²` (S1, S5). S3 also gives `[weight (kg) / height (cm) / height (cm)] × 10,000`, which is the same value.
- Imperial: `BMI = weight (lb) / [height (in)]² × 703` (S3) — **historical, not implemented** (Version 1 is metric-only, 1.3). The page shows only the metric formula.

### 2.4 Age — VERIFIED (S1, S2, S4) and POLICY
- Age ≥ 20: adult categories apply ("BMI categories for adults 20 and older", S1; S1 states they apply regardless of age, sex or race).
- Age < 20: children and teens are interpreted with sex-specific BMI-for-age percentiles for ages 2 through 19 (S4). **No adult BMI value and no adult category are shown.** The page shows only the under-20 notice: children and teens need age- and sex-specific BMI-for-age interpretation, the adult categories do not apply, with a link to CDC's child and teen BMI calculator (S4). Percentiles are not calculated.
- WHO's fact sheet (S5) uses "adults 18 years and over" in its statistics and BMI-for-age z-scores for ages 5–19, so CDC and WHO do not use the same age boundary. The site follows CDC's 20+ rule (owner decision) and must not claim that the two agree.

### 2.5 Categories — VERIFIED (S1; ranges table in S2)
Thresholds are applied to the **exact, unrounded** BMI (2.6). Categories and CDC names, kg/m²:

| Category | Exact-value rule (S1 wording) | S2 one-decimal range table |
|---|---|---|
| Underweight | BMI < 18.5 | below 18.5 |
| Healthy Weight | 18.5 ≤ BMI < 25 | 18.5 to 24.9 |
| Overweight | 25 ≤ BMI < 30 | 25.0 to 29.9 |
| Obesity (any class) | BMI ≥ 30 | 30.0 or greater |
| Class 1 Obesity | 30 ≤ BMI < 35 | 30.0 to 34.9 |
| Class 2 Obesity | 35 ≤ BMI < 40 | 35.0 to 39.9 |
| Class 3 Obesity | BMI ≥ 40 | 40.0 or greater |

WHO (S5) confirms only overweight ≥ 25 and obesity ≥ 30. WHO's full adult table was not readable and is not used.

### 2.6 Classification and display rule — POLICY (owner decision, revised A1)
1. Compute the exact BMI (full precision).
2. **Classify with the exact value** using the thresholds in 2.5 (18.5, 25, 30, 35, 40). Never classify with the rounded value and never copy cells from CDC's rounded weight table into the logic.
3. Display the BMI rounded to **one decimal** (round half up).
4. **Boundary explanation.** If the category of the displayed (rounded) value would differ from the category of the exact value, show a short note under the result: "BMI is shown rounded to one decimal. Your category is determined from the exact, unrounded BMI ({exact value to three decimals})." Example: exact BMI 24.959 is displayed as 25.0 and is classified Healthy Weight, with the note.
5. The note is informational, neutral in tone, without alarm colour.

### 2.7 Documented discrepancy D-BMI-1: CDC's text versus CDC's rounded weight table — VERIFIED
- CDC's category definitions use "less than" thresholds (for example "18.5 to less than 25", S1), which are exact-value rules. The calculator follows these.
- CDC's weight table for a person 5 ft 9 in tall (S1) lists integer-pound ranges: 124 or less Underweight; 125–168 Healthy Weight; 169–202 Overweight; 203 or more Obesity; 203–236 Class 1; 237–270 Class 2; 271 or more Class 3. The exact BMIs at 69 in are: 124 lb 18.310; **125 lb 18.457**; 168 lb 24.807; **169 lb 24.954**; 202 lb 29.827; **203 lb 29.975**; 236 lb 34.847; **237 lb 34.995**; 270 lb 39.868; 271 lb 40.015. The table's cells are consistent with classifying the BMI rounded to one decimal. Under the exact-value rule used here, **four cells differ** from the CDC table: 125 lb (exact value: Underweight; CDC lists Healthy Weight), 169 lb (Healthy Weight vs Overweight), 203 lb (Overweight vs Class 1 Obesity) and 237 lb (Class 1 vs Class 2). Both approaches are reasonable readings of CDC; this site uses the exact thresholds, as decided by the owner.
- Consequences: the CDC table cells must **not** be used as test expectations. The page's Methods text should say that categories use the exact BMI and may differ at the boundary from CDC's rounded weight table.

### 2.8 Healthy-weight range for the entered height — derived (POLICY)
The weights whose exact BMI is at least 18.5 and below 25 for the entered height. Compute with integer scaling (never floating-point `ceil` on raw products without an epsilon):
- metric (h in metres, 0.1 kg resolution): `min = ceil(18.5 × h² × 10) / 10`; `max = ceil(25 × h² × 10) / 10 − 0.1` (the largest 0.1 kg value whose BMI is still below 25);
- imperial (h in inches, whole pounds): `min = ceil(18.5 × h² / 703)`; `max = ceil(25 × h² / 703) − 1` — **historical, not implemented** (metric-only).
Shown as "about 58.7–79.2 kg for 178 cm". It restates the category boundaries; it is not a recommendation or a target. The rule for the note in 2.6 does not apply to this range.

### 2.9 Limitations to state on the page (S1–S3)
- BMI is a screening measure and not a diagnostic tool (S1, S2).
- BMI cannot distinguish fat mass from muscle and bone and does not show where fat is located (S3); people with a lot of muscle can fall into the overweight or obesity categories (S3).
- Adult categories are the same regardless of age, sex or race (S1, S3).
- The calculator is not a substitute for professional medical advice (S2).
- **UNVERIFIED (not included):** statements about pregnancy or ethnicity-specific cut-offs. None of the CDC pages read mention them.

### 2.10 Reference test cases
`r1()` = one-decimal round half up. Category is always from the **exact** value. **Rows whose system is "imperial" are historical (CDC worked examples) and are not tested: Version 1 is metric-only (1.3).** The metric rows and the boundary logic are tested; the exact-threshold behaviour is additionally covered by metric boundary cases in `bmi.test.ts`.

| # | System | Sex | Age | Height | Weight | Exact BMI | Display | Category | Note shown? |
|---|---|---|---|---|---|---|---|---|---|
| B1 | imperial | any | 40 | 68 in | 200 lb | 30.4066 | 30.4 | Class 1 Obesity | no — **CDC's worked example (S3): 30.4** |
| B2 | metric | M | 28 | 178 cm | 74 kg | 23.3556 | 23.4 | Healthy Weight | no |
| B3 | metric | F | 28 | 178 cm | 74 kg | 23.3556 | 23.4 | Healthy Weight | no — **identical to B2: sex has no effect** |
| B4 | metric | M | 30 | 178 cm | 50 kg | 15.7808 | 15.8 | Underweight | no |
| B5 | metric | M | 30 | 178 cm | 80 kg | 25.2493 | 25.2 | Overweight | no |
| B6 | metric | M | 30 | 178 cm | 95 kg | 29.9836 | 30.0 | **Overweight** | **yes** |
| B7 | metric | M | 30 | 178 cm | 111 kg | 35.0335 | 35.0 | Class 2 Obesity | no |
| B8 | imperial | F | 35 | 65 in | 150 lb | 24.9586 | 25.0 | **Healthy Weight** | **yes** (the owner's example) |
| B9 | imperial | F | 35 | 70 in | 160 lb | 22.9551 | 23.0 | Healthy Weight | no |
| B10 | imperial | any | 30 | 69 in | 124 lb | 18.3096 | 18.3 | Underweight | no |
| B11 | imperial | any | 30 | 69 in | 125 lb | 18.4573 | 18.5 | **Underweight** | **yes** |
| B12 | imperial | any | 30 | 69 in | 168 lb | 24.8066 | 24.8 | Healthy Weight | no |
| B13 | imperial | any | 30 | 69 in | 169 lb | 24.9542 | 25.0 | **Healthy Weight** | **yes** |
| B14 | imperial | any | 30 | 69 in | 203 lb | 29.9746 | 30.0 | **Overweight** | **yes** |
| B15 | imperial | any | 30 | 69 in | 237 lb | 34.9950 | 35.0 | **Class 1 Obesity** | **yes** |
| B16 | imperial | any | 30 | 69 in | 271 lb | 40.0153 | 40.0 | Class 3 Obesity | no |
| B17 | any | any | 19 | 175 cm | 70 kg | — | none | under-20 notice | — |
| B18 | any | any | 20 | 175 cm | 70 kg | 22.8571 | 22.9 | Healthy Weight | no (20 is adult) |
| B19 | any | any | 0 or 121 or 20.5 | 175 cm | 70 kg | — | — | age error | — |
| B20 | metric | any | 30 | 99.99 / 250.01 cm | 70 kg | — | — | height error | — |

Healthy-weight range cases (2.8): R1 178 cm → **58.7–79.2 kg** (exact: `18.5 × 3.1684 = 58.615 → 58.7`; `25 × 3.1684 = 79.210`, largest 0.1 kg value below it is 79.2); R2 165 cm → **50.4–68.0 kg**; R3 160 cm → 47.4–63.9 kg; R4 69 in → **126–169 lb**; R5 65 in → 112–150 lb. For each endpoint the test also asserts: BMI(min) ≥ 18.5 and BMI(max) < 25 (for example 79.2 kg at 178 cm = 24.9968).

---

## 3. BMR & TDEE — `/calculators/bmr-tdee/`

### 3.1 Scope and terminology
Two **separate, independent estimates**, with accurate labels:
- **Resting energy expenditure (REE)** — Mifflin–St Jeor equation (secondary result).
- **Total energy expenditure (TEE, commonly called TDEE)** — National Academies 2023 prediction equations (primary result).

The page name stays "BMR & TDEE Calculator". The page must explain, in short, that Mifflin–St Jeor estimates **REE** (it was derived from REE measured by indirect calorimetry, S6) and is **not a measured BMR**; that the Mifflin result must not be labelled "BMR" without this explanation; and that the National Academies recommend keeping the terms basal and resting metabolic rate distinct (S7, Summary recommendations). TEE is **not** computed from REE: the two estimates come from different equations and datasets, and **no conventional activity multipliers (1.2, 1.375 …) or PAL multiplication are used**. Do not display a TEE/REE ratio.

Neither value is a calorie target, a diet plan or advice to eat a given amount.

### 3.2 Inputs
| Input | Unit | Notes |
|---|---|---|
| Sex | male / female | biological sex used as the equations' sex term |
| Age | years | **whole number on the page** (valid 1–120; results only for **19–78**, see 3.3). The calculation functions may accept decimal ages only to reproduce the published examples TE2 and TE3 (3.9); the page's validator never passes a decimal age on (owner decision 2026-11-23). |
| Height | cm | |
| Weight | kg | |
| Activity category (for TEE) | Inactive / Low Active / Active / Very Active | 3.5. **No category is preselected** (owner decision 2026-11-23); a missing choice is a validation error ("Choose an activity category.") and no result is shown. |

### 3.3 REE: Mifflin–St Jeor — VERIFIED against the published abstract of S6 (abstract level; full text not read)
**Verification level (clarification requested by the owner):** the equations below — the simplified sex-specific form and the unrounded regression — were verified from the **published abstract of Mifflin et al. (1990)**, a primary source, by reading the PubMed record of the paper. They were **not** verified from secondary sources. The **full text of the paper was not read**, so details the abstract does not state (notably the result unit) are not verified from the paper itself. The study details quoted below (498 subjects, ages 19–78, indirect calorimetry, R² = 0.71) also come from the abstract.

Derived from 498 healthy adults (247 women, 251 men) aged 19–78 years (mean 45 ± 14), normal-weight (264) and obese (234), REE measured by indirect calorimetry; R² = 0.71. The authors' simplified sex-specific equations (stated in S6 to have the same predictive value as the full regression):
- Men: `REE = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(y) + 5`
- Women: `REE = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(y) − 161`

S6 also gives the unrounded regression `REE = 9.99 × weight + 6.25 × height − 4.92 × age + 166 × sex(male 1, female 0) − 161`. **Use the simplified sex-specific form above** (differences under 2 kcal in the test cases).

**Unit of the result: kcal/day — SECONDARY-supported, not confirmed in the original paper.** The abstract of S6 does not name a unit, and the full text could not be read (the publisher page returned HTTP 403). Two peer-reviewed papers that apply the Mifflin–St Jeor equation state the unit: S21 (equations "calculated in kcal per day") and S22 (table of REE prediction equations in kcal/day, with Mifflin–St Jeor predictions such as 1,896 kcal/day for men). The unit is therefore documented as kcal/day on that secondary basis, with the unverified status kept in section 8 (U-MIF). The page may display "kcal/day"; it must not claim that the original paper states the unit.

Age **19–78 only** (owner approved, matching the study population, S6): outside this range show "This equation was developed in adults aged 19–78; no estimate is shown." (no REE and no TEE are shown). **Important:** the National Academies TEE equations themselves apply to adults aged 19 and above with no upper bound (S7), but this website's approved eligibility for the calculator is **19–78 inclusive for both results**. Implementation must enforce 19–78 on the page and in the calculator function that the page uses (a test is required for ages 18, 19, 78 and 79: T8, T9) and must not extend TEE above 78 or REE below 19.

**Validation priority (owner decision 2026-11-23, POLICY):** (1) invalid age (empty, text, decimal, below 1, above 120) → age error, no result; (2) valid whole age outside 19–78 (1–18, 79–120) → the eligibility notice above, no results, and the notice **takes priority over any other field error**; (3) age 19–78 → validate height, weight and activity category (errors inline, no result); (4) otherwise both results. Tests: ages 0, 1, 18, 19, 78, 79, 120, 121, 20.5, empty and text; and an ineligible age (18, 79) combined with an empty height still gives the notice.

**Required methodology disclosure on the page (owner decision 2026-11-23):** the Mifflin–St Jeor equations were checked against the published abstract of the original 1990 paper; the original full text was not directly accessible during verification; the kcal/day unit is supported by later peer-reviewed publications (S21, S22). The page must not imply that the full original paper was reviewed and must not say that the 1990 paper itself states the unit. This restates the verification level above and U-MIF in section 8.

Accurate statements allowed on the page:
- REE is predicted from weight, height, age and sex only; body composition is not an input (S6 notes that fat-free mass was the best single predictor in the study, R² 0.64).
- S6 reports that the older Harris–Benedict equations overestimated measured REE by 5% in this sample.
- ~~A systematic review (S18, secondary) found Mifflin–St Jeor the most reliable of four commonly used equations…~~ **Owner decision 2026-11-23: this optional claim is left out of the page.** Do not describe Mifflin–St Jeor as "the most reliable" or "the most accurate" equation, and do not present it as a measured BMR. (S18 stays in the source register for reference only and is not cited on the page.)

### 3.4 TEE: National Academies 2023 equations — VERIFIED (S7, all 8 equations, 3 locations)
Adults **19 years and above**. Inputs: age in years, height in **cm**, weight in **kg**. Output: **kcal/day** (S7 table notes: "TEE is in kilocalories/day, age is in years, weight is in kilograms, height is in centimeters").

| Category | Men | Women |
|---|---|---|
| Inactive | `753.07 − 10.83·age + 6.50·height + 14.10·weight` | `584.90 − 7.01·age + 5.72·height + 11.71·weight` |
| Low Active | `581.47 − 10.83·age + 8.30·height + 14.94·weight` | `575.77 − 7.01·age + 6.60·height + 12.14·weight` |
| Active | `1004.82 − 10.83·age + 6.52·height + 15.91·weight` | `710.25 − 7.01·age + 6.54·height + 12.34·weight` |
| Very Active | `−517.88 − 10.83·age + 15.61·height + 19.11·weight` | `511.83 − 7.01·age + 9.07·height + 12.56·weight` |

(Note the **negative** constant `−517.88` for men, Very Active; the written form in S7 is `TEE = – 517.88 – (10.83 × age) + …`.)

Source locations: S7 Summary Table S-1, Chapter 5 Table 5-5, Appendix G. Model fit reported with the equations (S7 Table S-1 notes): men R² 0.73, RMSE 339 kcal/day; women R² 0.71, RMSE 246 kcal/day. The same coefficients are used in the report's estimated-energy-requirement tables; for weight-stable adults the report equates EER with TEE.

### 3.5 Activity categories and PAL cut-offs — VERIFIED (S7 Table 5-4 and text)
Physical activity level (PAL) is the ratio of TEE to basal metabolism. Adult (19 and over) cut-offs, the same for men and women:

| Category | PAL range | Description (paraphrased from S7) |
|---|---|---|
| Inactive | 1.00 ≤ PAL < 1.53 | basal metabolism, thermic effect of food and only the minimal activity needed for independent living |
| Low Active | 1.53 ≤ PAL < 1.68 | activity beyond the minimum: more walking and some occupational and recreational activity |
| Active | 1.68 ≤ PAL < 1.85 | even more walking and occupational or recreational activity |
| Very Active | 1.85 ≤ PAL < 2.50 | daily-living demands plus vigorous occupational or recreational exertion |

**Required note near the activity selector (owner decision 2026-11-23):** the categories are general guidance, not a precise measurement of the person's own activity; the National Academies report that no valid, reliable tool currently exists to classify an individual's PAL accurately; and the categories are not equivalent to weekly physical activity guidelines. The page text is in DESIGN-SPEC.md 10.3.

The report describes PAL as a complex aggregate of occupation, transportation, recreation, sleep patterns and environment, and gives **no questionnaire or scoring method** for assigning a person to a category. The page therefore shows the four descriptions (in the user's own words of choice, no invented scoring) and lets the user pick. The report's categories for adults do not depend on age.

### 3.6 Outputs, rounding and layout contract
- **Primary result:** "Estimated total energy expenditure (TEE)" for the chosen category, whole kcal/day (half up).
- **Secondary result:** "Estimated resting energy expenditure (REE), Mifflin–St Jeor", whole kcal/day.
- No ratio, no partition bar, no percentage chips (removed).

### 3.7 Limitations to state (short, collapsible "Estimation limits")
- These are estimates for groups of people; the report states that an individual's estimate has a large confidence interval (S7). The National Academies report identifies 339 kcal/day (men) and 246 kcal/day (women) as the **root mean squared error (RMSE)** of the TEE equations and notes that RMSE is equivalent to the **standard error of the estimate (SEE)** (S7; terminology confirmed by the owner 2026-11-23). **Terminology rule:** use "RMSE" (with "equivalent to the standard error of the estimate (SEE)" on first use); do not call these "standard errors" generically. **Wording rule (owner decision 2026-11-23):** present them as **statistics of the model across the people studied** (how far the equations' predictions were from measured values), **never as a guaranteed or personal margin of error** for the person using the calculator, and never as a "±" range around their result.
- TEE equals an energy requirement estimate only for weight-stable adults (S7); neither value is a calorie target or advice.
- TEE equations come from doubly labelled water studies; race and ethnicity were not factors in the model (S7). Activity category is self-selected and affects the result strongly (compare the four rows in the test cases).
- REE and TEE come from different equations and datasets and should not be divided or multiplied to derive each other.

### 3.8 Known report inconsistencies (do not affect the equations)
S7 gives 767 adults from the older IOM data in one table and 842 in the text; the model-fit sample sizes for adults (men 1,016; women 1,342) are smaller than the adult totals without a stated reason. Neither affects any coefficient. The equations are as printed.

### 3.9 Reference test cases
**Published worked examples (S7):**
- TE1: woman, 22 y, 165 cm, 63 kg, Low Active → `575.77 − 154.22 + 1089.0 + 764.82 = 2275.37` → **2,275** (S7 prints 2,275).
- TE2: woman, 53.9 y, 162.3 cm, 71.9 kg, Active → 2281.10 (S7 Table 5-8: 2,281).
- TE3: man, 50.3 y, 175.9 cm, 83.1 kg, Active → 2929.06 (S7 Table 5-8 prints 2,930 from unrounded inputs; assert within ±1.5). (Test functions accept decimal ages; the page accepts whole ages.)

**Full table (page limits apply; ages whole):**

| # | Sex | Age | Height | Weight | REE | TEE Inactive | Low Active | Active | Very Active |
|---|---|---|---|---|---|---|---|---|---|
| T1 | M | 28 | 178 cm | 74 kg | 1717.5 → **1,718** | 2650.23 → 2,650 | 2861.19 → 2,861 | 3039.48 → 3,039 | 3371.60 → 3,372 |
| T2 | F | 30 | 165 cm | 60 kg | 1320.25 → **1,320** | 2021.00 → 2,021 | 2182.87 → 2,183 | 2319.45 → 2,319 | 2551.68 → 2,552 |
| T3 | M | 40 | 175 cm | 70 kg | 1598.75 → **1,599** | 2444.37 → 2,444 | 2646.57 → 2,647 | 2826.32 → 2,826 | 3118.37 → 3,118 |
| T4 | F | 25 | 160 cm | 55 kg | 1264 → **1,264** | 1968.90 → 1,969 | 2124.22 → 2,124 | 2260.10 → 2,260 | 2478.58 → 2,479 |
| T5 | M | 19 | 178 cm | 74 kg | 1762.5 → **1,763** | 2747.70 → 2,748 | 2958.66 → 2,959 | 3136.95 → 3,137 | 3469.07 → 3,469 |
| T6 | F | 78 | 160 cm | 55 kg | 999 → **999** | 1597.37 → 1,597 | 1752.69 → 1,753 | 1888.57 → 1,889 | 2107.05 → 2,107 |
| T7 | — | | — | — | **historical, not implemented** (imperial input removed, metric-only policy 1.3) | | | | |
| T8 | any | 18 or 79 | | | no estimate (age rule) | | | | |
| T9 | any | 19 and 78 | | | accepted (boundaries inclusive) | | | | |

Also test: each sex separately; each category; REE and TEE independent (changing the category must not change REE).

**Additional required tests (owner-approved plan, 2026-11-23):**
- T10: each of the eight TEE equations at a probe point, with each coefficient checked by changing age, height and weight by 1 (catches sign and typing errors, including the negative constant −517.88 for men, Very Active), plus TE1, TE2 and TE3 and the 30 values of T1–T6.
- T11: validation priority (3.3): invalid ages give the age error; ages 1–18 and 79–120 give the notice even when other fields are empty or invalid; a missing activity category at age 19–78 gives an error and no result; half cases 1717.5 → 1,718, 1762.5 → 1,763, 1598.75 → 1,599 (half up).

---

## 4. Body Fat — `/calculators/body-fat/`

### 4.1 Scope and naming
Estimate body-fat percentage from height and circumference measurements with the **classic Hodgdon and Beckett (1984) circumference equations**. The page names the method exactly that way ("Hodgdon and Beckett (1984) circumference method, developed for the US Navy"). It must **not** be described as the current official US Navy body composition standard. Educational estimate only.

### 4.2 Comparison of the two Navy-related methods (resolves the "do not confuse them" requirement)
| | A. Classic Hodgdon and Beckett (1984) equations (**used here**) | B. Navy Body Composition Assessment (BCA) guide procedure |
|---|---|---|
| What it is | Regression equations from two Naval Health Research Center reports (S9) | An administrative procedure: measurement rules, lookup tables, screening steps (S8) |
| Inputs | Height, neck, waist (men) or waist + hip (women), in inches | The same circumferences, but repeated, averaged and rounded by rule |
| Calculation | Continuous log10 equation | Table lookup built from the same equations (reproduced in 4.3) |
| Rounding | None in the equation | Each circumference is measured twice (a third time if the first two differ by more than 1 inch) and averaged to the nearest ½ inch; neck rounded **up**, abdomen/waist/hip rounded **down** to ½ inch; height rounded **up** to ½ inch; the **circumference value (CV) is rounded down to the nearest ½ inch** before the lookup (S8 pp. 5, 10–12; verified 2026-11-24); integer % result |
| Purpose | Prediction of percent body fat from body density data | Military body-composition standards, after a weight-for-height screening step |
| Current status | Published 1984 | The 2016 edition (S8) was read. A 2023 edition exists; newer editions (2025) appear to have changed the screening step. **None of the post-2016 editions could be read.** |

Because B adds rounding, integer output, averaging and a screening step that suits a compliance procedure, and the current edition is unverified, this site uses **A** and adapts only the measurement instructions from B (2016 edition), labelled as "adapted from the US Navy body composition guide (2016 edition)". If the owner later wants the table procedure, the effect on the design would be: integer percentage output, rounding of inputs to half inches, a three-measurement averaging step, and a screening step. None of that is required for the approved design.

### 4.3 Equations — VERIFIED BY REPRODUCTION (S8 tables); primary reports UNVERIFIED (S9)
All measurements in **inches**, logarithms **base 10**, result in **percent body fat**. Convert centimetres with `inches = cm / 2.54` before the calculation. The calculation order is: compute the circumference value first, then take `log10`, then multiply by the coefficient.

- Men: `%BF = 86.010 × log10(waist − neck) − 70.041 × log10(height) + 36.76`
- Women: `%BF = 163.205 × log10(waist + hip − neck) − 97.684 × log10(height) − 78.387`

Here "waist" is the abdomen at the navel for men and the natural waist for women (4.4). The **hip is used only for women** and is added to the waist before the neck is subtracted.

**Verification:** the Navy guide (S8) prints percent-body-fat lookup tables whose rows are the circumference value (men: abdomen − neck; women: **waist + hip − neck**, as the guide's own text instructs) and whose columns are the height in inches. I extracted the full text of all four table pages and compared every numeric cell with the equations above, rounded to the nearest whole number: **1,996 of 1,996 numeric cells matched exactly** — men page 16 (424 cells), men page 17 (492), women page 18 (520), women page 19 (560) — **and the 144 cells printed as limits** ("<9" and similar; 104 for men, 40 for women) **are consistent** with the equations (checked as inequalities). *Correction 2026-11-24:* this section previously gave 1,991 cells and 555 for page 19; an independent re-extraction found 1,996 and 560, and the earlier figure was a count error. Spot checks: men CV 20 in, height 60 in → 24.118 (table 24); CV 20, 79.5 in → 15.558 (16); women CV 50.5, 58 in → 27.340 (27); CV 50.5, 67.5 in → 20.905 (21). This confirms the coefficients, the units (inches), the logarithm base (10) and the calculation order, including the hip for women.

**How to read this reproduction (clarified 2026-11-24, owner decision D12).** (1) Each cell is compared with the equation evaluated at the table's own header values (the CV row and the height column), then rounded to the nearest whole number; the guide's measurement-rounding rules (see the "Rounding" row in 4.2) are not part of this comparison because the header values are already half-inch values. Measurement rounding and the final whole-number rounding are different things: the first prepares the inputs of the lookup, the second is how the printed cells are rounded. (2) Truncation matches only about half the cells, so the cells are rounded to the nearest integer; no cell lies closer than about 0.0012 to a .5 tie, so half-up and half-even rounding agree. (3) The guide contains no equation, no author names and no statement of how its tables were calculated; it says the official determination is made by the Navy's PRIMS software. The match therefore shows that the equations reproduce the printed numbers; it does **not** show that the guide's authors used these exact equations, that the original 1984 reports say the same, or how PRIMS calculates the official result. (4) The calculator gives the continuous equation value for the measurements as entered; it does **not** apply the lookup-table procedure, so its result can differ from a Navy table reading of the same tape measurements (the guide's roundings all lower the looked-up value; with example readings 70.3 / 15.2 / 35.4 in the continuous value was 19.67 against 18.27 for the guide-rounded inputs, about 1.4 points; arithmetic illustration only, not an accuracy statement).

**What is still UNVERIFIED:** the equation text in the original reports (S9 could not be read). The equations must be cited to S9 as "Hodgdon and Beckett, 1984 (reports 84-11 and 84-29)", and the page may not claim that the reports were consulted directly. S19 is **not** used as a source for the equations because it prints the women's equation without the hip term (an apparent printing error).

**Required transparency statement (owner decision; shown in the page's Methods text, in plain words):** "These equations (Hodgdon and Beckett, 1984) were checked by reproducing the lookup tables of the official US Navy Body Composition Assessment guide (2016 edition). The text of the original 1984 reports was not directly accessible. This is the classic 1984 circumference method; it is not the current official US Navy standard." The page must keep this verification status visible and must not claim that the original reports were consulted. **Added 2026-11-24 (owner-approved D5):** the page adds the sentence "The guide does not state how its tables were calculated." and, separately, "The Navy guide records measurements to the nearest half inch with set rounding directions and reads the result from a table. This calculator does not apply those rules; it uses your measurements as entered, so its result can differ from the Navy table procedure." Cell counts are kept out of the page text.

**Do not use** the centimetre/density form that appears in the Stitch export (`495 / (1.0324 − 0.19077·log10(waist−neck) + 0.15456·log10(height)) − 450` and the women's `1.29579 / 0.35004 / 0.22100` version). It is unverified, and in cross-checks it differs from the inch form by 0.03–0.29 percentage points.

### 4.4 Inputs and measurement instructions — VERIFIED (S8, 2016 edition)
| Input | Men | Women | Unit |
|---|---|---|---|
| Sex | ✓ | ✓ | |
| Height | ✓ | ✓ | cm |
| Neck | ✓ | ✓ | cm |
| Waist | abdomen, across the navel | natural waist | cm |
| Hip | not shown, not used | **required** | cm |
| Weight | optional (fat and lean mass only) | optional | kg |

The hip field appears only when Female is selected and is required then. The calculator never computes from an incomplete set.

On-page measurement instructions (adapted from S8; do not claim they are the military procedure):
- **Neck:** bare skin, just below the larynx (Adam's apple), tape perpendicular to the long axis of the neck, not over the larynx; look straight ahead, shoulders down and relaxed; tape as close to horizontal as possible; avoid involving the neck and shoulder (trapezius) muscles.
- **Men, waist (abdomen):** bare skin, across the navel, arms down at the sides; at the end of a normal relaxed breath out, without holding the breath.
- **Women, natural waist:** bare skin, at the point of smallest abdominal circumference, usually about halfway between the navel and the lower end of the breastbone; if the point is hard to find, measure at several likely points and use the smallest; tape level (parallel to the floor), arms at the sides; end of a normal relaxed breath out.
- **Women, hips:** over thin fitted clothing only (no shaping garments); tape level, passing over the greatest protrusion of the buttocks as seen from the side; enough tension to limit the effect of clothing.
- **Height:** "Standing, without shoes." (owner decision D11, conservative wording; not attributed to the guide). S8 page 5 was read on 2026-11-24: shoes are not worn; the person stands on a flat surface at attention with the head level and the chin parallel to the deck; height for the circumference lookup is rounded up to the nearest ½ inch. The page still uses only the short wording.
- **Do not mix two different abdominal measurements.** For men the percent-body-fat measurement is the abdomen **across the navel** (S8 p. 10). The guide's separate screening "single-site abdominal circumference" is taken above the uppermost hip bone (iliac crest) (S8 pp. 6, 8) and is **not** used here; the Stitch text that mentions "naval / iliac crest" is not used.
- **Age (owner decision D1, 2026-11-24):** there is **no age input**. The page states "For adults aged 18 and older." and identifies it as a website eligibility policy, not a statement that the method is validated for every adult.
- The guide has each measurement repeated in turn and averaged, with rounding rules; the calculator does **not** apply those rounding rules. The page may suggest measuring twice and using the average, and must not present this as the military rule.

### 4.5 Validation specific to this calculator
**Order (owner decision 2026-11-24):** parse → convert to canonical cm/kg → validate each field's limits → logarithm-domain check → calculate → plausibility check. Field-level errors (empty, not a number, out of range, and for women a missing hip) are all shown first; the domain and plausibility checks run only when every required field is a valid number.
- **Missing hip (female only):** "Enter your hip measurement in centimetres." (on the hip field; wording updated 2026-11-26 with the metric-only policy). For a male the hip is hidden, ignored and never validated (F7).
- **Domain, men (`waist − neck ≤ 0`):** "The waist measurement must be larger than the neck measurement." No result.
- **Domain, women (`waist + hip − neck ≤ 0`):** "The waist and hip measurements added together must be larger than the neck measurement." No result.
- **Implausible result (percentage ≤ 0 or > 100):** "These measurements do not give a possible body-fat percentage (0% or below, or above 100%). Check each measurement and the selected units." No result (0 and 100 are mathematical bounds, not health claims).
- **Association and announcement:** domain and plausibility errors are shown in one alert directly under the measurement group; the involved fields (neck and waist, plus hip for women, and height for the plausibility case) are marked `aria-invalid` and reference the alert through `aria-describedby`; focus moves to the first involved field; the polite status region announces "No result. Please correct the highlighted fields."
- **Optional weight (owner decision D7):** empty → percentage without fat and lean mass; entered but invalid → error and no calculation.
- No result may ever contain NaN or Infinity.
- **Messages (owner decision 2026-11-26):** every field message states the expected input in plain words, for example "Enter your waist in centimetres, using digits and a decimal point only (for example 84.5). Do not add units." Range messages give the limits in cm.
- **Live correction (owner decision 2026-11-26, from the diagnostic of the reviewer's report):** when a field is edited, that field's error message and invalid styling are cleared immediately; and any previously shown result is hidden as soon as any measurement, the sex or the weight changes, so an outdated result can never remain on screen. The group (domain or plausibility) alert is cleared when any field it refers to is edited. A result appears only after Calculate.
- Limits in 1.3 apply (neck, waist and hip 10–250 cm), and the website policy age ≥ 18 (the page states it; there is no age input and the calculation uses no age).

### 4.6 Output
- Body-fat percentage, one decimal (half up), computed from the continuous equation (never from a lookup table).
- If weight is entered: fat mass = `weight × %BF / 100`; "lean mass (not fat)" = `weight − fat mass`, both from the **unrounded** percentage, shown with one decimal in kg, each labelled as an estimate (owner decision D9). The second is labelled as everything that is not fat, not as muscle. Hidden if weight is empty. Fat and lean mass are rounded independently.
- The result ring fills from 0 to 100 percent in one colour; it carries no bands and no health meaning, and the figure has a text equivalent (owner decision D3).
- **No category, band, colour range or "within healthy range" statement.** No health-status badge.
- **No accuracy claim and no error percentage** anywhere (owner decision). The earlier draft's standard-error and bias figures are removed.

### 4.7 Limitations to state (qualitative only)
- A circumference equation gives an estimate; individual results vary, and the result is not a body-composition scan.
- The method was developed for military screening using measurements of Navy personnel (S9, S8).
- Results depend on how carefully the measurements are taken.

### 4.8 Reference test cases
| # | Sex | Height | Neck | Waist | Hip | Weight | CV (in) | %BF (exact) | Display |
|---|---|---|---|---|---|---|---|---|---|
| F1 | M | 70.0 in | 15.0 in | 35.0 in | — | — | 20.0 | 19.4291 | 19.4 |
| F2 | F | 58.0 in | 13.0 in | 28.0 in | 35.5 in | — | 50.5 | 27.3400 | 27.3 |
| F3 | M | 178 cm (70.0787 in) | 38 cm (14.9606) | 84 cm (33.0709) | — | 76 kg | 18.1102 | 15.6873 | 15.7; fat 11.9 kg, lean 64.1 kg |
| F4 | F | 165 cm (64.9606 in) | 32 cm (12.5984) | 72 cm (28.3465) | 98 cm (38.5827) | — | 54.3307 | 27.7142 | 27.7 |
| F5 | M | 178 cm | 38 cm | 38 cm | — | — | 0 | — | error |
| F6 | F | 165 cm | 32 cm | 72 cm | missing | — | — | — | error |
| F7 | M with a hip value | | | | any | | | same as without the hip | hip ignored |
| F8 | M/F | **historical, not implemented** (imperial input removed). The cm → inch conversion inside the equations is tested through F3 and F4 (and through the Navy-table reproduction), which are metric cases. | | | | | | | |

**Table-reproduction test (required):** the implementation must reproduce all **1,996** numeric cells of the S8 tables (circumference value and height from the table headers; result rounded to a whole number) and be consistent with the **144** cells printed as limits, as an automated test against the independently extracted fixture `src/calculators/fixtures/navy-bca-2016-percent-body-fat.json` (provenance, extraction script and limitations in the README beside it). The fixture's counts are asserted so a truncated file fails. The expected values are the printed numbers, never values produced by the equations under test. The 8 spot checks in 4.3 are part of it.

---

## 5. Ideal Weight — `/calculators/ideal-weight/`

### 5.1 Scope and framing
Historical height-based estimates of "ideal body weight" (IBW). They were built from height–weight tables and are used in drug-dose calculations (S10 title; S12 abstract; S11 commentary). They are **not** personalised medical targets and **not** mandatory weight goals, and the page says so. A comparison of two formulas, Devine and Robinson.

### 5.2 Inputs
| Input | Unit | Notes |
|---|---|---|
| Sex | male / female | separate constants |
| Height | cm | eligibility: at least 152.4 cm (60 in) |

No age field (no verified formula uses age).

### 5.3 General form
`IBW (kg) = base(sex) + increment(sex) × (height_in − 60)`, with `height_in = height_cm / 2.54`. Output kg to one decimal; pounds = kg / 0.45359237 to one decimal.

### 5.4 Equations (kg; increment per inch over 5 feet)

| Formula | Men | Women | Source type and status |
|---|---|---|---|
| **Robinson et al., 1983** | `51.65 + 1.85 × (in − 60)` | `48.67 + 1.65 × (in − 60)` | **[P] VERIFIED** — S10 (original paper, abstract): "For men of all frame sizes, IBW = 51.65 kg + 1.85 kg/inch of height greater than 5 feet. For women … 48.67 kg + 1.65 kg/inch …" Exact coefficients are used. |
| **Devine, 1974** (Devine BJ, Drug Intell Clin Pharm 1974;8:650–655) | `50.0 + 2.3 × (in − 60)` | `45.5 + 2.3 × (in − 60)` | **[S] SECONDARY, owner-approved.** Source: S11, Table 1 (peer-reviewed commentary). The 1974 paper itself could not be read (not indexed in PubMed). The page and Methods text must say: "Devine's equation as reported in {S11}; the original paper was not consulted." S12 (abstract) confirms that Devine published IBW equations used in drug pharmacokinetics but gives no coefficients. |

S11 lists the Robinson equation as `52 + 1.9` (men) and `49 + 1.7` (women). Those are **rounded secondary versions** of S10's values. They must not be used or shown.

### 5.5 Formulas not included
- **Miller et al., 1983 — UNVERIFIED / HELD.** Two conflicting coefficient sets exist and neither was confirmed against Miller's own text (Miller DR, Carlson JD, Lloyd BJ, Day BJ, "Determining ideal body weight (and mass)", Am J Hosp Pharm 1983;40:1622, 1625; its PubMed record, PMID 6638023, has no abstract).
  - Version A: men `56.2 + 1.41`, women `53.1 + 1.36` kg per inch over 5 ft. Found on calculator websites and in the Stitch design; a search summary said it appears in S12's table, which could not be opened to confirm.
  - Version B: men `55.7 + 1.39`, women `53 + 1.33`. Printed in S11, Table 1 (the only peer-reviewed secondary source I could read).
  - At 5 ft 10 in the two give results about 0.4–0.7 kg apart. Neither is implemented, selected, averaged or combined. **Evidence needed:** the text of Miller's letter, or the equation table of Pai & Paloucek 2000 (S12), or another readable peer-reviewed source stating the coefficients.
- **Hamwi, 1964 — HELD** (the Stitch design shows it as `48.0 + 2.7` men and `45.5 + 2.2` women kg per inch; S11 lists it as `106 lb + 6 lb/in` and `100 lb + 5 lb/in`). The owner has not approved a fourth formula. Not implemented.
- No other formula is added to fill the layout.

### 5.6 Limits and validation
- Minimum height 152.4 cm (60 in), because the equations are written for height over 5 feet (S10). Below it no number is produced; the page explains that the formulas start at 5 ft.
- No maximum height is stated in the sources; only the validation limit in 1.3 applies.
- Do not call either equation "the gold standard". S12 states that the equations resemble each other because they come from the same height–weight tables; S20 (secondary) reports that most IBW formulas fall within a BMI of about 20–25 and suggests BMI ranges can be more useful than IBW formulas. These may be cited as context, not as a recommendation.

### 5.7 Range bar and healthy BMI weight span (design rows)
**Range bar (kept):** shows the range between the **two formula estimates** (the lower and the higher of Devine and Robinson for the entered height and sex). Its title is "Range between the two formula estimates", and its end labels are the actual formula names for that case (never hard-coded). It is **not** a healthy weight range, not a recommended range and not a target, and the page says so in one short line beside the bar: "This is only the spread between two historical formulas, not a recommended or healthy weight range." When the two estimates are equal to the displayed decimal, the bar shows one marker and the same labelling.

**Healthy BMI weight span (kept):** reuses the BMI healthy-weight range (2.8) for the same height, labelled as a BMI-category restatement. The page repeats that adult BMI categories are for people aged 20 and older.

### 5.8 Reference test cases
| # | Sex | Height | in over 60 | Devine (kg / lb) | Robinson (kg / lb) |
|---|---|---|---|---|---|
| I1 | M | 152.4 cm | 0 | 50.00 → 50.0 / 110.2 | 51.65 → 51.7 / 113.9 |
| I2 | F | 152.4 cm | 0 | 45.50 → 45.5 / 100.3 | 48.67 → 48.7 / 107.3 |
| I3 | M | 165.1 cm | 5 | 61.50 → 61.5 / 135.6 | 60.90 → 60.9 / 134.3 |
| I4 | F | 165.1 cm | 5 | 57.00 → 57.0 / 125.7 | 56.92 → 56.9 / 125.5 |
| I5 | M | 178 cm | 10.0787 | 73.18 → 73.2 / 161.3 | 70.30 → 70.3 / 155.0 |
| I6 | F | 178 cm | 10.0787 | 68.68 → 68.7 / 151.4 | 65.30 → 65.3 / 144.0 |
| I7 | any | 152.3 cm | negative | — no result (below 5 ft) | |
| I8 | any | 152.4 cm | 0 | accepted (boundary inclusive) | |

Imperial inputs 5 ft 0 in, 5 ft 5 in and 5 ft 10.0787 in must equal I1–I6.

---

## 6. Macros — `/calculators/macros/`

### 6.1 Scope
Convert a user-entered daily energy amount and a chosen protein / carbohydrate / fat percentage split into grams per day. Educational and mathematical. **No calorie target is recommended or computed, and there is no diet plan.**

### 6.2 Inputs
| Input | Unit | Notes |
|---|---|---|
| Energy | kcal/day | user-entered; limits 500–10,000 (1.3) |
| Protein, carbohydrate, fat share | % of energy | each 0–100, **total exactly 100** |
| Preset buttons | | 6.5 |

### 6.3 Energy conversion factors — VERIFIED (S13, re-read)
Protein 4.0 kcal/g, carbohydrate 4.0 kcal/g, fat 9.0 kcal/g (Atwater general factors; S13 section 3.5.1: 17 kJ/g, 37 kJ/g and 17 kJ/g). S13 notes the kJ values are rounded (precise 16.7, 37.4, 16.7 kJ/g); the calculator uses the 4/4/9 kcal/g factors (owner-approved). Alcohol is not used.

### 6.4 Calculation
```
grams(protein)      = (energy × proteinPct / 100) / 4
grams(carbohydrate) = (energy × carbPct / 100) / 4
grams(fat)          = (energy × fatPct / 100) / 9
energy per macro    = energy × pct / 100          (kcal, from the percentage, not from rounded grams)
```
- Units: kcal × fraction ÷ (kcal/g) = g. For example 2,200 kcal at 30/45/25 gives 165 g, 247.5 g, 61.1 g and 660/990/550 kcal, which sum to exactly 2,200 kcal.
- The three percentages must total **exactly 100** (integers from the UI; a decimal entry is allowed to one place with a 1e-9 tolerance). Otherwise show "The shares must add up to 100%" and no result. Custom requires this too.
- Grams are rounded to whole grams (half up) for display; displayed grams are not used to recompute energy.

### 6.5 Presets (owner-approved; illustrative calculation presets)
| Preset | Protein | Carbohydrate | Fat | Total |
|---|---:|---:|---:|---:|
| Balanced | 30% | 45% | 25% | 100% |
| High Protein | 35% | 45% | 20% | 100% |
| Moderate Carb | 25% | 45% | 30% | 100% |
| Custom | user-set | user-set | user-set | must be exactly 100% |

All three presets fall inside the adult reference ranges in 6.6. They are **illustrative presets for the calculation**, not recommendations. The page must not call any preset optimal, universally healthy, medically recommended or suitable for a goal, and states that individual nutritional needs vary. Changing a share by hand switches the selection to Custom.

### 6.6 Adult reference ranges (AMDR) — VERIFIED (S14; S15 Table 3-1) with caveat
For adults 19 years and older, % of total energy: **carbohydrate 45–65%, fat 20–35%, protein 10–35%.** S14 (National Academies table adapted from the 2002/2005 DRI report) defines an AMDR as the range of intake of an energy source associated with reduced chronic-disease risk while providing essential nutrients, and notes that intakes outside the range carry a potential for increased risk and insufficient nutrient intake. S15 reproduces the same adult values in its Table 3-1.

**Required caveat (shown wherever the ranges are shown):** "Reference ranges are the adult Acceptable Macronutrient Distribution Ranges from the National Academies' 2002/2005 Dietary Reference Intakes. In 2024 a National Academies committee recommended that future DRI reviews drop these ranges because the way they were derived is not consistent with current evidence-based standards; that report did not change the numbers. Individual needs vary."

What S15 (the 2024 document) is, exactly: *Rethinking the Acceptable Macronutrient Distribution Range for the 21st Century: A Letter Report*, National Academies Press, 2024, doi 10.17226/27957. It recommends (Recommendation 1) that the federal DRI working group remove the AMDR from the nutrient intake values considered in future macronutrient DRI reviews, and (Recommendation 2) that future reviews consider macronutrient quality and the reference values of constituent nutrients. It is a committee recommendation; I found no statement that it has been adopted as policy. It does not revise the numeric ranges, and it acknowledges that some users may keep applying the AMDRs in the interim, with their limitations in mind. The letter to the sponsor in that report was not readable (rate limited), so the sponsoring body's name is not recorded.

Use in the UI: show the range beside each share. A neutral information line appears if a share is outside its range ("outside the adult reference range of 45–65%"), with no warning colour or icon and no advice.

### 6.7 Reference test cases
| # | Energy | P / C / F % | Protein | Carbohydrate | Fat | kcal per macro |
|---|---|---|---|---|---|---|
| X1 | 2,200 | 30 / 45 / 25 | 165 g | 247.5 → **248 g** | 61.1 → **61 g** | 660 / 990 / 550 |
| X2 | 2,000 | 30 / 45 / 25 | 150 g | 225 g | 55.6 → **56 g** | 600 / 900 / 500 |
| X3 | 2,000 | 35 / 45 / 20 | 175 g | 225 g | 44.4 → **44 g** | 700 / 900 / 400 |
| X4 | 2,000 | 25 / 45 / 30 | 125 g | 225 g | 66.7 → **67 g** | 500 / 900 / 600 |
| X5 | 2,200 | 35 / 45 / 20 | 192.5 → **193 g** | 247.5 → **248 g** | 48.9 → **49 g** | 770 / 990 / 440 |
| X6 | 2,200 | 25 / 45 / 30 | 137.5 → **138 g** | 247.5 → **248 g** | 73.3 → **73 g** | 550 / 990 / 660 |
| X7 | 1,800 | 20 / 50 / 30 | 90 g | 225 g | 60 g | 360 / 900 / 540 |
| X8 | 2,000 | 30 / 45 / 20 | — | — | — | error: shares total 95% |
| X9 | 499 / 10,001 / 0 | any | — | — | — | error: outside 500–10,000 |
| X10 | 500 and 10,000 | 30 / 45 / 25 | accepted (boundaries inclusive) | | | |
| X11 | 2,000 | 35 / 40 / 25 | 175 g | 200 g | 55.6 → 56 g | carbohydrate 40% is below 45%: neutral note |

---

## 7. Water Intake — `/calculators/water-intake/`

### 7.1 Scope
Show the **total-water reference values published by two different organisations**, side by side, for an adult. They are population reference values, **not** an individual's exact requirement and **not** medical advice. The two values are never combined, averaged or presented as interchangeable.

### 7.2 Inputs
| Input | Options | Notes |
|---|---|---|
| Sex | female / male | |
| Display unit | L / mL / US fl oz | conversions in 1.2 |

Pregnancy and lactation are **outside** this general adult calculator (owner decision). They are not offered. If the owner later approves them, they need their own dedicated inputs and a separately verified methodology. (The values exist in the sources and are recorded in 7.4 for later use only.)
Removed from the design: any reference-source selector (both are always shown), the climate and exertion modifier, and the age-cohort dropdown. **There is no age input and no replacement for it** (owner decision): age does not affect the approved reference values. The adult scope is communicated by the notice "For adults aged 19 and over." shown near the inputs and the results.

### 7.3 What the values measure — VERIFIED (S16, S17)
**Total water intake** = water from drinking water, other beverages of all kinds and **food moisture**.
- EFSA (S17): "the reference values for total water intake should include water from drinking water, beverages of all kind, and from food moisture"; the table footnote says the same (water from beverages of all kind, including drinking and mineral water, and from food moisture).
- US National Academies (S16): the Adequate Intake is for total water "from a combination of drinking water, beverages, and food".
Neither value is a recommendation to drink that amount as plain water.

### 7.4 Reference values — VERIFIED

| Organisation | Women | Men | Basis (from the sources) |
|---|---|---|---|
| **EFSA** (S17, adequate intake of total water; adults and adolescents of 14+ are treated as adults) | **2.0 L/day** | **2.5 L/day** | Observed intakes in population groups combined with desirable urine osmolarity and water volumes per energy unit consumed. 95th percentile of observed intake: 3.1 L (women), 4.0 L (men). |
| **US National Academies / IOM** (S16, adequate intake of total water; adults 19–30, 31–50, 51–70 and over 70) | **2.7 L/day** | **3.7 L/day** | Set from the median total water intake of US survey data (NHANES III) for young adults. |

- S16 adds, for information: about 3.0 L (men) and 2.2 L (women) came from beverages including drinking water, and about 19% of total water came from food. EFSA's text read gives no beverage/food split, so no EFSA split is shown. Showing the US split is optional (small secondary line under the US value only; owner to decide).
- Stated conditions: EFSA's values apply only to moderate environmental temperature and moderate physical activity (PAL 1.6); losses under extreme heat or exercise "can be up to about 8,000 mL/day" and need replacing (S17). S16 states that higher intakes of total water are required for people who are physically active or exposed to hot environments, and that the AI should not be interpreted as a specific requirement. **Neither source gives a numeric adjustment**, so none is calculated or shown.
- EFSA states that water requirement varies between individuals and with environmental conditions, which is why only adequate intakes were defined (S17).
- For later use only (pregnancy and lactation, not offered now): EFSA 2.3 L and 2.7 L (S17); US 3.0 L and 3.8 L (S16).

**Why the numbers differ:** they are different reference sets from different organisations, built from different data and methods (7.4 table). The page says "These are separate reference values from different organisations and are not interchangeable." No reason beyond the basis column is stated.

### 7.5 Result area (communicate the difference simply)
A clear notice near the inputs and results: **"For adults aged 19 and over."** Then two side-by-side reference cards titled "EFSA (European Food Safety Authority)" and "US National Academies", each with the total-water value in the selected unit and the line "total water: drinking water, other beverages and food". Under them one short sentence explaining that these are separate reference values, not requirements. No combined or "recommended" number, no bar, no activity or climate control. The approved medical caution is shown: "Fluid needs vary between individuals. If you have a medical condition that affects fluid balance, consult a qualified healthcare professional."

### 7.6 Calculation
Lookup, then `mL = L × 1000`, `fl oz = mL / 29.5735295625`. Display: L one decimal, mL whole number with thousands separator, fl oz one decimal (half up).

### 7.7 Reference test cases
| # | Sex | Age | EFSA (L / mL / fl oz) | US National Academies (L / mL / fl oz) |
|---|---|---|---|---|
| W1 | F | 30 | 2.0 / 2,000 / 67.6 | 2.7 / 2,700 / 91.3 |
| W2 | M | 30 | 2.5 / 2,500 / 84.5 | 3.7 / 3,700 / 125.1 |
| W3 | F or M | — | same values as W1 / W2 (there is no age input) | |
| W4 | any | — | the notice "For adults aged 19 and over." is present in the rendered page | |
| W5 | any | — | the page contains no age field | |
| W6 | any | — | the page offers no pregnancy or lactation option | |

---

## 8. Unresolved issues

### 8.1 UNVERIFIED items (must not be implemented or claimed)
| ID | Item | Evidence needed |
|---|---|---|
| U-MIL | **Miller 1983 coefficients** (two conflicting sets, 5.5) | Miller's letter (Am J Hosp Pharm 1983;40:1622, 1625), or the equation table of Pai & Paloucek 2000, or another readable peer-reviewed source |
| U-DEV | **Devine 1974 primary paper** | The paper itself. Devine is implemented from the secondary source S11 as the owner approved. |
| U-HB | **Hodgdon and Beckett 1984 report text** (S9) | The two NHRC/DTIC reports (HTTP 403). The equations are verified numerically (1,996 of 1,996 numeric cells, 144 limit cells consistent), not from the report text. |
| U-NAVY | **Current Navy BCA guide** (2023 and later editions) | A readable copy. Affects only the on-page statement about the Navy procedure (the page does not claim a current standard). |
| U-MIF | **Mifflin result unit (kcal/day)** — SECONDARY-supported (S21, S22); not confirmed in the original paper | Full text of S6 (publisher page returned HTTP 403) |
| U-HGT | **Height-measurement wording in S8 (page 5)** | RESOLVED 2026-11-24: page 5 read (shoes not worn, standing at attention, head level; ½-inch rounding up for the lookup). The page uses only "Standing, without shoes." |
| U-CONV | **Unit definitions** — checked against NIST SP 811 (S23) to seven digits; extra digits are the defining values | None required; keep the NIST citation in Methods |
| U-SPONSOR | Sponsor of the 2024 National Academies letter report | Read the letter to the sponsor (rate limited) |

### 8.2 HELD items (owner decision)
Hamwi formula; Miller formula (also UNVERIFIED); pregnancy and lactation values in the water calculator; any body-fat category scale; activity multipliers (1.2–1.9) and FAO/WHO/UNU PAL ranges for TDEE.

### 8.3 Documented discrepancies and assumptions
- **D-BMI-1:** CDC's text thresholds versus its rounded weight table (2.7).
- **D-S7:** small internal inconsistencies in the 2023 report that do not affect the equations (3.8).
- **D-S19:** one secondary paper prints the women's Navy equation without the hip term (4.3). Not used.
- **D-IBW-1:** Robinson's coefficients appear rounded (`52 + 1.9`, `49 + 1.7`) in secondary sources; the original paper's exact values are used (5.4).
- All input limits (1.3) and eligibility rules are website policies, not medical thresholds.

### 8.4 Remaining unverified citations and assumptions (consolidated)
Nothing below may be presented on a page as an established fact.
- **Original sources not read:** Hodgdon and Beckett 1984 reports (S9); Devine 1974; Miller 1983; the full text of Mifflin et al. 1990 (S6: the REE coefficients are verified at abstract level only); Pai & Paloucek 2000 table (S12, abstract only).
- **Secondary-supported only:** Devine coefficients (S11); the kcal/day unit of the Mifflin result (S21, S22). Both must be labelled as secondary where shown.
- **Not read:** current Navy BCA guide editions after 2016; the letter to the sponsor in the 2024 National Academies report; the exact height-measurement wording in S8 page 5.
- **Policy decisions (owner), not science:** the BMR & TDEE validation priority, no preselected activity category, whole-number ages in the interface, the omitted reliability claim and the wording of the standard errors (3.2, 3.3, 3.7; 2026-11-23), all validation limits and eligibility rules (1.3), BMI classification on the exact value (2.6), the healthy-weight range derivation (2.8), calculator age limits (BMI 20+, REE and TEE 19–78, body fat 18+), the presets (6.5), the exclusion of Miller and Hamwi, and no pregnancy or lactation water values.
- **Derived by us (arithmetic, tested):** fat mass and lean mass (4.6), healthy-weight range endpoints (2.8), unit conversions of results.
- **Reported report inconsistencies (no effect on the formulas):** 767 versus 842 adults in the 2023 energy report (3.8).

## 9. Maintenance
- Re-verify the CDC, WHO, EFSA, National Academies and Navy pages before each public release and whenever a source page is updated; record the access date in each page's Sources section.
- Any change to a formula, constant, category, range, rounding rule or test case is made in this file first, then in code and tests, in the same task.
- Never replace a VERIFIED value with a value from memory or a web calculator. Never mark an item VERIFIED unless its actual source text was checked.
