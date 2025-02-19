import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes, createGlobalStyle } from "styled-components";

const GlobalStyle = createGlobalStyle`
  body {
    margin: 0;
    padding: 0;
    background: #0a0a0a;
    cursor: none;
  }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(79, 172, 254, 0.3); }
  50% { box-shadow: 0 0 10px rgba(79, 172, 254, 0.5); }
  100% { box-shadow: 0 0 5px rgba(79, 172, 254, 0.3); }
`;

const floatAnimation = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`;

const CustomCursor = styled.div`
  width: 20px;
  height: 20px;
  background: linear-gradient(45deg, #4facfe, #00f2fe);
  border-radius: 50%;
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  transition: all 0.1s ease;
  mix-blend-mode: screen;
`;

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #0a0a0a;
  position: relative;
  overflow: hidden;
`;

const LoginContainer = styled.div`
  background: rgba(15, 15, 15, 0.95);
  padding: 40px;
  border-radius: 20px;
  border: 1px solid rgba(79, 172, 254, 0.2);
  animation: ${floatAnimation} 6s ease-in-out infinite;
  position: relative;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
`;

const Title = styled.h2`
  color: #fff;
  text-align: center;
  margin-bottom: 30px;
  font-size: 2em;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 10px rgba(79, 172, 254, 0.3);
`;

const Logo = styled.div`
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 60px;
    height: 60px;
    border: 2px solid rgba(79, 172, 254, 0.5);
    border-radius: 50%;
    animation: ${glowAnimation} 2s infinite;
  }

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 30px;
    height: 30px;
    background: #4facfe;
    clip-path: polygon(50% 0%, 100% 100%, 0% 100%);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(79, 172, 254, 0.2);
  border-radius: 5px;
  color: #fff;
  font-size: 16px;
  outline: none;
  transition: all 0.3s ease;

  &:focus {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(79, 172, 254, 0.5);
    box-shadow: 0 0 10px rgba(79, 172, 254, 0.2);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 12px;
  margin-top: 20px;
  background: #4facfe;
  border: none;
  border-radius: 5px;
  color: #fff;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;

  &:hover {
    background: #2195fe;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(79, 172, 254, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Login = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({ username: "", password: "" });
  const [cursorPosition, setCursorPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    setCursorPosition({ x: e.clientX, y: e.clientY });
  };

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
    <>
      <GlobalStyle />
      <Container onMouseMove={handleMouseMove}>
        <CustomCursor style={{ left: cursorPosition.x - 10, top: cursorPosition.y - 10 }} />
        <LoginContainer>
          <Logo />
          <Title>Helpdesk Command Centre</Title>
          <Input
            type="text"
            placeholder="Username"
            value={input.username}
            onChange={(e) => setInput({ ...input, username: e.target.value })}
          />
          <Input
            type="password"
            placeholder="Password"
            value={input.password}
            onChange={(e) => setInput({ ...input, password: e.target.value })}
          />
          <Button onClick={handleLogin}>Login</Button>
        </LoginContainer>
      </Container>
    </>
  );
};

export default Login;