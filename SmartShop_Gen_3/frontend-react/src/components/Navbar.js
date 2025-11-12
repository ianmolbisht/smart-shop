import React from "react";

const Navbar = ({ setPage }) => {
  return (
    <nav style={styles.nav}>
      <h2>🛍️ SmartShop</h2>
      <div>
        <button style={styles.btn} onClick={() => setPage("dashboard")}>
          Dashboard
        </button>
        <button style={styles.btn} onClick={() => setPage("ml")}>
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
    padding: "1rem 2rem",
    backgroundColor: "#f2f2f2",
  },
  btn: {
    marginLeft: "1rem",
    padding: "0.5rem 1rem",
    border: "none",
    backgroundColor: "#007bff",
    color: "white",
    borderRadius: "8px",
    cursor: "pointer",
  },
};

export default Navbar;
