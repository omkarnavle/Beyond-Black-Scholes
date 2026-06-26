# 📈 Beyond Black-Scholes

> **An Event Study of Call Option Pricing in the Indian Financial Landscape**  
> **Using Taguchi L9 Orthogonal Array Methodologies · HDFC Bank · NSE**

---

## 📌 Project Overview

This repository contains the complete research and interactive dashboard for a statistics project built as part of the **MSc in Statistics and Data Science** programme at **SVKM's Narsee Monjee Institute of Management Studies (NMIMS), Mumbai**.

The study applies the **Taguchi L9 orthogonal array** to the **Black-Scholes Model** for European call options — reducing 81 full-factorial experiments to just 9 balanced trials, while delivering complete sensitivity analysis across three time horizons using ANOVA, ANOM, S/N Ratio, and Regression. The findings are presented through a **live FastAPI dashboard** that fetches real-time NSE stock prices.

| Detail | Value |
|---|---|
| Group | Group 1 |
| Members | Eashal D'Britto (A014) · Samiksha Kabra (A023) · Omkar Navle (A037) · Liz Rodrigues (A050) · Mohammed Aamir Vahedna (A061) |
| Programme | M.Sc. Statistics and Data Science · Semester 1 · 2025–2026 |
| Mentor | Dr. Pradnya Khandeparkar |
| RT Professor | Mr. Vaibhav Vasundekar |
| Institution | Nilkamal School of Mathematics, Applied Statistics & Analytics, NMIMS Mumbai |
| Stock Studied | HDFC Bank — HDFCBANK.NS |
| Data Source | [NSE India](https://www.nseindia.com/) |
| Time Periods Analysed | 1 Week · 1 Month · 3 Months |
| Tools Used | Python · R · FastAPI · Excel · Minitab |

---

## 🖥️ Live Dashboard

![Dashboard](assets/images/dashboard_preview.png)

A **FastAPI web dashboard** that fetches live NSE prices, builds the Taguchi L9 array in real time, computes Black-Scholes call prices for all 9 trials, and presents complete statistical analysis across five tabs — **L9 Design · ANOVA · ANOM · S/N Ratio · Optimal**.

### Running the Dashboard

```bash
git clone https://github.com/your-username/beyond-black-scholes.git
cd beyond-black-scholes/dashboard
pip install -r requirements.txt
python run.py
# Open http://localhost:8000
```

---

## 📂 Repository Structure

```
beyond-black-scholes/
├── dashboard/                        ← FastAPI live dashboard
│   ├── app/
│   │   ├── main.py                   ← FastAPI entry point
│   │   ├── routers/analysis.py       ← API routes
│   │   └── services/
│   │       ├── finance.py            ← Black-Scholes + Taguchi logic
│   │       └── stocks.py             ← Live NSE price fetching (yfinance)
│   ├── static/css/main.css           ← Dashboard theme
│   ├── static/js/                    ← Chart rendering, UI logic
│   ├── templates/index.html
│   ├── requirements.txt
│   └── run.py
├── analysis/
│   ├── python/
│   │   ├── regression_anova_diagnostics.py
│   │   └── anova_anom.py
│   └── r/
│       ├── sn_ratio_1week.Rmd
│       ├── sn_ratio_1month.Rmd
│       └── sn_ratio_3month.Rmd
├── report/
│   ├── GROUP_1_REPORT.pdf
│   └── GROUP_1_PPT.pptx
├── assets/images/
├── .gitignore
└── README.md
```

---

## 🎯 Aim and Objectives

![Objectives](assets/images/objectives.jpg)

---

## 🧪 The Black-Scholes Model

![Black-Scholes Formula](assets/images/bs_formula.jpg)

The BSM prices European call options using four input parameters. The goal of this study is to identify which parameter most significantly affects the call option value and what combination of levels maximises it.

---

## ⚙️ The Taguchi Method

![Taguchi Method Steps](assets/images/taguchi_method_steps.jpg)

Instead of running all 81 combinations of 4 factors × 3 levels, the Taguchi L9 array cuts this to **9 balanced, orthogonal trials** — saving 89% of experimental effort while preserving the ability to independently estimate each factor's contribution.

---

## 📐 Factor Levels

![Factor Levels](assets/images/factor_levels.jpg)

---

## 🔢 L9 Orthogonal Array

![L9 Orthogonal Array](assets/images/l9_orthogonal_array.jpg)

Each factor appears at each of its three levels exactly three times across the nine trials. Every pair of factor levels appears together exactly once — this orthogonality ensures unbiased estimation with zero confounding.

---

## 📋 L9 Design Applied — 1 Week Data

![L9 Data 1 Week](assets/images/l9_data_1week.jpg)

The 9 parameter combinations from the L9 array are plugged into the Black-Scholes formula for each maturity period. T7 (S₀=994.143, K=965) consistently produces the highest BS price because it combines the highest stock price with the lowest strike price — putting the option deepest in-the-money.

---

## 📉 Regression

![Regression Equations](assets/images/regression_equations.jpg)

A multiple linear regression model `Call = a + b₁·S + b₂·K + b₃·r + b₄·σ` was fitted for all three time periods. R² exceeded **0.975** in all cases. K carries a consistently **negative coefficient** — higher strike price directly reduces call value. S₀, r, and σ all carry positive coefficients.

---

## 🔬 Regression Diagnostics — 1 Week

![Regression Diagnostics 1 Week](assets/images/regression_diagnostics_1week.jpg)

---

## 🔬 Regression Diagnostics — 1 Month

![Regression Diagnostics 1 Month](assets/images/regression_diagnostics_1month.jpg)

---

## 🔬 Regression Diagnostics — 3 Months

![Regression Diagnostics 3 Months](assets/images/regression_diagnostics_3month.jpg)

The Q-Q plots confirm approximate normality of residuals across all three periods. The Residuals vs Observation Order plots show a cyclical pattern — indicating autocorrelation inherent to the structured Taguchi L9 design (not a random sample).

---

## 📊 ANOM — All Three Periods

![ANOM All Periods](assets/images/anom_all_periods.jpg)

ANOM ranks factors by Delta (max level mean − min level mean). **K holds Rank 1 across all three periods** — the choice of strike price has the biggest impact on option value. As maturity increases, σ rises from Rank 3 to Rank 2, overtaking S₀ in importance.

---

## 📡 Signal-to-Noise Ratio — 1 Week

![S/N Ratio 1 Week](assets/images/sn_ratio_1week.jpg)

K has the highest Delta of **15.27** — by far the most influential factor on option robustness. r remains flat with a Delta of just 0.95, confirming minimal impact.

### S/N Main Effects Plots — 1 Week

![S/N Plots 1 Week](assets/images/sn_ratio_plots_1week.jpg)

---

## 📡 Signal-to-Noise Ratio — 1 Month

![S/N Ratio 1 Month](assets/images/sn_ratio_1month.jpg)

σ rises to Rank 2 (Delta = 3.92), showing growing importance as time to maturity increases. K retains Rank 1 with Delta = 7.07.

### S/N Main Effects Plots — 1 Month

![S/N Plots 1 Month](assets/images/sn_ratio_plots_1month.jpg)

---

## 📡 Signal-to-Noise Ratio — 3 Months

![S/N Ratio 3 Months](assets/images/sn_ratio_3month.jpg)

At 3 months, σ (Delta = 3.68) nearly catches K (Delta = 3.88) — confirming that volatility becomes increasingly dominant as time to expiry grows longer.

### S/N Main Effects Plots — 3 Months

![S/N Plots 3 Months](assets/images/sn_ratio_plots_3month.jpg)

In all three periods: S₀ and σ show **upward slopes** (higher = more robust), K shows a **strong downward slope** (higher K = weaker robustness), and r stays essentially flat.

---

## 🏆 Optimal Combination

![Optimal Combination](assets/images/optimal_combination.jpg)

The optimal parameter combination is **consistent across all three maturities** — S₀ at Level 3 and K at Level 1 every time. A high underlying price with a low strike price puts the option deep in-the-money, maximising call value.

### Verification — 1 Month Optimal

![1 Month Optimal Verified](assets/images/l9_data_1month_optimal.jpg)

Applying the optimal combination (S₀=994.143, K=965, r=0.065, σ=0.25) to the Black-Scholes formula yields **₹48.35** — the highest value among all nine L9 trials, confirming the Taguchi analysis.

| Period | S₀ | K | r | σ | Predicted BS |
|---|---|---|---|---|---|
| 1 Week | 994.143 (L3) | 965 (L1) | 0.045 (L1) | 0.25 (L3) | 32.14 |
| 1 Month | 994.143 (L3) | 965 (L1) | 0.065 (L3) | 0.25 (L3) | **48.35** |
| 3 Months | 994.143 (L3) | 965 (L1) | 0.065 (L3) | 0.25 (L3) | 65.78 |

---

## ✅ Conclusion

![Conclusion](assets/images/conclusion.jpg)

---

## 📈 Key Results Summary

| Finding | 1 Week | 1 Month | 3 Months |
|---|---|---|---|
| **Top factor (ANOVA %)** | K — 69.2% | K — 61.3% | K — 45.9% |
| **σ contribution** | 9.2% | 21.2% | 39.9% |
| **r contribution** | 0.9% | 0.6% | 1.1% |
| **Model R²** | 0.975 | 0.994 | 0.998 |
| **ANOM Rank 1** | K | K | K |
| **S/N Rank 1** | K (Δ=15.27) | K (Δ=7.07) | K (Δ=3.88) |
| **BS value range** | 3.73 – 32.14 | 14.13 – 43.55 | 30.85 – 65.78 |

---

## 📦 Python Packages

| Package | Purpose |
|---|---|
| `fastapi` + `uvicorn` | Dashboard web framework and server |
| `yfinance` | Live NSE stock price and volatility fetching |
| `numpy` + `scipy` | Numerical computation and normal CDF for BS formula |
| `statsmodels` | OLS regression and ANOVA |
| `pandas` | Data manipulation |
| `jinja2` | HTML templating |

---

## 📊 R Packages

| Package | Purpose |
|---|---|
| `DoE.base` | Taguchi orthogonal array construction |
| `ggplot2` | Main effects plots for S/N ratio |

---

## 📄 Report and Presentation

📋 [`GROUP_1_REPORT.pdf`](report/GROUP_1_REPORT.pdf)

📊 [`GROUP_1_PPT.pptx`](report/GROUP_1_PPT.pptx)

---

## 🔗 References

1. Black, F., & Scholes, M. (1973). The pricing of options and corporate liabilities. *Journal of Political Economy*, 81(3), 637–654.
2. Merton, R. C. (1974). On the pricing of corporate debt. *Journal of Finance*, 29(2), 449–470.
3. Hull, J. C. (2016). *Options, Futures, and Other Derivatives* (9th ed.). Pearson.
4. Phadke, M. S. (1989). *Quality Engineering Using Robust Design*. Prentice Hall.
5. Roy, R. K. (2001). *Design of Experiments Using the Taguchi Approach*. Wiley.
6. Dar & Anuradha (2018). An application of Taguchi L9 method in Black-Scholes model. *International Journal of Entrepreneurship*, 22(1), 117–127.
7. NSE India: https://www.nseindia.com/

---

## 📜 Licence

Submitted as academic coursework for the M.Sc. Statistics and Data Science programme at NMIMS Mumbai, 2025–2026.
Code and analysis are original work by Group 1. Data sourced from NSE India under public market data terms.

---

*Built with Python · R · FastAPI · NMIMS Mumbai · November 2025*
