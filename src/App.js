import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import TicketDetails from "./components/TicketDetails";
import Login from "./components/login"; // Ensure you have a Login component
import "./App.css";

// Protected Route Component
const ProtectedRoute = ({ element }) => {
  const [isAuthenticated, setIsAuthenticated] = React.useState(localStorage.getItem("isAuthenticated") === "true");

  React.useEffect(() => {
    const handleStorageChange = () => {
      setIsAuthenticated(localStorage.getItem("isAuthenticated") === "true");
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  if (isAuthenticated === null) {
    return <div>Loading...</div>; // Prevent flashing of unauthorized content
  }

  return isAuthenticated ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<ProtectedRoute element={<Dashboard />} />} />
          <Route path="/ticket/:ticketId" element={<ProtectedRoute element={<TicketDetails />} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
