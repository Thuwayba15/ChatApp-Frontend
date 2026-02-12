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
    window.location.href = '/ChatApp-Frontend/pages/login.html';
}

//Set default tab to be selected
let activeTab = 'all';
//Keep track of chat that is currently open
let activeChatId = null;

//Load and return users from local storage
function loadUsers() {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  return JSON.parse(raw);
}

//Save users to local storage array
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

//Return logged in user from session storage
function getCurrentUserId() {
  const raw = sessionStorage.getItem(CURRENT_USER_KEY);
  if (!raw) return null;
  return Number(raw);
}

//Chat functions

//Load and return chats from local storage
function loadChats() {
    const raw = localStorage.getItem(CHATS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
}

//Save chats to local storage array
function saveChats(chats) {
    localStorage.setItem(CHATS_KEY, JSON.stringify(chats));
}

//Read next id from local storage, add 1 and return
function getNextChatId() {
    const raw = localStorage.getItem(NEXT_CHAT_ID_KEY);
    const current = raw ? Number(raw) : 1;
    localStorage.setItem(NEXT_CHAT_ID_KEY, String(current + 1));
    return current;
}

//Get a chat between two users or create it
//Load the chats, find 'direct' chats with us, return or create, save to chats array
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

//Load and return messages from local storage
function loadMessages() {
    const raw = localStorage.getItem(MESSAGES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
}

//Save messages to local storage array
function saveMessages(messages) {
    localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
}

//Read next id from local storage, add 1 and return
function getNextMessageId() {
    const raw = localStorage.getItem(NEXT_MESSAGE_ID_KEY);
    const current = raw ? Number(raw) : 1;
    localStorage.setItem(NEXT_MESSAGE_ID_KEY, String(current + 1));
    return current;
}

//Load messages and chats, create a message object, push to array and save, find chat by chatId, update timestamp
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

//See who is online by loading users besides me, where isOnline is true
function getOnlineVisibleUsers() {
    const me = getCurrentUserId();

    return loadUsers()
        .filter((u) => u.id !== me && u.isOnline === true);
}

//Create a sidebar item that represents a chat
//Get current user ID, load all chats that include me, sort by timestamp,
//map each chat into one sidebar item (direct: find user that is not me, clean up to only return info we need)
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

//Render the actual messages
//clear so i tonly shows new, if no activeChatId stop, load messages and filter by current chat,
//sort by timestamp, check if group, for each message:
//create div for in or out, if its a group AND incoming, show username, add content and append to messages container
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
        //Format time according to locale, hours and mins only
        time.textContent = new Date(message.timeStamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

        msgDiv.appendChild(content);
        msgDiv.appendChild(time);

        messages.appendChild(msgDiv);
    }

    messages.scrollTop = messages.scrollHeight;
}

//Renders the items in sidebar
//Clear so only shows new, if statement for which tab is active, set userPick for online users
//For each item, create a button with dp, name, badge
// if it's direct, badge is online or offline, if userPick, opens chats and sets activeChatId
function render() {
    chatList.innerHTML = '';

    let items = [];

    if (activeTab === 'online') {
        items = getOnlineVisibleUsers().map((u) => ({
        type: 'userPick',
        user: u,
        }));
    } else if (activeTab === 'all') {
        items = getAllChatsSidebarItems();
    } else if (activeTab === 'groups') { 
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

    if (item.type === 'userPick') {
      const user = item.user;
      name.textContent = user.username;

      badge.textContent = 'Online';
      badge.classList.add('badge-online');

      button.addEventListener('click', () => {
        const me = getCurrentUserId();
        if (me === null) return;

        const chat = getOrCreateChat(me, user.id);
        activeChatId = chat.id;

        renderMessages();
        render(); 
      });
    }

    info.appendChild(name);
    info.appendChild(badge);

    button.appendChild(pic);
    button.appendChild(info);

    chatList.appendChild(button);
  }
}

//Handle switching between tabs, detects which is clicked and sets active class, calls render
tabs.addEventListener('click', (event) => {
    const clicked = event.target.closest('button');
    if(!clicked) return;

    //COME BACK
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

//Handle sending a message, sends typed message, clears input after, renders messages
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

//Initial setup for first render
function init(){
    const defaultTab = document.getElementById('active');
    
    render();
    renderMessages();
}

init();