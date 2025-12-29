from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from engine import get_strategic_forecast, get_year_factors, get_ai_chat_response

app = FastAPI()

# FORCE OPEN CORS: This ensures React can talk to Python without errors
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.get("/api/forecast/{country}")
def read_forecast(country: str, horizon: int = 25):
    return get_strategic_forecast(country, horizon)

@app.get("/api/factors/{country}/{year}")
def read_factors(country: str, year: int):
    return get_year_factors(country, year)

# CHAT ENDPOINT
@app.post("/api/chat")
async def chat_with_ai(request: Request):
    try:
        body = await request.json()
        user_message = body.get("message")
        response = get_ai_chat_response(user_message)
        return {"response": response}
    except Exception as e:
        return {"response": f"Backend Logic Error: {str(e)}"}

# HEARTBEAT TEST (To check if server is alive)
@app.get("/api/health")
def health():
    return {"status": "online"}