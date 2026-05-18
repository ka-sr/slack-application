import { useEffect } from "react";
import axios from "axios";

import { useChat } from "./Context";
import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

import Message from "./Message";
import MessageInput from "./MessageInput";

const ChatWindow = () => {

  const {

    activeWorkspace,

    activeChat,

    messages,

    typingUser,

    setMessages,

  } = useChat();

  const socket = useSocket();

  const { user, logout } = useAuth();

  const username =
    user?.name || "User";

  // NO WORKSPACE SELECTED
  if (!activeWorkspace) {

    return (

      <div className="h-full flex items-center justify-center bg-slate-950">

        <div className="text-center">

          <h1 className="text-3xl font-bold text-white mb-4">
            Welcome to Slack Chat
          </h1>

          <p className="text-gray-400">
            Create or join a workspace to start chatting
          </p>

        </div>

      </div>

    );
  }

  // JOIN ROOM / DM
  useEffect(() => {

    if (
      !socket ||
      !username ||
      !activeChat?.id
    ) return;

    console.log(
      "Joining room:",
      activeChat.id
    );

    socket.emit("join-room", {

      room: activeChat.id,

      user: username,

    });

    return () => {

      socket.emit("leave-room", {

        room: activeChat.id,

      });

    };

  }, [
    activeChat,
    socket,
    username,
  ]);

  // LOAD CHAT HISTORY
  useEffect(() => {

    if (!activeChat?.id) return;

    const loadHistory = async () => {

      try {

        console.log(
          "Loading messages for:",
          activeChat.id
        );

        const res = await axios.get(

          `http://localhost:5000/messages/${activeChat.id}`

        );

        if (res.data) {

          setMessages((prev) => ({

            ...prev,

            [activeChat.id]:
              res.data.map((msg) => ({

                id:
                  msg._id ||
                  Date.now(),

                user:
                  msg.sender,

                text:
                  msg.text,

                self:
                  msg.sender
                    ?.trim()
                    .toLowerCase() ===
                  username
                    ?.trim()
                    .toLowerCase(),

              })),

          }));

        }

      } catch (err) {

        console.log(
          "History load error:",
          err
        );

      }
    };

    loadHistory();

  }, [
    activeChat,
    setMessages,
    username,
  ]);

  return (
    <div className="h-full flex flex-col bg-slate-950">

      {/* HEADER */}
      <div className="h-16 px-6 border-b border-slate-800 flex items-center justify-between">

        {/* LEFT */}
        <div className="flex flex-col">

          {/* WORKSPACE */}
          <span className="text-xs text-blue-400 font-medium">

            {activeWorkspace.name}

          </span>

          {/* CHAT TITLE */}
          <span className="font-bold text-lg text-white">

            {activeChat.type === "room"
              ? `# ${activeChat.name}`
              : activeChat.name}

          </span>

        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-4">

          <span className="text-sm text-gray-400">
            {username}
          </span>

          <button
            onClick={logout}
            className="px-3 py-1 bg-red-600 hover:bg-red-700 transition rounded-lg text-sm"
          >
            Logout
          </button>

        </div>
      </div>

      {/* MESSAGES */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">

        {messages[activeChat.id]?.length >
        0 ? (

          messages[activeChat.id]?.map(
            (msg) => (

              <Message
                key={msg.id}
                msg={msg}
              />

            )
          )

        ) : (

          <div className="h-full flex items-center justify-center">

            <p className="text-gray-500">
              No messages yet
            </p>

          </div>

        )}

        {/* TYPING */}
        {typingUser && (

          <p className="text-sm text-gray-400 italic">
            {typingUser} is typing...
          </p>

        )}

      </div>

      {/* INPUT */}
      <MessageInput />

    </div>
  );
};

export default ChatWindow;