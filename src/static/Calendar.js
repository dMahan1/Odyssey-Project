/*Variables */

const top_bar = document.getElementById('top_bar');

// Event specific variables
const scrap_event = document.getElementById('scrap_event');
const save_event = document.getElementById('save_event');
const event_popup = document.getElementById('event_popup_background');
const event_popup_open = document.getElementById('event_button');
const event_popup_top_bar = document.getElementById('event_popup_bar');
const event_popup_content = document.getElementById('event_popup_content');

const title = document.getElementById('title');
const attendees = document.getElementById('attendees');
const start = document.getElementById('start');
const end = document.getElementById('end');
const location_search = document.getElementById('location_search');
const start_label = document.getElementById('start_label');
const end_label = document.getElementById('end_label');

// Inbox specific variables
const inbox_button = document.getElementById('inbox_button');
const inbox_popup = document.getElementById('inbox_popup_background');
const close_inbox = document.getElementById('close_inbox');
const inbox_popup_top_bar = document.getElementById('inbox_popup_bar');
const event_invites = document.getElementsByClassName('event_invite');


/* On run */
top_bar.style.height = window_height / 16 + "px";
change_event_size();
change_inbox_size();

/* Event Listeners */
window.addEventListener('resize', function(){
    window_height = window.innerHeight;
    window_width = window.innerWidth;
    top_bar.style.height = window_height / 16 + "px";

    change_event_size();
    change_inbox_size();

})

scrap_event.addEventListener('click', () => {
    event_popup.style.display = "none";
})

save_event.addEventListener('click', () => {
    /* do stuff to save the event with server*/
    event_popup.style.display = "none";
})

event_popup_open.addEventListener('click', () => {
    event_popup.style.display = "block";
})

inbox_button.addEventListener('click', () => {
    inbox_popup.style.display = "block";
})

close_inbox.addEventListener('click', () => {
    inbox_popup.style.display = "none";
})

/* Functions */

function change_inbox_size() {
    inbox_popup_top_bar.style.height = window_height / 16 + "px";

}

function change_event_size() {
    event_popup_top_bar.style.height = window_height / 16 + "px";
    event_popup_content.style.gap = .02 * window_height + "px";

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
}

class event_invite {
    constructor(event_name, event_creator) {
        this.event_name = event_name;
        this.event_creator = event_creator;
    }
}

function create_event_invite(event_name, event_creator) {
    const new_invite = new event_invite(event_name, event_creator);

    const name = document.getElementById('event_name');
    const creator = document.getElementById('event_creator');

    name.style.textContent = new_invite.event_name;
    creator.style.textContent = new_invite.event_creator;

}
