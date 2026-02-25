// Variables
const logout = document.getElementById('logout');
const friends_bar = document.getElementById('friends_bar');

friends_bar.style.height = window_height / 2 + "px";

// On run
logout.addEventListener('click', () => {
    window.location.href = "../Signin.html";
})

window.addEventListener('click', () => {
    window_height = window.innerHeight;
    window_width = window.innerWidth;
    friends_bar.style.height = window_height / 2 + "px";
})