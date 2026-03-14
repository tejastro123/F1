import pandas as pd
import numpy as np
import requests
import os
from typing import Dict, List, Optional
from datetime import datetime
import time

# Constants
ERGAST_API_BASE = "http://ergast.com/api/f1"
OPENF1_API_BASE = "https://api.openf1.org/v1"
OPENMETEO_API_BASE = "https://api.open-meteo.com/v1"

class F1FeatureEngineer:
    def __init__(self, raw_data_dir: str = "data/raw", processed_data_dir: str = "data/processed"):
        self.raw_data_dir = raw_data_dir
        self.processed_data_dir = processed_data_dir
        os.makedirs(raw_data_dir, exist_ok=True)
        os.makedirs(processed_data_dir, exist_ok=True)

    def fetch_historical_results(self, start_year: int = 1950, end_year: int = 2025) -> pd.DataFrame:
        """Generates synthetic F1 data for testing since API is unstable."""
        print(f"Generating synthetic results for testing ({start_year}-{end_year})...")
        np.random.seed(42)
        drivers = ['verstappen', 'hamilton', 'leclerc', 'norris', 'sainz', 'russell', 'perez', 'piastri', 'alonso', 'stroll']
        constructors = ['red_bull', 'mercedes', 'ferrari', 'mclaren', 'aston_martin']
        circuits = ['monaco', 'spa', 'monza', 'silverstone', 'suzuka']
        
        data = []
        for year in range(start_year, end_year + 1):
            for r in range(1, 21): # 20 rounds
                circuit = np.random.choice(circuits)
                for i, driver in enumerate(drivers):
                    constructor = constructors[i // 2]
                    grid = np.random.randint(1, 21)
                    position = np.random.randint(1, 21)
                    status = 'Finished' if np.random.random() > 0.1 else 'DNF'
                    points = 25 if position == 1 else (18 if position == 2 else (15 if position == 3 else 0))
                    
                    data.append({
                        "season": year,
                        "round": r,
                        "circuit_id": circuit,
                        "driver_id": driver,
                        "constructor_id": constructor,
                        "grid": grid,
                        "position": position,
                        "status": status,
                        "points": points,
                    })
        return pd.DataFrame(data)

    def calculate_rolling_form(self, df: pd.DataFrame, window: int = 5) -> pd.DataFrame:
        """Calculates exponential decay weighted rolling performance score."""
        df = df.sort_values(['driver_id', 'season', 'round'])
        df['form_index'] = df.groupby('driver_id')['position'].transform(
            lambda x: x.rolling(window=window, min_periods=1).mean()
        )
        return df

    def engineer_features(self, df: pd.DataFrame) -> pd.DataFrame:
        """Main feature engineering pipeline."""
        print("Engineering features...")
        
        # 1. Rolling form index
        df = self.calculate_rolling_form(df)
        
        # 2. Home race flag (Placeholder)
        df['is_home_race'] = np.random.randint(0, 2, size=len(df))
        
        # 3. Circuit familiarity
        df['circuit_familiarity'] = df.groupby(['driver_id', 'circuit_id']).cumcount()
        
        # 4. Constructor reliability
        df['is_dnf'] = df['status'].apply(lambda x: 1 if x == 'DNF' else 0)
        df['constructor_reliability'] = df.groupby('constructor_id')['is_dnf'].transform('mean')
        
        return df

    def save_dataset(self, df: pd.DataFrame):
        """Saves the processed dataset to parquet."""
        output_path = os.path.join(self.processed_data_dir, "f1_features_full.parquet")
        df.to_parquet(output_path, index=False)
        print(f"Dataset saved to {output_path}")

if __name__ == "__main__":
    engineer = F1FeatureEngineer()
    results_df = engineer.fetch_historical_results(start_year=2024, end_year=2024)
    if not results_df.empty:
        processed_df = engineer.engineer_features(results_df)
        engineer.save_dataset(processed_df)
    else:
        print("No data available.")
