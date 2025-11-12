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
      <div style={styles.headerSection}>
        <div>
          <h1 style={styles.heading}>Analytics Dashboard</h1>
          <p style={styles.subheading}>Monitor inventory and track transactions in real-time</p>
        </div>
        <div style={styles.statsContainer}>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📦</div>
            <div>
              <div style={styles.statValue}>{inventory.length}</div>
              <div style={styles.statLabel}>Products</div>
            </div>
          </div>
          <div style={styles.statCard}>
            <div style={styles.statIcon}>📊</div>
            <div>
              <div style={styles.statValue}>{transactions.length}</div>
              <div style={styles.statLabel}>Transactions</div>
            </div>
          </div>
        </div>
      </div>

      <div style={styles.filterBar}>
        <div style={styles.filterGroup}>
          <label style={styles.label}>
            <span style={styles.labelIcon}>📅</span>
            Date Filter
          </label>
          <input
            type="date"
            onChange={(e) =>
              setDateFilter(e.target.value ? e.target.value.split("-").reverse().join("-") : "")
            }
            style={styles.input}
          />
        </div>

        <div style={styles.filterGroup}>
          <label style={styles.label}>
            <span style={styles.labelIcon}>📋</span>
            Rows Limit
          </label>
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            style={styles.select}
          >
            {[5, 10, 20, 50, 100].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>

        <button onClick={fetchData} style={styles.refreshBtn}>
          <span style={styles.btnIcon}>🔄</span>
          Refresh Data
        </button>
      </div>

      {loading && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <h3 style={styles.loading}>Loading data...</h3>
        </div>
      )}
      {error && (
        <div style={styles.errorContainer}>
          <span style={styles.errorIcon}>⚠️</span>
          <h3 style={styles.error}>{error}</h3>
        </div>
      )}

      {!loading && !error && (
        <>
          {inventory.length > 0 && (
            <div style={styles.chartBox}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.subTitle}>
                    <span style={styles.titleIcon}>📦</span>
                    Inventory Overview
                  </h2>
                  <p style={styles.sectionDescription}>Current stock levels for all products</p>
                </div>
              </div>

              <div style={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={inventory}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis 
                      dataKey="product" 
                      tick={{ fill: "#cbd5e1", fontSize: 12 }} 
                      angle={-25}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "rgba(15, 23, 42, 0.95)", 
                        border: "1px solid rgba(0, 224, 255, 0.3)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
                      }}
                      labelStyle={{ color: "#00E0FF", fontWeight: 600 }}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                    <Bar 
                      dataKey="stock" 
                      fill="url(#colorGradient)" 
                      radius={[8, 8, 0, 0]}
                      animationDuration={1000}
                    >
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#00E0FF" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.tableContainer}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Product</th>
                      <th style={styles.th}>Stock</th>
                      <th style={styles.th}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inventory.map((item, idx) => (
                      <tr key={item.product} style={{ animationDelay: `${idx * 50}ms` }}>
                        <td style={styles.td}>
                          <div style={styles.productCell}>
                            <span style={styles.productIcon}>📦</span>
                            {item.product}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.stockBadge}>
                            <span style={styles.stockValue}>{item.stock}</span>
                            <span style={styles.stockUnit}>units</span>
                          </div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.actionButtons}>
                            <button
                              onClick={() => handleTransaction(item.product, 1, "buy")}
                              style={styles.buyBtn}
                              title="Add stock"
                            >
                              <span>➕</span> Buy
                            </button>
                            <button
                              onClick={() => handleTransaction(item.product, 1, "sell")}
                              style={styles.sellBtn}
                              title="Remove stock"
                            >
                              <span>➖</span> Sell
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {transactions.length > 0 && (
            <div style={styles.chartBox}>
              <div style={styles.sectionHeader}>
                <div>
                  <h2 style={styles.subTitle}>
                    <span style={styles.titleIcon}>📊</span>
                    Recent Transactions
                  </h2>
                  <p style={styles.sectionDescription}>Transaction history and trends</p>
                </div>
              </div>

              <div style={styles.chartWrapper}>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={transactions}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.1)" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: "#cbd5e1", fontSize: 12 }} 
                      angle={-25}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fill: "#cbd5e1", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: "rgba(15, 23, 42, 0.95)", 
                        border: "1px solid rgba(249, 115, 22, 0.3)",
                        borderRadius: "8px",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)"
                      }}
                      labelStyle={{ color: "#f97316", fontWeight: 600 }}
                      itemStyle={{ color: "#e2e8f0" }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="quantity" 
                      stroke="url(#lineGradient)" 
                      strokeWidth={3} 
                      dot={{ r: 5, fill: "#f97316" }}
                      activeDot={{ r: 7 }}
                      animationDuration={1000}
                    >
                      <defs>
                        <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#f97316" stopOpacity={1}/>
                          <stop offset="100%" stopColor="#ea580c" stopOpacity={1}/>
                        </linearGradient>
                      </defs>
                    </Line>
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={styles.tableContainer}>
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
                    {transactions.map((t, idx) => (
                      <tr key={t.id} style={{ animationDelay: `${idx * 30}ms` }}>
                        <td style={styles.td}>
                          <span style={styles.idBadge}>#{t.id}</span>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.productCell}>
                            <span style={styles.productIcon}>📦</span>
                            {t.product}
                          </div>
                        </td>
                        <td style={styles.td}>
                          <span style={styles.quantityBadge}>{t.quantity}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.typeBadge,
                            ...(t.type === "sell" ? styles.typeBadgeSell : styles.typeBadgeBuy)
                          }}>
                            {t.type === "sell" ? "➖" : "➕"} {t.type.toUpperCase()}
                          </span>
                        </td>
                        <td style={styles.td}>{t.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
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
    background: "linear-gradient(160deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
    minHeight: "100vh",
    color: "#fff",
    padding: "2.5rem 3rem",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    position: "relative",
    overflowX: "hidden",
  },
  headerSection: {
    marginBottom: "3rem",
  },
  heading: {
    fontSize: "2.8rem",
    fontWeight: 800,
    background: "linear-gradient(135deg, #00E0FF 0%, #3b82f6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "0.5rem",
    letterSpacing: "-1px",
  },
  subheading: {
    fontSize: "1.1rem",
    color: "#94a3b8",
    fontWeight: 400,
    marginTop: "0.5rem",
  },
  statsContainer: {
    display: "flex",
    gap: "1.5rem",
    marginTop: "2rem",
  },
  statCard: {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    background: "rgba(255, 255, 255, 0.05)",
    padding: "1.2rem 1.8rem",
    borderRadius: "16px",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.2)",
    transition: "all 0.3s ease",
  },
  statIcon: {
    fontSize: "2.5rem",
    filter: "drop-shadow(0 2px 8px rgba(0, 224, 255, 0.3))",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#00E0FF",
    lineHeight: 1,
  },
  statLabel: {
    fontSize: "0.9rem",
    color: "#94a3b8",
    marginTop: "0.3rem",
    fontWeight: 500,
  },
  filterBar: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    gap: "1.5rem",
    flexWrap: "wrap",
    marginBottom: "2.5rem",
    padding: "1.5rem",
    background: "rgba(255, 255, 255, 0.03)",
    borderRadius: "16px",
    border: "1px solid rgba(148, 163, 184, 0.1)",
  },
  filterGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    fontWeight: 600,
    color: "#cbd5e1",
    fontSize: "0.9rem",
  },
  labelIcon: {
    fontSize: "1.1rem",
  },
  input: {
    padding: "0.7rem 1rem",
    borderRadius: "10px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    background: "rgba(15, 23, 42, 0.6)",
    color: "#e2e8f0",
    fontWeight: 500,
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    outline: "none",
  },
  select: {
    padding: "0.7rem 1rem",
    borderRadius: "10px",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    background: "rgba(15, 23, 42, 0.6)",
    color: "#e2e8f0",
    fontWeight: 500,
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.3s ease",
    outline: "none",
  },
  refreshBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    background: "linear-gradient(135deg, #00E0FF 0%, #3b82f6 100%)",
    color: "#fff",
    border: "none",
    padding: "0.7rem 1.5rem",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0, 224, 255, 0.3)",
  },
  btnIcon: {
    fontSize: "1.1rem",
  },
  loadingContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "4rem",
    gap: "1.5rem",
  },
  spinner: {
    width: "50px",
    height: "50px",
    border: "4px solid rgba(0, 224, 255, 0.2)",
    borderTop: "4px solid #00E0FF",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
  },
  loading: {
    textAlign: "center",
    color: "#a5b4fc",
    fontSize: "1.2rem",
    fontWeight: 500,
  },
  errorContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "1rem",
    padding: "1.5rem",
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
    textAlign: "center",
    fontSize: "1.1rem",
    fontWeight: 600,
    margin: 0,
  },
  chartBox: {
    background: "rgba(255, 255, 255, 0.04)",
    padding: "2rem 2.5rem",
    borderRadius: "24px",
    marginBottom: "2.5rem",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(148, 163, 184, 0.1)",
    backdropFilter: "blur(10px)",
    transition: "all 0.3s ease",
  },
  sectionHeader: {
    marginBottom: "2rem",
  },
  subTitle: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
    fontSize: "1.6rem",
    color: "#e2e8f0",
    marginBottom: "0.5rem",
    fontWeight: 700,
  },
  titleIcon: {
    fontSize: "1.8rem",
  },
  sectionDescription: {
    color: "#94a3b8",
    fontSize: "0.95rem",
    marginTop: "0.5rem",
    marginLeft: "2.6rem",
  },
  chartWrapper: {
    marginBottom: "2rem",
    padding: "1rem",
    background: "rgba(15, 23, 42, 0.4)",
    borderRadius: "16px",
  },
  tableContainer: {
    overflowX: "auto",
    borderRadius: "12px",
    background: "rgba(15, 23, 42, 0.4)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "0",
  },
  th: {
    textAlign: "left",
    padding: "16px 20px",
    borderBottom: "2px solid rgba(0, 224, 255, 0.2)",
    color: "#00E0FF",
    fontWeight: 700,
    fontSize: "0.95rem",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  td: {
    padding: "16px 20px",
    borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
    color: "#e2e8f0",
    fontWeight: 400,
    fontSize: "0.95rem",
  },
  productCell: {
    display: "flex",
    alignItems: "center",
    gap: "0.6rem",
  },
  productIcon: {
    fontSize: "1.2rem",
  },
  stockBadge: {
    display: "flex",
    alignItems: "baseline",
    gap: "0.3rem",
  },
  stockValue: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#00E0FF",
  },
  stockUnit: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
  actionButtons: {
    display: "flex",
    gap: "0.6rem",
  },
  buyBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "linear-gradient(135deg, #22c55e, #16a34a)",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.85rem",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(34, 197, 94, 0.3)",
  },
  sellBtn: {
    display: "flex",
    alignItems: "center",
    gap: "0.4rem",
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    color: "#fff",
    border: "none",
    padding: "0.5rem 1rem",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.85rem",
    transition: "all 0.2s ease",
    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.3)",
  },
  idBadge: {
    background: "rgba(0, 224, 255, 0.15)",
    color: "#00E0FF",
    padding: "0.3rem 0.7rem",
    borderRadius: "6px",
    fontSize: "0.85rem",
    fontWeight: 600,
  },
  quantityBadge: {
    background: "rgba(148, 163, 184, 0.15)",
    color: "#cbd5e1",
    padding: "0.3rem 0.7rem",
    borderRadius: "6px",
    fontSize: "0.9rem",
    fontWeight: 600,
  },
  typeBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.3rem",
    padding: "0.4rem 0.8rem",
    borderRadius: "8px",
    fontSize: "0.85rem",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  typeBadgeBuy: {
    background: "rgba(34, 197, 94, 0.2)",
    color: "#4ADE80",
  },
  typeBadgeSell: {
    background: "rgba(239, 68, 68, 0.2)",
    color: "#f87171",
  },
};

export default Dashboard;
