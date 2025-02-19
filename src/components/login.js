import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({ username: "", password: "" });

  const handleLogin = () => {
    const hardcodedCredentials = {
      username: "admin",
      password: "password123",
    };

    if (input.username === hardcodedCredentials.username && input.password === hardcodedCredentials.password) {
      localStorage.setItem("isAuthenticated", "true");
      navigate("/dashboard");
    } else {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="login-container">
      <h2>Login</h2>
      <input
        type="text"
        placeholder="Username"
        value={input.username}
        onChange={(e) => setInput({ ...input, username: e.target.value })}
      />
      <input
        type="password"
        placeholder="Password"
        value={input.password}
        onChange={(e) => setInput({ ...input, password: e.target.value })}
      />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};

export default Login;