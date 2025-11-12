import React from "react";

const Navbar = ({ setPage, currentPage }) => {
  return (
    <nav style={styles.nav}>
      <div style={styles.logoContainer}>
        <div style={styles.logoIcon}>🛍️</div>
        <h2 style={styles.logoText}>SmartShop</h2>
        <span style={styles.logoSubtext}>Analytics</span>
      </div>
      <div style={styles.navButtons}>
        <button
          style={{
            ...styles.btn,
            ...(currentPage === "dashboard" ? styles.btnActive : {}),
          }}
          onClick={() => setPage("dashboard")}
        >
          <span style={styles.btnIcon}>📊</span>
          Dashboard
        </button>
        <button
          style={{
            ...styles.btn,
            ...(currentPage === "ml" ? styles.btnActive : {}),
          }}
          onClick={() => setPage("ml")}
        >
          <span style={styles.btnIcon}>🤖</span>
          ML Analytics
        </button>
      </div>
    </nav>
  );
};

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "1.2rem 3rem",
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
    borderBottom: "1px solid rgba(148, 163, 184, 0.1)",
    position: "sticky",
    top: 0,
    zIndex: 1000,
    backdropFilter: "blur(10px)",
  },
  logoContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.8rem",
  },
  logoIcon: {
    fontSize: "2rem",
    filter: "drop-shadow(0 2px 4px rgba(0, 224, 255, 0.3))",
  },
  logoText: {
    margin: 0,
    fontSize: "1.8rem",
    fontWeight: 700,
    background: "linear-gradient(135deg, #00E0FF 0%, #3b82f6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.5px",
  },
  logoSubtext: {
    fontSize: "0.85rem",
    color: "#94a3b8",
    fontWeight: 500,
    marginLeft: "0.3rem",
  },
  navButtons: {
    display: "flex",
    gap: "1rem",
  },
  btn: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.7rem 1.5rem",
    border: "none",
    background: "rgba(148, 163, 184, 0.1)",
    color: "#cbd5e1",
    borderRadius: "12px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.95rem",
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  },
  btnActive: {
    background: "linear-gradient(135deg, #00E0FF 0%, #3b82f6 100%)",
    color: "#fff",
    boxShadow: "0 4px 15px rgba(0, 224, 255, 0.4)",
    transform: "translateY(-2px)",
  },
  btnIcon: {
    fontSize: "1.1rem",
  },
};

export default Navbar;
