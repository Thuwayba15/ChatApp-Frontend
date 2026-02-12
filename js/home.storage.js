//User functions

const loadUsers = () => {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
};

//Store in local storage as JSON string
const saveUsers = (users) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

//Fetch current id and convert to usable number
const getCurrentUserId = () => {
  const raw = sessionStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  return Number(raw);
};

const getUserById = (userId) => {
  const users = loadUsers();
  return users.find((u) => u.id === userId) || null;
};

//Chat functions

const loadChats = () => {
  const raw = localStorage.getItem(CHATS_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
};

const saveChats = (chats) => {
  localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
};

const getNextChatId = () => {
  const raw = localStorage.getItem(NEXT_CHAT_ID_KEY);
  const current = raw ? Number(raw) : 1;
  localStorage.setItem(NEXT_CHAT_ID_KEY, String(current + 1));
  return current;
};

//Message functions

const loadMessages = () => {
  const raw = localStorage.getItem(MESSAGES_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
};

const saveMessages = (messagesList) => {
  localStorage.setItem(MESSAGES_KEY, JSON.stringify(messagesList));
};

const getNextMessageId = () => {
  const raw = localStorage.getItem(NEXT_MESSAGE_ID_KEY);
  const current = raw ? Number(raw) : 1;
  localStorage.setItem(NEXT_MESSAGE_ID_KEY, String(current + 1));
  return current;
};
