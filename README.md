# 📈 Beyond Black-Scholes

> **Applying Taguchi L9 Orthogonal Array Design to European Call Option Pricing**
> **on Indian Stock Market Data (HDFC Bank · NSE)**

---

## 📌 Project Overview

This repository contains the complete research submission for the **Statistics Project**
as part of the **M.Sc. Statistics and Data Science** programme at **SVKM's NMIMS University, Mumbai**.

| Detail | Value |
|---|---|
| Group | Group 1 |
| Members | Eashal D'britto (A014) · Samiksha Kabra (A023) · Omkar Navle (A037) · Liz Rodrigues (A050) · Mohammed Aamir Vahedna (A061) |
| Programme | M.Sc. Statistics and Data Science · Semester 1 · 2025–2026 |
| Mentor | Dr. Pradnya Khandeparkar |
| RT Professor | Mr. Vaibhav Vasundekar |
| Institution | Nilkamal School of Mathematics, Applied Statistics & Analytics, NMIMS Mumbai |
| Software | Python · R · FastAPI · Excel · Minitab |
| Data Source | [NSE India](https://www.nseindia.com/) — HDFC Bank (HDFCBANK.NS) |

---

## 🖥️ Live Dashboard Preview

![Dashboard Preview](assets/images/dashboard_preview.png)

An interactive FastAPI dashboard that fetches **live NSE stock prices**, constructs the **Taguchi L9 design in real time**, computes **Black-Scholes call option values**, and presents full statistical analysis across five tabs: **L9 Design · ANOVA · ANOM · S/N Ratio · Optimal**.

---

## 📂 Repository Structure

```
beyond-black-scholes/
│
├── dashboard/                        ← FastAPI web application
│   ├── app/
│   │   ├── main.py                   ← FastAPI entry point
│   │   ├── routers/
│   │   │   └── analysis.py           ← API routes for analysis
│   │   └── services/
│   │       ├── finance.py            ← Black-Scholes + Taguchi logic
│   │       └── stocks.py             ← Live NSE data via yfinance
│   ├── static/
│   │   ├── css/main.css              ← Premium dark-green dashboard theme
│   │   ├── js/                       ← Chart rendering, panel logic, UI
│   │   └── img/                      ← NMIMS logo assets
│   ├── templates/index.html          ← Single-page dashboard template
│   ├── requirements.txt
│   └── run.py                        ← Launch script
│
├── analysis/
│   ├── python/
│   │   ├── regression_anova_diagnostics.py   ← OLS regression + ANOVA + residual plots
│   │   └── anova_anom.py                     ← ANOVA percentage contribution + ANOM table
│   └── r/
│       ├── sn_ratio_1week.Rmd        ← S/N ratio analysis · T = 1 week
│       ├── sn_ratio_1month.Rmd       ← S/N ratio analysis · T = 1 month
│       └── sn_ratio_3month.Rmd       ← S/N ratio analysis · T = 3 months
│
├── report/
│   ├── GROUP_1_REPORT.pdf            ← Full written research report
│   └── GROUP_1_PPT.pptx              ← Presentation slides
│
├── assets/
│   └── images/
│       └── dashboard_preview.png
│
├── .gitignore
└── README.md
```

---

## 🧪 Research Design

### The Core Idea

The **Black-Scholes Model (BSM)** prices European call options using four parameters:

| Symbol | Parameter | Role |
|---|---|---|
| S₀ | Underlying asset price | Independent variable |
| K | Strike price | Independent variable |
| r | Risk-free interest rate | Independent variable |
| σ | Volatility | Independent variable |
| C | Call option value | **Response variable (BS)** |

A full factorial experiment with 4 factors × 3 levels would require **81 trials**.
The **Taguchi L9 (3⁴) orthogonal array** reduces this to just **9 balanced trials** — preserving analytical integrity while saving 89% of the experimental effort.

### L9 Orthogonal Array Structure

| Trial | S₀ (A) | K (B) | r (C) | σ (D) |
|---|---|---|---|---|
| 1 | 1 | 1 | 1 | 1 |
| 2 | 1 | 2 | 2 | 2 |
| 3 | 1 | 3 | 3 | 3 |
| 4 | 2 | 1 | 2 | 3 |
| 5 | 2 | 2 | 3 | 1 |
| 6 | 2 | 3 | 1 | 2 |
| 7 | 3 | 1 | 3 | 2 |
| 8 | 3 | 2 | 1 | 3 |
| 9 | 3 | 3 | 2 | 1 |

### Time Periods Analysed

Three independent datasets were constructed — one per maturity:

| Period | T (years) | S₀ Range | K Range | r Range | σ Range | BS Range |
|---|---|---|---|---|---|---|
| 1 Week | 1/52 | 974–994 | 965–1005 | 0.045–0.065 | 0.15–0.25 | 3.73–32.14 |
| 1 Month | 1/12 | 974–994 | 965–1005 | 0.045–0.065 | 0.15–0.25 | 14.13–43.55 |
| 3 Months | 3/12 | 974–994 | 965–1005 | 0.045–0.065 | 0.15–0.25 | 30.85–65.78 |

---

## 📊 Statistical Methods

### 1. Black-Scholes Formula

```
C = S₀·N(d₁) − K·e^(−rT)·N(d₂)

d₁ = [ln(S₀/K) + (r + 0.5σ²)T] / (σ√T)
d₂ = d₁ − σ√T
```

### 2. ANOVA (Analysis of Variance) — Type II

Quantifies the **percentage contribution** of each factor to total variation in call option price.

| Factor | 1 Week % | 1 Month % | 3 Month % |
|---|---|---|---|
| S₀ (Stock Price) | 18.2% | 16.4% | 12.9% |
| K (Strike Price) | 69.2% | 61.3% | 45.9% |
| r (Risk-free Rate) | 0.9% | 0.6% | 1.1% |
| σ (Volatility) | 9.2% | 21.2% | 39.9% |
| Residual | 2.5% | 0.6% | 0.2% |

> **K dominates at short maturities. σ grows in importance as maturity increases.**

### 3. ANOM (Analysis of Means)

Identifies which **factor level** produces the highest mean BS value.
Factor rankings by Delta (max level mean − min level mean):

| Period | Rank 1 | Rank 2 | Rank 3 | Rank 4 |
|---|---|---|---|---|
| 1 Week | K | S₀ | σ | r |
| 1 Month | K | S₀ | σ | r |
| 3 Month | K | σ | S₀ | r |

### 4. S/N Ratio — Larger-the-Better

```
S/N = −10 · log₁₀(1/n · Σ(1/yᵢ²))
```

Identifies **robust** parameter settings where BS value is both high and stable.
K shows a consistent **downward** S/N trend (higher K → lower robustness).
S₀ and σ show **upward** trends across all three time periods.

### 5. Regression Model

```
Call = a + b₁·S + b₂·K + b₃·r + b₄·σ
```

| Period | R² | Adj. R² | F-statistic |
|---|---|---|---|
| 1 Week | 0.975 | 0.950 | 38.86 |
| 1 Month | 0.994 | 0.987 | 154.7 |
| 3 Months | 0.998 | 0.996 | 470.7 |

---

## 🏆 Optimal Parameter Combinations

The optimal combination (highest BS value and highest S/N ratio) identified across all three periods:

| Period | S₀ | K | r | σ | Predicted BS |
|---|---|---|---|---|---|
| 1 Week | 994.143 (L3) | 965 (L1) | 0.045 (L1) | 0.25 (L3) | ~32.14 |
| 1 Month | 994.143 (L3) | 965 (L1) | 0.065 (L3) | 0.25 (L3) | **48.35** |
| 3 Months | 994.143 (L3) | 965 (L1) | 0.065 (L3) | 0.25 (L3) | ~65.78 |

> Across all periods: **S₀ at Level 3, K at Level 1** is consistently optimal — high underlying price + low strike price maximises intrinsic call option value.

---

## 🖥️ Running the Dashboard

### Prerequisites

- Python 3.9+
- Internet connection (for live NSE price fetching)

### Installation

```bash
git clone https://github.com/your-username/beyond-black-scholes.git
cd beyond-black-scholes/dashboard
pip install -r requirements.txt
python run.py
```

Then open your browser at **http://localhost:8000**

### Dashboard Tabs

| Tab | What it shows |
|---|---|
| **L9 Design** | The 9-trial orthogonal array with live BS prices |
| **ANOVA** | Sum of squares, F-statistic, % contribution per factor |
| **ANOM** | Mean BS at each factor level, Delta rankings |
| **S/N Ratio** | Larger-the-better S/N values and factor rankings |
| **Optimal** | Consolidated ranking, optimal combination, predicted BS |

---

## 🔬 Running the Python Analysis Scripts

```bash
cd analysis/python

# Regression + ANOVA + residual diagnostic plots
python regression_anova_diagnostics.py

# ANOVA percentage contribution + ANOM table
python anova_anom.py
```

> **Note:** Update the `file_path` variable in each script to point to your local Excel data file.

---

## 📊 Running the R Scripts (S/N Ratio Analysis)

```r
# Install required packages
install.packages(c("DoE.base", "ggplot2"))

# Open in RStudio and knit to Word
# analysis/r/sn_ratio_1week.Rmd
# analysis/r/sn_ratio_1month.Rmd
# analysis/r/sn_ratio_3month.Rmd
```

---

## 📦 Python Packages Used

| Package | Purpose |
|---|---|
| `fastapi` | Web framework for the dashboard |
| `uvicorn` | ASGI server |
| `yfinance` | Live NSE stock price fetching |
| `numpy` | Numerical computation |
| `scipy` | Normal CDF for Black-Scholes |
| `statsmodels` | OLS regression + ANOVA |
| `pandas` | Data manipulation |
| `jinja2` | HTML templating |

---

## 📦 R Packages Used

| Package | Purpose |
|---|---|
| `DoE.base` | Taguchi orthogonal array construction |
| `ggplot2` | Main effects plots for S/N ratio |

---

## 📄 Report & Presentation

Full written report and presentation slides are available in the `report/` folder:

📋 [`GROUP_1_REPORT.pdf`](report/GROUP_1_REPORT.pdf)

📊 [`GROUP_1_PPT.pptx`](report/GROUP_1_PPT.pptx)

---

## 🔍 Key Findings

1. **Strike Price (K) is the dominant factor** — contributing 45–69% of variation across all maturities via ANOVA, and ranking #1 in both ANOM and S/N ratio analyses.

2. **Volatility (σ) grows in importance over time** — its ANOVA contribution rises from 9% (1 week) to 40% (3 months), reflecting increasing time-value sensitivity at longer maturities.

3. **Risk-free rate (r) has minimal influence** — consistently ranked last with under 1.1% ANOVA contribution and near-flat S/N ratio trends across all periods.

4. **Option value increases with maturity** — median BS values rise from ~14–32 (1 week) to ~31–66 (3 months), confirming the time-value effect.

5. **The optimal combination is robust** — S₀₃–K₁–σ₃ is optimal in all three periods, producing the highest BS value and S/N ratio simultaneously.

---

## 🔮 Future Scope

- **L27 Array** — more degrees of freedom, valid error estimation, proper F-tests
- **Monte Carlo Simulation** — stochastic analysis of BS price distributions
- **Greeks Dashboard** — Delta, Gamma, Vega, Theta as additional KPI metrics
- **Put Options** — extend analysis to puts and put-call parity validation
- **Multi-stock Portfolio** — run Taguchi analysis across multiple NSE stocks simultaneously
- **Machine Learning Integration** — ML-based parameter prediction and anomaly detection

---

## 🔗 References

1. Black, F., & Scholes, M. (1973). The pricing of options and corporate liabilities. *Journal of Political Economy*, 81(3), 637–654.
2. Merton, R. C. (1974). On the pricing of corporate debt. *Journal of Finance*, 29(2), 449–470.
3. Hull, J. C. (2016). *Options, Futures, and Other Derivatives* (9th ed.). Pearson.
4. Phadke, M. S. (1989). *Quality Engineering Using Robust Design*. Prentice Hall.
5. Roy, R. K. (2001). *Design of Experiments Using the Taguchi Approach*. Wiley.
6. Dar, A. A., & Anuradha, N. (2018). An application of Taguchi L9 method in Black-Scholes model for European call option. *International Journal of Entrepreneurship*, 22(1), 117–127.
7. NSE India — Live Market Data: https://www.nseindia.com/

---

## 📜 Licence

Submitted as academic coursework for the M.Sc. Statistics and Data Science programme at NMIMS Mumbai, 2025–2026.
Data sourced from NSE India under public market data terms.
Code, analysis, and report content are original work by Group 1.

---

*Built with Python · R · FastAPI · NMIMS Mumbai · November 2025*
