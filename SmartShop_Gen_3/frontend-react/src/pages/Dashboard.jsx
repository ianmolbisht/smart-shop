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

  const CancelToken = axios.CancelToken;
  let cancelRequest;

  const fetchData = async () => {
    if (cancelRequest) cancelRequest();
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
      setError("Failed to fetch data from backend.");
      setInventory([]);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTransaction = async (product, quantity, type) => {
    try {
      await axios.post(`${BASE_URL}/data/transaction`, { product, quantity, type });
      fetchData();
    } catch (err) {
      console.error("Transaction failed:", err);
      setError("Transaction update failed.");
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit, dateFilter]);

  return (
    <div style={styles.container}>
      <h1 style={styles.heading}>SmartShop Analytics Dashboard</h1>

      <div style={styles.filterBar}>
        <div>
          <label style={styles.label}>Date</label>
          <input
            type="date"
            onChange={(e) =>
              setDateFilter(e.target.value ? e.target.value.split("-").reverse().join("-") : "")
            }
            style={styles.input}
          />
        </div>

        <div>
          <label style={styles.label}>Rows</label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={styles.input}
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <button onClick={fetchData} style={styles.refreshBtn}>Refresh</button>
      </div>

      {loading && <h3 style={styles.loading}>Loading data...</h3>}
      {error && <h3 style={styles.error}>{error}</h3>}

      {!loading && !error && (
        <>
          {inventory.length > 0 && (
            <div style={styles.chartBox}>
              <h2 style={styles.subTitle}>Inventory Overview</h2>

              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={inventory}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2f3c58" />
                  <XAxis dataKey="product" tick={{ fill: "#ccc" }} />
                  <YAxis tick={{ fill: "#ccc" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "none" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Bar dataKey="stock" fill="#00E0FF" radius={[5, 5, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>

              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Product</th>
                    <th style={styles.th}>Stock</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.map((item) => (
                    <tr key={item.product}>
                      <td style={styles.td}>{item.product}</td>
                      <td style={styles.td}>{item.stock}</td>
                      <td style={styles.td}>
                        <button
                          onClick={() => handleTransaction(item.product, 1, "buy")}
                          style={styles.buyBtn}
                        >
                          Buy
                        </button>
                        <button
                          onClick={() => handleTransaction(item.product, 1, "sell")}
                          style={styles.sellBtn}
                        >
                          Sell
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {transactions.length > 0 && (
            <div style={styles.chartBox}>
              <h2 style={styles.subTitle}>Recent Transactions</h2>

              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={transactions}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2f3c58" />
                  <XAxis dataKey="date" tick={{ fill: "#ccc" }} />
                  <YAxis tick={{ fill: "#ccc" }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1e293b", border: "none" }}
                    labelStyle={{ color: "#fff" }}
                  />
                  <Line type="monotone" dataKey="quantity" stroke="#FF4F00" strokeWidth={2} dot={{ r: 3 }} />
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
                      <td style={{ ...styles.td, color: t.type === "sell" ? "#ff6b6b" : "#4ADE80" }}>
                        {t.type}
                      </td>
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
    background: "linear-gradient(160deg, #0f172a 0%, #1e293b 100%)",
    minHeight: "100vh",
    color: "#fff",
    padding: "2.5rem",
    fontFamily: "'Poppins', sans-serif",
  },
  heading: {
    textAlign: "center",
    fontSize: "2rem",
    letterSpacing: "0.5px",
    color: "#00E0FF",
    marginBottom: "2rem",
  },
  filterBar: {
    display: "flex",
    justifyContent: "center",
    gap: "1.2rem",
    flexWrap: "wrap",
    marginBottom: "2rem",
  },
  label: { marginRight: "0.4rem", fontWeight: "500" },
  input: {
    padding: "0.4rem 0.7rem",
    borderRadius: "8px",
    border: "none",
    background: "#e2e8f0",
    color: "#000",
    fontWeight: "500",
  },
  refreshBtn: {
    background: "linear-gradient(90deg, #00E0FF, #0072ff)",
    color: "#fff",
    border: "none",
    padding: "0.45rem 1.2rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "transform 0.15s ease",
  },
  chartBox: {
    background: "rgba(255,255,255,0.06)",
    padding: "1.4rem 1.8rem",
    borderRadius: "20px",
    marginBottom: "2.5rem",
    boxShadow: "0 4px 25px rgba(0,0,0,0.3)",
  },
  subTitle: {
    fontSize: "1.4rem",
    color: "#93C5FD",
    marginBottom: "1rem",
    borderLeft: "4px solid #00E0FF",
    paddingLeft: "10px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "1rem",
  },
  th: {
    textAlign: "left",
    padding: "12px 18px",
    borderBottom: "2px solid rgba(255,255,255,0.15)",
    color: "#a5b4fc",
    fontWeight: 600,
    fontSize: "0.95rem",
  },
  td: {
    padding: "12px 18px",
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    fontWeight: 400,
  },
  buyBtn: {
    background: "linear-gradient(90deg, #22c55e, #16a34a)",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    marginRight: "8px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "transform 0.1s ease",
  },
  sellBtn: {
    background: "linear-gradient(90deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    transition: "transform 0.1s ease",
  },
  error: { color: "#f87171", textAlign: "center" },
  loading: { textAlign: "center", color: "#a5b4fc" },
};

export default Dashboard;
