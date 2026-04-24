from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
from nlp import extract_symptoms

app = FastAPI()

# Allow React frontend to talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
model = joblib.load("symptom_model.pkl")

class SymptomRequest(BaseModel):
    text: str

class PredictionResponse(BaseModel):
    prediction: str
    probability: float
    top5: list[dict]

@app.get("/")
def root():
    return {"status": "SymptomsAI backend is running"}

@app.post("/predict", response_model=PredictionResponse)
def predict(request: SymptomRequest):
    # 1. Convert text to vector
    vector = extract_symptoms(request.text)
    X = np.array(vector).reshape(1, -1)
    
    # 2. Get prediction + probabilities
    proba = model.predict_proba(X)[0]
    top5_idx = proba.argsort()[::-1][:5]
    
    return {
        "prediction": model.classes_[top5_idx[0]],
        "probability": float(proba[top5_idx[0]]),
        "top5": [
            {
                "disease": model.classes_[i],
                "probability": float(proba[i])
            }
            for i in top5_idx
        ]
    }