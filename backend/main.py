from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from engine import get_strategic_forecast, get_year_factors

app = FastAPI()

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/forecast/{country}")
def read_forecast(country: str, horizon: int = 25):
    # We default to 25 years to reach 2050
    return get_strategic_forecast(country, horizon)

@app.get("/api/factors/{country}/{year}")
def read_factors(country: str, year: int):
    return get_year_factors(country, year)