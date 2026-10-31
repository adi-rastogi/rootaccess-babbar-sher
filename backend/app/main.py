"""
POLLUTIONMITRA — FastAPI Environmental Intelligence Backend
Modular REST & WebSocket API Architecture
"""

from fastapi import FastAPI, Depends, HTTPException, Query, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import os

app = FastAPI(
    title="PollutionMitra API",
    description="Air Quality, Street by Street — Environmental Intelligence API",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://localhost:3000").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health endpoint
@app.get("/api/health", tags=["Health"])
async def health_check():
    return {
        "status": "operational",
        "service": "PollutionMitra Backend",
        "version": "1.0.0",
        "database": "configured",
        "mqtt": "ready",
        "quality_label": "DEMO",
    }

# Environmental Data Models
class EnvironmentalReading(BaseModel):
    sensor_id: str
    neighborhood: str
    latitude: float
    longitude: float
    pm25: float
    pm10: float
    aqi: int
    temperature: float
    humidity: float
    quality_label: str  # MEASURED | ESTIMATED | PREDICTED | SIMULATED | DEMO
    timestamp: str

@app.get("/api/environment/overview", tags=["Environmental Data"])
async def get_overview():
    return {
        "overall_status": "active",
        "data_quality": "DEMO",
        "active_neighborhoods": 8,
        "monitored_sensors": 8,
        "primary_innovations": [
            "Wind-Aware Pollution Flow Mapping",
            "Smart Sensor Network and Critical-Zone Identification"
        ]
    }

@app.get("/api/sensors", tags=["Sensors"])
async def get_sensors(status: Optional[str] = None):
    # Returns sensor array from database/cache
    return {
        "count": 8,
        "source": "DEMO/SIMULATED",
        "note": "Connects to PostgreSQL/PostGIS in full-stack deployment"
    }

@app.post("/api/simulation/run", tags=["Simulator"])
async def run_scenario(wind_speed: float, temperature: float, traffic: str):
    return {
        "status": "completed",
        "model_type": "EDUCATIONAL_SIMULATION",
        "disclaimer": "Not a validated physical dispersion model"
    }

@app.post("/api/ai/chat", tags=["AI Copilot"])
async def copilot_chat(query: str):
    return {
        "query": query,
        "mode": "deterministic_fallback",
        "quality_label": "DEMO"
    }

