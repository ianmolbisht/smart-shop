from fastapi import FastAPI, Query, Body
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import sqlite3
import os
from datetime import datetime, timedelta
from backend.ml_model import run_regression_model, run_classification_model
from backend.pricing_engine import calculate_dynamic_price


# ==========================================================
# FASTAPI CONFIG
# ==========================================================
app = FastAPI(title="SmartShop ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ==========================================================
# DATABASE
# ==========================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = r"C:\Users\anmol\OneDrive\Desktop\dbms\smart-shop\SmartShop_Gen_3\database\my_database.db"


def connect_db():
    return sqlite3.connect(DB_PATH, check_same_thread=False, timeout=10)


def query_db(query: str, params=None):
    try:
        with connect_db() as conn:
            return pd.read_sql(query, conn, params=params or [])
    except Exception as e:
        print("❌ Query Error:", e)
        return pd.DataFrame()


def execute_db(query: str, params=None):
    try:
        with connect_db() as conn:
            cur = conn.cursor()
            cur.execute(query, params or [])
            conn.commit()
    except Exception as e:
        print("❌ DB Write Error:", e)
        raise


def normalize_date(date_str: str):
    if not date_str:
        return None
    try:
        dt = pd.to_datetime(date_str, errors="coerce")
        if pd.isna(dt):
            dt = datetime.strptime(date_str, "%d-%m-%Y")
        return dt.strftime("%d-%m-%Y")
    except Exception:
        return None


# ==========================================================
# ML ROUTES
# ==========================================================
@app.get("/predict/forecast")
def forecast():
    df = query_db("SELECT * FROM my_table")
    if df.empty:
        return JSONResponse({"error": "No data found."}, status_code=404)
    return JSONResponse({"forecast": run_regression_model(df)})


@app.get("/predict/classify")
def classify():
    df = query_db("SELECT * FROM my_table")
    if df.empty:
        return JSONResponse({"error": "No data found."}, status_code=404)
    return JSONResponse({"classification": run_classification_model(df)})


# ==========================================================
# DASHBOARD ROUTES
# ==========================================================
@app.get("/data/inventory")
def get_inventory(date: str = Query(None)):
    normalized_date = normalize_date(date)
    params = [normalized_date] if normalized_date else []

    query = f"""
        SELECT m.product_name AS product,
               m.stock_left AS stock,
               m.expiry_date,
               m.base_price
        FROM my_table AS m
        WHERE m.rowid = (
            SELECT rowid FROM my_table
            WHERE product_name = m.product_name
            ORDER BY COALESCE(updated_at, date) DESC
            LIMIT 1
        )
        {"AND m.date = ?" if normalized_date else ""}
        ORDER BY m.product_name ASC;
    """

    df = query_db(query, params)
    if df.empty:
        return JSONResponse({"error": "No inventory data found."}, status_code=404)
    return JSONResponse(df.to_dict(orient="records"))

@app.get("/data/transactions")
def get_transactions(limit: int = Query(20), date: str = Query(None)):
    normalized_date = normalize_date(date)
    params = [normalized_date, limit] if normalized_date else [limit]

    query = f"""
        SELECT 
            product_name AS product,
            stock_sold AS quantity,
            'Sale' AS type,
            date
        FROM my_table
        WHERE stock_sold > 0
        {"AND date = ?" if normalized_date else ""}
        ORDER BY COALESCE(updated_at, date) DESC
        LIMIT ?;
    """
    df = query_db(query, params)
    if df.empty:
        return JSONResponse({"error": "No transactions found."}, status_code=404)
    return JSONResponse(df.to_dict(orient="records"))

# ==========================================================
# BUY / SELL ENDPOINTS
# ==========================================================
@app.post("/data/transaction")
def handle_transaction(data: dict = Body(...)):
    product = data.get("product")
    quantity = int(data.get("quantity", 1))
    tx_type = data.get("type", "").lower()

    if not product or tx_type not in ["buy", "sell"]:
        return JSONResponse({"error": "Invalid request body."}, status_code=400)

    try:
        with connect_db() as conn:
            cur = conn.cursor()
            cur.execute("""
                SELECT stock_left, base_price, expiry_date
                FROM my_table
                WHERE product_name = ?
                ORDER BY COALESCE(updated_at, date) DESC
                LIMIT 1;
            """, (product,))
            row = cur.fetchone()
            if not row:
                return JSONResponse({"error": f"Product '{product}' not found."}, status_code=404)

            stock_left, base_price, expiry_date = row
            new_stock = stock_left + quantity if tx_type == "buy" else stock_left - quantity
            if new_stock < 0:
                return JSONResponse({"error": "Insufficient stock."}, status_code=400)

            today = datetime.now().strftime("%d-%m-%Y")
            now_ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")  # <-- ISO format

            cur.execute("""
                INSERT INTO my_table (product_name, stock_left, stock_sold, base_price, expiry_date, date, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?);
            """, (
                product,
                new_stock,
                quantity if tx_type == "sell" else 0,
                base_price,
                expiry_date,
                today,
                now_ts
            ))
            conn.commit()

        print(f"✅ {tx_type.upper()} OK → {product} now {new_stock}")
        return JSONResponse({
            "message": f"{tx_type.capitalize()} transaction successful.",
            "product": product,
            "new_stock": new_stock
        })

    except Exception as e:
        print("❌ Transaction error:", e)
        return JSONResponse({"error": "Transaction failed."}, status_code=500)


# ==========================================================
# HEALTH CHECK
# ==========================================================
@app.get("/")
def home():
    return {"message": "✅ SmartShop ML API running successfully"}
