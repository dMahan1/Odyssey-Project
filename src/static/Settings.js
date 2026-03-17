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


// friends_bar.style.height = window_height / 2 + "px";

// On run
logout.addEventListener('click', () => {
    window.location.href = "Signin.html";
})

window.addEventListener('click', () => {
    window_height = window.innerHeight;
    window_width = window.innerWidth;
    // friends_bar.style.height = window_height / 2 + "px";
})

// Populate the UI with the user's current data
// 1. Load users into the dropdown when the page loads
document.addEventListener("DOMContentLoaded", () => {
    if (user_profile) {
        // (Your existing profile display code here...)
        document.getElementById('username_display').innerText = user_profile.username || "Unknown User";
        document.getElementById('email_display').innerText = user_profile.email || "Unknown Email";
        document.getElementById('password_display').innerText = "********"; 
        
        // Request the list of all available users
        window.socket.emit("get_all_users", user_profile);
        window.socket.emit("get_friends", user_profile);
    }
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
    friends_search.innerHTML = '<option value="" disabled selected>Select a user...</option>';
    
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
    window.socket.emit("send_friend_request", user_profile, recipient_id);
    
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
        window.socket.emit("remove_friend", user_profile, friend_id);
        
        window.socket.once("removed_friend", () => {
            alert("Friend removed.");
            
            // Refresh BOTH dropdown lists to keep the UI perfectly synced!
            // (The removed friend should now reappear in the "Add Friend" list)
            window.socket.emit("get_friends", user_profile);
            window.socket.emit("get_all_users", user_profile);
        });
    }
});

password_change.addEventListener('click', () => {
    // Check if the user object exists
    if (user_profile && user_profile.email) {
        // Send the request to the server
        window.socket.emit("reset_password", user_profile.email);
        
        // Listen for the response
        window.socket.once("password_reset_sent", (success) => {
            if (success) {
                alert(`A password reset link has been sent to ${user_profile.email}`);
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
    if (newUsername === user_profile.username) {
        user_div_background.style.display = "none";
        return; // No change needed
    }

    // Send the request to the server
    window.socket.emit("update_username", user_profile, newUsername);
    
    // Listen for the specific response
    window.socket.once("username_updated", (status) => {
        if (status === "Success") {
            // 1. Update the local variable
            user_profile.username = newUsername; 
            
            // 2. Update the UI text
            document.getElementById('username_display').innerText = newUsername; 
            
            // 3. Hide popup and clear input
            user_div_background.style.display = "none";
            usernameInput.value = ""; 
            
            alert("Username successfully updated!");
        } 
        else if (status === "Username") {
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
        window.socket.emit("delete", user_profile);
        
        // 3. Listen for the 'deleted' confirmation from main.py
        window.socket.once("deleted", () => {
            alert("Your account has been successfully deleted.");
            
            // 4. Redirect the user back to the sign-in/sign-up page
            window.location.href = "Signin.html"; 
        });
    }
});

delete_friends.addEventListener('click', () => {
    /* delete friend from the list */
})

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