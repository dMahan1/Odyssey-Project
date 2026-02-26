//Variables

const top_bar = document.getElementById('top_bar');

const scrap_event = document.getElementById('scrap_event');
const popup = document.getElementById('popup_background');
const popup_open = document.getElementById('event_button');

// On run
top_bar.style.height = window_height / 16 + "px";

window.addEventListener('resize', function(){
    window_height = window.innerHeight;
    window_width = window.innerWidth;
    top_bar.style.height = window_height / 16 + "px";
})

scrap_event.addEventListener('click', () => {
    popup.style.display = "none";
})

popup_open.addEventListener('click', () => {
    popup.style.display = "block";
})

