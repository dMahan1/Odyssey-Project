//Variables

const top_bar = document.getElementById('top_bar');

const scrap_event = document.getElementById('scrap_event');
const save_event = document.getElementById('save_event');
const popup = document.getElementById('event_popup_background');
const popup_open = document.getElementById('event_button');
const popup_top_bar = document.getElementById('event_popup_bar');
const all_day = document.getElementById('all_day');
const popup_content = document.getElementById('event_popup_content');

const title = document.getElementById('title');
const attendees = document.getElementById('attendees');
const start = document.getElementById('start');
const end = document.getElementById('end');
const location_search = document.getElementById('location_search');
const start_label = document.getElementById('start_label');
const end_label = document.getElementById('end_label');

// On run
top_bar.style.height = window_height / 16 + "px";
popup_top_bar.style.height = window_height / 16 + "px";

title.style.height =
    attendees.style.height =
    start.style.height =
    end.style.height =
    location_search.style.height =
    end_label.style.height =
    start_label.style.height =
    end_label.style.lineHeight =
    start_label.style.lineHeight =
    window_height * .05 + "px";

title.style.fontSize =
    attendees.style.fontSize =
    start.style.fontSize =
    end.style.fontSize =
    location_search.style.fontSize =
    end_label.style.fontSize =
    start_label.style.fontSize =
    window_height * .03 + "px";

popup_content.style.gap = .02 * window_height + "px";

// Set start time and end time to today's date
let date = new Date();

window.addEventListener('resize', function(){
    console.log(window.innerHeight);
    window_height = window.innerHeight;
    window_width = window.innerWidth;
    top_bar.style.height = window_height / 16 + "px";
    popup_top_bar.style.height = window_height / 16 + "px";

    popup_content.style.gap = .02 * window_height + "px";

    title.style.height =
        title.style.fontSize =
        attendees.style.height =
        start.style.height =
        end.style.height =
        end_label.style.height =
        start_label.style.height =
        location_search.style.height =
        end_label.style.lineHeight =
        start_label.style.lineHeight =
        window_height * .05 + "px";

    title.style.fontSize =
        attendees.style.fontSize =
        start.style.fontSize =
        end.style.fontSize =
        location_search.style.fontSize =
        end_label.style.fontSize =
        start_label.style.fontSize =
        window_height * .03 + "px";

})

scrap_event.addEventListener('click', () => {
    popup.style.display = "none";
})

save_event.addEventListener('click', () => {
    /* do stuff to save the event with server*/
    popup.style.display = "none";
})

popup_open.addEventListener('click', () => {
    popup.style.display = "block";
})

