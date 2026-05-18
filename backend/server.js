const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Workspace = require("./Workspace");
const Invitation = require("./Invitation");

const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

/* MONGODB CONNECTION */
mongoose
  .connect("mongodb://127.0.0.1:27017/chat-app")
  .then(() => console.log("🟢 MongoDB Connected"))
  .catch((err) => console.log("Mongo Error:", err));

/* MESSAGE SCHEMA */
const messageSchema = new mongoose.Schema({

  room: {
    type: String,
    required: true,
  },

  chatType: {
    type: String,
    enum: ["room", "dm"],
    default: "room",
  },

  sender: {
    type: String,
    required: true,
  },

  text: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

});

const Message = mongoose.model(
  "Message",
  messageSchema
);

/* USER SCHEMA */
const userSchema = new mongoose.Schema({

  name: String,

  email: {
    type: String,
    unique: true,
  },

  password: String,

});

const User = mongoose.model(
  "User",
  userSchema
);

const JWT_SECRET = "chatappsecret";

/* REGISTER */
app.post("/register", async (req, res) => {

  try {

    const { name, email, password } = req.body;

    const exists = await User.findOne({
      email,
    });

    if (exists) {

      return res.status(400).json({
        msg: "User already exists",
      });

    }

    const hashed = await bcrypt.hash(
      password,
      10
    );

    const user = new User({
      name,
      email,
      password: hashed,
    });

    await user.save();

    res.json({
      msg: "User registered successfully",
    });

  } catch (err) {

    res.status(500).json({
      msg: "Register error",
    });

  }
});

/* LOGIN */
app.post("/login", async (req, res) => {

  try {

    const { email, password } = req.body;

    const user = await User.findOne({
      email,
    });

    if (!user) {

      return res.status(400).json({
        msg: "User not found",
      });

    }

    const match = await bcrypt.compare(
      password,
      user.password
    );

    if (!match) {

      return res.status(400).json({
        msg: "Wrong password",
      });

    }

    const token = jwt.sign(

      {
        id: user._id,
        name: user.name,
      },

      JWT_SECRET,

      {
        expiresIn: "7d",
      }

    );

    res.json({

      token,

      user: {
        name: user.name,
        email: user.email,
      },

    });

  } catch (err) {

    res.status(500).json({
      msg: "Login error",
    });

  }
});

/* GET ALL USERS */
app.get("/users", async (req, res) => {

  try {

    const users = await User.find()
      .select("name email");

    res.json(users);

  } catch (err) {

    res.status(500).json({
      msg: "Failed to load users",
    });

  }

});

/* CREATE WORKSPACE */
app.post(
  "/workspaces",

  async (req, res) => {

    try {

      const {
        name,
        owner,
      } = req.body;

      const exists =
        await Workspace.findOne({
          name,
        });

      if (exists) {

        return res.status(400).json({
          msg: "Workspace already exists",
        });

      }

      const workspace =
        new Workspace({

          name,

          owner,

          members: [owner],

          channels: [
            "general",
            "random",
          ],

        });

      await workspace.save();

      res.json({

        msg:
          "Workspace created successfully",

        workspace,

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({
        msg:
          "Workspace creation failed",
      });

    }
  }
);

/* GET ALL WORKSPACES */
app.get(
  "/workspaces",

  async (req, res) => {

    try {

      const workspaces =
        await Workspace.find();

      res.json(workspaces);

    } catch (err) {

      res.status(500).json({
        msg:
          "Failed to load workspaces",
      });

    }
  }
);

/* GET SINGLE WORKSPACE */
app.get(

  "/workspace/:id",

  async (req, res) => {

    try {

      const workspace =
        await Workspace.findById(
          req.params.id
        );

      if (!workspace) {

        return res.status(404).json({

          msg:
            "Workspace not found",

        });

      }

      res.json(workspace);

    } catch (err) {

      console.log(err);

      res.status(500).json({

        msg:
          "Failed to load workspace",

      });

    }
  }
);

/* SEND INVITATION */
app.post(
  "/invite",

  async (req, res) => {

    try {

      const {
        workspaceId,
        workspaceName,
        sender,
        receiverEmail,
      } = req.body;

      const user =
        await User.findOne({
          email: receiverEmail,
        });

      if (!user) {

        return res.status(404).json({

          msg:
            "User with this email not found",

        });

      }

      const existingInvite =
        await Invitation.findOne({

          workspaceId,

          receiverEmail,

          status: "pending",

        });

      if (existingInvite) {

        return res.status(400).json({

          msg:
            "Invitation already sent",

        });

      }

      const invitation =
        new Invitation({

          workspaceId,

          workspaceName,

          sender,

          receiverEmail,

        });

      await invitation.save();

      res.json({

        msg:
          "Invitation sent successfully",

        invitation,

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        msg:
          "Invitation failed",

      });

    }
  }
);

/* GET USER INVITATIONS */
app.get(

  "/invitations/:email",

  async (req, res) => {

    try {

      const invitations =
        await Invitation.find({

          receiverEmail:
            req.params.email,

          status: "pending",

        });

      res.json(invitations);

    } catch (err) {

      console.log(err);

      res.status(500).json({

        msg:
          "Failed to load invitations",

      });

    }
  }
);

/* ACCEPT INVITATION */
app.post(

  "/accept-invite",

  async (req, res) => {

    try {

      const {
        invitationId,
      } = req.body;

      const invitation =
        await Invitation.findById(
          invitationId
        );

      if (!invitation) {

        return res.status(404).json({

          msg:
            "Invitation not found",

        });

      }

      const workspace =
        await Workspace.findById(

          invitation.workspaceId

        );

      if (!workspace) {

        return res.status(404).json({

          msg:
            "Workspace not found",

        });

      }

      const user =
        await User.findOne({

          email:
            invitation.receiverEmail,

        });

      if (!user) {

        return res.status(404).json({

          msg:
            "User not found",

        });

      }

      if (
        !workspace.members.includes(
          user.name
        )
      ) {

        workspace.members.push(
          user.name
        );

      }

      await workspace.save();

      invitation.status =
        "accepted";

      await invitation.save();

      res.json({

        msg:
          "Invitation accepted successfully",

        workspace,

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        msg:
          "Accept invitation failed",

      });

    }
  }
);

/* CREATE CHANNEL */
app.post(

  "/create-channel",

  async (req, res) => {

    try {

      const {
        workspaceId,
        channelName,
      } = req.body;

      const workspace =
        await Workspace.findById(
          workspaceId
        );

      if (!workspace) {

        return res.status(404).json({

          msg:
            "Workspace not found",

        });

      }

      const formattedChannel =
        channelName
          .trim()
          .toLowerCase();

      if (
        workspace.channels.includes(
          formattedChannel
        )
      ) {

        return res.status(400).json({

          msg:
            "Channel already exists",

        });

      }

      workspace.channels.push(
        formattedChannel
      );

      await workspace.save();

      res.json({

        msg:
          "Channel created successfully",

        workspace,

      });

    } catch (err) {

      console.log(err);

      res.status(500).json({

        msg:
          "Create channel failed",

      });

    }
  }
);

/* SOCKET IO */
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

const onlineUsers = {};

/* SOCKET CONNECTION */
io.on("connection", (socket) => {

  console.log(
    "🟢 User connected:",
    socket.id
  );

  /* JOIN ROOM */
  socket.on(
    "join-room",
    ({ room, user }) => {

      socket.join(room);

      onlineUsers[socket.id] = {
        room,
        user,
      };

      const roomUsers = Object.values(
        onlineUsers
      )
        .filter((u) => u.room === room)
        .map((u) => u.user);

      io.to(room).emit(
        "online-users",
        roomUsers
      );
    }
  );

  /* LEAVE ROOM */
  socket.on(
    "leave-room",
    ({ room }) => {

      socket.leave(room);

      delete onlineUsers[socket.id];

      const roomUsers = Object.values(
        onlineUsers
      )
        .filter((u) => u.room === room)
        .map((u) => u.user);

      io.to(room).emit(
        "online-users",
        roomUsers
      );
    }
  );

  /* SEND MESSAGE */
  socket.on(

    "send-message",

    async ({
      room,
      chatType,
      user,
      text,
    }) => {

      try {

        const newMessage = new Message({

          room,

          chatType,

          sender: user,

          text,

        });

        await newMessage.save();

        socket.to(room).emit(
          "receive-message",

          {
            room,
            chatType,
            user,
            text,
          }
        );

      } catch (err) {

        console.log(
          "Message save error:",
          err
        );

      }
    }
  );

  /* TYPING */
  socket.on(
    "typing",
    ({ room, user }) => {

      socket.to(room).emit(
        "user-typing",
        { user }
      );

    }
  );

  /* STOP TYPING */
  socket.on(
    "stop-typing",
    ({ room }) => {

      socket.to(room).emit(
        "user-stop-typing"
      );

    }
  );

  /* DISCONNECT */
  socket.on("disconnect", () => {

    const userData =
      onlineUsers[socket.id];

    delete onlineUsers[socket.id];

    if (userData) {

      const roomUsers = Object.values(
        onlineUsers
      )
        .filter(
          (u) =>
            u.room === userData.room
        )
        .map((u) => u.user);

      io.to(userData.room).emit(
        "online-users",
        roomUsers
      );
    }

    console.log(
      "🔴 User disconnected:",
      socket.id
    );
  });
});

/* GET MESSAGE HISTORY */
app.get(
  "/messages/:room",

  async (req, res) => {

    try {

      const messages =
        await Message.find({
          room: req.params.room,
        })
          .sort({ createdAt: 1 })
          .limit(100);

      res.json(messages);

    } catch (err) {

      res.status(500).json({
        error: "Failed to load messages",
      });

    }
  }
);

server.listen(5000, () => {

  console.log(
    "🚀 Server running on port 5000"
  );

});