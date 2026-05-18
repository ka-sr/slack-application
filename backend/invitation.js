const mongoose =
  require("mongoose");

const invitationSchema =
  new mongoose.Schema({

    workspaceId: {
      type:
        mongoose.Schema.Types.ObjectId,

      ref: "Workspace",
    },

    workspaceName: {
      type: String,
    },

    sender: {
      type: String,
    },

    receiverEmail: {
      type: String,
    },

    status: {

      type: String,

      enum: [
        "pending",
        "accepted",
      ],

      default: "pending",

    },

    createdAt: {

      type: Date,

      default: Date.now,

    },

  });

module.exports =
  mongoose.model(
    "Invitation",
    invitationSchema
  );