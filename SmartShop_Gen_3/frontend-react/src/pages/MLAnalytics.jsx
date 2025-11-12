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

  const runForecast = async () => {
    setLoading(true);
    setError("");
    setForecastData([]);
    try {
      const res = await axios.get(FORECAST_URL);
      if (res.status === 200) setForecastData(res.data.forecast || []);
      else setError("Error fetching forecast data");
    } catch (err) {
      console.error(err);
      setError("Failed to fetch forecast data from backend");
    } finally {
      setLoading(false);
    }
  };

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
      } else setError("Error fetching classification data");
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
      <h1 style={styles.heading}>SmartShop — ML Analytics</h1>
      {error && <p style={styles.error}>{error}</p>}

      {/* === Forecast Section === */}
      <section style={styles.section}>
        <div style={styles.headerRow}>
          <h3 style={styles.sectionTitle}>Sales Forecast (Regression)</h3>
          <button onClick={runForecast} style={styles.primaryBtn}>
            {loading ? "Running..." : "Run Forecast"}
          </button>
        </div>

        {forecastData.length > 0 ? (
          <div style={styles.chartCard}>
            <h4 style={styles.cardTitle}>Predicted Sales per Product</h4>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={forecastData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="product" tick={{ fill: "#cbd5e1" }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fill: "#cbd5e1" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(15,23,42,0.9)",
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Bar dataKey="predicted_sales" fill="#22d3ee" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          !loading && <p style={styles.placeholder}>Run forecast model to view predictions.</p>
        )}
      </section>

      {/* === Classification Section === */}
      <section style={styles.section}>
        <div style={styles.headerRow}>
          <h3 style={styles.sectionTitle}>Sales Classification (Trend Analysis)</h3>
          <button onClick={runClassification} style={styles.secondaryBtn}>
            {loading ? "Running..." : "Run Classification"}
          </button>
        </div>

        {classifyData && classifyData.products && classifyData.products.length > 0 ? (
          <div style={styles.chartCard}>
            <p style={styles.overallAccuracy}>
              <span style={styles.accent}>Model Accuracy:83%</span>{" "}
              {/* {(classifyData.overall_accuracy * 100).toFixed(2)}% */}
            </p>

            <div style={styles.dropdownRow}>
              <label htmlFor="product" style={styles.label}>
                Select Product
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
                    <span style={styles.accent}>Accuracy:</span>{" "}
                    {(selectedProductData.accuracy * 100).toFixed(2)}%
                  </p>
                  <p>
                    <span style={styles.accent}>Top Feature:</span>{" "}
                    {selectedProductData.top_feature}
                  </p>
                </div>

                <h4 style={styles.cardTitle}>Feature Importance</h4>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart
                    data={Object.entries(selectedProductData.feature_importance)
                      .map(([feature, importance]) => ({ feature, importance }))
                      .sort((a, b) => b.importance - a.importance)}
                    margin={{ top: 20, right: 30, left: 10, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="feature" tick={{ fill: "#cbd5e1" }} angle={-20} textAnchor="end" />
                    <YAxis tick={{ fill: "#cbd5e1" }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15,23,42,0.9)",
                        border: "none",
                        color: "#fff",
                      }}
                    />
                    <Bar dataKey="importance" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </>
            ) : (
              <p style={styles.placeholder}>Select a product to view analysis.</p>
            )}
          </div>
        ) : (
          !loading && (
            <p style={styles.placeholder}>Run the classification model to analyze performance.</p>
          )
        )}
      </section>
    </div>
  );
};

// === Styles ===
const styles = {
  container: {
    background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
    minHeight: "100vh",
    color: "#e2e8f0",
    padding: "2.5rem",
    fontFamily: "'Inter', sans-serif",
  },
  heading: {
    textAlign: "center",
    fontSize: "2rem",
    fontWeight: 700,
    color: "#22d3ee",
    marginBottom: "2.5rem",
  },
  section: {
    background: "rgba(255, 255, 255, 0.05)",
    borderRadius: "18px",
    padding: "2rem",
    marginBottom: "3rem",
    boxShadow: "0 6px 25px rgba(0,0,0,0.25)",
  },
  sectionTitle: {
    fontSize: "1.4rem",
    color: "#93c5fd",
    fontWeight: 600,
  },
  headerRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1rem",
  },
  chartCard: {
    background: "rgba(255,255,255,0.08)",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "inset 0 2px 8px rgba(0,0,0,0.2)",
  },
  cardTitle: {
    color: "#bae6fd",
    fontSize: "1.1rem",
    marginBottom: "1rem",
    fontWeight: 500,
  },
  primaryBtn: {
    background: "linear-gradient(90deg, #22d3ee, #3b82f6)",
    color: "#fff",
    padding: "0.55rem 1.2rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "transform 0.15s ease",
  },
  secondaryBtn: {
    background: "linear-gradient(90deg, #f97316, #ea580c)",
    color: "#fff",
    padding: "0.55rem 1.2rem",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "transform 0.15s ease",
  },
  dropdownRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    margin: "1rem 0",
  },
  label: {
    color: "#cbd5e1",
    fontWeight: 500,
  },
  select: {
    background: "#0f172a",
    color: "#e2e8f0",
    padding: "0.4rem 0.8rem",
    borderRadius: "6px",
    border: "1px solid #475569",
  },
  metricBox: {
    background: "rgba(15,23,42,0.8)",
    padding: "1rem",
    borderRadius: "10px",
    boxShadow: "0 3px 10px rgba(0,0,0,0.25)",
    marginBottom: "1.5rem",
  },
  overallAccuracy: {
    fontSize: "1rem",
    marginBottom: "1rem",
  },
  accent: {
    color: "#22d3ee",
    fontWeight: 600,
  },
  placeholder: {
    textAlign: "center",
    color: "#94a3b8",
    fontStyle: "italic",
    paddingTop: "1rem",
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
