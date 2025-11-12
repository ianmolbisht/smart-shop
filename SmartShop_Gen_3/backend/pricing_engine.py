# backend/pricing_engine.py

from datetime import datetime
import pandas as pd

def calculate_dynamic_price(base_price, expiry_date, current_date):
    """
    Calculate adjusted price and discount percent based on days left until expiry.
    Handles NoneType or missing base_price safely.
    """
    # Ensure base_price is a valid float
    try:
        if base_price is None or pd.isna(base_price):
            base_price = 10.0  # default price fallback
        else:
            base_price = float(base_price)
    except Exception:
        base_price = 10.0

    # Parse dates
    try:
        expiry = pd.to_datetime(expiry_date, errors="coerce")
        current = pd.to_datetime(current_date, errors="coerce")
    except Exception:
        return base_price, 0

    if pd.isna(expiry) or pd.isna(current):
        return base_price, 0

    days_left = (expiry - current).days

    # Apply discount rules
    if days_left < 0:
        return base_price * 0.1, 90
    elif days_left <= 2:
        return base_price * 0.3, 70
    elif days_left <= 5:
        return base_price * 0.5, 50
    elif days_left <= 10:
        return base_price * 0.7, 30
    elif days_left <= 15:
        return base_price * 0.85, 15
    else:
        return base_price, 0
