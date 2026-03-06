// Variables
const logout = document.getElementById('logout');
const password_change = document.getElementById('password');
const email_change = document.getElementById('email');
const username_change = document.getElementById('username');
const user_div_background = document.getElementById('user_div_background');
const user_check = document.getElementById('user_check');
const delete_account = document.getElementById('delete');
const friends_bar = document.getElementById('friends_bar');
const add_friends = document.getElementById('add_friends');
const delete_friends = document.getElementById('delete_friends');

// friends_bar.style.height = window_height / 2 + "px";

// On run
logout.addEventListener('click', () => {
    window.location.href = "Signin.html";
})

window.addEventListener('click', () => {
    window_height = window.innerHeight;
    window_width = window.innerWidth;
    // friends_bar.style.height = window_height / 2 + "px";
})

password_change.addEventListener('click', () => {
    /* send the emails */
})

email_change.addEventListener('click', () => {
    /* send the emails */
})

username_change.addEventListener('click', () => {
    user_div_background.style.display = "block";
})

user_check.addEventListener('click', () => {
    user_div_background.style.display = "none";
    /* sending username to database */
})

delete_account.addEventListener('click', () => {
    /* delete the account stuff and send back to signup */
})

add_friends.addEventListener('click', () => {
    /* add friend to the list and send request */
})

delete_friends.addEventListener('click', () => {
    /* delete friend from the list */
})

function add_friend(name) {
    const friend_template = document.getElementById("friends_template");
    let new_friend = friend_template.content.cloneNode(true);

    new_friend.querySelector('label').append(name);
    friends_bar.appendChild(new_friend);
}