# app/routers/analysis.py
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.services.finance import build_l9, compute_anom, compute_anova, bs_call, fetch_stock
import itertools

router = APIRouter(prefix="/api")


class RunRequest(BaseModel):
    ticker:       str
    T:            float
    r:            List[float]
    manualPrice:  float
    manualVol:    float


@router.post("/run")
def run_analysis(req: RunRequest):
    # 1. fetch live data
    live = fetch_stock(req.ticker)
    if live["ok"]:
        price = live["price"]
        vol   = live["vol"]
        msg   = f"Live data fetched for {req.ticker}.NS"
    else:
        price = req.manualPrice
        vol   = req.manualVol
        msg   = f"Live fetch failed — using manual values"

    vol_d = vol / 100

    # 2. build levels — r comes as % from sidebar, convert to decimal
    so_lvls = [round(price * 0.99, 3), round(price, 3), round(price * 1.01, 3)]
    k_lvls  = [
        int(round(round(price * 0.98 / 5) * 5)),
        int(round(round(price       / 5) * 5)),
        int(round(round(price * 1.02 / 5) * 5)),
    ]
    # Convert % to decimal for BS formula
    r_lvls  = [round(r / 100, 5) for r in req.r]
    sg_lvls = [round(vol_d * 0.90, 4), round(vol_d, 4), round(vol_d * 1.10, 4)]

    # 3. L9
    rows = build_l9(so_lvls, k_lvls, r_lvls, sg_lvls, req.T)

    # 4. stats
    anom  = compute_anom(rows)
    anova = compute_anova(rows)

    # 5. TRUE optimal — evaluate all 3^4 = 81 combinations, pick the best
    # This guarantees optimal always >= L9 max
    best_bs   = -1
    best_combo = (so_lvls[0], k_lvls[0], r_lvls[0], sg_lvls[0])
    for so, k, r, sg in itertools.product(so_lvls, k_lvls, r_lvls, sg_lvls):
        val = bs_call(so, k, r, sg, req.T)
        if val > best_bs:
            best_bs    = val
            best_combo = (so, k, r, sg)

    best_So, best_K, best_r, best_sg = best_combo
    opt_bs = round(best_bs, 5)

    return {
        "status":  msg,
        "price":   round(price, 2),
        "vol":     vol,
        "rows":    rows,
        "soLvls":  so_lvls,
        "kLvls":   k_lvls,
        "rLvls":   r_lvls,
        "sgLvls":  sg_lvls,
        "anom":    anom,
        "anova":   anova,
        "bestSo":  best_So,
        "bestK":   best_K,
        "bestR":   best_r,
        "bestSg":  best_sg,
        "optBS":   opt_bs,
    }


@router.get("/stocks")
def get_stocks():
    from app.services.stocks import NSE_STOCKS
    return NSE_STOCKS
