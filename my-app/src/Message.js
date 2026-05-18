const Message = ({ msg }) => {
  return (
    <div
      className={`flex ${
        msg.self ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`px-4 py-2 rounded max-w-xs text-sm ${
          msg.self
            ? "bg-blue-600"
            : "bg-slate-700"
        }`}
      >
        {!msg.self && (
          <p className="text-xs text-gray-300 mb-1">
            {msg.user}
          </p>
        )}
        {msg.text}
      </div>
    </div>
  );
};

export default Message;
