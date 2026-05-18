import RoomList from "./RoomList";
import ChatWindow from "./ChatWindow";
import OnlineUsers from "./OnlineUsers";

const Chat = () => {
  return (
    <div className="h-screen flex bg-slate-900 text-white">
      <div className="w-1/5 border-r border-slate-700">
        <RoomList />
      </div>

      <div className="w-3/5">
        <ChatWindow />
      </div>
      <div className="w-1/5 border-l border-slate-700">
        <OnlineUsers />
      </div>
    </div>
  );
};

export default Chat;
