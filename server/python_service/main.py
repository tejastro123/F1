import os
import wikipedia
import fastf1
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional

# Enable FastF1 Cache
CACHE_DIR = os.path.join(os.path.dirname(__file__), '..', 'tmp', 'fastf1_cache')
os.makedirs(CACHE_DIR, exist_ok=True)
fastf1.Cache.enable_cache(CACHE_DIR)

app = FastAPI(title="F1 2026 Sync Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class WikiRequest(BaseModel):
    query: str
    type: str # 'driver', 'team', or 'track'

@app.get("/api/sync/schedule")
def get_schedule(year: int = 2025):
    try:
        # We fetch 2024 or 2025 since 2026 might not be available in fastf1 until late 2025/2026
        # FastF1 returns a pandas dataframe for the schedule
        schedule = fastf1.get_event_schedule(year)
        # Filter out testing, keep only races (EventFormat != 'testing' and EventDate isn't null)
        races = schedule[schedule['EventFormat'] != 'testing']
        
        results = []
        for index, row in races.iterrows():
            results.append({
                "round": row["RoundNumber"],
                "grandPrixName": row["EventName"],
                "venue": row["Location"],
                "country": row["Country"],
                "date": row["EventDate"].isoformat() if not pd.isnull(row["EventDate"]) else None
            })
        return {"status": "success", "year": year, "schedule": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sync/results")
def get_results(year: int = 2025, round: int = 1):
    try:
        session = fastf1.get_session(year, round, 'R')
        session.load(telemetry=False, weather=False, messages=False)
        
        results_df = session.results
        top10 = []
        for index, row in results_df.iterrows():
            if len(top10) < 10:
                top10.append(row['FullName'])
        
        # Optionally get sprint results if there's a sprint
        sprint_top8 = []
        try:
            sprint_session = fastf1.get_session(year, round, 'S')
            sprint_session.load(telemetry=False, weather=False, messages=False)
            sprint_df = sprint_session.results
            for index, row in sprint_df.iterrows():
                if len(sprint_top8) < 8:
                    sprint_top8.append(row['FullName'])
        except Exception:
            pass # No sprint
            
        return {
            "status": "success", 
            "year": year, 
            "round": round, 
            "resultsTop10": top10,
            "sprintTop8": sprint_top8
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sync/wikipedia")
def fetch_wikipedia_info(req: WikiRequest):
    try:
        # Graceful degradation logic: return partial info to avoid breaking the Node sync
        search_results = wikipedia.search(req.query, results=1)
        if not search_results:
            return {"status": "ignored", "message": f"No wikipedia page found for {req.query}", "data": {}}
        
        page = wikipedia.page(search_results[0], auto_suggest=False)
        summary = page.summary
        
        # Limit summary length
        if len(summary) > 500:
            summary = summary[:497] + "..."
            
        # For tracks, maybe extract more info if available, but Wikipedia lib is limited.
        # We'll just return the summary for now to display the requested info
        
        return {
            "status": "success",
            "data": {
                "description": summary,
                "url": page.url,
                "title": page.title
            }
        }
    except wikipedia.exceptions.DisambiguationError as e:
        # Take the first option
        try:
            page = wikipedia.page(e.options[0], auto_suggest=False)
            return {
                "status": "success",
                "data": {
                    "description": page.summary[:500] + "..." if len(page.summary) > 500 else page.summary,
                    "url": page.url,
                    "title": page.title
                }
            }
        except:
            return {"status": "ignored", "message": "Disambiguation failed", "data": {}}
    except Exception as e:
        return {"status": "ignored", "message": f"Wikipedia scraping error: {str(e)}", "data": {}}
