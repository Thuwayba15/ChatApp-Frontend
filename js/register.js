const form = document.getElementById('registerForm');

const usernameInput = document.getElementById('username');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');

//For storing users as JSON
const USERS_KEY = 'chat-o.users';

//Session storage key for current user
const CURRENT_USER_KEY = 'chat-o.current-user';

//Get users from local storage
function loadUsers() {
    const raw = localStorage.getItem(USERS_KEY);

    //If no data yet, return empty array
    if(!raw) return [];

    //Convert JSON to JS array
    return JSON.parse(raw);
}

//Save users to local storage
function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

form.addEventListener('submit', (event) => {

    //Stop refresh
    event.preventDefault();

    const username = usernameInput.value.trim();
    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;

    //Check if all fields are filled
    if (!username || !email || !password){
        alert('Please fill in all fields');
        return;
    }

    //Good password rules
    if(password.length < 6){
        alert('Password must be at least 6 characters');
        return;
    }

    //Get users from local storage
    const users = loadUsers();

    //Check uniqueness
    const usernameExists = users.some ( (user) => 
        user.username.toLowerCase() === username.toLowerCase());

    if(usernameExists){
        alert('Username already exists');
        return;
    }

    //Create new user object
    const newUser = {
        username: username,
        email: email,
        password: password,
    }

    //Add to users list
    users.push(newUser);

    //Save to local storage
    saveUsers(users);

    //Session storage
    localStorage.setItem(
        CURRENT_USER_KEY,
        JSON.stringify(newUser.username, newUser.email)
    )

    window.location.href = '../index.html';

})

