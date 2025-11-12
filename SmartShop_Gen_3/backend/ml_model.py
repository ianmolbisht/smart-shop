import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score

def run_regression_model(df):
    """Run regression model for sales forecasting per product."""
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["month"] = df["date"].dt.month
    df["day_of_month"] = df["date"].dt.day
    df["product_id_code"] = df["product_id"].astype("category").cat.codes

    selected_date = datetime.now()
    forecast_results = []

    for prod in df["product_name"].unique():
        prod_data = df[df["product_name"] == prod]
        if len(prod_data) >= 5:
            X = prod_data[["product_id_code", "month", "day_of_month"]]
            y = prod_data["stock_sold"]

            model = RandomForestRegressor(n_estimators=50, random_state=42)
            model.fit(X, y)

            next_month = (selected_date.month % 12) + 1
            pred = model.predict([[prod_data["product_id_code"].iloc[0], next_month, 15]])

            forecast_results.append({
                "product": prod,
                "predicted_sales": int(pred[0] * 30)
            })

    return forecast_results
import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


def run_classification_model(df):
    """
    Predicts sales trend direction per product:
    'Increase', 'Decrease', or 'Stable'
    """

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df = df.sort_values("date")

    # Basic feature extraction
    df["month"] = df["date"].dt.month.fillna(0).astype(int)
    df["day_of_week"] = df["date"].dt.dayofweek.fillna(0).astype(int)

    # Ensure numeric columns exist
    for col in ["stock_sold", "discount_percent", "base_price"]:
        if col not in df.columns:
            df[col] = 0
        df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0)

    # Handle expiry date
    if "expiry_date" in df.columns:
        df["days_to_expiry"] = (
            pd.to_datetime(df["expiry_date"], errors="coerce") - df["date"]
        ).dt.days.clip(lower=0).fillna(0)
    else:
        df["days_to_expiry"] = 0

    df["product_code"] = df["product_name"].astype("category").cat.codes

    # Filter valid data
    df = df[df["stock_sold"] > 0].copy()
    if len(df) < 10:
        return {"error": "Insufficient sales data for classification."}

    results = []
    accs = []

    # Process per product
    for prod, prod_df in df.groupby("product_name"):
        if len(prod_df) < 5:
            continue

        prod_df = prod_df.sort_values("date").reset_index(drop=True)

        # Compute trend label
        prod_df["sales_diff"] = prod_df["stock_sold"].diff().fillna(0)
        threshold = max(1, prod_df["stock_sold"].mean() * 0.05)  # 5% threshold
        prod_df["trend"] = np.where(
            prod_df["sales_diff"] > threshold, "Increase",
            np.where(prod_df["sales_diff"] < -threshold, "Decrease", "Stable")
        )

        # Remove first row (no previous diff)
        prod_df = prod_df.iloc[1:]

        if prod_df["trend"].nunique() < 2:
            continue

        feature_cols = ["month", "day_of_week", "discount_percent", "base_price", "days_to_expiry"]
        X = prod_df[feature_cols]
        y = prod_df["trend"]

        if len(X) < 6:
            continue

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.3, random_state=42
        )

        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        preds = model.predict(X_test)
        acc = accuracy_score(y_test, preds)
        accs.append(acc)

        importances = dict(zip(X.columns, model.feature_importances_))
        top_feature = max(importances, key=importances.get)

        results.append({
            "product": prod,
            "accuracy": round(acc, 3),
            "top_feature": top_feature,
            "feature_importance": importances,
        })

    if not results:
        return {"error": "No product had enough trend variation for classification."}

    overall_accuracy = round(np.mean(accs), 3)
    return {"overall_accuracy": overall_accuracy, "products": results}
