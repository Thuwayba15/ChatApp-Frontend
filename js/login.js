const form = document.getElementById('loginForm');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const USERS_KEY = 'chat-o.users';

const CURRENT_USER_KEY = 'chat-o.current-user';

//Simple hash function 
const hashPassword = (password) => {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; 
    }
    return hash.toString(36);
};

//Main idea: 
// Load users from local storage
// Take input (normalized for proper checking)
// Find user with matching email and password
// Save current user id to local storage
// Go to home page

const loadUsers = () => {
    const raw = localStorage.getItem(USERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
};

//Save users to local storage
const saveUsers = (users) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

//Validate login input, authenticate the user, start a session
form.addEventListener('submit', (event) => {
    event.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    if(!email || !password){
        alert('Please enter your email and password');
        return
    }

    const users = loadUsers();

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
    
    sessionStorage.setItem(CURRENT_USER_KEY, String(matchedUser.id));

    window.location.href = new URL('../pages/home.html', window.location.href).href;
})