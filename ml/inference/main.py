from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import json
import numpy as np
import pandas as pd
import os
from typing import Dict, List, Optional

app = FastAPI(title="F1 ML Inference API", version="2.0.0")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = "ml/inference/models"

# State to hold models
models = {}

@app.on_event("startup")
async def load_models():
    try:
        models["xgb"] = joblib.load(os.path.join(MODELS_DIR, 'xgb_winner.pkl'))
        models["lgbm"] = joblib.load(os.path.join(MODELS_DIR, 'lgbm_podium.pkl'))
        models["ensemble"] = joblib.load(os.path.join(MODELS_DIR, 'ensemble_stacker.pkl'))
        with open(os.path.join(MODELS_DIR, 'feature_cols.json'), 'r') as f:
            models["feature_cols"] = json.load(f)
        print("Models loaded successfully.")
    except Exception as e:
        print(f"Error loading models: {e}")

class RacePredictionRequest(BaseModel):
    round: int
    circuit_id: str
    drivers: List[Dict] # Expect list of {driver_id: str, grid: int, ...}

def build_feature_matrix(drivers: List[Dict], feature_cols: List[str]) -> pd.DataFrame:
    # This is a simplified version. In real use, it should match the training pipeline.
    data = []
    for d in drivers:
        data.append({
            'grid': d.get('grid', 20),
            'form_index': d.get('form_index', 10),
            'is_home_race': d.get('is_home_race', 0),
            'circuit_familiarity': d.get('circuit_familiarity', 5),
            'constructor_reliability': d.get('constructor_reliability', 0.1)
        })
    return pd.DataFrame(data)[feature_cols]

@app.get("/model/health")
async def health():
    return {"status": "ready", "models_loaded": list(models.keys())}

@app.post("/predict/race-winner")
async def predict_winner(req: RacePredictionRequest):
    if "ensemble" not in models:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    df = build_feature_matrix(req.drivers, models["feature_cols"])
    # Predict probabilities for class 1 (Podium/Winner)
    probs = models["ensemble"].predict_proba(df)[:, 1]
    
    # Normalize to sum to 1 for "Winner" interpretation if needed, 
    # but here we return raw probabilities for each driver.
    results = {}
    for i, d in enumerate(req.drivers):
        results[d['driver_id']] = float(probs[i])
        
    return results

@app.post("/predict/podium")
async def predict_podium(req: RacePredictionRequest):
    if "lgbm" not in models:
        raise HTTPException(status_code=503, detail="Models not loaded")
    
    df = build_feature_matrix(req.drivers, models["feature_cols"])
    probs = models["lgbm"].predict_proba(df)[:, 1]
    
    results = {}
    for i, d in enumerate(req.drivers):
        results[d['driver_id']] = float(probs[i])
        
    return results

@app.post("/predict/points")
async def predict_points(req: RacePredictionRequest):
    if "bayesian" not in models:
        # Load it if not in dict (just in case)
        models["bayesian"] = joblib.load(os.path.join(MODELS_DIR, 'bayesian_points.pkl'))
    
    df = build_feature_matrix(req.drivers, models["feature_cols"])
    preds = models["bayesian"].predict(df)
    
    return {d['driver_id']: float(p) for d, p in zip(req.drivers, preds)}

@app.post("/predict/safety-car")
async def predict_safety_car(req: RacePredictionRequest):
    # Mock probability score + binary
    prob = np.random.uniform(0.1, 0.6)
    return {
        "probability": float(prob),
        "deployment_likely": bool(prob > 0.5)
    }

@app.get("/model/shap/{driver_id}")
async def get_shap_explanation(driver_id: str):
    # Mock SHAP values for the dashboard
    features = models["feature_cols"]
    values = np.random.uniform(-0.5, 0.5, len(features))
    return {
        "driver_id": driver_id,
        "shap_values": {f: float(v) for f, v in zip(features, values)},
        "base_value": 0.25
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
