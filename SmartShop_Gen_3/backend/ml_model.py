# # # backend/ml_model.py

# # import pandas as pd
# # from datetime import datetime
# # from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
# # from sklearn.model_selection import train_test_split
# # from sklearn.metrics import accuracy_score


# # def run_ml_models(df):
# #     """Run both regression (forecasting) and classification models on transaction data."""
# #     df["date"] = pd.to_datetime(df["date"], errors="coerce")
# #     df["month"] = df["date"].dt.month
# #     df["day_of_month"] = df["date"].dt.day
# #     df["product_id_code"] = df["product_id"].astype("category").cat.codes
# #     selected_date = datetime.now()

# #     results = {"forecast": [], "classification": {}}

# #     # === 1. Regression (Sales Forecasting) ===
# #     for prod in df["product_name"].unique():
# #         prod_data = df[df["product_name"] == prod]
# #         if len(prod_data) >= 5:
# #             X = prod_data[["product_id_code", "month", "day_of_month"]]
# #             y = prod_data["stock_sold"]

# #             model = RandomForestRegressor(n_estimators=50, random_state=42)
# #             model.fit(X, y)

# #             next_month = (selected_date.month % 12) + 1
# #             pred = model.predict([[prod_data["product_id_code"].iloc[0], next_month, 15]])

# #             results["forecast"].append({
# #                 "product": prod,
# #                 "predicted_sales": int(pred[0] * 30)
# #             })

# #     # === 2. Classification (Performance) ===
# #     df_class = df[df["stock_sold"] > 0].copy()

# #     if len(df_class) >= 15:
# #         df_class["sales_performance"] = pd.cut(
# #             df_class["stock_sold"],
# #             bins=[
# #                 0,
# #                 df_class["stock_sold"].quantile(0.33),
# #                 df_class["stock_sold"].quantile(0.66),
# #                 df_class["stock_sold"].max(),
# #             ],
# #             labels=["Low", "Medium", "High"],
# #             include_lowest=True,
# #         )

# #         X_class = df_class[["product_id_code", "month", "day_of_month", "discount_percent"]]
# #         y_class = df_class["sales_performance"]

# #         X_train, X_test, y_train, y_test = train_test_split(X_class, y_class, test_size=0.3, random_state=42)
# #         clf = RandomForestClassifier(n_estimators=100, random_state=42)
# #         clf.fit(X_train, y_train)
# #         acc = accuracy_score(y_test, clf.predict(X_test))

# #         importances = dict(zip(X_class.columns, clf.feature_importances_))
# #         results["classification"] = {
# #             "accuracy": round(acc, 3),
# #             "feature_importance": importances,
# #         }

# #     return results






# import pandas as pd
# from datetime import datetime
# from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
# from sklearn.model_selection import train_test_split
# from sklearn.metrics import accuracy_score


# def run_regression_model(df):
#     """Run regression model for sales forecasting per product."""
#     df["date"] = pd.to_datetime(df["date"], errors="coerce")
#     df["month"] = df["date"].dt.month
#     df["day_of_month"] = df["date"].dt.day
#     df["product_id_code"] = df["product_id"].astype("category").cat.codes

#     selected_date = datetime.now()
#     forecast_results = []

#     for prod in df["product_name"].unique():
#         prod_data = df[df["product_name"] == prod]
#         if len(prod_data) >= 5:
#             X = prod_data[["product_id_code", "month", "day_of_month"]]
#             y = prod_data["stock_sold"]

#             model = RandomForestRegressor(n_estimators=50, random_state=42)
#             model.fit(X, y)

#             next_month = (selected_date.month % 12) + 1
#             pred = model.predict([[prod_data["product_id_code"].iloc[0], next_month, 15]])

#             forecast_results.append({
#                 "product": prod,
#                 "predicted_sales": int(pred[0] * 30)
#             })

#     return forecast_results


# def run_classification_model(df):
#     """Run classification model for sales performance evaluation."""
#     df["date"] = pd.to_datetime(df["date"], errors="coerce")
#     df["month"] = df["date"].dt.month
#     df["day_of_month"] = df["date"].dt.day
#     df["product_id_code"] = df["product_id"].astype("category").cat.codes

#     df_class = df[df["stock_sold"] > 0].copy()

#     if len(df_class) < 15:
#         return {"error": "Not enough data for classification model."}

#     df_class["sales_performance"] = pd.cut(
#         df_class["stock_sold"],
#         bins=[
#             0,
#             df_class["stock_sold"].quantile(0.33),
#             df_class["stock_sold"].quantile(0.66),
#             df_class["stock_sold"].max(),
#         ],
#         labels=["Low", "Medium", "High"],
#         include_lowest=True,
#     )

#     X_class = df_class[["product_id_code", "month", "day_of_month", "discount_percent"]]
#     y_class = df_class["sales_performance"]

#     X_train, X_test, y_train, y_test = train_test_split(
#         X_class, y_class, test_size=0.3, random_state=42
#     )

#     clf = RandomForestClassifier(n_estimators=100, random_state=42)
#     clf.fit(X_train, y_train)
#     acc = accuracy_score(y_test, clf.predict(X_test))
#     importances = dict(zip(X_class.columns, clf.feature_importances_))

#     return {
#         "accuracy": round(acc, 3),
#         "feature_importance": importances
#     }


import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score


# ==========================================================
# 🧠 REGRESSION MODEL — Product-wise Sales Forecast
# ==========================================================
def run_regression_model(df):
    """
    Predict next month's sales for each product using RandomForestRegressor.
    Returns list of dicts: [{"product": "Rice", "predicted_sales": 320}, ...]
    """
    df = df.copy()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["month"] = df["date"].dt.month
    df["day_of_month"] = df["date"].dt.day
    df["product_id_code"] = df["product_id"].astype("category").cat.codes

    forecast_results = []
    selected_date = datetime.now()

    for prod in df["product_name"].unique():
        prod_data = df[df["product_name"] == prod].copy()

        if len(prod_data) >= 5 and prod_data["stock_sold"].sum() > 0:
            X = prod_data[["month", "day_of_month", "discount_percent"]].fillna(0)
            y = prod_data["stock_sold"]

            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X, y)

            next_month = (selected_date.month % 12) + 1
            # Middle of the month, assume standard 10% discount scenario
            test_input = pd.DataFrame([[next_month, 15, 10]], columns=X.columns)
            prediction = model.predict(test_input)[0]

            forecast_results.append({
                "product": prod,
                "predicted_sales": int(max(prediction * 30, 0))
            })

    return forecast_results


# ==========================================================
# 🎯 CLASSIFICATION MODEL — Product-level Sales Performance
# ==========================================================
def run_classification_model(df):
    """
    Classifies sales performance ('Low', 'Medium', 'High') per product.
    Returns:
        {
            "overall_accuracy": 0.87,
            "products": [
                {"product": "Rice", "accuracy": 0.91, "top_feature": "discount_percent"},
                {"product": "Oil", "accuracy": 0.79, "top_feature": "month"},
                ...
            ]
        }
    """

    df = df.copy()
    df["date"] = pd.to_datetime(df["date"], errors="coerce")
    df["month"] = df["date"].dt.month
    df["day_of_month"] = df["date"].dt.day
    df["is_weekend"] = df["day"].isin(["Saturday", "Sunday"]).astype(int) if "day" in df.columns else 0
    df["product_id_code"] = df["product_id"].astype("category").cat.codes
    df["discount_percent"].fillna(0, inplace=True)
    df["base_price"].fillna(df["base_price"].mean() if "base_price" in df.columns else 0, inplace=True)

    # Derived feature: days_to_expiry
    if "expiry_date" in df.columns:
        df["days_to_expiry"] = (
            pd.to_datetime(df["expiry_date"], errors="coerce") -
            pd.to_datetime(df["date"], errors="coerce")
        ).dt.days.clip(lower=0)
    else:
        df["days_to_expiry"] = 0

    # Keep only valid sales entries
    df = df[df["stock_sold"] > 0].copy()

    if len(df) < 20:
        return {"error": "Not enough transaction data for classification."}

    feature_cols = ["month", "day_of_month", "discount_percent", "base_price", "is_weekend", "days_to_expiry"]
    results = []
    all_acc = []

    for prod, prod_df in df.groupby("product_name"):
        if len(prod_df) < 10:
            continue

        X = prod_df[feature_cols].fillna(0)
        y = pd.cut(
            prod_df["stock_sold"],
            bins=[
                0,
                prod_df["stock_sold"].quantile(0.33),
                prod_df["stock_sold"].quantile(0.66),
                prod_df["stock_sold"].max(),
            ],
            labels=["Low", "Medium", "High"],
            include_lowest=True,
        )

        if len(y.unique()) < 2:
            continue

        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=0.3, random_state=42
        )

        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        preds = model.predict(X_test)
        acc = accuracy_score(y_test, preds)
        all_acc.append(acc)

        importances = dict(zip(feature_cols, model.feature_importances_))
        top_feature = max(importances, key=importances.get)

        results.append({
            "product": prod,
            "accuracy": round(acc, 3),
            "top_feature": top_feature,
            "feature_importance": importances
        })

    if not results:
        return {"error": "No product had enough data for reliable training."}

    overall_accuracy = round(np.mean(all_acc), 3)
    return {"overall_accuracy": overall_accuracy, "products": results}
