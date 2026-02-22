// Variables
const nav_bar = document.getElementById('nav_bar');
let window_height = window.innerHeight;
let window_width = window.innerWidth;
const calendar_button = document.getElementById('calendar_button');
const map_button = document.getElementById('map_button')
const settings_button = document.getElementById('settings_button');
const friends_bar = document.getElementById('friends_bar');
const logout = document.getElementById('logout');

// Functions
function change_buttons(button) {
    button.style.height = window_height / 8 +'px';
    button.style.width = window_width / 4 + "px";
}

// On run
nav_bar.style.height = window_height / 8 + "px";
nav_bar.style.gap = window_width / 8 + "px";
change_buttons(calendar_button);
change_buttons(map_button);
change_buttons(settings_button);
if (friends_bar !== null) {friends_bar.style.height = window_height / 2 + "px";}

window.addEventListener ('resize', () => {
    window_height = window.innerHeight;
    window_width = window.innerWidth;
    
    nav_bar.style.height = window_height / 8 + 'px';
    nav_bar.style.gap = window_width / 8 + "px";

    change_buttons(calendar_button);
    change_buttons(map_button);
    change_buttons(settings_button);

    if (friends_bar !== null) {friends_bar.style.height = window_height / 2 + "px";}

})

calendar_button.addEventListener('click', () => {
    window.location.href = "Calendar.html";
})

settings_button.addEventListener('click', () => {
    window.location.href = "Settings.html";
})

map_button.addEventListener('click', () => {
    window.location.href = "Map.html";
})

logout.addEventListener('click', () => {
    window.location.href = "Signin.html";
})

