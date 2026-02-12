const form = document.getElementById('loginForm');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const USERS_KEY = 'chat-o.users';

const CURRENT_USER_KEY = 'chat-o.current-user';

//Simple password hashing function (taken from) https://stackoverflow.com/questions/6122571/simple-non-secure-hash-function-for-javascript
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; 
    }
    return hash.toString(36);
}

//Main idea: 
// Load users from local storage
// Take input (normalized for proper checking)
// Find user with matching email and password
// Save current user id to local storage
// Go to home page

function loadUsers() {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
}

//Save users to local storage
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    //Vaidation
    if(!email || !password){
        alert('Please enter your email and password');
        return
    }

    //Get list from local storage
    const users = loadUsers();

    //Find matching user with email
    const matchedUser = users.find((user) => 
        user.email === email
    );

    if (!matchedUser) {
        alert('No user found with that email');
        return;
    }

    //Once email is matched, check password
    if(matchedUser.password !== hashPassword(password)){
        alert('Incorrect password');
        return;
    }

    //Online once logged in, save to update
    matchedUser.isOnline = true;
    console.log(matchedUser);
    saveUsers(users);

    //Session storage
    sessionStorage.setItem(CURRENT_USER_KEY, String(matchedUser.id));

    //Go to home page
    window.location.href = '../index.html';
})