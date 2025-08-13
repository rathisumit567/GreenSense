from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import logging
import os
from typing import Optional

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Energy Prediction API", version="1.0.0")

# Configure CORS - Update this with your actual frontend URL in production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development. In production use: ["https://yourdomain.com"]
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Pydantic model for request validation
class EnergyFeatures(BaseModel):
    Hour: int
    Month: int
    DayofWeek: int
    Kitchen_Efficiency: float
    Laundry_Efficiency: float
    Climate_Efficiency: float

class PredictionResponse(BaseModel):
    prediction: float
    status: str
    message: str

# Global variable to store the model
model = None

@app.on_event("startup")
async def load_model():
    """Load the model on startup"""
    global model
    try:
        # Check if model file exists
        model_path = 'rf_model_compressed.pkl'
        if not os.path.exists(model_path):
            logger.error(f"Model file not found: {model_path}")
            return
        
        logger.info(f"Loading model from {model_path}")
        logger.info(f"Model file size: {os.path.getsize(model_path) / (1024*1024):.2f} MB")
        
        # Try different loading methods
        try:
            model = joblib.load(model_path)
            logger.info("Model loaded successfully with joblib")
        except Exception as e:
            logger.warning(f"Joblib failed: {e}, trying pickle...")
            # Fallback for older scikit-learn versions
            import pickle
            with open(model_path, 'rb') as f:
                model = pickle.load(f)
            logger.info("Model loaded successfully with pickle")
        
        logger.info(f"Model type: {type(model)}")
        
        # Test prediction to ensure model works
        test_features = np.array([[12, 6, 1, 0.8, 0.7, 0.75]])
        test_pred = model.predict(test_features)[0]
        logger.info(f"Test prediction successful: {test_pred}")
        
    except Exception as e:
        logger.error(f"Failed to load model: {str(e)}")
        model = None

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Energy Prediction API",
        "status": "running",
        "model_loaded": model is not None
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "api_version": "1.0.0"
    }

@app.post("/predict", response_model=PredictionResponse)
async def predict_energy(features: EnergyFeatures):
    """Predict energy consumption based on input features"""
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Validate input ranges
        if not (0 <= features.Hour <= 23):
            raise HTTPException(status_code=400, detail="Hour must be between 0-23")
        if not (1 <= features.Month <= 12):
            raise HTTPException(status_code=400, detail="Month must be between 1-12")
        if not (0 <= features.DayofWeek <= 6):
            raise HTTPException(status_code=400, detail="DayofWeek must be between 0-6")
        if not (0.0 <= features.Kitchen_Efficiency <= 1.0):
            raise HTTPException(status_code=400, detail="Kitchen_Efficiency must be between 0.0-1.0")
        if not (0.0 <= features.Laundry_Efficiency <= 1.0):
            raise HTTPException(status_code=400, detail="Laundry_Efficiency must be between 0.0-1.0")
        if not (0.0 <= features.Climate_Efficiency <= 1.0):
            raise HTTPException(status_code=400, detail="Climate_Efficiency must be between 0.0-1.0")
        
        # Convert features to array matching your model's expected input
        feature_array = np.array([[
            features.Hour,
            features.Month,
            features.DayofWeek,
            features.Kitchen_Efficiency,
            features.Laundry_Efficiency,
            features.Climate_Efficiency
        ]])
        
        logger.info(f"Making prediction with features: {feature_array[0]}")
        
        # Make prediction
        prediction = model.predict(feature_array)[0]
        
        # Ensure prediction is reasonable (positive energy consumption)
        prediction = max(0.1, float(prediction))
        
        logger.info(f"Prediction result: {prediction}")
        
        return PredictionResponse(
            prediction=prediction,
            status="success",
            message="Prediction completed successfully"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

@app.post("/batch_predict")
async def batch_predict(features_list: list[EnergyFeatures]):
    """Predict energy consumption for multiple feature sets"""
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        predictions = []
        
        for features in features_list:
            feature_array = np.array([[
                features.Hour,
                features.Month,
                features.DayofWeek,
                features.Kitchen_Efficiency,
                features.Laundry_Efficiency,
                features.Climate_Efficiency
            ]])
            
            prediction = model.predict(feature_array)[0]
            prediction = max(0.1, float(prediction))
            predictions.append(prediction)
        
        return {
            "predictions": predictions,
            "status": "success",
            "count": len(predictions)
        }
        
    except Exception as e:
        logger.error(f"Batch prediction error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Batch prediction failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)