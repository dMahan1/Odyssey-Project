/*Variables */
const event_title = document.getElementById('title')
const attendees_list = document.getElementById('attendees')
const start_time = document.getElementById('start')
const end_time = document.getElementById('end')
const loc = document.getElementById('location_search')
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
const inbox_popup_content = document.getElementById('inbox_popup_content');

// Calendar specific variables
const day_textfield = document.getElementById('day');
const previous_day = document.getElementById('prev_day');
const next_day = document.getElementById('next_day');

let current_date = new Date();
let current_day = current_date.getDate();
let current_dow = current_date.getDay();
let current_month = current_date.getMonth();
let current_year = current_date.getFullYear();
let messages = [];

const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

function create_event_invite(event_name, event_creator){
    const event_template = document.getElementById("event_invite_template");
    let new_invite = event_template.content.cloneNode(true)

    new_invite.querySelector('.event_name').innerText = event_name;
    new_invite.querySelector('.event_creator').innerText = event_creator;

    inbox_popup_content.appendChild(new_invite);
}

function create_friend_request(friend_username) {
    const friend_template = document.getElementById("friend_invite_template");
    let new_friend_request = friend_template.content.cloneNode(true);

    new_friend_request.querySelector('.request_username').innerText = friend_username;

    inbox_popup_content.appendChild(new_friend_request);
}

function make_calendar(day, dow, month, year) {
    day_textfield.textContent = days[dow] + ', ' + months[month] + ' ' + day + ', ' + year;
}

/* On run */
top_bar.style.height = window_height / 16 + "px";
change_event_size();
change_inbox_size();
make_calendar(current_day, current_dow, current_month, current_year);


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
    /* did stuff to save the event with server*/
    socket.emit("create_event", user, event_title.value, start_time.value, end_time.value, loc.value, attendees_list.value)
    socket.on("event_created", (key) => {
        /*add event pop up stuff*/
    });
    event_popup.style.display = "none";
})

event_popup_open.addEventListener('click', () => {
    event_popup.style.display = "block";
})

inbox_button.addEventListener('click', () => {
    //socket.emit("get_user", user)
   // socket.on("return_user", (data) => {
       // messages = data.new_messages

    //})
    inbox_popup.style.display = "block";
})

close_inbox.addEventListener('click', () => {
    inbox_popup.style.display = "none";
})

previous_day.addEventListener('click', () => {
    current_day--;
    current_dow--;
    if (current_day < 1) {
        current_month--;
        current_day =  new Date(current_year, current_month + 1, 0).getDate();
    }

    if (current_dow < 0) {
      current_dow = 6;
    }

    if (current_month < 0) {
        current_year--;
        current_month = 11;
        current_day =  new Date(current_year, current_month + 1, 0).getDate();
    }
    make_calendar(current_day, current_dow, current_month, current_year);
})

next_day.addEventListener('click', () => {
    current_day++;
    current_dow++;
    if (current_day > new Date(current_year, current_month + 1, 0).getDate()) {
        current_day = 1;
        current_month++;
    }

    if (current_dow > 6) {
        current_dow = 0;
    }

    if (current_month > 11) {
        current_year++;
        current_month = 0;
    }

    make_calendar(current_day, current_dow, current_month, current_year);
})
