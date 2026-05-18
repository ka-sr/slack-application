import { createContext, useContext, useState } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("chat-user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const login = (userData, token) => {
    try {
  
      localStorage.clear();

      localStorage.setItem("chat-user", JSON.stringify(userData));
      localStorage.setItem("chat-token", token);

      setUser(userData);
    } catch (err) {
      console.log("Login storage error:", err);
    }
  };

  const logout = () => {
    try {
      localStorage.clear(); 
      setUser(null);

      
      window.location.replace("/login");
    } catch (err) {
      console.log("Logout error:", err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
