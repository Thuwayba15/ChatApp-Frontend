//Log out functionality

const CURRENT_USER_KEY = 'chat-o.current-user';

const current = localStorage.getItem(CURRENT_USER_KEY);
if(!current){
    window.location.href = '../pages/login.html';
}

const logoutButton = document.getElementById('logoutButton');

logoutButton.addEventListener('click', () => {
    localStorage.removeItem(CURRENT_USER_KEY);
    window.location.href = '../pages/login.html';
})