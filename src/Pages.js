const nav_bar = document.getElementById('nav_bar');
let window_height = window.innerHeight;
let window_width = window.innerWidth;
const calendar_button = document.getElementById('calendar_button');
const map_button = document.getElementById('map_button')
const settings_button = document.getElementById('settings_button');

nav_bar.style.height = window_height / 8 + "px";
nav_bar.style.gap = window_width / 8 + "px";
change_proportions(calendar_button);
change_proportions(map_button);
change_proportions(settings_button);

window.addEventListener ('resize', () => {
    window_height = window.innerHeight;
    window_width = window.innerWidth;
    
    nav_bar.style.height = window_height / 8 + 'px';
    nav_bar.style.gap = window_width / 8 + "px";

    change_proportions(calendar_button);
    change_proportions(map_button);
    change_proportions(settings_button);
})

function change_proportions(button) {
    button.style.height = window_height / 8 -  + 'px';
    button.style.width = window_width / 4 + "px";
}
