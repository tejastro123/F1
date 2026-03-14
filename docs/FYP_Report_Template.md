# FYP Technical Report: F1 2026 Season Tracker AI/ML Enhancement

## 1. Introduction
This project explores the intersection of probabilistic modeling and real-time sports analytics. By applying Bayesian inference frameworks—originally designed for nuclear decay modeling—to Formula 1 race predictions, we achieve a robust forecasting system.

## 2. System Architecture
The system follows a microservices architecture:
- **Express API Gateway**: Auth and session management.
- **FastAPI ML Inference**: Model serving (XGBoost + LightGBM).
- **LangChain NLP Service**: RAG-based knowledge retrieval.
- **OpenCV Vision Service**: Visual telemetry analysis.

## 3. Methodology
- **Predictive Modeling**: Ensemble learning with stacked generalization.
- **Explainability**: SHAP value distribution for model transparency.
- **Simulations**: Monte Carlo methods for championship forecasting.

## 4. Results & Evaluation
- **Model Accuracy**: [Insert AUC-ROC/F1 Results]
- **RAG Quality**: [Insert MRR/NDCG Results]
- **System Reliability**: 99.5% uptime SLA target.

## 5. Conclusion
The integration of advanced AI/ML techniques transforms the F1 tracking experience into a deep analytical platform suitable for high-level academic research.
