import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import { useSocket } from "./SocketContext";
import { useAuth } from "./AuthContext";

const ChatContext = createContext();

const initialMessages = {

  General: [
    {
      id: 1,
      user: "Aman",
      text: "Hello everyone!",
      self: false,
    },

    {
      id: 2,
      user: "Neha",
      text: "Welcome to chat!",
      self: false,
    },
  ],

  Random: [
    {
      id: 1,
      user: "Rohit",
      text: "Random talks 😄",
      self: false,
    },
  ],

};

export const ChatProvider = ({
  children,
}) => {

  // ACTIVE WORKSPACE
  const [
    activeWorkspace,
    setActiveWorkspace,
  ] = useState(null);

  // ACTIVE CHAT
  const [activeChat, setActiveChat] =
    useState({

      type: "room",

      id: "General",

      name: "General",

    });

  // ALL MESSAGES
  const [messages, setMessages] =
    useState(initialMessages);

  // TYPING USER
  const [typingUser, setTypingUser] =
    useState(null);

  // UNREAD COUNTS
  const [unread, setUnread] =
    useState({

      General: 0,
      Random: 0,

    });

  // ONLINE USERS
  const [onlineUsers, setOnlineUsers] =
    useState([]);

  const socket = useSocket();

  const { user } = useAuth();

  // RECEIVE MESSAGE
  useEffect(() => {

    if (!socket) return;

    const handleReceive = ({
      room,
      user: sender,
      text,
    }) => {

      setMessages((prev) => ({

        ...prev,

        [room]: [

          ...(prev[room] || []),

          {

            id:
              Date.now() +
              Math.random(),

            user: sender,

            text,

            self:
              sender
                ?.trim()
                .toLowerCase() ===
              user?.name
                ?.trim()
                .toLowerCase(),

          },

        ],

      }));

      // UNREAD COUNT
      if (room !== activeChat.id) {

        setUnread((prev) => ({

          ...prev,

          [room]:
            (prev[room] || 0) + 1,

        }));

      }
    };

    socket.on(
      "receive-message",
      handleReceive
    );

    return () =>

      socket.off(
        "receive-message",
        handleReceive
      );

  }, [socket, activeChat, user]);

  // TYPING EVENTS
  useEffect(() => {

    if (!socket) return;

    socket.on(
      "user-typing",

      ({ user }) => {

        setTypingUser(user);

      }
    );

    socket.on(
      "user-stop-typing",

      () => {

        setTypingUser(null);

      }
    );

    return () => {

      socket.off("user-typing");

      socket.off(
        "user-stop-typing"
      );

    };

  }, [socket]);

  // ONLINE USERS
  useEffect(() => {

    if (!socket) return;

    socket.on(
      "online-users",

      (users) => {

        setOnlineUsers(users);

      }
    );

    return () =>

      socket.off("online-users");

  }, [socket]);

  // SEND MESSAGE
  const sendMessage = (text) => {

    setMessages((prev) => ({

      ...prev,

      [activeChat.id]: [

        ...(prev[activeChat.id] ||
          []),

        {

          id:
            Date.now() +
            Math.random(),

          user: user?.name,

          text,

          self: true,

        },

      ],

    }));

    // RESET UNREAD
    setUnread((prev) => ({

      ...prev,

      [activeChat.id]: 0,

    }));
  };

  return (
    <ChatContext.Provider
      value={{

        // WORKSPACE
        activeWorkspace,
        setActiveWorkspace,

        // CHAT
        activeChat,
        setActiveChat,

        // MESSAGES
        messages,
        setMessages,

        sendMessage,

        // TYPING
        typingUser,
        setTypingUser,

        // UNREAD
        unread,
        setUnread,

        // ONLINE
        onlineUsers,

      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () =>
  useContext(ChatContext);