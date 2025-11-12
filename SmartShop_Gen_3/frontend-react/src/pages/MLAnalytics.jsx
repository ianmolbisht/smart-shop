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
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.heading}>
            <span style={styles.headingIcon}></span>
            ML Analytics
          </h1>
          <p style={styles.subheading}>Predictive insights and machine learning models</p>
        </div>
      </div>

      {error && (
        <div style={styles.errorContainer}>
          <span style={styles.errorIcon}></span>
          <p style={styles.error}>{error}</p>
        </div>
      )}

      {/* === Forecast Section === */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}>📈</span>
              Sales Forecast (Regression)
            </h3>
            <p style={styles.sectionDescription}>Predict future sales using regression analysis</p>
          </div>
          <button onClick={runForecast} style={styles.primaryBtn} disabled={loading}>
            {loading ? (
              <>
                <span style={styles.btnSpinner}></span>
                Running...
              </>
            ) : (
              <>
                <span style={styles.btnIcon}></span>
                Run Forecast
              </>
            )}
          </button>
        </div>

        {forecastData.length > 0 ? (
          <div style={styles.chartCard}>
            <div style={styles.cardHeader}>
              <h4 style={styles.cardTitle}>
                <span style={styles.cardIcon}></span>
                Predicted Sales per Product
              </h4>
              <div style={styles.badge}>
                {forecastData.length} Products
              </div>
            </div>
            <div style={styles.chartWrapper}>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={forecastData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                  <XAxis 
                    dataKey="product" 
                    tick={{ fill: "#cbd5e1", fontSize: 12 }} 
                    angle={-25} 
                    textAnchor="end" 
                  />
                  <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(15, 23, 42, 0.95)",
                      border: "1px solid rgba(34, 211, 238, 0.3)",
                      borderRadius: "8px",
                      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#22d3ee", fontWeight: 600 }}
                    itemStyle={{ color: "#e2e8f0" }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="predicted_sales" 
                    fill="url(#forecastGradient)" 
                    radius={[8, 8, 0, 0]}
                    animationDuration={1000}
                  >
                    <defs>
                      <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={1}/>
                        <stop offset="100%" stopColor="#06b6d4" stopOpacity={0.8}/>
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          !loading && (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}></span>
              <p style={styles.placeholder}>Run forecast model to view predictions.</p>
            </div>
          )
        )}
      </section>

      {/* === Classification Section === */}
      <section style={styles.section}>
        <div style={styles.sectionHeader}>
          <div>
            <h3 style={styles.sectionTitle}>
              <span style={styles.sectionIcon}></span>
              Sales Classification (Trend Analysis)
            </h3>
            <p style={styles.sectionDescription}>Analyze product trends and feature importance</p>
          </div>
          <button onClick={runClassification} style={styles.secondaryBtn} disabled={loading}>
            {loading ? (
              <>
                <span style={styles.btnSpinner}></span>
                Running...
              </>
            ) : (
              <>
                <span style={styles.btnIcon}></span>
                Run Classification
              </>
            )}
          </button>
        </div>

        {classifyData && classifyData.products && classifyData.products.length > 0 ? (
          <div style={styles.chartCard}>
            <div style={styles.dropdownRow}>
              <label htmlFor="product" style={styles.label}>
                <span style={styles.labelIcon}></span>
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
                <div style={styles.metricsGrid}>
                  <div style={styles.metricCard}>
                    <div style={styles.metricIcon}></div>
                    <div>
                      <div style={styles.metricLabel}>Top Feature</div>
                      <div style={styles.metricValue}>{selectedProductData.top_feature}</div>
                    </div>
                  </div>
                </div>

                <div style={styles.chartSection}>
                  <h4 style={styles.cardTitle}>
                    <span style={styles.cardIcon}></span>
                    Feature Importance
                  </h4>
                  <div style={styles.chartWrapper}>
                    <ResponsiveContainer width="100%" height={350}>
                      <BarChart
                        data={Object.entries(selectedProductData.feature_importance)
                          .map(([feature, importance]) => ({ feature, importance }))
                          .sort((a, b) => b.importance - a.importance)}
                        margin={{ top: 20, right: 30, left: 10, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                        <XAxis 
                          dataKey="feature" 
                          tick={{ fill: "#cbd5e1", fontSize: 12 }} 
                          angle={-20} 
                          textAnchor="end" 
                        />
                        <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "rgba(15, 23, 42, 0.95)",
                            border: "1px solid rgba(249, 115, 22, 0.3)",
                            borderRadius: "8px",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                            color: "#fff",
                          }}
                          labelStyle={{ color: "#f97316", fontWeight: 600 }}
                          itemStyle={{ color: "#2e6bbaff" }}
                        />
                        <Bar 
                          dataKey="importance" 
                          fill="url(#importanceGradient)" 
                          radius={[8, 8, 0, 0]}
                          animationDuration={1000}
                        >
                          <defs>
                            <linearGradient id="importanceGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#f97316" stopOpacity={1}/>
                              <stop offset="100%" stopColor="#ea580c" stopOpacity={0.8}/>
                            </linearGradient>
                          </defs>
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div style={styles.emptyState}>
                <span style={styles.emptyIcon}></span>
                <p style={styles.placeholder}>Select a product to view analysis.</p>
              </div>
            )}
          </div>
        ) : (
          !loading && (
            <div style={styles.emptyState}>
              <span style={styles.emptyIcon}></span>
              <p style={styles.placeholder}>Run the classification model to analyze performance.</p>
            </div>
          )
        )}
      </section>
    </div>
  );
};

// === Styles ===
const styles = {
  container: {
    background: "linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    minHeight: "100vh",
    color: "#e2e8f0",
    padding: "2.5rem 3rem",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  headerSection: {
    marginBottom: "3rem",
  },
  heading: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    fontSize: "2.8rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "0.5rem",
    letterSpacing: "-1px",
  },
  headingIcon: {
    fontSize: "2.8rem",
    filter: "drop-shadow(0 2px 8px rgba(34, 211, 238, 0.4))",
  },
  subheading: {
    fontSize: "1.1rem",
    color: "#94a3b8",
    fontWeight: 400,
    marginTop: "0.5rem",
    marginLeft: "3.8rem",
  },
  section: {
    background: "rgba(255, 255, 255, 0.04)",
    borderRadius: "24px",
    padding: "2rem 2.5rem",
    marginBottom: "2.5rem",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
    gap: "2rem",
  },
  sectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    fontSize: "1.6rem",
    color: "#e2e8f0",
    fontWeight: 700,
    marginBottom: "0.5rem",
  },
  sectionIcon: {
    fontSize: "1.8rem",
  },
  sectionDescription: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    marginTop: "0.5rem",
    marginLeft: "2.6rem",
  },
  chartCard: {
    background: "rgba(15, 23, 42, 0.4)",
    padding: "2rem",
    borderRadius: "20px",
    boxShadow: "inset 0 2px 12px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(148, 163, 184, 0.1)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "1.5rem",
  },
  cardTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
    color: "#e2e8f0",
    fontSize: "1.2rem",
    fontWeight: 600,
  },
  cardIcon: {
    fontSize: "1.3rem",
  },
  badge: {
    background: "rgba(0, 224, 255, 0.15)",
    color: "#00E0FF",
    padding: "0.4rem 1rem",
    borderRadius: "12px",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  chartWrapper: {
    padding: "1rem",
    background: "rgba(15, 23, 42, 0.3)",
    borderRadius: "16px",
  },
  chartSection: {
    marginTop: "2rem",
  },
  primaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "linear-gradient(135deg, #22d3ee, #3b82f6)",
    color: "#fff",
    padding: "0.7rem 1.5rem",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(34, 211, 238, 0.4)",
    whiteSpace: "nowrap",
  },
  secondaryBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "linear-gradient(135deg, #f97316, #ea580c)",
    color: "#fff",
    padding: "0.7rem 1.5rem",
    border: "none",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(249, 115, 22, 0.4)",
    whiteSpace: "nowrap",
  },
  btnIcon: {
    fontSize: "1.1rem",
  },
  btnSpinner: {
    fontSize: "1.1rem",
    animation: "spin 1s linear infinite",
  },
  dropdownRow: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    margin: "1.5rem 0",
    padding: "1rem",
    background: "rgba(15, 23, 42, 0.4)",
    borderRadius: "12px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    color: "#cbd5e1",
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  labelIcon: {
    fontSize: "1.1rem",
  },
  select: {
    background: "rgba(15, 23, 42, 0.6)",
    color: "#e2e8f0",
    padding: "0.6rem 1rem",
    borderRadius: "10px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    fontSize: "0.95rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "all 0.3s ease",
    outline: "none",
    flex: 1,
    maxWidth: "300px",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "1rem",
    marginBottom: "2rem",
  },
  metricCard: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    background: "rgba(15, 23, 42, 0.6)",
    padding: "1.2rem",
    borderRadius: "12px",
    border: "1px solid rgba(148, 163, 184, 0.1)",
  },
  metricIcon: {
    fontSize: "1.8rem",
    color: "#22d3ee",
  },
  metricLabel: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontWeight: 500,
    marginBottom: "0.3rem",
  },
  metricValue: {
    fontSize: "1.3rem",
    fontWeight: 700,
    color: "#e2e8f0",
  },
  emptyState: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem 2rem",
    gap: "1rem",
  },
  emptyIcon: {
    fontSize: "4rem",
    opacity: 0.5,
  },
  placeholder: {
    textAlign: "center",
    color: "#94a3b8",
    fontStyle: "italic",
    fontSize: "1.1rem",
  },
  errorContainer: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    padding: "1.2rem 1.5rem",
    background: "rgba(239, 68, 68, 0.1)",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    borderRadius: "12px",
    marginBottom: "2rem",
  },
  errorIcon: {
    fontSize: "1.5rem",
  },
  error: {
    color: "#f87171",
    fontSize: "1rem",
    fontWeight: 600,
    margin: 0,
  },
};

export default MLAnalytics;
