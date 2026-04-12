/*Variables */
const start_time = document.getElementById('start')
const end_time = document.getElementById('end')
const loc = document.getElementById('location_search')
const top_bar = document.getElementById('top_bar');
const title = document.getElementById('title');
const attendees = document.getElementById('attendees');
const start_label = document.getElementById('start_label');
const end_label = document.getElementById('end_label');

let permanent_locations = [];

// Event specific variables
const scrap_event = document.getElementById('scrap_event');
const save_event = document.getElementById('save_event');
const event_popup = document.getElementById('event_popup_background');
const event_popup_open = document.getElementById('event_button');
const event_popup_top_bar = document.getElementById('event_popup_bar');
const event_popup_content = document.getElementById('event_popup_content');

const attendees_popup = document.getElementById('attendees_popup_background')
const attendees_content = document.getElementById('attendees_popup_content');
const more_attendees_button = document.getElementById('more_attendees');
const attendees_popup_top_bar = document.getElementById('attendees_popup_bar');
const save_attendees = document.getElementById('save_attendees');
const attendeeText = document.getElementById('attendee_text');

const message_button = document.getElementById('message_button');

const main_content = document.querySelector('.main_content');

// Inbox specific variables
const inbox_button = document.getElementById('inbox_button');
const inbox_popup = document.getElementById('inbox_popup_background');
const close_inbox = document.getElementById('close_inbox');
const inbox_popup_top_bar = document.getElementById('inbox_popup_bar');
const inbox_popup_content = document.getElementById('inbox_popup_content');
const calendar_popup = document.getElementById('calendar_popup_background');

// Calendar specific variables
const day_textfield = document.getElementById('day');
const previous_day = document.getElementById('prev_day');
const next_day = document.getElementById('next_day');
const previous_month = document.getElementById('prev_month');
const next_month = document.getElementById('next_month');

let current_date = new Date();
let current_day = current_date.getDate();
let current_dow = current_date.getDay();
let current_month = current_date.getMonth();
let current_year = current_date.getFullYear();
let current_event_id = null; // To track which event we're messaging about, if any

const cancel_calendar_change = document.getElementById('cancel_calendar_change');
const change_mode_button = document.getElementById('change_mode_button');
const day_change = document.getElementById('day_change');
const week_change = document.getElementById('week_change');
const month_change = document.getElementById('month_change');
const year_change = document.getElementById('year_change');
const day_calendar = document.querySelector('.day_calendar');
const month_calendar = document.querySelector('.month_calendar');


// Message specific variables
const message_popup_bar = document.getElementById('message_popup_bar');
const close_message = document.getElementById('close_message');
const message_popup = document.getElementById('message_popup_background');
const message_text = document.getElementById('message_text');
const send_message = document.getElementById('send_message');


// Global state to store IDs of checked friends
let selectedAttendeeIds = new Set();
let messages = [];

const socket = io({
    withCredentials: true,
    transports: ['websocket', 'polling'] // Force websocket to keep the session stable
});
window.socket = socket;
// added
const backupUser = JSON.parse(localStorage.getItem('user_backup'));
if (backupUser) {
    socket.emit("verify_session", backupUser);
}

let current_user = JSON.parse(sessionStorage.getItem('user')) || null;

const months = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

/* Functions */

function change_inbox_size() {
    inbox_popup_top_bar.style.height = window_height / 16 + "px";
}

function change_message_size() {
    message_popup_bar.style.height = window_height / 16 + "px";
}

function change_event_size() {
    event_popup_top_bar.style.height = window_height / 16 + "px";
    event_popup_content.style.gap = .02 * window_height + "px";

    title.style.height =
        title.style.fontSize =
        attendees.style.height =
        start_time.style.height =
        end_time.style.height =
        end_label.style.height =
        start_label.style.height =
        loc.style.height =
        end_label.style.lineHeight =
        start_label.style.lineHeight =
        window_height * .05 + "px";

    title.style.fontSize =
        attendees.style.fontSize =
        start_time.style.fontSize =
        end_time.style.fontSize =
        loc.style.fontSize =
        end_label.style.fontSize =
        start_label.style.fontSize =
        window_height * .03 + "px";
}

function change_attendees_size () {
    attendees_popup_top_bar.style.height = window_height / 32 + "px";
}

function load_permanent_locations() {
    window.socket.emit("get_permanent_locations");
    
    window.socket.once("permanent_locations_got", (locations) => {
        permanent_locations = locations;
        update_permanent_locations();
    });
}

function update_permanent_locations() {
    loc.innerHTML = '<option hidden="hidden">&#x2315 Location</option>';

    if (permanent_locations) {
        permanent_locations.forEach(loc => {
            add_location(loc.name, loc.id);
        });
    }
}

function create_event_invite(event_name, event_message, event_id, message_id){
    const event_template = document.getElementById("event_invite_template");
    let new_invite = event_template.content.cloneNode(true);
    
    let invite_element = new_invite.querySelector('.event_invite');

    invite_element.querySelector('.event_name').innerText = event_name;
    invite_element.querySelector('.event_creator').innerText = event_message;

    // --- ACCEPT BUTTON ---
    const acceptBtn = invite_element.querySelector('#accept_event');
    acceptBtn.addEventListener('click', () => {
        window.socket.emit("accept_event_invite", event_id, message_id);
        
        invite_element.remove();
    });

    // --- DECLINE BUTTON ---
    const declineBtn = invite_element.querySelector('#decline_event');
    declineBtn.addEventListener('click', () => {
        window.socket.emit("remove_message", message_id);
        
        invite_element.remove();
    });

    inbox_popup_content.appendChild(new_invite);
}

function create_friend_request(friend_username, sender_id, message_id) {
    const friend_template = document.getElementById("friend_invite_template");
    let new_friend_request = friend_template.content.cloneNode(true);
    
    let request_element = new_friend_request.querySelector('.friend_invite');
    request_element.querySelector('.request_username').innerText = friend_username;

    // --- ACCEPT BUTTON ---
    const acceptBtn = request_element.querySelector('#accept_friend');
    acceptBtn.addEventListener('click', () => {
        window.socket.emit("add_friend", sender_id);
        
        window.socket.emit("remove_message", message_id);
        
        request_element.remove();
    });

    // --- DECLINE BUTTON ---
    const declineBtn = request_element.querySelector('#decline_friend');
    declineBtn.addEventListener('click', () => {
        window.socket.emit("remove_message", message_id);
        
        request_element.remove();
    });

    inbox_popup_content.appendChild(new_friend_request);
}

function create_message(sender_username, message_id, message_text, event_name) {
    const message_template = document.getElementById("message_template");
    let new_message = message_template.content.cloneNode(true);

    let message_element = new_message.querySelector('.message');
    message_element.querySelector('.event_name').innerText = event_name ? `${event_name}` : "Message";
    message_element.querySelector('.message_text').innerText = message_text;
    message_element.querySelector('.sender_username').innerText = "@" + sender_username;

    const declineBtn = message_element.querySelector('#remove_message');
    declineBtn.addEventListener('click', () => {
        window.socket.emit("remove_message", message_id);
        
        message_element.remove();
    });

    inbox_popup_content.appendChild(new_message);
}

function add_attendee_list(attendee_name, attendee_id) {
    const template = document.getElementById("attendee_template");
    const container = document.getElementById("attendees_popup_content");

    if (!template) return;

    let new_attendee = template.content.cloneNode(true);
    const checkbox = new_attendee.querySelector('.attendees_select');
    const label = new_attendee.querySelector('label');

    checkbox.id = attendee_id;
    checkbox.value = attendee_name;
    
    label.appendChild(document.createTextNode(" " + attendee_name));

    container.appendChild(new_attendee);
}

function add_location(location_name, location_id) {
    const newLoc = new Option(location_name, location_id);
    loc.appendChild(newLoc);
}

function add_event(event_name, event_creator, event_location, start_time, end_time, event_id) {
    let new_event = event_template.content.cloneNode(true);

    let event_div = new_event.querySelector('.event');
    const hour_size = 60;
    event_div.style.top = ((start_time + 1) * hour_size) + "px";
    event_div.style.height = ((end_time - start_time) * hour_size) + "px";
    event_div.id = event_id;

    // --- NEW DELETE LOGIC ---
    const deleteBtn = new_event.querySelector('.delete_event_btn');
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();

        if (confirm(`Are you sure you want to delete "${event_name}"?`)) {
            window.socket.emit("delete_event", event_id);
            
            remove_event(event_id);
            window.socket.once("event_deleted", (success) => {
                if (!success) {
                    alert("An error occurred while deleting the event. Please try again.");
                    add_event(event_name, event_creator, event_location, start_time, end_time, event_id); // Re-add if deletion failed
                }
            });
        }
    });

    const message_button = new_event.querySelector('.message_button');
    message_button.addEventListener('click', (e) => {
        e.stopPropagation();
        current_event_id = event_id;
        message_popup.style.display = "block";
    })

    new_event.querySelector('.event_name').innerText = "Name: " + event_name;
    new_event.querySelector('.event_creator').innerText = "Coordinator: " + event_creator;
    new_event.querySelector('.event_location').innerText = "Location: " + event_location;

    let start_hour = Math.floor(start_time);
    let start_minute = Math.floor((start_time * 60) % 60)

    if (start_hour > 12) {
        start_hour = start_hour % 12;
        new_event.querySelector('.event_start').innerText = "Start: " + start_hour + ":" + start_minute.toString().padStart(2, '0') + "pm";

    } else {
        if (start_hour === 0) {
            start_hour = 12;
        }
        new_event.querySelector('.event_start').innerText = "Start: " + start_hour + ":" + start_minute.toString().padStart(2, '0') + "am";
    }

    let end_hour = Math.floor(end_time);
    let end_minute = Math.floor((end_time * 60) % 60);

    if (end_hour > 12) {
        end_hour = end_hour % 12;
        new_event.querySelector('.event_end').innerText = "End: " + end_hour + ":" + end_minute.toString().padStart(2, '0') + "pm";
    } else {
        if (end_hour === 0) {
            end_hour = 12;
        }
        new_event.querySelector('.event_end').innerText = "End: " + end_hour + ":" + end_minute.toString().padStart(2, '0') + "am";
    }

    if (event_creator !== current_user.displayName) {
        message_button.style.display = "none";
    }

    main_content.appendChild(new_event);
}

function remove_event(event_id) {
    let to_remove = document.getElementById(event_id);
    if (to_remove) {
        to_remove.remove();
    }
}

function clear_events() {
    const events = document.querySelectorAll('.event');
    events.forEach(event => event.remove());
}

function update_events() {
    window.socket.emit("get_events");
    window.socket.once("events_got", (events) => {
        clear_events();
        
        const calendarDate = new Date(current_year, current_month, current_day);
        calendarDate.setHours(0, 0, 0, 0); 

        events.forEach(event => {
            const startVal = new Date(event.start_time);
            const endVal = new Date(event.end_time);

            const startDay = new Date(startVal.getFullYear(), startVal.getMonth(), startVal.getDate());
            const endDay = new Date(endVal.getFullYear(), endVal.getMonth(), endVal.getDate());

            if (calendarDate >= startDay && calendarDate <= endDay) {
                let displayStart = 0;
                let displayEnd = 24;

                if (calendarDate.getTime() === startDay.getTime()) {
                    displayStart = startVal.getHours() + (startVal.getMinutes() / 60);
                }

                if (calendarDate.getTime() === endDay.getTime()) {
                    displayEnd = endVal.getHours() + (endVal.getMinutes() / 60);
                }

                console.log(event);

                add_event(
                    event.name, 
                    event.creator_username,
                    event.location_name,
                    displayStart, 
                    displayEnd, 
                    event.id
                );
            }
        });
    });
}

const month_label = document.getElementById('month_label');
const month_calendar_dates =  document.querySelector('.month_calendar_dates');

/* Calendar Specific functions */
function make_calendar(day, dow, month, year) {
    make_day_calendar(day, dow, month, year);
    make_month_calendar(month, year);

}

function make_day_calendar(day, dow, month, year) {
    day_textfield.textContent = days[dow] + ', ' + months[month] + ' ' + day + ', ' + year;
}

function make_month_calendar(month, year) {
    month_calendar_dates.innerHTML = '';
    month_label.textContent = `${months[month]} ${year}`;

    const firstDay = new Date(year, month, 1).getDay();

    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
        const blank_element = document.createElement('div');
        blank_element.classList.add('calendar_day');
        month_calendar_dates.appendChild(blank_element);
    }

    for (let i = 1; i <= daysInMonth; i++) {
        const day_element = document.createElement('div');
        day_element.classList.add('calendar_day');
        day_element.textContent = i;
        month_calendar_dates.appendChild(day_element);
    }
}

function clear_event_window() {
    title.value = null;
    start_time.value = null;
    end_time.value = null;
    update_permanent_locations();
    attendeeText.innerText = `Attendees`;
}

/* On run */
top_bar.style.height = window_height / 16 + "px";
change_event_size();
change_inbox_size();
change_attendees_size();
change_message_size();

make_calendar(current_day, current_dow, current_month, current_year);
update_events();
load_permanent_locations();

/* Event Listeners */
window.addEventListener('resize', function(){
    window_height = window.innerHeight;
    window_width = window.innerWidth;
    top_bar.style.height = window_height / 16 + "px";

    change_event_size();
    change_inbox_size();
    change_attendees_size();
    change_message_size();

    update_events();
});

scrap_event.addEventListener('click', () => {
    event_popup.style.display = "none";
    clear_event_window();
})

save_event.addEventListener('click', () => {

    if (title.value === "" || loc.value === "" || start_time.value === "" || end_time.value === "") {
        alert("No empty fields!")
        return;
    }

    const startVal = new Date(start_time.value);
    const endVal = new Date(end_time.value);

    const calendarDate = new Date(current_year, current_month, current_day);

    const startDay = new Date(startVal.getFullYear(), startVal.getMonth(), startVal.getDate());
    const endDay = new Date(endVal.getFullYear(), endVal.getMonth(), endVal.getDate());

    if (calendarDate >= startDay && calendarDate <= endDay) {
        
        const attendeeIdsArray = Array.from(selectedAttendeeIds);
        window.socket.emit("create_event", 
            title.value,
            start_time.value, 
            end_time.value, 
            loc.value,
            attendeeIdsArray
        );

        window.socket.once("event_created", (key) => {
            if (key) {
                update_events();
            } else {
                alert("An error occurred while creating the event.");
            }
        });
    } else {
        window.socket.emit("create_event", title.value, start_time.value, end_time.value, loc.value, Array.from(selectedAttendeeIds));
        console.log("Event saved, but not displayed on this specific calendar day.");
    }


    event_popup.style.display = "none";
    clear_event_window();
});

event_popup_open.addEventListener('click', () => {
    event_popup.style.display = "block";
})

inbox_button.addEventListener('click', () => {
    inbox_popup.style.display = "block";
    inbox_popup_content.innerHTML = '';

    window.socket.emit("get_user");

    window.socket.once("return_user", (data) => {
        console.log(data);

        const userMessages = data.messages;

        if (userMessages) {
            Object.entries(userMessages).forEach(([message_id, msg]) => {
                if (msg.type === 0) {
                    create_friend_request(msg.sender_username, msg.sender_id, message_id);
                } else if (msg.type === 1) {
                    create_event_invite(msg.sender_username, msg.message, msg.event_id, message_id);
                } else if (msg.type === 2) {
                    create_message(msg.sender_username, message_id, msg.message, (msg.event_name) ? msg.event_name : "Event Message");
                }
            });
        }

        if (inbox_popup_content.innerHTML === '') {
            const emptyMsg = document.createElement('p');
            emptyMsg.innerText = "No new notifications";
            emptyMsg.style.textAlign = "center";
            inbox_popup_content.appendChild(emptyMsg);
        }
    });
});

close_inbox.addEventListener('click', () => {
    inbox_popup.style.display = "none";
})



window.socket.on("event_accepted", (success) => {
    if (success) {
        update_events();
    }
});

more_attendees_button.addEventListener('click', () => {
    attendees_content.innerHTML = '';

    window.socket.emit("get_friends");
    
    window.socket.once("friends_got", (ret) => {
        ret.forEach(friend => {
            add_attendee_list(friend.username, friend.id);
            
            const cb = document.getElementById(friend.id);
            if (cb && selectedAttendeeIds.has(String(friend.id))) {
                cb.checked = true;
            }
        });
    });
    attendees_popup.style.display = "block";
});

save_attendees.addEventListener('click', () => {
    const checkboxes = attendees_content.querySelectorAll('.attendees_select');
    selectedAttendeeIds.clear(); // Refresh our saved list
    
    checkboxes.forEach(cb => {
        if (cb.checked) {
            selectedAttendeeIds.add(cb.id);
        }
    });

    attendeeText.innerText = `Attendees (${selectedAttendeeIds.size})`;
    attendees_popup.style.display = "none";
});

close_message.addEventListener('click', () => {
    message_popup.style.display = "none";
    message_text.value = null;
})

send_message.addEventListener('click', () => {
    if (message_text.value === "") {
        alert("Please enter a message!");
    } else {
        // send message logic

        window.socket.emit("send_message", message_text.value, current_event_id);
        window.socket.once("message_sent", (status) => {
            alert(status);
        });
        current_event_id = null;
        console.log(message_text.value);
        message_popup.style.display = "none";
        message_text.value = null;
    }
})

/* Calendar specific things */
cancel_calendar_change.addEventListener('click', () => {
    calendar_popup.style.display = "none";
})
change_mode_button.addEventListener('click', () => {
    calendar_popup.style.display = "block";
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
    make_day_calendar(current_day, current_dow, current_month, current_year);
    update_events();
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

    make_day_calendar(current_day, current_dow, current_month, current_year);
    update_events();
})

previous_month.addEventListener('click', () => {
    current_month--;
    if (current_month < 0) {
        current_month = 11;
        current_year--;
    }

    make_month_calendar(current_month, current_year);
})

next_month.addEventListener('click', () => {
    current_month++;
    if (current_month > 11) {
        current_month = 0;
        current_year++;
    }

    make_month_calendar(current_month, current_year);
})


day_change.addEventListener('click', () => {
    month_calendar.style.display = "none";
    day_calendar.style.display = "block";
    calendar_popup.style.display = "none";
})

week_change.addEventListener('click', () => {
    day_calendar.style.display = "none";
    month_calendar.style.display = "none";
    calendar_popup.style.display = "none";
})

month_change.addEventListener('click', () => {
    day_calendar.style.display = "none";
    month_calendar.style.display = "flex";
    calendar_popup.style.display = "none";
})

year_change.addEventListener('click', () => {
    day_calendar.style.display = "none";
    calendar_popup.style.display = "none";
})

