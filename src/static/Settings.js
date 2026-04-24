// Variables
const logout = document.getElementById('logout');
const password_change = document.getElementById('password');
const username_change = document.getElementById('username');
const user_div_background = document.getElementById('user_div_background');
const user_check = document.getElementById('user_check');
const delete_account = document.getElementById('delete');
const friends_bar = document.getElementById('friends_bar');
const add_friends = document.getElementById('add_friends');
const delete_friends = document.getElementById('delete_friends');
const friends_search = document.getElementById('friends_search');
const current_friends_search = document.getElementById('current_friends_search');

const ban_search = document.getElementById('ban_search');
const ban_user = document.getElementById('ban_user');

const report_bug_background = document.getElementById('report_bug_background');
const report_bug_button = document.getElementById('report_bug');
const close_report_bug = document.getElementById('close_report_bug');
const report_bug_text = document.getElementById('report_bug_text');
const send_report_bug = document.getElementById('send_report_bug');

const report_user_background = document.getElementById('report_user_background');
const report_user_button = document.getElementById('report_user');
const close_report_user = document.getElementById('close_report_user');
const report_user_text = document.getElementById('report_user_text');
const send_report_user = document.getElementById('send_report_user');

const hats = ["./static/images/Blank-Avatar.png", "./static/images/Hats/Avatar_Hat1.png", "./static/images/Hats/Avatar_Hat2.png", "./static/images/Hats/Avatar_Hat3.png"];
const shirts = ["./static/images/Blank-Avatar.png", "./static/images/Shirts/Avatar_Shirt1.png", "./static/images/Shirts/Avatar_Shirt2.png", "./static/images/Shirts/Avatar_Shirt3.png"];
const shoes = ["./static/images/Blank-Avatar.png", "./static/images/Shoes/Avatar_Shoes1.png"];

const socket = io({
    withCredentials: true,
    transports: ['websocket', 'polling'] // Force websocket to keep the session stable
});
window.socket = socket;

// added
const backupUser = JSON.parse(sessionStorage.getItem('user_backup'));
if (backupUser) {
    // Manually tell the server "Hey, remember me?"
    // This helps the server re-fill the session['user'] if it got wiped
    socket.emit("verify_session", backupUser);
}

let current_user = JSON.parse(sessionStorage.getItem('user')) || null;

socket.on("auth", (user) => {
    current_user = user;
    sessionStorage.setItem('user', JSON.stringify(user));
});


let hat_idx = 0;
let shirt_idx = 0;
let shoe_idx = 0;

function check_unlock(item, path) {
    window.socket.emit("get_user");

    window.socket.once("return_user", (user_data) => {
        const owned_features = user_data.owned_feature_ids;
        const is_owned = owned_features.includes(path);
        const visibility = is_owned ? 'hidden' : 'visible';
        switch (item) {
            case 'hat':
                hat_unlock.style.visibility = visibility;
                break;
            case 'shirt':
                shirt_unlock.style.visibility = visibility;
                break;
            case 'shoes':
                shoes_unlock.style.visibility = visibility;
                break;
        }
    });
}

function change_item(item, direction) {
    const layer = document.getElementById(`layer-${item}`);
    let assetList = [];

    // Select the correct array
    switch (item) {
        case 'hat':
            assetList = hats;
            hat_idx = (hat_idx + direction + hats.length) % hats.length;
            if (hats.length > 0) layer.src = hats[hat_idx];
            check_unlock(item, hats[hat_idx]);
            break;
        case 'shirt':
            assetList = shirts;
            shirt_idx = (shirt_idx + direction + shirts.length) % shirts.length;
            if (shirts.length > 0) layer.src = shirts[shirt_idx];
            check_unlock(item, shirts[shirt_idx]);
            break;
        case 'shoes':
            assetList = shoes;
            shoe_idx = (shoe_idx + direction + shoes.length) % shoes.length;
            layer.src = shoes[shoe_idx];
            check_unlock(item, shoes[shoe_idx]);
            break;
    }
}

// On run

logout.addEventListener('click', () => {
    current_user = null;
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('user_backup');
    socket.emit('logout');
    window.location.href = "Signin.html";
})

window.addEventListener('resize', () => {
    window_height = window.innerHeight;
    window_width = window.innerWidth;
})

// Populate the UI with the user's current data
// 1. Load users into the dropdown when the page loads
document.addEventListener("DOMContentLoaded", () => {
    if (current_user) {
        window.socket.emit("get_user");

        window.socket.once("return_user", (user_data) => {
            console.log(user_data);
            if (user_data && user_data.admin) {
                ban_search.style.display = "inline";
                ban_user.style.display = "inline";
            }
        });

        // (Your existing profile display code here...)
        document.getElementById('username_display').innerText = current_user.displayName || "Unknown User";
        document.getElementById('email_display').innerText = current_user.email || "Unknown Email";
        document.getElementById('password_display').innerText = "********";

        // Request the list of all available users
        window.socket.emit("get_all_users");
        window.socket.emit("get_friends");


        document.getElementById("private").addEventListener("change", () => {
            const isPrivate = document.getElementById("private").checked;
            window.socket.emit("loc_status_update", !isPrivate);
        });
        window.socket.emit("get_privacy");

        change_item('hat', 0);
        change_item('shirt', 0);
        change_item('shoes', 0);

        window.socket.emit("get_toucoins");
    }
});

window.socket.on("privacy_got", (is_private) => {
    document.getElementById("private").checked = is_private;
});

window.socket.on("friends_got", (friends) => {
    // Clear the dropdown and set a default placeholder
    current_friends_search.innerHTML = '<option value="" disabled selected>Remove a friend...</option>';

    if (friends && friends.length > 0) {
        friends.forEach(f => {
            // Uses standard JavaScript Option constructor (Text, Value)
            const newFriend = new Option(f.username, f.id);
            current_friends_search.appendChild(newFriend);
        });
    } else {
        current_friends_search.innerHTML = '<option value="" disabled>No friends yet</option>';
    }
});

window.socket.on("all_users_got", (users) => {
    // Clear the dropdown and set a default placeholder
    friends_search.innerHTML = '<option value="" disabled selected>Add a new friend...</option>';

    if (users) {
        users.forEach(u => {
            add_users(u.username, u.id); // Uses your existing function
        });
    }
});

// 3. Handle the Checkmark (Add Friend) Button click
add_friends.addEventListener('click', () => {
    const recipient_id = friends_search.value;

    // Prevent sending if they haven't selected anyone
    if (!recipient_id) {
        alert("Please select a user to add.");
        return;
    }

    // Emit the request to your existing "send_friend_request" python route
    window.socket.emit("send_friend_request", recipient_id);

    // Listen for the confirmation
    window.socket.once("request_sent", (success) => {
        if (success) {
            alert("Friend request sent!");

            // Remove that user from the dropdown so you can't spam them with requests
            const optionToRemove = friends_search.querySelector(`option[value="${recipient_id}"]`);
            if (optionToRemove) optionToRemove.remove();

            // Reset dropdown to default
            friends_search.value = "";
        } else {
            alert("Failed to send friend request. Please try again.");
        }
    });
});

delete_friends.addEventListener('click', () => {
    const friend_id = current_friends_search.value;

    if (!friend_id) {
        alert("Please select a friend to remove.");
        return;
    }

    // Double check before deleting
    if(confirm("Are you sure you want to remove this friend?")) {
        // Tell the server to mutually remove the friendship
        window.socket.emit("remove_friend", friend_id);

        window.socket.once("removed_friend", () => {
            alert("Friend removed.");
            // Refresh BOTH dropdown lists to keep the UI perfectly synced!
            // (The removed friend should now reappear in the "Add Friend" list)
            window.socket.emit("get_friends");
            window.socket.emit("get_all_users");
        });
    }
});

ban_user.addEventListener('click', () => {
    window.socket.emit("ban_user", ban_search.value);
    window.socket.once("ban_response", (success) => {
        console.log(success);
        if (success === "Success") {
            alert("The user has banned for one week, SO SAYS THE BAN HAMMER!!!");
        }
        else {
            alert("There has been an error");
        }
    });
});

password_change.addEventListener('click', () => {
    // Check if the user object exists
    if (current_user && current_user.email) {
        // Send the request to the server
        window.socket.emit("reset_password", current_user.email);

        // Listen for the response
        window.socket.once("password_reset_sent", (success) => {
            if (success) {
                alert(`A password reset link has been sent to ${current_user.email}`);
            } else {
                alert("Failed to send reset email. Please try again later.");
            }
        });
    } else {
        alert("Error: User email not found.");
    }
});

username_change.addEventListener('click', () => {
    user_div_background.style.display = "block";
})

report_bug_button.addEventListener('click', () => {
    report_bug_background.style.display = "block";
})

report_user_button.addEventListener('click', () => {
    report_user_background.style.display = "block";
})

close_report_bug.addEventListener('click', () => {
    report_bug_background.style.display = "none";
    report_bug_text.value = null;
})

close_report_user.addEventListener('click', () => {
    report_user_background.style.display = "none";
    report_user_text.value = null;
})

send_report_bug.addEventListener('click', () => {

    window.socket.emit("report_issue", report_bug_text.value);
    window.socket.once("issue_reported", (success) => {
        if (success) {
            alert("Thank you for your feedback! The issue has been reported.");
        } else {
            alert("Failed to submit your report. Please try again later.");
        }
    });

    report_bug_background.style.display = "none";
    report_bug_text.value = null;
})

send_report_user.addEventListener('click', () => {

    const reportedUsername = report_user_username.value.trim();
    if (reportedUsername === "") {
        alert("Please enter a username to report.");
        return;
    }

    window.socket.emit("report_user", reportedUsername, report_user_text.value);
    window.socket.once("user_reported", (result) => {
        if (result === "Success") {
            alert(`Thank you for your report. If the user "${reportedUsername}" is violating our guidelines, appropriate action will be taken.`);
        } else if (result === "Not Found") {
            alert(`The username "${reportedUsername}" was not found. Please check the spelling and try again.`);
        } else {
            alert("Failed to submit your report. Please try again later.");
        }
    });

    report_user_background.style.display = "none";
    report_user_text.value = null;
})

// Close the popup if the user clicks the dark background outside the input box
user_div_background.addEventListener('click', (e) => {
    if (e.target === user_div_background) {
        user_div_background.style.display = "none";
        document.getElementById('username_input').value = ""; // Reset input
    }
});

user_check.addEventListener('click', () => {
    const usernameInput = document.getElementById('username_input');
    const newUsername = usernameInput.value.trim();

    // Basic validation
    if (newUsername === "") {
        alert("Username cannot be empty.");
        return;
    }
    if (newUsername === current_user.displayName) {
        user_div_background.style.display = "none";
        return; // No change needed
    }

    // Send the request to the server
    window.socket.emit("update_username", newUsername);

    // Listen for the specific response
    window.socket.once("username_updated", (status) => {
        if (status.status === "Success") {
            // 1. Update the local variable
            current_user.displayName = newUsername;

            // 2. Persist to storage so it survives page navigation
            sessionStorage.setItem('user', JSON.stringify(current_user));
            sessionStorage.setItem('user_backup', JSON.stringify(current_user));

            // 3. Update the UI text
            document.getElementById('username_display').innerText = newUsername;

            // 4. Hide popup and clear input
            user_div_background.style.display = "none";
            usernameInput.value = "";

            alert("Username successfully updated!");
        }
        else if (status.status === "Username") {
            alert("That username is already taken. Please choose another one.");
        }
        else {
            alert("An error occurred while updating your username. Please try again.");
        }
    });
});

delete_account.addEventListener('click', () => {
    // 1. Add a strict confirmation prompt
    const confirmDelete = confirm("Are you absolutely sure you want to delete your account? This action cannot be undone and you will lose all your data.");

    if (confirmDelete) {
        // Optional: Disable the button to prevent multiple clicks
        delete_account.disabled = true;
        delete_account.innerText = "Deleting...";

        // 2. Emit the existing 'delete' event to your server
        window.socket.emit("delete");

        // 3. Listen for success or failure from the server
        window.socket.once("deleted", () => {
            alert("Your account has been successfully deleted.");
            window.location.href = "Signin.html";
        });

        window.socket.once("deleteError", () => {
            alert("Failed to delete your account. Please try again.");
            delete_account.disabled = false;
            delete_account.innerText = "Delete Account";
        });
    }
});

/* Adds friends to the list */
function add_friend(name) {
    const friend_template = document.getElementById("friends_template");
    let new_friend = friend_template.content.cloneNode(true);

    new_friend.querySelector('label').append(name);
    friends_bar.appendChild(new_friend);
}

/* Adds users to the friends dropdown */
function add_users(username, id) {
    const newUser = new Option(username, id);
    friends_search.appendChild(newUser);
}


window.socket.on("toucoins_result", (data) => {
    if (data.status === "success") {
        const toucoins = data.toucoins;
        document.getElementById("toucoin_amount").innerText = "Toucoins: " + toucoins;
    }
});

const hat_unlock = document.getElementById("hat_unlock");
const shirt_unlock = document.getElementById("shirt_unlock");
const shoes_unlock = document.getElementById("shoes_unlock");

hat_unlock.addEventListener("click", () => {
    if( confirm("Would you like to unlock this hat?") ) {
        const path_to_unlock = hats[hat_idx];
        window.socket.emit("add_feature_items", path_to_unlock);
        window.socket.once("feature purchase", (status) => {
            check_unlock('hat', hats[hat_idx]);
            alert(status);
            window.socket.emit("get_toucoins");
        })
    }
})

shirt_unlock.addEventListener("click", () => {
    if( confirm("Would you like to unlock this shirt?") ) {
        const path_to_unlock = shirts[shirt_idx];
        window.socket.emit("add_feature_items", path_to_unlock);
        window.socket.once("feature purchase", (status) => {
            check_unlock('shirt', shirts[shirt_idx]);
            alert(status);
            window.socket.emit("get_toucoins");
        })
    }
})

shoes_unlock.addEventListener("click", () => {
    if( confirm("Would you like to unlock these shoes?") ) {
        const path_to_unlock = shoes[shoe_idx];
        window.socket.emit("add_feature_items", path_to_unlock);
        window.socket.once("feature purchase", (status) => {
            check_unlock('shoes', shoes[shoe_idx]);
            alert(status);
            window.socket.emit("get_toucoins");
        })
    }
})

window.socket.on("user error", () => {
    alert("Error getting user data from session storage")
})

