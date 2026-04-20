import fastf1
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import os
from typing import Optional
import json

# Setup FastF1 Cache
CACHE_DIR = "f1_cache"
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)
fastf1.Cache.enable_cache(CACHE_DIR)

app = FastAPI(title="Pit Wall Pro - FastF1 Bridge")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, restrict this to your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "Pit Wall Pro Bridge Active", "provider": "FastF1"}

@app.get("/session")
def get_session_info(year: int, event: str, session_type: str):
    """
    Load session results and basic metadata.
    session_type: 'FP1', 'FP2', 'FP3', 'Q', 'S', 'SS', 'R'
    """
    try:
        session = fastf1.get_session(year, event, session_type)
        session.load(laps=True, telemetry=False, weather=False)
        
        results = session.results
        # Convert results to JSON serializable format
        clean_results = []
        for index, row in results.iterrows():
            clean_results.append({
                "position": int(row['Position']),
                "driver_number": row['DriverNumber'],
                "driver_code": row['Abbreviation'],
                "team": row['TeamName'],
                "status": row['Status'],
                "points": float(row['Points']),
                "full_name": row['FullName']
            })
            
        return {
            "session_name": session.event['EventName'],
            "location": session.event['Location'],
            "results": clean_results
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/telemetry")
def get_driver_telemetry(year: int, event: str, session_type: str, driver: str, lap_number: Optional[int] = None):
    """
    Get detailed car telemetry (Speed, RPM, Throttle, Brake, Gear) for a driver.
    If lap_number is None, it picks the fastest lap.
    """
    try:
        session = fastf1.get_session(year, event, session_type)
        session.load(laps=True, telemetry=True, weather=False)
        
        laps = session.laps.pick_driver(driver)
        if lap_number:
            target_lap = laps[laps['LapNumber'] == lap_number].iloc[0]
        else:
            target_lap = laps.pick_fastest()
            
        telemetry = target_lap.get_telemetry()
        
        # Select and format telemetry channels
        tel_data = {
            "time": telemetry['Time'].dt.total_seconds().tolist(),
            "speed": telemetry['Speed'].tolist(),
            "rpm": telemetry['RPM'].tolist(),
            "gear": telemetry['nGear'].tolist(),
            "throttle": telemetry['Throttle'].tolist(),
            "brake": telemetry['Brake'].tolist(),
            "drs": telemetry['DRS'].tolist(),
            "x": telemetry['X'].tolist(),
            "y": telemetry['Y'].tolist(),
            "z": telemetry['Z'].tolist()
        }
        
        return {
            "driver": driver,
            "lap_number": int(target_lap['LapNumber']),
            "lap_time": str(target_lap['LapTime']),
            "telemetry": tel_data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/comparison")
def compare_drivers(year: int, event: str, session_type: str, d1: str, d2: str):
    """
    Compare fastest laps of two drivers.
    """
    try:
        session = fastf1.get_session(year, event, session_type)
        session.load(laps=True, telemetry=True, weather=False)
        
        lap1 = session.laps.pick_driver(d1).pick_fastest()
        lap2 = session.laps.pick_driver(d2).pick_fastest()
        
        tel1 = lap1.get_telemetry().add_distance()
        tel2 = lap2.get_telemetry().add_distance()
        
        return {
            "d1": {
                "name": d1,
                "lap_time": str(lap1['LapTime']),
                "speed": tel1['Speed'].tolist(),
                "distance": tel1['Distance'].tolist()
            },
            "d2": {
                "name": d2,
                "lap_time": str(lap2['LapTime']),
                "speed": tel2['Speed'].tolist(),
                "distance": tel2['Distance'].tolist()
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/weather")
def get_weather(year: int, event: str, session_type: str):
    try:
        session = fastf1.get_session(year, event, session_type)
        session.load(laps=False, telemetry=False, weather=True)
        weather_data = session.weather_data.to_dict(orient="records")
        return weather_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
