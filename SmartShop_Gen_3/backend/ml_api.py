# # backend/ml_api.py

# from fastapi import FastAPI
# from fastapi.responses import JSONResponse
# import pandas as pd
# import sqlite3
# from backend.ml_model import run_ml_models

# app = FastAPI(title="SmartShop ML API")
# DB_PATH = "database/my_database (1).db"


# def load_data():
#     conn = sqlite3.connect(DB_PATH)
#     df = pd.read_sql("SELECT * FROM my_table", conn)
#     conn.close()
#     return df


# @app.get("/predict")
# def predict():
#     """Run ML models and return JSON predictions"""
#     df = load_data()
#     if df.empty:
#         return JSONResponse({"error": "No data found in database."}, status_code=404)

#     results = run_ml_models(df)
#     return results
# from fastapi.middleware.cors import CORSMiddleware

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],  # or ["*"] for all origins
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )





# from fastapi import FastAPI
# from fastapi.responses import JSONResponse
# from fastapi.middleware.cors import CORSMiddleware
# from fastapi import Query
# import pandas as pd
# import sqlite3
# import os
# from backend.ml_model import run_regression_model, run_classification_model

# # ==========================================================
# # FASTAPI APP CONFIGURATION
# # ==========================================================
# app = FastAPI(title="SmartShop ML API")

# # Enable CORS for React frontend
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # change to ["http://localhost:3000"] for safety
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ==========================================================
# # DATABASE PATH (ABSOLUTE)
# # ==========================================================
# BASE_DIR = os.path.dirname(os.path.abspath(__file__))
# DB_PATH = os.path.join(BASE_DIR, "..", "database", "my_database.db")


# # ==========================================================
# # HELPER FUNCTION
# # ==========================================================
# def load_data():
#     """Load data from SQLite database."""
#     try:
#         if not os.path.exists(DB_PATH):
#             print("⚠️ Database file not found.")
#             return pd.DataFrame()

#         conn = sqlite3.connect(DB_PATH)
#         df = pd.read_sql("SELECT * FROM my_table", conn)
#         conn.close()
#         return df

#     except Exception as e:
#         print(f"❌ Database Error: {e}")
#         return pd.DataFrame()


# def query_db(query: str):
#     """General-purpose function to execute SQL queries safely."""
#     try:
#         if not os.path.exists(DB_PATH):
#             return pd.DataFrame()

#         conn = sqlite3.connect(DB_PATH)
#         df = pd.read_sql(query, conn)
#         conn.close()
#         return df
#     except Exception as e:
#         print(f"❌ Query Error: {e}")
#         return pd.DataFrame()


# # ==========================================================
# # ML ROUTES
# # ==========================================================
# @app.get("/predict/forecast")
# def forecast():
#     """Run regression model (sales forecasting)."""
#     df = load_data()
#     if df.empty:
#         return JSONResponse(
#             {"error": "No data found in database or table missing."}, status_code=404
#         )

#     results = run_regression_model(df)
#     return JSONResponse({"forecast": results})


# @app.get("/predict/classify")
# def classify():
#     """Run classification model (sales performance)."""
#     df = load_data()
#     if df.empty:
#         return JSONResponse(
#             {"error": "No data found in database or table missing."}, status_code=404
#         )

#     results = run_classification_model(df)
#     return JSONResponse({"classification": results})


# # ==========================================================
# # DASHBOARD ROUTES (For React Frontend)
# # ==========================================================
# from fastapi import Query

# @app.get("/data/inventory")
# def get_inventory(date: str = Query(None, description="Filter by specific date (dd-mm-yyyy)")):
#     """
#     Return inventory based on selected date (if provided).
#     """
#     if date:
#         query = f"""
#             SELECT 
#                 product_name AS product,
#                 MAX(stock_left) AS stock
#             FROM my_table
#             WHERE date = '{date}'
#             GROUP BY product_name
#             ORDER BY product_name ASC;
#         """
#     else:
#         query = """
#             SELECT 
#                 product_name AS product,
#                 MAX(stock_left) AS stock
#             FROM my_table
#             GROUP BY product_name
#             ORDER BY product_name ASC;
#         """

#     df = query_db(query)
#     if df.empty:
#         return JSONResponse({"error": f"No inventory data found for {date or 'available records'}."}, status_code=404)
#     return JSONResponse(df.to_dict(orient="records"))


# @app.get("/data/transactions")
# def get_transactions(
#     limit: int = Query(20, ge=1, le=100, description="Number of transactions to return"),
#     date: str = Query(None, description="Filter by specific date (dd-mm-yyyy)")
# ):
#     """
#     Return recent transactions filtered by date and limit.
#     """
#     if date:
#         query = f"""
#             SELECT 
#                 product_id AS id,
#                 product_name AS product,
#                 stock_sold AS quantity,
#                 'Sale' AS type,
#                 date
#             FROM my_table
#             WHERE stock_sold > 0 AND date = '{date}'
#             ORDER BY date DESC
#             LIMIT {limit};
#         """
#     else:
#         query = f"""
#             SELECT 
#                 product_id AS id,
#                 product_name AS product,
#                 stock_sold AS quantity,
#                 'Sale' AS type,
#                 date
#             FROM my_table
#             WHERE stock_sold > 0
#             ORDER BY date DESC
#             LIMIT {limit};
#         """

#     df = query_db(query)
#     if df.empty:
#         return JSONResponse({"error": f"No transactions found for {date or 'available records'}."}, status_code=404)
#     return JSONResponse(df.to_dict(orient="records"))

# from datetime import datetime

# @app.get("/data/weekly-summary")
# def weekly_summary(
#     month: str = Query(..., description="Full month name, e.g. January"),
#     week: int = Query(..., ge=1, le=4, description="Week number 1–4"),
# ):
#     """
#     Generate weekly sales + stock summary for given month & week.
#     Restricted to data up to 2nd week of September 2025.
#     """

#     # === Valid months ===
#     allowed_months = [
#         "January", "February", "March", "April", "May", "June",
#         "July", "August", "September"
#     ]
#     if month not in allowed_months:
#         return JSONResponse({"error": "Invalid month name."}, status_code=400)

#     # === Date boundaries ===
#     month_num = allowed_months.index(month) + 1
#     start_day = (week - 1) * 7 + 1
#     end_day = week * 7

#     cutoff_date = datetime(2025, 9, 14)  # End of 2nd week, Sept 2025
#     week_end_date = datetime(2025, month_num, min(end_day, 28))

#     if week_end_date > cutoff_date:
#         return JSONResponse(
#             {"error": "Data beyond 2nd week of September 2025 is not available."},
#             status_code=400,
#         )

#     # === SQL Query ===
#     query = """
#         SELECT product_name AS product, stock_sold, stock_left, date
#         FROM my_table
#         WHERE substr(date, 4, 2) = ?
#           AND CAST(substr(date, 1, 2) AS INTEGER) BETWEEN ? AND ?
#     """
#     params = [f"{month_num:02d}", start_day, end_day]

#     try:
#         conn = sqlite3.connect(DB_PATH)
#         df = pd.read_sql_query(query, conn, params=params)
#         conn.close()
#     except Exception as e:
#         print(f"❌ Weekly query error: {e}")
#         return JSONResponse({"error": "Database query failed."}, status_code=500)

#     if df.empty:
#         return JSONResponse(
#             {"error": f"No data found for {month}, Week {week}."}, status_code=404
#         )

#     # === Compute stats ===
#     total_sales = int(df["stock_sold"].sum())
#     avg_stock_left = round(df["stock_left"].mean(), 2)
#     by_product = (
#         df.groupby("product")
#         .agg({"stock_sold": "sum", "stock_left": "mean"})
#         .reset_index()
#         .to_dict(orient="records")
#     )

#     return JSONResponse({
#         "month": month,
#         "week": week,
#         "total_sales": total_sales,
#         "average_stock_left": avg_stock_left,
#         "product_breakdown": by_product
#     })


# # ==========================================================
# # HEALTH CHECK
# # ==========================================================
# @app.get("/")
# def home():
#     return {"message": "✅ SmartShop ML API is running successfully!"}



from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import sqlite3
import os
from datetime import datetime, timedelta
from backend.ml_model import run_regression_model, run_classification_model
from backend.pricing_engine import calculate_dynamic_price  # Ensure this exists

# ==========================================================
# FASTAPI APP CONFIGURATION
# ==========================================================
app = FastAPI(title="SmartShop ML API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to ["http://localhost:3000"] for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================================
# DATABASE CONFIG
# ==========================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "..", "database", "my_database.db")


# ==========================================================
# HELPER FUNCTIONS
# ==========================================================
def load_data():
    """Load all data from SQLite database."""
    try:
        if not os.path.exists(DB_PATH):
            print("⚠️ Database file not found at", DB_PATH)
            return pd.DataFrame()
        with sqlite3.connect(DB_PATH, check_same_thread=False, timeout=10) as conn:
            df = pd.read_sql("SELECT * FROM my_table", conn)
        return df
    except Exception as e:
        print(f"❌ Database Error: {e}")
        return pd.DataFrame()


def query_db(query: str, params=None):
    """Run an SQL query safely and return DataFrame."""
    try:
        if not os.path.exists(DB_PATH):
            print("⚠️ DB not found at", DB_PATH)
            return pd.DataFrame()
        with sqlite3.connect(DB_PATH, check_same_thread=False, timeout=10) as conn:
            df = pd.read_sql(query, conn, params=params or [])
        return df
    except Exception as e:
        print(f"❌ Query Error: {e}")
        return pd.DataFrame()


def normalize_date(date_str: str):
    """
    Normalize incoming date formats (dd-mm-yyyy, yyyy-mm-dd, ISO)
    to 'dd-mm-yyyy' for SQLite compatibility.
    Returns None if cannot parse.
    """
    if not date_str:
        return None
    try:
        # Try general parsing
        dt = pd.to_datetime(date_str, errors="coerce")
        if pd.isna(dt):
            # Fallback: dd-mm-yyyy
            dt = datetime.strptime(date_str, "%d-%m-%Y")
        return dt.strftime("%d-%m-%Y")
    except Exception:
        return None


# ==========================================================
# ML ROUTES
# ==========================================================
@app.get("/predict/forecast")
def forecast():
    """Run regression model for sales forecasting."""
    df = load_data()
    if df.empty:
        return JSONResponse(
            {"error": "No data found in database or table missing."}, status_code=404
        )
    results = run_regression_model(df)
    return JSONResponse({"forecast": results})


@app.get("/predict/classify")
def classify():
    """Run classification model for sales performance."""
    df = load_data()
    if df.empty:
        return JSONResponse(
            {"error": "No data found in database or table missing."}, status_code=404
        )
    results = run_classification_model(df)
    return JSONResponse({"classification": results})


# ==========================================================
# DASHBOARD ROUTES (for React frontend)
# ==========================================================
@app.get("/data/inventory")
def get_inventory(date: str = Query(None, description="Filter inventory by date")):
    """Return current inventory data with dynamic pricing."""
    normalized_date = normalize_date(date)

    if normalized_date:
        query = """
            SELECT 
                product_name AS product,
                MAX(stock_left) AS stock,
                MAX(expiry_date) AS expiry_date,
                MAX(base_price) AS base_price
            FROM my_table
            WHERE date = ?
            GROUP BY product_name
            ORDER BY product_name ASC;
        """
        params = [normalized_date]
    else:
        query = """
            SELECT 
                product_name AS product,
                MAX(stock_left) AS stock,
                MAX(expiry_date) AS expiry_date,
                MAX(base_price) AS base_price
            FROM my_table
            GROUP BY product_name
            ORDER BY product_name ASC;
        """
        params = []

    df = query_db(query, params)
    if df.empty:
        return JSONResponse(
            {"error": f"No inventory data found for {normalized_date or 'available records'}."},
            status_code=404,
        )

    # --- Data Cleaning & Defaults ---
    # Parse expiry_date (DB stores dd-mm-yyyy in your dataset)
    df["expiry_date"] = pd.to_datetime(df["expiry_date"], format="%d-%m-%Y", errors="coerce")
    # Fill missing expiry with a future date so pricing logic won't crash
    df["expiry_date"] = df["expiry_date"].fillna(datetime.now() + timedelta(days=30))

    # Ensure base_price is numeric and not None
    df["base_price"] = pd.to_numeric(df["base_price"], errors="coerce").fillna(10.0)

    # Apply dynamic pricing (use a safe current_date string)
    current_date = datetime.now()
    try:
        # Use list comprehension to avoid pandas weirdness with zip/apply on empty frames
        adjusted_list = [
            calculate_dynamic_price(row_base, row_expiry, current_date)
            for row_base, row_expiry in zip(df["base_price"].tolist(), df["expiry_date"].tolist())
        ]
        # unzip
        adjusted_prices, discounts = zip(*adjusted_list) if adjusted_list else ([], [])
        df["adjusted_price"] = list(adjusted_prices)
        df["discount_percent"] = list(discounts)
    except Exception as e:
        print("❌ Error while applying dynamic pricing:", e)
        # fallback: set adjusted to base and discount 0
        df["adjusted_price"] = df["base_price"]
        df["discount_percent"] = 0

    # --- Convert datetime/Timestamp columns to strings for JSON serialization ---
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = df[col].dt.strftime("%Y-%m-%d")

    # Final defensive cast to plain python types
    records = df.to_dict(orient="records")
    return JSONResponse(records)


@app.get("/data/transactions")
def get_transactions(
    limit: int = Query(20, ge=1, le=100, description="Number of transactions to return"),
    date: str = Query(None, description="Filter by date")
):
    """Return transaction history filtered by date."""
    normalized_date = normalize_date(date)

    if normalized_date:
        query = """
            SELECT 
                product_id AS id,
                product_name AS product,
                stock_sold AS quantity,
                'Sale' AS type,
                date
            FROM my_table
            WHERE stock_sold > 0 AND date = ?
            ORDER BY date DESC
            LIMIT ?;
        """
        params = [normalized_date, limit]
    else:
        query = """
            SELECT 
                product_id AS id,
                product_name AS product,
                stock_sold AS quantity,
                'Sale' AS type,
                date
            FROM my_table
            WHERE stock_sold > 0
            ORDER BY date DESC
            LIMIT ?;
        """
        params = [limit]

    df = query_db(query, params)
    if df.empty:
        return JSONResponse(
            {"error": f"No transactions found for {normalized_date or 'available records'}."},
            status_code=404,
        )

    # Convert any date columns to safe strings
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            df[col] = df[col].dt.strftime("%Y-%m-%d")

    # If date column is stored as strings in DB (dd-mm-yyyy), normalize to ISO for frontend
    if "date" in df.columns and df["date"].dtype == object:
        try:
            df["date"] = pd.to_datetime(df["date"], format="%d-%m-%Y", errors="coerce").dt.strftime("%Y-%m-%d")
        except Exception:
            pass

    return JSONResponse(df.to_dict(orient="records"))


# ==========================================================
# WEEKLY DASHBOARD ROUTE
# ==========================================================
@app.get("/data/weekly-summary")
def weekly_summary(
    month: str = Query(..., description="Full month name, e.g. January"),
    week: int = Query(..., ge=1, le=4, description="Week number 1–4"),
):
    """Generate weekly sales + stock summary for a given month & week."""

    allowed_months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September"
    ]
    if month not in allowed_months:
        return JSONResponse({"error": "Invalid month name."}, status_code=400)

    month_num = allowed_months.index(month) + 1
    start_day = (week - 1) * 7 + 1
    end_day = week * 7

    cutoff_date = datetime(2025, 9, 14)
    # week_end_date uses 2025 as the reference year for cutoff logic
    week_end_date = datetime(2025, month_num, min(end_day, 28))

    if week_end_date > cutoff_date:
        return JSONResponse(
            {"error": "Data beyond 2nd week of September 2025 is not available."},
            status_code=400,
        )

    query = """
        SELECT product_name AS product, stock_sold, stock_left, date
        FROM my_table
        WHERE substr(date, 4, 2) = ?
          AND CAST(substr(date, 1, 2) AS INTEGER) BETWEEN ? AND ?;
    """
    params = [f"{month_num:02d}", start_day, end_day]

    try:
        df = query_db(query, params)
    except Exception as e:
        print(f"❌ Weekly query error: {e}")
        return JSONResponse({"error": "Database query failed."}, status_code=500)

    if df.empty:
        return JSONResponse(
            {"error": f"No data found for {month}, Week {week}."}, status_code=404
        )

    total_sales = int(df["stock_sold"].sum())
    avg_stock_left = round(df["stock_left"].mean(), 2)
    by_product = (
        df.groupby("product")
        .agg({"stock_sold": "sum", "stock_left": "mean"})
        .reset_index()
        .to_dict(orient="records")
    )

    # convert dates to ISO strings if present
    if "date" in df.columns:
        try:
            df["date"] = pd.to_datetime(df["date"], format="%d-%m-%Y", errors="coerce").dt.strftime("%Y-%m-%d")
        except Exception:
            pass

    return JSONResponse({
        "month": month,
        "week": week,
        "total_sales": total_sales,
        "average_stock_left": avg_stock_left,
        "product_breakdown": by_product
    })


# ==========================================================
# HEALTH CHECK
# ==========================================================
@app.get("/")
def home():
    return {"message": "✅ SmartShop ML API is running successfully!"}
