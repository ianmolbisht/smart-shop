

import React, { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const FORECAST_URL = "http://127.0.0.1:8000/predict/forecast";
const CLASSIFY_URL = "http://127.0.0.1:8000/predict/classify";

const MLAnalytics = () => {
  const [forecastData, setForecastData] = useState([]);
  const [classifyData, setClassifyData] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // === Run Forecast API ===
  const runForecast = async () => {
    setLoading(true);
    setError("");
    setForecastData([]);
    try {
      const res = await axios.get(FORECAST_URL);
      if (res.status === 200) {
        setForecastData(res.data.forecast || []);
      } else {
        setError("Error fetching forecast data");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch forecast data from backend");
    } finally {
      setLoading(false);
    }
  };

  // === Run Classification API ===
  const runClassification = async () => {
    setLoading(true);
    setError("");
    setClassifyData(null);
    try {
      const res = await axios.get(CLASSIFY_URL);
      if (res.status === 200) {
        setClassifyData(res.data.classification || {});
        if (res.data.products && res.data.products.length > 0) {
          setSelectedProduct(res.data.products[0].product);
        }
      } else {
        setError("Error fetching classification data");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to fetch classification data from backend");
    } finally {
      setLoading(false);
    }
  };

  const selectedProductData =
    classifyData?.products?.find((p) => p.product === selectedProduct) || null;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>🤖 SmartShop — ML Analytics</h2>

      {error && <p style={styles.error}>{error}</p>}

      {/* ================= Forecast Section ================= */}
      <section style={styles.section}>
        <div style={styles.headerRow}>
          <h3 style={styles.sectionTitle}>📈 Sales Forecast (Regression)</h3>
          <button onClick={runForecast} style={styles.primaryBtn}>
            {loading ? "Running..." : "Run Forecast"}
          </button>
        </div>

        {forecastData.length > 0 ? (
          <div style={styles.card}>
            <h4 style={styles.cardTitle}>Predicted Sales per Product</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart
                data={forecastData}
                margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="product"
                  tick={{ fontSize: 12 }}
                  angle={-25}
                  textAnchor="end"
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar
                  dataKey="predicted_sales"
                  fill="#4f46e5"
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          !loading && (
            <p style={styles.placeholder}>
              Run the forecast model to view predictions.
            </p>
          )
        )}
      </section>

      {/* ================= Classification Section ================= */}
      <section style={styles.section}>
        <div style={styles.headerRow}>
          <h3 style={styles.sectionTitle}>
            🎯 Product-Wise Sales Classification
          </h3>
          <button onClick={runClassification} style={styles.secondaryBtn}>
            {loading ? "Running..." : "Run Classification"}
          </button>
        </div>

        {classifyData && classifyData.products && classifyData.products.length > 0 ? (
          <div style={styles.card}>
            <p>
              <strong>Overall Model Accuracy:</strong>{" "}
              {(classifyData.overall_accuracy * 100).toFixed(2)}%
            </p>

            <div style={styles.dropdownRow}>
              <label htmlFor="product" style={styles.label}>
                Select Product:
              </label>
              <select
                id="product"
                style={styles.select}
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
              >
                {classifyData.products.map((prod) => (
                  <option key={prod.product} value={prod.product}>
                    {prod.product}
                  </option>
                ))}
              </select>
            </div>

            {selectedProductData ? (
              <>
                <div style={styles.metricBox}>
                  <p>
                    <strong>Accuracy:</strong>{" "}
                    {(selectedProductData.accuracy * 100).toFixed(2)}%
                  </p>
                  <p>
                    <strong>Top Feature:</strong>{" "}
                    {selectedProductData.top_feature}
                  </p>
                </div>

                <h4 style={styles.cardTitle}>Feature Importance</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={Object.entries(selectedProductData.feature_importance)
                      .filter(([feature]) => !["base_price", "discount_percent"].includes(feature))
                      .map(([feature, importance]) => ({
                        feature,
                        importance,
                      }))
                      .sort((a, b) => b.importance - a.importance)}

                    margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="feature"
                      tick={{ fontSize: 12 }}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar
                      dataKey="importance"
                      fill="#f97316"
                      radius={[8, 8, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <p style={styles.placeholder}>Select a product to view details.</p>
            )}
          </div>
        ) : (
          !loading && (
            <p style={styles.placeholder}>
              Run the classification model to analyze sales performance.
            </p>
          )
        )}
      </section>
    </div>
  );
};

// === Styles ===
const styles = {
  container: {
    padding: "2rem",
    fontFamily: "'Inter', sans-serif",
    backgroundColor: "#f8fafc",
    minHeight: "100vh",
  },
  title: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "#111827",
    marginBottom: "2rem",
  },
  section: {
    marginBottom: "3rem",
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  sectionTitle: {
    fontSize: "1.3rem",
    color: "#1f2937",
    fontWeight: 600,
  },
  card: {
    padding: "1.5rem",
    borderRadius: "10px",
    backgroundColor: "#f9fafb",
    boxShadow: "inset 0 1px 4px rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: "1.1rem",
    color: "#374151",
    marginBottom: "1rem",
    fontWeight: 500,
  },
  dropdownRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    marginTop: "1rem",
    marginBottom: "1rem",
  },
  label: {
    fontWeight: 500,
    color: "#374151",
  },
  select: {
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    fontSize: "0.95rem",
  },
  metricBox: {
    backgroundColor: "white",
    padding: "1rem",
    borderRadius: "8px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
    marginBottom: "1.5rem",
  },
  placeholder: {
    textAlign: "center",
    fontStyle: "italic",
    color: "#6b7280",
  },
  primaryBtn: {
    backgroundColor: "#4f46e5",
    color: "white",
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 500,
    transition: "0.2s",
  },
  secondaryBtn: {
    backgroundColor: "#f97316",
    color: "white",
    padding: "0.6rem 1.2rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 500,
    transition: "0.2s",
  },
  error: {
    background: "#fee2e2",
    color: "#b91c1c",
    padding: "0.8rem 1rem",
    borderRadius: "8px",
    marginBottom: "1rem",
    fontWeight: 500,
  },
};

export default MLAnalytics;
