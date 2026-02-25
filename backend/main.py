from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from engine import get_strategic_forecast, get_year_factors, get_ai_chat_response
app = FastAPI(title="Strategic AI API")
VERY IMPORTANT: This allows your Vercel frontend to talk to this Render backend
app.add_middleware(
CORSMiddleware,
allow_origins=[""],
allow_credentials=True,
allow_methods=[""],
allow_headers=["*"],
)
This fixes the "Not Found" error you saw in the browser
@app.get("/")
def read_root():
return {
"status": "online",
"message": "Strategic AI Engine is Operational. Neural Link is Active.",
"endpoints": ["/api/forecast/{country}", "/api/chat", "/api/health"]
}
@app.get("/api/health")
def health():
return {"status": "online"}
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
return {"response": f"Neural Link Logic Error: {str(e)}"}
