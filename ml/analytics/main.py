from fastapi import FastAPI, Body
from scipy import stats
import pandas as pd
import numpy as np
from typing import List, Dict
from .community_intelligence import CommunityIntelligence

app = FastAPI(title="F1 Analytics Engine", version="1.0.0")
ci = CommunityIntelligence()

@app.post("/analytics/community/cluster")
async def cluster_users(predictions: List[Dict]):
    """
    Categorizes user prediction styles using K-Means.
    """
    df = pd.DataFrame(predictions)
    # Basic features: avg_grid of predicted winners and variance
    clusters = ci.cluster_users(df)
    return {"clusters": clusters.tolist()}
async def run_t_test(group1: List[float], group2: List[float]):
    """
    Performs a t-test on team performance data.
    """
    t_stat, p_val = stats.ttest_ind(group1, group2)
    return {
        "t_statistic": float(t_stat),
        "p_value": float(p_val),
        "significant": bool(p_val < 0.05)
    }

@app.post("/analytics/statistics/anova")
async def run_anova(groups: List[List[float]]):
    """
    Performs One-Way ANOVA on multiple team datasets.
    """
    f_stat, p_val = stats.f_oneway(*groups)
    return {
        "f_statistic": float(f_stat),
        "p_value": float(p_val),
        "significant": bool(p_val < 0.05)
    }

@app.post("/analytics/monte-carlo")
async def monte_carlo_sim(n_sims: int = 10000):
    """
    Runs a Monte Carlo simulation for championship outcomes.
    """
    drivers = ["verstappen", "hamilton", "leclerc", "norris"]
    # Mock simulation weights
    weights = [0.45, 0.15, 0.10, 0.30]
    results = np.random.choice(drivers, size=n_sims, p=weights)
    
    unique, counts = np.unique(results, return_counts=True)
    outcomes = {driver: int(count) for driver, count in zip(unique, counts)}
    
    return {
        "n_simulations": n_sims,
        "outcomes": outcomes,
        "prediction": max(outcomes, key=outcomes.get)
    }

@app.get("/analytics/standings-forecast")
async def standings_forecast():
    """
    Time-series decomposition for points trajectory.
    """
    # Mock data for points trajectory with confidence bands
    rounds = list(range(1, 25))
    forecast = [i * 15 + np.random.normal(0, 5) for i in rounds]
    upper = [f + 10 for f in forecast]
    lower = [f - 10 for f in forecast]
    
    return {
        "rounds": rounds,
        "forecast": forecast,
        "upper_bound": upper,
        "lower_bound": lower
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8005)
