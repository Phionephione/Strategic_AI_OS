import wbgapi as wb
import pandas as pd
from prophet import Prophet
import pycountry
import random
import google.generativeai as genai
import os
from dotenv import load_dotenv
import time

# 1. LOAD ENVIRONMENT
load_dotenv() 
API_KEY = os.getenv("GEMINI_API_KEY")

# 2. INITIALIZE AI CLIENT
AI_AVAILABLE = False
if API_KEY:
    try:
        genai.configure(api_key=API_KEY)
        # SWITCHED to 'gemini-1.5-flash' for higher rate limits (Free Tier stable)
        model_ai = genai.GenerativeModel('gemini-1.5-flash')
        AI_AVAILABLE = True
        print("SUCCESS: AI Neural Link Established (Stable Mode).")
    except Exception as e:
        print(f"ERROR: Gemini Init failed: {e}")
else:
    print("ERROR: No GEMINI_API_KEY found.")

# --- CORE LOGIC ---
ANCHORS = {"IND": 4.20e12, "USA": 30.1e12, "CHN": 19.5e12}

def get_country_code(name):
    mapping = {"india": "IND", "usa": "USA", "united states": "USA", "china": "CHN", "germany": "DEU", "japan": "JPN"}
    clean_name = name.lower().strip()
    if clean_name in mapping: return mapping[clean_name]
    try:
        results = pycountry.countries.search_fuzzy(name)
        return results[0].alpha_3
    except: return None

def get_strategic_forecast(country_name="India", horizon=25, confidence=0.80):
    code = get_country_code(country_name)
    if not code: return {"error": "Country not identified."}
    try:
        data = wb.data.DataFrame('NY.GDP.MKTP.CD', code, time=range(1990, 2024))
        df_raw = data.T.reset_index()
        df_raw.columns = ['ds', 'y']
        df_raw['ds'] = pd.to_datetime(df_raw['ds'].str.replace('YR', ''))
        df_raw = df_raw.sort_values('ds').dropna()
        last_real_val = df_raw['y'].iloc[-1]
        anchor_2025 = ANCHORS.get(code, last_real_val * 1.12)
        bridge = [{'ds': pd.to_datetime('2024-01-01'), 'y': last_real_val + (anchor_2025 - last_real_val)/2}, {'ds': pd.to_datetime('2025-01-01'), 'y': anchor_2025}]
        df_final = pd.concat([df_raw, pd.DataFrame(bridge)], ignore_index=True)
        truth_map = {row['ds'].year: row['y'] for _, row in df_final.iterrows()}
        m = Prophet(interval_width=confidence, yearly_seasonality=True, changepoint_prior_scale=0.1, growth='linear')
        m.fit(df_final)
        future = m.make_future_dataframe(periods=horizon, freq='YE')
        forecast = m.predict(future)
        res_data = []
        for _, row in forecast.iterrows():
            year = row['ds'].year
            if year in truth_map: gdp, up, lo = truth_map[year], truth_map[year], truth_map[year]
            else: gdp, up, lo = row['yhat'], row['yhat_upper'], row['yhat_lower']
            res_data.append({"date": str(year), "gdp": round(max(0, gdp), 2), "lower": round(max(0, lo), 2), "upper": round(max(0, up), 2), "isForecast": year > 2025})
        momentum = ((anchor_2025 / df_raw['y'].iloc[-1]) ** (1/2) - 1) * 100
        return {"data": res_data, "code": code, "name": pycountry.countries.get(alpha_3=code).name, "growth": round(momentum, 2)}
    except Exception as e: return {"error": str(e)}

def get_year_factors(country_code, year):
    codes = {'consumption': 'NE.CON.PRVT.ZS', 'investment': 'NE.GDI.FTOT.ZS', 'government': 'NE.CON.GOVT.ZS', 'exports': 'NE.RSB.GNFS.ZS'}
    try:
        search_year = int(year) if int(year) <= 2022 else 2022
        data = wb.data.DataFrame(list(codes.values()), country_code, time=search_year)
        return {name: round(data.loc[code][f'YR{search_year}'] + (random.uniform(-1, 1) if int(year) > 2022 else 0), 2) for name, code in codes.items()}
    except: return {'consumption': 61.5, 'investment': 28.3, 'government': 12.2, 'exports': -2.0}

# 3. AI CHAT LOGIC (Higher Stability)
def get_ai_chat_response(user_message):
    if AI_AVAILABLE:
        try:
            # We use 1.5-flash for maximum reliability on Render
            prompt = f"User asks: {user_message}. Context: You are a Strategic AI predicting GDP to 2050 using World Bank data and Prophet. Be concise (max 3 sentences)."
            response = model_ai.generate_content(prompt)
            return response.text
        except Exception as e:
            if "429" in str(e):
                return "The AI is cooling down (Rate Limit). Please wait 20 seconds and ask again."
            return f"Strategic Assistant encountered a logic shift: {str(e)[:50]}..."
    
    return "Neural Link Offline. Check API Configuration."