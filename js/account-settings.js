//Log out functionality

const CURRENT_USER_KEY = 'chat-o.current-user';
const USERS_KEY = 'chat-o.users';

const cancelButton = document.getElementById('cancel-button');
const saveButton = document.getElementById('save-button');
const userName = document.getElementById('userName');
const userIcon = document.getElementById('userIcon');
const editIconButton = document.getElementById('editIcon');
const profilePicInput = document.getElementById('profilePicInput');

function renderCurrentUserName() {
  const me = getCurrentUserId();
  if (me === null) return;

  const users = loadUsers();
  const user = users.find((u) => u.id === me);

  if (!user || !userName) return;

  userName.textContent = user.username; 
}

function renderCurrentUserIcon() {
  const me = getCurrentUserId();
  if (me === null || !userIcon) return;

  const users = loadUsers();
  const user = users.find((u) => u.id === me);
  if (!user) return;

  if (user.profilePic) {
    userIcon.style.backgroundImage = `url("${user.profilePic}")`;
  } else {
    userIcon.style.backgroundImage = '';
  }
}

renderCurrentUserName();
renderCurrentUserIcon();

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

if (saveButton) {
  saveButton.addEventListener('click', () => {
    window.location.href = '../index.html';
  });
}

if (editIconButton && profilePicInput) {
  editIconButton.addEventListener('click', () => {
    profilePicInput.click();
});

profilePicInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (!file.type.startsWith('image/')) {
    alert('Please select an image file');
    return;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const me = getCurrentUserId();
    if (me === null) return;

    const users = loadUsers();
    const user = users.find((u) => u.id === me);
    if (!user) return;

    user.profilePic = reader.result;
    saveUsers(users);
    renderCurrentUserIcon();
  };

  reader.readAsDataURL(file);
  
  });
}