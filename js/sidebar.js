//Storage key for all users + current user
const USERS_KEY = "chat-o.users";
const CURRENT_USER_KEY = "chat-o.current-user";

//Storage keys for chats and messages
const CHATS_KEY = "chat-o.chats";
const MESSAGES_KEY = "chat-o.messages";

//storage keys for chat IDs and message IDs
const NEXT_CHAT_ID_KEY = "chat-o.nextChatId";
const NEXT_MESSAGE_ID_KEY = "chat-o.nextMessageId";

//Where the three different tabs will be rendered
const chatList = document.getElementById('chatList');
const empty = document.getElementById('chatListEmpty');
const tabs = document.getElementById('tabs');

//Chats themselves
const messages = document.getElementById('messages');
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');

//make sure only logged in users can see index
const current = sessionStorage.getItem(CURRENT_USER_KEY);
if(!current){
    window.location.href = 'ChatApp-Frontend/pages/login.html';
}

//Set default tab to be selected
let activeTab = 'all';
//Keep track of chat that is currently open
let activeChatId = null;

//Load an return users from local storage
function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}


function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function getCurrentUserId() {
  const raw = sessionStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  return Number(raw);
}

//Chat functions
function loadChats() {
    const raw = localStorage.getItem(CHATS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
}

function saveChats(chats) {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

function getNextChatId() {
    const raw = localStorage.getItem(NEXT_CHAT_ID_KEY);
    const current = raw ? Number(raw) : 1;
    localStorage.setItem(NEXT_CHAT_ID_KEY, String(current + 1));
    return current;
}

function getOrCreateChat(me, you){
    const chats = loadChats();

    const existing = chats.find((c) => 
        c.type === 'direct' &&
        c.members.length === 2 &&
        c.members.includes(me) &&
        c.members.includes(you)
    );

    if(existing) return existing;

    const chat = {
        id: getNextChatId(),
        type: 'direct',
        members: [me, you],
        timeStamp: Date.now(),
    }

    chats.push(chat);
    saveChats(chats);
    return chat;
}

//Message functions

function loadMessages() {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
}

function saveMessages(messages) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

function getNextMessageId() {
    const raw = localStorage.getItem(NEXT_MESSAGE_ID_KEY);
    const current = raw ? Number(raw) : 1;
    localStorage.setItem(NEXT_MESSAGE_ID_KEY, String(current + 1));
    return current;
}

function sendMessage(chatId, senderId, content) {
    const messages = loadMessages();
    const chats = loadChats();

    const message = {
        id: getNextMessageId(),
        chatId,
        senderId,
        content,
        timeStamp: Date.now(),
    }

    messages.push(message);
    saveMessages(messages);

    const chat = chats.find((c) => c.id === chatId);
    if(chat){
        chat.timeStamp = message.timeStamp;
        saveChats(chats);
    }
}

function getVisibleUsers(users) {
    const me = getCurrentUserId();

    const notMe = users.filter((u) =>
    u.id !== me);

    //Filter by tabs
    if(activeTab === 'online') {
        return notMe.filter((u) =>
        u.isOnline === true)
    }

    //COME BACK TO THIS
    if(activeTab === 'groups'){
        return [];
    }

    return notMe;
}

function getAllChatsVisibleUsers(){
    const me = getCurrentUserId();
    if(me === null) return [];

    const chats = loadChats()
     .filter((c) => c.type === 'direct' && c.members.includes(me))
     .sort((a,b) => b.timeStamp - a.timeStamp);

    const users = chats.map((c) => c.members.find((id) => id !== me));
    return users.map((id) => loadUsers().find((u) => u.id === id)).filter((u) => u !== undefined);
}

function getOnlineVisibleUsers() {
    const me = getCurrentUserId();

    return loadUsers()
        .filter((u) => u.id !== me && u.isOnline === true);
}

function getAllChatsSidebarItems(){
    const me = getCurrentUserId();
    if(me === null) return [];

    return loadChats().filter((c) => c.members.includes(me))
    .sort((a,b) => b.timeStamp - a.timeStamp)
    .map((c) => {
        if(c.type === 'direct') {
            const otherUserId = c.members.find((id) => id !== me);
            const otherUser = loadUsers().find((u) => u.id === otherUserId);
            return {
                type: 'direct',
                chatId: c.id,
                user: otherUser
            };
        }

        return {
            type: 'group',
            chatId: c.id,
            title: c.title,
        }
    })
}
function renderMessages() {
    const me = getCurrentUserId();
    messages.innerHTML = '';

    if(activeChatId === null) {
        return;
    }

    const allMessages = loadMessages().filter((m) => m.chatId === activeChatId).sort((a,b) => a.timeStamp - b.timeStamp);

    const chats = loadChats().find((c) => c.id === activeChatId);

    const isGroup = chats?.type === 'group';

    for (const message of allMessages){
        const msgDiv = document.createElement('div');
        msgDiv.className = message.senderId === me ? 'msg-out' : 'msg-in';

        if(isGroup && message.senderId !== me){
            const sender = document.createElement('div');
            sender.className = 'msg-sender';
            sender.textContent = loadUsers().find((u) => u.id === message.senderId)?.username || 'Unknown';
            msgDiv.appendChild(sender);
        }

        const content = document.createElement('div');
        content.className = 'msg-content';
        content.textContent = message.content;

        const time = document.createElement('div');
        time.className = 'msg-time';
        time.textContent = new Date(message.timeStamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        msgDiv.appendChild(content);
        msgDiv.appendChild(time);

        messages.appendChild(msgDiv);
    }

    messages.scrollTop = messages.scrollHeight;
}

function render() {
  chatList.innerHTML = "";

  let items = [];

  if (activeTab === 'online') {
    // online tab shows USERS (not chats)
    items = getOnlineVisibleUsers().map((u) => ({
      type: 'userPick',
      user: u,
    }));
  } else if (activeTab === 'all') {
    // all tab shows DIRECT + GROUP chats
    items = getAllChatsSidebarItems();
  } else if (activeTab === 'groups') {
    // groups tab shows only group chats 
    items = getAllChatsSidebarItems().filter((i) => i.type === "group");
  }

  if (items.length === 0) {
    empty.hidden = false;
    return;
  }

  empty.hidden = true;

  for (const item of items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chat-list-item';

    const pic = document.createElement('div');
    pic.className = 'chat-list-item-pic';

    const info = document.createElement('div');
    info.className = 'chat-list-item-info';

    const name = document.createElement('span');
    name.className = 'chat-list-item-name';

    const badge = document.createElement('span');
    badge.className = 'chat-list-item-badge';

    if (item.type === 'direct') {
      name.textContent = item.user.username;

      if (item.user.isOnline) {
        badge.textContent = 'Online';
        badge.classList.add('badge-online');
      } else {
        badge.textContent = 'Offline';
        badge.classList.add('badge-offline'); 
      }

      button.addEventListener('click', () => {
        activeChatId = item.chatId;
        renderMessages();
      });
    }

    if (item.type === 'group') {
      name.textContent = item.title;
      badge.textContent = 'Group';

      button.addEventListener('click', () => {
        activeChatId = item.chatId;
        renderMessages();
      });
    }

    // Online tab: clicking a user should create/open direct chat
    if (item.type === 'userPick') {
      const user = item.user;
      name.textContent = user.username;

      badge.textContent = 'Online';
      badge.classList.add('badge--online');

      button.addEventListener('click', () => {
        const me = getCurrentUserId();
        if (me === null) return;

        const chat = getOrCreateChat(me, user.id);
        activeChatId = chat.id;

        renderMessages();
        render(); // refresh sidebar ordering
      });
    }

    info.appendChild(name);
    info.appendChild(badge);

    button.appendChild(pic);
    button.appendChild(info);

    chatList.appendChild(button);
  }
}


tabs.addEventListener('click', (event) => {
    const clicked = event.target.closest('button');
    if(!clicked) return;

    if(clicked.id === 'add') return;

    if (clicked.id !== "all" && clicked.id !== "groups" && clicked.id !== "online") {
        return;
    }

    activeTab = clicked.id;

    const allTabs = tabs.querySelectorAll('.tab');
    allTabs.forEach((t) => t.classList.remove('active'));
    clicked.classList.add('active');

    render();
});

sendBtn.addEventListener('click', () => {
    const me = getCurrentUserId();
    if(me === null) return;

    const content = msgInput.value.trim();

    if(activeChatId === null){
        alert('No chat selected');
        return;
    }

    sendMessage(activeChatId, me, content);
    msgInput.value = '';
    renderMessages();
    render();
});

//Check that it updates when users go offline
window.addEventListener('storage', (event) => {
  if (event.key === USERS_KEY || event.key === CHATS_KEY|| event.key === MESSAGES_KEY) {
    render();
    renderMessages();
  }
});

function init(){
    const defalt = document.getElementById('active');
    
    render();
    renderMessages();
}

init();