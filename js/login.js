const form = document.getElementById('loginForm');

const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

const USERS_KEY = 'chat-o.users';

const CURRENT_USER_KEY = 'chat-o.current-user';

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
    if(matchedUser.password !== password){
        alert('Incorrect password');
        return;
    }

    //Local storage
    localStorage.setItem(CURRENT_USER_KEY, String(matchedUser.id));

    //Go to home page
    window.location.href = '../index.html';
})