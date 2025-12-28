import wbgapi as wb
import pandas as pd
from prophet import Prophet
import pycountry
import random

def get_country_code(name):
    mapping = {
        "india": "IND", "usa": "USA", "united states": "USA", 
        "china": "CHN", "germany": "DEU", "japan": "JPN", 
        "russia": "RUS", "uk": "GBR", "brazil": "BRA"
    }
    clean_name = name.lower().strip()
    if clean_name in mapping: return mapping[clean_name]
    try:
        results = pycountry.countries.search_fuzzy(name)
        return results[0].alpha_3
    except: return None

def get_strategic_forecast(country_name="India", horizon=25, confidence=0.80):
    code = get_country_code(country_name)
    if not code: return {"error": f"Country '{country_name}' not found."}

    try:
        # 1. Fetch RAW Historical Data (1990 - 2023)
        data = wb.data.DataFrame('NY.GDP.MKTP.CD', code, time=range(1990, 2024))
        df_raw = data.T.reset_index()
        df_raw.columns = ['ds', 'y']
        df_raw['ds'] = pd.to_datetime(df_raw['ds'].str.replace('YR', ''))
        df_raw = df_raw.sort_values('ds').dropna()

        # Map for "Truth" values
        truth_map = {row['ds'].year: row['y'] for _, row in df_raw.iterrows()}

        # 2. MOMENTUM CALCULATION
        # Calculate growth of the last 5 years
        start_val = df_raw['y'].iloc[-5]
        end_val = df_raw['y'].iloc[-1]
        momentum_rate = (end_val / start_val) ** (1/5) - 1
        
        # Bridge to 2025
        bridge = []
        current_y = end_val
        for year in [2024, 2025]:
            current_y = current_y * (1 + momentum_rate)
            bridge.append({'ds': pd.to_datetime(f"{year}-01-01"), 'y': current_y})
            truth_map[year] = current_y

        df_train = pd.concat([df_raw, pd.DataFrame(bridge)], ignore_index=True)

        # 3. AI STRATEGIC MODELING
        m = Prophet(interval_width=confidence, yearly_seasonality=True, changepoint_prior_scale=0.1)
        m.fit(df_train)
        
        future = m.make_future_dataframe(periods=horizon, freq='Y')
        forecast = m.predict(future)
        
        # 4. DATA FORMATTING
        res_data = []
        for _, row in forecast.iterrows():
            year = row['ds'].year
            if year in truth_map:
                gdp, upper, lower = truth_map[year], truth_map[year], truth_map[year]
            else:
                gdp, upper, lower = row['yhat'], row['yhat_upper'], row['yhat_lower']

            res_data.append({
                "date": str(year),
                "gdp": round(max(0, gdp), 2),
                "lower": round(max(0, lower), 2),
                "upper": round(max(0, upper), 2),
                "isForecast": year > 2025
            })
            
        return {
            "data": res_data, 
            "code": code, 
            "name": pycountry.countries.get(alpha_3=code).name,
            "growth": round(momentum_rate * 100, 2)
        }
    except Exception as e:
        return {"error": str(e)}

def get_year_factors(country_code, year):
    codes = {'consumption': 'NE.CON.PRVT.ZS', 'investment': 'NE.GDI.FTOT.ZS', 'government': 'NE.CON.GOVT.ZS', 'exports': 'NE.RSB.GNFS.ZS'}
    target_year = int(year)
    search_year = target_year if target_year <= 2022 else 2022
    
    try:
        data = wb.data.DataFrame(list(codes.values()), country_code, time=search_year)
        results = {}
        for name, code in codes.items():
            val = data.loc[code][f'YR{search_year}']
            if target_year > 2022:
                val += random.uniform(-2.5, 2.5) 
            results[name] = round(val, 2)
        return results
    except:
        return {'consumption': 62.5, 'investment': 24.1, 'government': 11.4, 'exports': 2.0}