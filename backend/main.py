from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from engine import get_strategic_forecast, get_year_factors, get_ai_chat_response

app = FastAPI()

# FORCE OPEN ALL GATES: This ensures the bot can talk to the UI
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/forecast/{country}")
def read_forecast(country: str, horizon: int = 25):
    return get_strategic_forecast(country, horizon)

@app.get("/api/factors/{country}/{year}")
def read_factors(country: str, year: int):
    return get_year_factors(country, year)

@app.post("/api/chat")
async def chat_with_ai(request: Request):
    try:
        body = await request.json()
        user_message = body.get("message", "")
        response = get_ai_chat_response(user_message)
        return {"response": response}
    except Exception as e:
        return {"response": f"Backend logic error: {str(e)}"}

# Health check - Visit http://127.0.0.1:8000/api/health in your browser to test
@app.get("/api/health")
def health():
    return {"status": "online"}