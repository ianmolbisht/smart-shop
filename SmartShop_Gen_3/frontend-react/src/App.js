import React, { useState } from "react";
import Dashboard from "./pages/Dashboard";
import MLAnalytics from "./pages/MLAnalytics";
import Navbar from "./components/Navbar";

const App = () => {
  const [page, setPage] = useState("dashboard");

  return (
    <div className="app">
      <Navbar setPage={setPage} currentPage={page} />
      {page === "dashboard" ? <Dashboard /> : <MLAnalytics />}
    </div>
  );
};

export default App;
