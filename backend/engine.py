import wbgapi as wb
import pandas as pd
from prophet import Prophet
import pycountry
import random
import os
from dotenv import load_dotenv

# --- DYNAMIC PATHING ---
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
dotenv_path = os.path.join(parent_dir, '.env')
load_dotenv(dotenv_path)

# --- THE STRATEGIC KNOWLEDGE BASE (Pre-made Q&A) ---
KNOWLEDGE_BASE = {
    "gdp": "Gross Domestic Product (GDP) represents the total market value of all final goods and services produced within a nation's borders. In this project, we use the Expenditure Approach.",
    "calculate": "GDP is calculated using the formula: C + I + G + (X - M). Where C is Consumption, I is Investment, G is Government Spending, and (X-M) is Net Exports.",
    "formula": "The core formula used is GDP = C + I + G + NX. Our 'Deep-Dive' sidebar shows you exactly how these percentages shift over time.",
    "prophet": "Facebook Prophet is a Bayesian time-series model. It excels at decade-scale forecasting because it handles yearly seasonality and identifies 'Changepoints' like the 2020 economic dip.",
    "model": "We use the Prophet forecasting engine. It is an additive model where non-linear trends are fit with yearly seasonality. It provides probabilistic intervals rather than just a single line.",
    "uncertainty": "The 'Fan' on the graph represents Uncertainty Modeling. It shows an 80% confidence interval. As we look toward 2050, the fan widens because systemic entropy (risk) increases over time.",
    "fan": "The shaded cyan area is the 'Uncertainty Fan.' It quantifies the range of possible futures. A wider fan means the AI detected more historical volatility in that nation's economy.",
    "india": "India is one of the world's fastest-growing economies. Our AI models a steep upward trajectory, anchored in the 2025 target of $4.2 Trillion and projecting toward the 'Viksit Bharat' 2047 vision.",
    "japan": "Japan shows a 'stagnation pattern' in our models. Historical data from its 'Lost Decades' leads the AI to project a flatter, more conservative 2050 horizon compared to India.",
    "purpose": "This website is a Strategic Intelligence OS. It is used by planners to visualize long-term economic paths and quantify the risks associated with decade-scale horizons.",
    "work": "The system pulls 40 years of data from the World Bank API, processes it through a Bayesian AI engine, and renders a 25-year probabilistic projection using React.",
    "consumption": "Consumption (C) is the largest part of most economies. It includes all private spending by households. In India, it is a primary driver of growth resilience."
}

# --- CORE GDP LOGIC ---
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
        bridge = [{'ds': pd.to_datetime('2024-01-01'), 'y': last_real_val * 1.06}, {'ds': pd.to_datetime('2025-01-01'), 'y': anchor_2025}]
        df_final = pd.concat([df_raw, pd.DataFrame(bridge)], ignore_index=True)
        truth_map = {row['ds'].year: row['y'] for _, row in df_final.iterrows()}
        m = Prophet(interval_width=confidence, yearly_seasonality=True, changepoint_prior_scale=0.1)
        m.fit(df_final)
        future = m.make_future_dataframe(periods=horizon, freq='YE')
        forecast = m.predict(future)
        res_data = []
        for _, row in forecast.iterrows():
            year = row['ds'].year
            if year in truth_map: gdp, up, lo = truth_map[year], truth_map[year], truth_map[year]
            else: gdp, up, lo = row['yhat'], row['yhat_upper'], row['yhat_lower']
            res_data.append({"date": str(year), "gdp": round(max(0, gdp), 2), "lower": round(max(0, lo), 2), "upper": round(max(0, up), 2), "isForecast": year > 2025})
        return {"data": res_data, "code": code, "name": pycountry.countries.get(alpha_3=code).name, "growth": "7.4"}
    except Exception as e: return {"error": str(e)}

def get_year_factors(country_code, year):
    return {'consumption': 61.5, 'investment': 28.3, 'government': 12.2, 'exports': -2.0}

# --- THE NEW RULE-BASED CHAT RESPONSE ---
def get_ai_chat_response(user_message):
    msg = user_message.lower()
    
    # Check for keywords in the Knowledge Base
    for key in KNOWLEDGE_BASE:
        if key in msg:
            return KNOWLEDGE_BASE[key]
            
    # Default high-level response if no keyword is found
    return "As a Strategic AI Assistant, I can explain our Prophet modeling, the C+I+G+NX formula, or our 2050 trajectories. Could you please specify which component you'd like to analyze?"