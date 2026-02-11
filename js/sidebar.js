//Show list of online users

const USERS_KEY = "chat-o.users";
const CURRENT_USER_KEY = "chat-o.current-user";

const chatList = document.getElementById('chatList');
const empty = document.getElementById('chatListEmpty');
const tabs = document.getElementById('tabs');

//Set default tab to be selected
let activeTab = 'all';

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

function render() {
    const users = loadUsers();
    const visible = getVisibleUsers(users);

    //clear items before rendering
    chatList.innerHTML = '';

    //if it's empty, show empty list, otherwise shpw users
    if(visible.length === 0){
        empty.hidden = false;
        return;
    }

    //Assuming it's not empty
    empty.hidden = true;

    for (const user of visible){
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'chat-list-item';

        //IMAGE PLACEHOLDER
        const pic = document.createElement('div');
        pic.className = 'chat-list-item-pic';

        const info = document.createElement('div');
        info.className = 'chat-list-item-info';

        const name = document.createElement('span');
        name.className = 'chat-list-item-name';
        name.textContent = user.username;

        const badge = document.createElement('span');
        badge.className = 'chat-list-item-badge';
        badge.textContent = user.isOnline ? 'Online' : 'Offline';

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

//Check that it updates when users go offline
window.addEventListener('storage', (event) => {
  if (event.key === USERS_KEY || event.key === CURRENT_USER_KEY) {
    render();
  }
});


render();