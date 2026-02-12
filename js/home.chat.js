//Find an existing direct chat between two users or create a new one
const getOrCreateChat = (me, you) => {
  const chats = loadChats();

  const existing = chats.find((c) =>
    c.type === 'direct' &&
    c.members.length === 2 &&
    c.members.includes(me) &&
    c.members.includes(you)
  );

  if (existing) return existing;

  const chat = {
    id: getNextChatId(),
    type: 'direct',
    members: [me, you],
    timeStamp: Date.now(),
  };

  chats.push(chat);
  saveChats(chats);
  return chat;
};

//Return the id of an existing direct chat between two users, or null if none
const getDirectChatId = (me, you) => {
  const chats = loadChats();

  const existing = chats.find((c) =>
    c.type === 'direct' &&
    c.members.length === 2 &&
    c.members.includes(me) &&
    c.members.includes(you)
  );

  return existing ? existing.id : null;
};

//Store a message and update the parent timestamp for sorting
const sendMessage = (chatId, senderId, content) => {
  const messagesList = loadMessages();
  const chats = loadChats();

  const message = {
    id: getNextMessageId(),
    chatId,
    senderId,
    content,
    timeStamp: Date.now(),
  };

  messagesList.push(message);
  saveMessages(messagesList);

  const chat = chats.find((c) => c.id === chatId);
  if (chat) {
    chat.timeStamp = message.timeStamp;
    saveChats(chats);
  }
};

//Return users (excluding me) that are online
const getOnlineVisibleUsers = () => {
  const me = getCurrentUserId();

  return loadUsers().filter((u) => u.id !== me && u.isOnline === true);
};

//Build chat items
const getAllChatsSidebarItems = () => {
  const me = getCurrentUserId();
  if (me === null) return [];

  return loadChats()
    .filter((c) => c.members.includes(me))
    .sort((a, b) => b.timeStamp - a.timeStamp)
    .map((c) => {
      if (c.type === 'direct') {
        const otherUserId = c.members.find((id) => id !== me);
        const otherUser = loadUsers().find((u) => u.id === otherUserId);
        return {
          type: 'direct',
          chatId: c.id,
          user: otherUser,
        };
      }

      return {
        type: 'group',
        chatId: c.id,
        title: c.title,
      };
    });
};

//Create and persist a new group chat with the provided members
const createGroupChat = (title, memberIds) => {
  const chats = loadChats();

  const chat = {
    id: getNextChatId(),
    type: 'group',
    title,
    members: memberIds,
    timeStamp: Date.now(),
  };

  chats.push(chat);
  saveChats(chats);

  return chat;
};
