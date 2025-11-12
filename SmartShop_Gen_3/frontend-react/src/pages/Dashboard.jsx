import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid, LineChart, Line
} from "recharts";

const Dashboard = () => {
  const BASE_URL = "http://127.0.0.1:8000";
  const [inventory, setInventory] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [error, setError] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);

  // Cancel token for axios to avoid race conditions
  const CancelToken = axios.CancelToken;
  let cancelRequest;

  const fetchData = async () => {
    if (cancelRequest) cancelRequest(); // cancel ongoing request
    setLoading(true);
    setError("");

    try {
      const invUrl = `${BASE_URL}/data/inventory${dateFilter ? `?date=${dateFilter}` : ""}`;
      const transUrl = `${BASE_URL}/data/transactions?limit=${limit}${dateFilter ? `&date=${dateFilter}` : ""}`;

      const [invRes, transRes] = await Promise.all([
        axios.get(invUrl, { cancelToken: new CancelToken(c => (cancelRequest = c)) }),
        axios.get(transUrl, { cancelToken: new CancelToken(c => (cancelRequest = c)) }),
      ]);

      setInventory(invRes.data);
      setTransactions(transRes.data);
    } catch (err) {
      if (axios.isCancel(err)) return;
      console.error("Backend error:", err);
      setError("⚠️ Failed to fetch data from backend.");
      setInventory([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, dateFilter]);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>🛍️ SmartShop Dashboard (Stable)</h1>

      {/* FILTER BAR */}
      <div style={styles.filterBar}>
        <div>
          <label style={styles.label}>📅 Date: </label>
          <input
            type="date"
            onChange={(e) =>
              setDateFilter(e.target.value ? e.target.value.split("-").reverse().join("-") : "")
            }
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>📊 Rows: </label>
          <select value={limit} onChange={(e) => setLimit(Number(e.target.value))} style={styles.input}>
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <button onClick={fetchData} style={styles.refreshBtn}>🔄 Refresh</button>
      </div>

      {loading && <h3 style={{ textAlign: "center", color: "#aaa" }}>⏳ Loading data...</h3>}
      {error && <h3 style={{ color: "red", textAlign: "center" }}>{error}</h3>}

      {!loading && !error && (
        <>
          {/* INVENTORY */}
          {inventory.length > 0 && (
            <div style={styles.chartBox}>
              <h2 style={styles.subTitle}>📦 Inventory Overview</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={inventory}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="product" tick={{ fill: "#ccc" }} />
                  <YAxis tick={{ fill: "#ccc" }} />
                  <Tooltip />
                  <Bar dataKey="stock" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* TRANSACTIONS */}
          {transactions.length > 0 && (
            <div style={styles.chartBox}>
              <h2 style={styles.subTitle}>💳 Recent Transactions</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={transactions}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fill: "#ccc" }} />
                  <YAxis tick={{ fill: "#ccc" }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="quantity" stroke="#FF7300" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>ID</th>
                    <th style={styles.th}>Product</th>
                    <th style={styles.th}>Quantity</th>
                    <th style={styles.th}>Type</th>
                    <th style={styles.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((t) => (
                    <tr key={t.id}>
                      <td style={styles.td}>{t.id}</td>
                      <td style={styles.td}>{t.product}</td>
                      <td style={styles.td}>{t.quantity}</td>
                      <td style={{ ...styles.td, color: "#ff6b6b", fontWeight: 600 }}>{t.type}</td>
                      <td style={styles.td}>{t.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Styles
const styles = {
  container: {
    background: "linear-gradient(135deg, #141E30, #243B55)",
    minHeight: "100vh",
    color: "#fff",
    padding: "2rem",
    fontFamily: "'Poppins', sans-serif",
  },
  heading: { textAlign: "center", marginBottom: "1.5rem" },
  filterBar: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    flexWrap: "wrap",
    marginBottom: "2rem",
  },
  input: {
    padding: "0.3rem 0.6rem",
    borderRadius: "6px",
    border: "none",
    background: "#eee",
    color: "#000",
  },
  refreshBtn: {
    background: "#0072ff",
    color: "#fff",
    border: "none",
    padding: "0.4rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
  },
  chartBox: {
    background: "rgba(255,255,255,0.08)",
    padding: "1rem 1.5rem",
    borderRadius: "15px",
    marginBottom: "2rem",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: { textAlign: "left", padding: "10px 20px", borderBottom: "2px solid rgba(255,255,255,0.15)" },
  td: { padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)" },
  subTitle: { marginBottom: "1rem" },
};

export default Dashboard;
