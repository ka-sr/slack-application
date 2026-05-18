import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Chat from "./Chat";
import Login from "./Login";
import { ChatProvider } from "./Context";
import { SocketProvider } from "./SocketContext";
import { AuthProvider } from "./AuthContext";

function App() {
  const token = localStorage.getItem("chat-token");

  return (
    <AuthProvider>
      <SocketProvider>
        <ChatProvider>
          <BrowserRouter>
            <Routes>
              <Route
                path="/"
                element={token ? <Chat /> : <Navigate to="/login" />}
              />
              <Route
                path="/login"
                element={!token ? <Login /> : <Navigate to="/" />}
              />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </BrowserRouter>
        </ChatProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
