//Open the group modal, reset selection state, render the user list
const openGroupModal = () => {
  if (!groupModal || !groupNameInput) return;

  selectedGroupMemberIds = new Set();
  groupNameInput.value = '';
  groupModal.hidden = false;
  renderGroupUserList();
};

const closeGroupModal = () => {
  if (!groupModal) return;
  groupModal.hidden = true;
};

const handleCreateGroup = () => {
  const me = getCurrentUserId();
  if (me === null) return;

  const title = groupNameInput ? groupNameInput.value.trim() : '';
  if (!title) {
    alert('Please enter a group name');
    return;
  }

  const members = [me, ...Array.from(selectedGroupMemberIds)];

  if (members.length < 3) {
    alert('Add at least 2 other people to create a group');
    return;
  }

  const groupChat = createGroupChat(title, members);
  activeChatId = groupChat.id;

  closeGroupModal();
  render();
  renderMessages();
};

const handleCancelGroup = () => {
  closeGroupModal();
};

//Switch tabs/ open group modal
const handleTabsClick = (event) => {
  const clicked = event.target.closest('button');
  if (!clicked) return;

  if (clicked.id === 'add') {
    openGroupModal();
    return;
  }

  if (clicked.id !== 'all' && clicked.id !== 'groups' && clicked.id !== 'online') {
    return;
  }

  activeTab = clicked.id;

  const allTabs = tabs ? tabs.querySelectorAll('.tab') : [];
  allTabs.forEach((t) => t.classList.remove('active'));
  clicked.classList.add('active');

  render();
};

//Send the typed message
const handleSendMessage = () => {
  const me = getCurrentUserId();
  if (me === null) return;

  const content = msgInput ? msgInput.value.trim() : '';

  if (activeChatId === null) {
    alert('No chat selected');
    return;
  }

  sendMessage(activeChatId, me, content);
  if (msgInput) msgInput.value = '';
  renderMessages();
  render();
};

//Sync UI when storage changes
const handleStorageSync = (event) => {
  if (event.key === USERS_KEY || event.key === CHATS_KEY || event.key === MESSAGES_KEY) {
    renderAccountPic();
    render();
    renderMessages();
  }
};

//Update sidebar search query
const handleSidebarSearch = (event) => {
  sidebarSearchQuery = event.target.value.trim().toLowerCase();
  render();
};

//Update modal search query
const handleModalSearch = (event) => {
  modalSearchQuery = event.target.value.trim().toLowerCase();
  renderGroupUserList();
};

if (createGroupBtn) createGroupBtn.addEventListener('click', handleCreateGroup);
if (cancelGroupBtn) cancelGroupBtn.addEventListener('click', handleCancelGroup);
if (tabs) tabs.addEventListener('click', handleTabsClick);
if (sendBtn) sendBtn.addEventListener('click', handleSendMessage);

window.addEventListener('storage', handleStorageSync);

if (sidebarSearchInput) sidebarSearchInput.addEventListener('input', handleSidebarSearch);
if (modalSearchInput) modalSearchInput.addEventListener('input', handleModalSearch);
