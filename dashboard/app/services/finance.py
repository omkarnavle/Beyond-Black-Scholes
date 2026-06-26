# app/services/finance.py
import numpy as np
from scipy.stats import norm
from typing import List, Dict, Any


# ── Black-Scholes ─────────────────────────────────────────────────────────────

def bs_call(S: float, K: float, r: float, sigma: float, T: float) -> float:
    if T <= 0:
        return max(S - K, 0.0)
    d1 = (np.log(S / K) + (r + 0.5 * sigma**2) * T) / (sigma * np.sqrt(T))
    d2 = d1 - sigma * np.sqrt(T)
    return float(S * norm.cdf(d1) - K * np.exp(-r * T) * norm.cdf(d2))


# ── Taguchi L9 (original pattern) ────────────────────────────────────────────

def build_l9(So: List, K: List, r: List, sg: List, T: float) -> List[Dict]:
    so_arr = [So[0],So[0],So[0], So[1],So[1],So[1], So[2],So[2],So[2]]
    k_arr  = [K[0], K[1], K[2],  K[0], K[1], K[2],  K[0], K[1], K[2]]
    r_arr  = [r[0], r[1], r[2],  r[1], r[2], r[0],  r[2], r[0], r[1]]
    sg_arr = [sg[0],sg[1],sg[2], sg[2],sg[0],sg[1], sg[1],sg[2],sg[0]]

    rows = []
    for i in range(9):
        rows.append({
            "trial": i + 1,
            "So":    round(so_arr[i], 3),
            "K":     round(k_arr[i],  2),
            "r":     round(r_arr[i],  4),
            "sigma": round(sg_arr[i], 4),
            "BS":    round(bs_call(so_arr[i], k_arr[i], r_arr[i], sg_arr[i], T), 5),
        })
    return rows


# ── ANOM ──────────────────────────────────────────────────────────────────────

def compute_anom(rows: List[Dict]) -> Dict:
    factors = ["So", "K", "r", "sigma"]
    result  = {}
    for f in factors:
        lvls  = sorted(set(r[f] for r in rows))
        means = []
        sns   = []
        for lv in lvls:
            vals = [r["BS"] for r in rows if r[f] == lv]
            m    = sum(vals) / len(vals)
            sn   = -10 * np.log10(sum(1/v**2 for v in vals) / len(vals))
            means.append(round(m, 4))
            sns.append(round(float(sn), 6))
        result[f] = {
            "lvls":       lvls,
            "means":      means,
            "snRatios":   sns,
            "deltaMean":  round(max(means) - min(means), 4),
            "deltaSN":    round(max(sns)   - min(sns),   6),
            "bestMean":   lvls[means.index(max(means))],
            "bestSN":     lvls[sns.index(max(sns))],
        }
    return result


# ── ANOVA (Type II SS) ────────────────────────────────────────────────────────

def compute_anova(rows: List[Dict]) -> Dict:
    import statsmodels.formula.api as smf
    from statsmodels.stats.anova import anova_lm
    import pandas as pd

    df    = pd.DataFrame(rows)
    model = smf.ols("BS ~ So + K + r + sigma", data=df).fit()
    tbl   = anova_lm(model, typ=2)
    ss_total = tbl["sum_sq"].sum()

    factors = ["So", "K", "r", "sigma"]
    pct     = {f: round(float(tbl.loc[f, "sum_sq"] / ss_total * 100), 3) for f in factors}
    pct["Residual"] = round(float(tbl.loc["Residual", "sum_sq"] / ss_total * 100), 3)

    params = model.params
    coeffs = {f: round(float(params[f]), 6) for f in factors}

    resid   = [round(float(v), 5) for v in model.resid]
    fitted  = [round(float(v), 5) for v in model.fittedvalues]
    r2      = round(float(model.rsquared), 6)
    r2_adj  = round(float(model.rsquared_adj), 6)
    fstat   = round(float(model.fvalue), 3)
    fpval   = round(float(model.f_pvalue), 6)
    intercept = round(float(params["Intercept"]), 4)

    return {
        "pct": pct, "coeffs": coeffs, "intercept": intercept,
        "residuals": resid, "fitted": fitted,
        "r2": r2, "r2_adj": r2_adj, "fstat": fstat, "fpval": fpval,
    }


# ── Stock data ─────────────────────────────────────────────────────────────────

def fetch_stock(symbol: str):
    import yfinance as yf
    try:
        tk    = yf.Ticker(symbol + ".NS")
        price = tk.fast_info.last_price
        hist  = tk.history(period="1y")
        if hist.empty or len(hist) < 10:
            raise ValueError("insufficient data")
        lr  = np.log(hist["Close"] / hist["Close"].shift(1)).dropna()
        vol = round(float(lr.std() * np.sqrt(252) * 100), 2)
        return {"price": price, "vol": vol, "ok": True}
    except Exception as e:
        return {"price": None, "vol": None, "ok": False, "error": str(e)}
