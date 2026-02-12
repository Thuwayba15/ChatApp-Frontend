//Storage keys for users, chats, and messages
const USERS_KEY = 'chat-o.users';
const CURRENT_USER_KEY = 'chat-o.current-user';
const CHATS_KEY = 'chat-o.chats';
const MESSAGES_KEY = 'chat-o.messages';
const NEXT_CHAT_ID_KEY = 'chat-o.nextChatId';
const NEXT_MESSAGE_ID_KEY = 'chat-o.nextMessageId';

//Sidebar and tabs
const chatList = document.getElementById('chatList');
const empty = document.getElementById('chatListEmpty');
const tabs = document.getElementById('tabs');

//Chat view
const messages = document.getElementById('messages');
const msgInput = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');

//Top bar
const topUserName = document.getElementById('top-user-name');
const topUserStatus = document.getElementById('top-user-status');
const topUserPic = document.getElementById('top-user-pic');

//Group modal
const groupModal = document.getElementById('groupModal');
const groupNameInput = document.getElementById('groupName');
const groupUserList = document.getElementById('groupUserList');
const cancelGroupBtn = document.getElementById('cancelGroupBtn');
const createGroupBtn = document.getElementById('createGroupBtn');

//Selection state
let selectedGroupMemberIds = new Set();
const accountPic = document.getElementById('account-pic');

//Search inputs
const sidebarSearchInput = document.getElementById('sidebarSearchInput');
const modalSearchInput = document.getElementById('modalSearchInput');

let sidebarSearchQuery = '';
let modalSearchQuery = '';

//UI state
let activeTab = 'all';
let activeChatId = null;

const _current = sessionStorage.getItem(CURRENT_USER_KEY);
if (!_current) {
	window.location.href = '../index.html';
}
