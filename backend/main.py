from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from engine import get_strategic_forecast, get_year_factors, get_ai_chat_response

# 1. Initialize FastAPI
app = FastAPI(
    title="Strategic AI OS - Backend",
    description="Decade-scale GDP forecasting engine powered by Prophet and Gemini 3 Pro."
)

# 2. PROD-READY CORS CONFIGURATION
# This is crucial for Vercel to communicate with Render
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allows your Vercel URL to access the API
    allow_credentials=True,
    allow_methods=["*"], # Allows GET, POST, OPTIONS, etc.
    allow_headers=["*"], # Allows all headers
)

# --- ENDPOINTS ---

@app.get("/")
def read_root():
    return {"message": "Strategic AI Engine is Operational."}

# GDP FORECAST ENDPOINT
@app.get("/api/forecast/{country}")
def read_forecast(country: str, horizon: int = 25):
    """Returns truth-anchored historical data and AI projections up to 2050."""
    return get_strategic_forecast(country, horizon)

# EXPENDITURE PILLARS ENDPOINT
@app.get("/api/factors/{country}/{year}")
def read_factors(country: str, year: int):
    """Returns the C+I+G+NX breakdown for a specific country and year."""
    return get_year_factors(country, year)

# GEMINI 3 PRO CHAT ENDPOINT
@app.post("/api/chat")
async def chat_with_ai(request: Request):
    """Processes natural language queries via Gemini 3 Pro."""
    try:
        body = await request.json()
        user_message = body.get("message", "")
        
        if not user_message:
            return {"response": "System message: No input detected."}
            
        # Call the Gemini logic in engine.py
        response = get_ai_chat_response(user_message)
        return {"response": response}
        
    except Exception as e:
        print(f"Server Chat Error: {str(e)}")
        return {"response": "Connection to Neural Link interrupted. Check backend logs."}

# SYSTEM HEALTH CHECK
@app.get("/api/health")
def health_check():
    """Endpoint to verify Render instance is awake."""
    return {"status": "online", "engine": "Prophet-Bayesian", "ai": "Gemini-3-Pro"}

# --- SERVER STARTUP ---
# When running on Render, the 'Start Command' in the dashboard handles this:
# uvicorn main:app --host 0.0.0.0 --port 10000