import { useChat } from "./Context";

const OnlineUsers = () => {
  const { onlineUsers } = useChat();

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold mb-4">Online</h2>

      {onlineUsers.length === 0 && (
        <p className="text-gray-400">No users online</p>
      )}

      {onlineUsers.map((user, index) => (
        <div key={index} className="flex items-center mb-2">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          {user}
        </div>
      ))}
    </div>
  );
};

export default OnlineUsers;
