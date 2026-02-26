//Variables

const top_bar = document.getElementById('top_bar');

const scrap_event = document.getElementById('scrap_event');
const popup = document.getElementById('popup_background');
const popup_open = document.getElementById('event_button');
const popup_top_bar = document.getElementById('popup_bar');
const all_day = document.getElementById('all_day');
let start = document.getElementById('start');
let end = document.getElementById('end');

// On run
top_bar.style.height = window_height / 16 + "px";
popup_top_bar.style.height = window_height / 16 + "px";

// Set start time and end time to today's date
let date = new Date();

window.addEventListener('resize', function(){
    window_height = window.innerHeight;
    window_width = window.innerWidth;
    top_bar.style.height = window_height / 16 + "px";
    popup_top_bar.style.height = window_height / 16 + "px";

})

/* Need to make it so that once the checkbox is clicked we change to that day all day.
   Also need to account for if nothing is put into start or end
 */
all_day.addEventListener('change', () => {
    if (all_day.checked) {
        let start_time = "T12:00"
        let end_time = "T23:59"
        let start_date = start.value.substring(0, start.value.indexOf("T"));
        let end_date = end.value.substring(0, end.value.indexOf("T"));

        start.value = start_date + start_time;
        end.value = end_date + end_time;
    }
})

start.addEventListener('change', () => {
    all_day.checked = false;
})

end.addEventListener('change', () => {
    all_day.checked = false;
})

scrap_event.addEventListener('click', () => {
    popup.style.display = "none";
})

popup_open.addEventListener('click', () => {
    popup.style.display = "block";
})

