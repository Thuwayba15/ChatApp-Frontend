//Apply a user's profile image to an element, clearing if missing
const applyUserPic = (element, user) => {
  if (!element) return;

  if (user?.profilePic) {
    element.style.backgroundImage = `url("${user.profilePic}")`;
    element.style.backgroundSize = 'cover';
    element.style.backgroundPosition = 'center';
  } else {
    element.style.backgroundImage = '';
  }
};

//Render the current user's profile image in the top-right account button
const renderAccountPic = () => {
  if (!accountPic) return;

  const me = getCurrentUserId();
  if (me === null) {
    accountPic.style.backgroundImage = '';
    return;
  }

  const user = getUserById(me);
  applyUserPic(accountPic, user);
};

//Set the chat header name, status text, and optional user pic
const setTopBar = (name, statusText, userId, isGroup) => {
  if (topUserName) topUserName.textContent = name || '';
  if (topUserStatus) topUserStatus.textContent = statusText || '';

  if (!topUserPic) return;

  if (isGroup || !userId) {
    topUserPic.style.display = 'none';
    topUserPic.style.backgroundImage = '';
    return;
  }

  const user = getUserById(userId);
  topUserPic.style.display = '';
  applyUserPic(topUserPic, user);
};

//Render messages for the active chat with timestamps and group sender labels
const renderMessages = () => {
  if (!messages) return;

  const me = getCurrentUserId();
  messages.innerHTML = '';

  if (activeChatId === null) {
    return;
  }

  const allMessages = loadMessages()
    .filter((m) => m.chatId === activeChatId)
    .sort((a, b) => a.timeStamp - b.timeStamp);

  const chat = loadChats().find((c) => c.id === activeChatId);
  const isGroup = chat?.type === 'group';
  const users = loadUsers();

  for (const message of allMessages) {
    const msgDiv = document.createElement('div');
    msgDiv.className = message.senderId === me ? 'msg-out' : 'msg-in';

    if (isGroup && message.senderId !== me) {
      const sender = document.createElement('div');
      sender.className = 'msg-sender';
      sender.textContent = users.find((u) => u.id === message.senderId)?.username || 'Unknown';
      msgDiv.appendChild(sender);
    }

    const content = document.createElement('div');
    content.className = 'msg-content';
    content.textContent = message.content;

    const time = document.createElement('div');
    time.className = 'msg-time';
    time.textContent = new Date(message.timeStamp).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });

    msgDiv.appendChild(content);
    msgDiv.appendChild(time);

    messages.appendChild(msgDiv);
  }

  messages.scrollTop = messages.scrollHeight;
};

// Render sidebar items based on active tab and search filter.
const render = () => {
  if (!chatList) return;

  chatList.innerHTML = '';

  let items = [];
  const me = getCurrentUserId();

  if (activeTab === 'online') {
    items = getOnlineVisibleUsers().map((u) => ({
      type: 'userPick',
      user: u,
      chatId: me === null ? null : getDirectChatId(me, u.id),
    }));
  } else if (activeTab === 'all') {
    items = getAllChatsSidebarItems();
  } else if (activeTab === 'groups') {
    items = getAllChatsSidebarItems().filter((i) => i.type === 'group');
  }

  if (sidebarSearchQuery) {
    const q = sidebarSearchQuery.toLowerCase();
    items = items.filter((item) => {
      if (item.type === 'direct' || item.type === 'userPick') {
        return (item.user?.username || '').toLowerCase().includes(q);
      }
      if (item.type === 'group') {
        return (item.title || '').toLowerCase().includes(q);
      }
      return false;
    });
  }

  if (items.length === 0) {
    if (empty) empty.hidden = false;
    return;
  }

  if (empty) empty.hidden = true;

  for (const item of items) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'chat-list-item';

    if (item.type === 'group') {
      button.classList.add('chat-list-item-group');
    }

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

      applyUserPic(pic, item.user);

      //Open the selected  chat and refresh the UI
      button.addEventListener('click', () => {
        activeChatId = item.chatId;
        setTopBar(item.user.username, item.user.isOnline ? 'Online' : 'Offline', item.user.id, false);
        render();
        renderMessages();
      });
    }

    if (item.type === 'group') {
      name.textContent = item.title;
      badge.textContent = 'Group';

      //Open the selected group chat and refresh the UI
      button.addEventListener('click', () => {
        activeChatId = item.chatId;
        setTopBar(item.title, 'Group', null, true);
        render();
        renderMessages();
      });
    }

    if (item.type === 'userPick') {
      const user = item.user;
      name.textContent = user.username;

      badge.textContent = 'Online';
      badge.classList.add('badge-online');

      applyUserPic(pic, user);

      //Start or open a direct chat with the selected online user
      button.addEventListener('click', () => {
        const meId = getCurrentUserId();
        if (meId === null) return;

        const chat = getOrCreateChat(meId, user.id);
        activeChatId = chat.id;
        setTopBar(user.username, 'Online', user.id, false);
        renderMessages();
        render();
      });
    }

    if (item.chatId && item.chatId === activeChatId) {
      button.classList.add('chat-list-item-active');
    }

    info.appendChild(name);
    info.appendChild(badge);

    if (item.type !== 'group') {
      button.appendChild(pic);
    }

    button.appendChild(info);
    chatList.appendChild(button);
  }
};

//Render the group member list with add/remove actions
const renderGroupUserList = () => {
  if (!groupUserList) return;

  const me = getCurrentUserId();
  let users = loadUsers().filter((u) => u.id !== me);

  if (modalSearchQuery) {
    const q = modalSearchQuery.toLowerCase();
    users = users.filter((u) => (u.username || '').toLowerCase().includes(q));
  }

  groupUserList.innerHTML = '';

  for (const user of users) {
    const row = document.createElement('div');
    row.className = 'modal-row';

    const left = document.createElement('div');
    left.className = 'modal-row-left';

    const pic = document.createElement('div');
    pic.className = 'modal-row-pic';
    applyUserPic(pic, user);

    const name = document.createElement('div');
    name.className = 'modal-row-name';
    name.textContent = user.username;

    left.appendChild(pic);
    left.appendChild(name);

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'modal-row-btn';

    const isSelected = selectedGroupMemberIds.has(user.id);
    btn.textContent = isSelected ? 'Remove' : 'Add';
    if (isSelected) btn.classList.add('modal-row-btn-remove');

    //Toggle selection and re-render the list
    btn.addEventListener('click', () => {
      if (selectedGroupMemberIds.has(user.id)) {
        selectedGroupMemberIds.delete(user.id);
      } else {
        selectedGroupMemberIds.add(user.id);
      }
      renderGroupUserList();
    });

    row.appendChild(left);
    row.appendChild(btn);

    groupUserList.appendChild(row);
  }
};
