import { useState, useRef } from "react";

import { useChat } from "./Context";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const MessageInput = () => {

  const [text, setText] = useState("");

  const {
    sendMessage,
    activeChat,
    setTypingUser,
  } = useChat();

  const socket = useSocket();

  const { user } = useAuth();

  const username = user?.name || "User";

  const typingTimeoutRef = useRef(null);

  // HANDLE TYPING
  const handleChange = (e) => {

    const value = e.target.value;

    setText(value);

    setTypingUser(username);

    if (socket) {

      socket.emit("typing", {

        room: activeChat.id,

        user: username,

      });

    }

    // CLEAR OLD TIMEOUT
    if (typingTimeoutRef.current) {

      clearTimeout(
        typingTimeoutRef.current
      );

    }

    // STOP TYPING AFTER 1 SECOND
    typingTimeoutRef.current = setTimeout(() => {

      setTypingUser(null);

      if (socket) {

        socket.emit("stop-typing", {

          room: activeChat.id,

        });

      }

    }, 1000);
  };

  // HANDLE SEND
  const handleSend = () => {

    if (!text.trim()) return;

    console.log(
      "Sending message to room:",
      activeChat.id
    );

    // LOCAL UI UPDATE
    sendMessage(text);

    // SOCKET SEND
    if (socket) {

      socket.emit("send-message", {

        room: activeChat.id,

        chatType: activeChat.type,

        user: username,

        text,

      });

      socket.emit("stop-typing", {

        room: activeChat.id,

      });

    }

    setTypingUser(null);

    setText("");
  };

  return (
    <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center gap-3">

      {/* INPUT */}
      <input
        value={text}
        onChange={handleChange}

        placeholder={
          activeChat.type === "room"
            ? `Message #${activeChat.name || activeChat.id}`
            : `Message ${activeChat.name}`
        }

        onKeyDown={(e) => {

          if (e.key === "Enter") {
            handleSend();
          }

        }}

        className="flex-1 px-4 py-3 rounded-xl bg-slate-800 text-white outline-none border border-slate-700 focus:border-blue-500"
      />

      {/* SEND BUTTON */}
      <button
        onClick={handleSend}
        className="px-5 py-3 bg-blue-600 hover:bg-blue-700 transition rounded-xl font-medium"
      >
        Send
      </button>

    </div>
  );
};

export default MessageInput;