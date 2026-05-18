import { useEffect, useState } from "react";
import axios from "axios";

import { useChat } from "./Context";
import { useAuth } from "./AuthContext";

const RoomList = () => {

  const {
    activeChat,
    setActiveChat,

    activeWorkspace,
    setActiveWorkspace,

    unread,
    onlineUsers,
  } = useChat();

  const { user } = useAuth();

  // DIRECT MESSAGES
  const [directMessages, setDirectMessages] =
    useState([]);

  // WORKSPACE MEMBERS
  const [workspaceMembers, setWorkspaceMembers] =
    useState([]);

  // WORKSPACES
  const [workspaces, setWorkspaces] =
    useState([]);

  // INVITATIONS
  const [invitations, setInvitations] =
    useState([]);

  // LOAD WORKSPACE MEMBERS
  useEffect(() => {

    const loadWorkspaceMembers =
      async () => {

        try {

          if (!activeWorkspace?._id)
            return;

          // GET WORKSPACE
          const workspaceRes =
            await axios.get(

              `https://slack-application.onrender.com/workspace/${activeWorkspace._id}`

            );

          // GET ALL USERS
          const usersRes =
            await axios.get(

              "https://slack-application.onrender.com/users"

            );

          // MATCH MEMBERS
          const members =
            usersRes.data.filter(
              (u) =>
                workspaceRes.data.members.includes(
                  u.name
                )
            );

          setWorkspaceMembers(
            members
          );

          // REMOVE CURRENT USER
          const filteredDMs =
            members.filter(
              (u) =>
                u.name
                  ?.trim()
                  .toLowerCase() !==
                user?.name
                  ?.trim()
                  .toLowerCase()
            );

          setDirectMessages(
            filteredDMs
          );

        } catch (err) {

          console.log(
            "Workspace members error:",
            err
          );

        }
      };

    loadWorkspaceMembers();

  }, [
    activeWorkspace,
    user,
  ]);

  // LOAD WORKSPACES
  useEffect(() => {

    const loadWorkspaces =
      async () => {

        try {

          const res =
            await axios.get(
              "https://slack-application.onrender.com/workspaces"
            );

          const filtered =
            res.data.filter(
              (workspace) =>
                workspace.members.includes(
                  user?.name
                )
            );

          setWorkspaces(filtered);

        } catch (err) {

          console.log(
            "Workspace load error:",
            err
          );

        }
      };

    loadWorkspaces();

  }, [user]);

  // LOAD INVITATIONS
  useEffect(() => {

    const loadInvitations =
      async () => {

        try {

          if (!user?.email) return;

          const res =
            await axios.get(

              `https://slack-application.onrender.com/invitations/${user.email}`

            );

          setInvitations(
            res.data
          );

        } catch (err) {

          console.log(
            "Invitation load error:",
            err
          );

        }
      };

    loadInvitations();

  }, [user]);

  // CREATE WORKSPACE
  const handleCreateWorkspace =
    async () => {

      const workspaceName =
        prompt(
          "Enter workspace name"
        );

      if (!workspaceName) return;

      try {

        const res =
          await axios.post(

            "https://slack-application.onrender.com/workspaces",

            {
              name: workspaceName,
              owner: user?.name,
            }
          );

        setWorkspaces((prev) => [
          ...prev,
          res.data.workspace,
        ]);

        setActiveWorkspace(
          res.data.workspace
        );

        // AUTO OPEN GENERAL CHANNEL
        setActiveChat({

          type: "room",

          id: `${res.data.workspace.name}-general`,

          name: "general",

        });

        alert(
          "Workspace created successfully"
        );

      } catch (err) {

        console.log(err);

      }
    };

  // INVITE MEMBER
  const handleInviteMember =
    async () => {

      const email =
        prompt(
          "Enter member email"
        );

      if (!email) return;

      try {

        await axios.post(

          "https://slack-application.onrender.com/invite",

          {

            workspaceId:
              activeWorkspace._id,

            workspaceName:
              activeWorkspace.name,

            sender:
              user?.name,

            receiverEmail:
              email,

          }
        );

        alert(
          "Invitation sent successfully"
        );

      } catch (err) {

        console.log(err);

      }
    };

  // ACCEPT INVITE
  const handleAcceptInvite =
    async (inviteId) => {

      try {

        const res =
          await axios.post(

            "https://slack-application.onrender.com/accept-invite",

            {
              invitationId:
                inviteId,
            }
          );

        alert(
          "Invitation accepted"
        );

        setInvitations((prev) =>
          prev.filter(
            (i) =>
              i._id !== inviteId
          )
        );

        setWorkspaces((prev) => [
          ...prev,
          res.data.workspace,
        ]);

      } catch (err) {

        console.log(err);

      }
    };

  // CREATE CHANNEL
  const handleCreateChannel =
    async () => {

      const channelName =
        prompt(
          "Enter channel name"
        );

      if (!channelName) return;

      try {

        const res =
          await axios.post(

            "https://slack-application.onrender.com/create-channel",

            {

              workspaceId:
                activeWorkspace._id,

              channelName,

            }
          );

        // UPDATE ACTIVE WORKSPACE
        setActiveWorkspace(
          res.data.workspace
        );

        // UPDATE WORKSPACES
        setWorkspaces((prev) =>

          prev.map((workspace) =>

            workspace._id ===
            res.data.workspace._id

              ? res.data.workspace

              : workspace
          )
        );

        alert(
          "Channel created successfully"
        );

      } catch (err) {

        console.log(err);

        alert(
          err?.response?.data?.msg ||
          "Failed to create channel"
        );

      }
    };

  // DM ROOM ID
  const createDmRoomId = (
    user1,
    user2
  ) => {

    return [user1, user2]

      .map((name) =>
        name.trim().toLowerCase()
      )

      .sort()

      .join("-");

  };

  return (
    <div className="h-full bg-slate-900 p-4 overflow-y-auto">

      {/* TITLE */}
      <h1 className="text-2xl font-bold mb-4 text-white">
        Slack Chat
      </h1>

      {/* CREATE WORKSPACE */}
      <button
        onClick={handleCreateWorkspace}
        className="w-full mb-6 bg-blue-600 hover:bg-blue-700 transition py-2 rounded-xl font-medium text-white"
      >
        + Create Workspace
      </button>

      {/* WORKSPACES */}
      <div className="mb-8">

        <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">
          Workspaces
        </h2>

        {workspaces.map((workspace) => (

          <div
            key={workspace._id}

            onClick={() => {

              setActiveWorkspace(
                workspace
              );

              setActiveChat({

                type: "room",

                id: `${workspace.name}-general`,

                name: "general",

              });

            }}

            className={`p-3 mb-3 rounded-xl cursor-pointer ${
              activeWorkspace?._id ===
              workspace._id
                ? "bg-blue-600"
                : "bg-slate-800"
            }`}
          >

            <div className="text-white font-medium">
              {workspace.name}
            </div>

          </div>

        ))}
      </div>

      {/* INVITATIONS */}
      <div className="mb-8">

        <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">
          Invitations
        </h2>

        {invitations.length === 0 && (

          <p className="text-sm text-gray-500">
            No pending invites
          </p>

        )}

        {invitations.map((invite) => (

          <div
            key={invite._id}
            className="p-3 mb-3 rounded-xl bg-slate-800"
          >

            <p className="text-white text-sm mb-2">

              <span className="font-semibold">
                {invite.sender}
              </span>

              {" "}invited you to{" "}

              <span className="font-semibold">
                {invite.workspaceName}
              </span>

            </p>

            <button

              onClick={() =>
                handleAcceptInvite(
                  invite._id
                )
              }

              className="w-full bg-green-600 hover:bg-green-700 transition py-1 rounded-lg text-sm text-white"
            >
              Accept Invite
            </button>

          </div>

        ))}
      </div>

      {/* SHOW ONLY AFTER WORKSPACE SELECT */}
      {activeWorkspace && (

        <>

          {/* INVITE MEMBER */}
          <button
            onClick={handleInviteMember}
            className="w-full mb-6 bg-purple-600 hover:bg-purple-700 transition py-2 rounded-xl font-medium text-white"
          >
            + Invite Member
          </button>

          {/* CHANNELS */}
          <div className="mb-8">

            <div className="flex items-center justify-between mb-3">

              <h2 className="text-sm uppercase tracking-wider text-gray-400">

                Channels

              </h2>

              <button

                onClick={handleCreateChannel}

                className="text-xs bg-slate-700 hover:bg-slate-600 transition px-2 py-1 rounded text-white"

              >
                +
              </button>

            </div>

            {activeWorkspace?.channels?.map(
              (room) => (

                <div
                  key={room}

                  onClick={() =>
                    setActiveChat({

                      type: "room",

                      id: `${activeWorkspace.name}-${room}`,

                      name: room,

                    })
                  }

                  className={`flex items-center justify-between px-3 py-2 mb-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeChat.type === "room" &&
                    activeChat.id ===
                      `${activeWorkspace.name}-${room}`
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-800 text-gray-300"
                  }`}
                >

                  <span className="font-medium">
                    # {room}
                  </span>

                  {unread[
                    `${activeWorkspace.name}-${room}`
                  ] > 0 && (

                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">

                      {
                        unread[
                          `${activeWorkspace.name}-${room}`
                        ]
                      }

                    </span>

                  )}

                </div>

              )
            )}
          </div>

          {/* MEMBERS */}
          <div className="mb-8">

            <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">
              Members
            </h2>

            {workspaceMembers.map((member) => {

              const isOnline =
                onlineUsers.includes(
                  member.name
                );

              return (

                <div
                  key={member._id}
                  className="flex items-center gap-3 px-3 py-2 mb-2 rounded-xl bg-slate-800"
                >

                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnline
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  />

                  <span className="text-white">
                    {member.name}
                  </span>

                </div>

              );
            })}
          </div>

          {/* DIRECT MESSAGES */}
          <div>

            <h2 className="text-sm uppercase tracking-wider text-gray-400 mb-3">
              Direct Messages
            </h2>

            {directMessages.map((dmUser) => {

              const dmRoomId =
                createDmRoomId(
                  user?.name || "user",
                  dmUser.name
                );

              const isOnline =
                onlineUsers.includes(
                  dmUser.name
                );

              return (

                <div
                  key={
                    dmUser._id ||
                    dmUser.name
                  }

                  onClick={() => {

                    setActiveChat({

                      type: "dm",

                      id: dmRoomId,

                      name: dmUser.name,

                    });
                  }}

                  className={`flex items-center gap-3 px-3 py-2 mb-2 rounded-xl cursor-pointer transition-all duration-200 ${
                    activeChat.type === "dm" &&
                    activeChat.id === dmRoomId
                      ? "bg-slate-800 text-white"
                      : "hover:bg-slate-800 text-gray-300"
                  }`}
                >

                  <span
                    className={`w-2 h-2 rounded-full ${
                      isOnline
                        ? "bg-green-500"
                        : "bg-gray-500"
                    }`}
                  />

                  <span className="font-medium">
                    {dmUser.name}
                  </span>

                </div>

              );
            })}
          </div>

        </>

      )}

    </div>
  );
};

export default RoomList;