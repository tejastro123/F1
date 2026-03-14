from sklearn.cluster import KMeans
import pandas as pd
import numpy as np

class CommunityIntelligence:
    def __init__(self, data_path: str = "data/processed/f1_features_full.parquet"):
        self.data_path = data_path

    def cluster_users(self, user_predictions: pd.DataFrame):
        """
        K-Means clustering on prediction patterns to identify archetypes:
        risk taker / safe player / contrarian.
        """
        # Feature: average grid position of predicted winners, variance of predictions
        kmeans = KMeans(n_clusters=3, random_state=42)
        clusters = kmeans.fit_predict(user_predictions[['avg_grid', 'pred_variance']])
        return clusters

    def collaborative_filtering(self, user_id: str, predictions_df: pd.DataFrame):
        """
        'Users like you also predicted X' recommendation engine.
        Using basic item-based similarity.
        """
        # Placeholder for recommendation logic
        return ["verstappen", "norris"]

    def anomaly_detection(self, predictions: pd.DataFrame):
        """
        Flag statistically unusual predictions for bonus point opportunities.
        """
        # Z-score based anomaly detection
        z_scores = (predictions['prob'] - predictions['prob'].mean()) / predictions['prob'].std()
        return predictions[abs(z_scores) > 3]

if __name__ == "__main__":
    # Integration logic for analytics engine
    print("Community Intelligence module ready.")
