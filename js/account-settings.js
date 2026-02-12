//Log out functionality

const CURRENT_USER_KEY = 'chat-o.current-user';
const USERS_KEY = 'chat-o.users';

const cancelButton = document.getElementById('cancel-button');
const userName = document.getElementById('userName');

function renderCurrentUserName() {
  const me = getCurrentUserId();
  if (me === null) return;

  const users = loadUsers();
  const user = users.find((u) => u.id === me);

  if (!user) return;

  userName.textContent = user.username; 
}

renderCurrentUserName();

const current = sessionStorage.getItem(CURRENT_USER_KEY);
if(!current){
    window.location.href = '../pages/login.html';
}

const logoutButton = document.getElementById('logoutButton');

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

logoutButton.addEventListener('click', () => {
    //Find current user and make them offline
    const users = loadUsers();
    const me = getCurrentUserId();
    const user = users.find((u) =>
    u.id === me);

    if(user) {
        user.isOnline = false;
        saveUsers(users);
    }
    sessionStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = '../pages/login.html';
})



cancelButton.addEventListener('click', () => {
  window.location.href = '../index.html';
});