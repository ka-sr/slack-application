const mongoose = require("mongoose");

const workspaceSchema =
  new mongoose.Schema({

    name: {
      type: String,
      required: true,
    },

    owner: {
      type: String,
      required: true,
    },

    members: [
      {
        type: String,
      },
    ],

    channels: [
      {
        type: String,
      },
    ],

    createdAt: {
      type: Date,
      default: Date.now,
    },

  });

module.exports = mongoose.model(
  "Workspace",
  workspaceSchema
);