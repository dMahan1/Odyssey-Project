import os
from datetime import datetime, timezone

import empyrebase
from dotenv import load_dotenv

# Get the user's home directory path
# home_dir = Path.home()

# Server Requires firebase key downloaded and stored seperately
# Not included in code but shared with server computer manually
# Change path for change in server, currently accesses OdysseyFirebase folder in a user's home directory.
# home_dir = Path.home()
# path = home_dir/"OdysseyCodes"
load_dotenv()
config = {
    "apiKey": os.getenv("API_KEY"),
    "authDomain": os.getenv("AUTH_DOMAIN"),
    "projectId": os.getenv("PROJECT_ID"),
    "databaseURL": os.getenv("DATABASE_URL"),
    "storageBucket": os.getenv("STORAGE_BUCKET"),
    # "serviceAccount": path/"odyssey-cd6c7-firebase-adminsdk-fbsvc-33704d2399.json"
}

firebase = empyrebase.initialize_app(config)
auth = firebase.auth()


def auth_user(email, password, latitude, longitude):
    print(f"Authenticating user with email: {email} and password: {password}")
    print(f"Received location: Latitude {latitude}, Longitude {longitude}")

    # Log the user in
    try:
        user = auth.sign_in_with_email_and_password(email, password)
    except Exception as e:
        err = str(e)
        if "INVALID_EMAIL" in err:
            return {"status": "Invalid"}
        elif "INVALID_LOGIN_CREDENTIALS" in err:
            return {"status": "Bad_Pass"}
        else:
            return {"status": "Error"}
          
    else:
        # Verify the user has data in the database
        user_data = get_user_data(user)
        if user_data is None:
            return {"status": "NoAccount"}
        # Update the user's location
        update_user_location(user, latitude, longitude)
        if user_data.get("banned_until") is not None:
            banned_until = datetime.fromisoformat(user_data["banned_until"])
            if datetime.now(timezone.utc) < banned_until:
                return {"status": "Banned", "banned_until": user_data["banned_until"]}
            else:
                db = firebase.database()
                db.child("Users").child(user["localId"]).update(
                    {"banned_until": None}, token=user["idToken"]
                )
        user["status"] = "Success"
        return user
    
def ban_user(user, banned_until):
    db = firebase.database()
    db.child("Users").child(user["localId"]).set({"banned_until": banned_until}, token=user["idToken"])


def get_user_data(user):
    # Get a reference to the database service
    db = firebase.database()

    # Get a reference to the user's data
    user_data = (
        db.child("Users").child(user["localId"]).get(token=user["idToken"]).val()
    )

    print(user_data)
    return user_data


def create_user(email, username, password, latitude, longitude):

    # Create a new user
    try:
        user = auth.create_user_with_email_and_password(email, password)
    except Exception as e:
        err = str(e)
        if "WEAK_PASSWORD" in err:
            return {"status": "Weak"}
        elif "EMAIL_EXISTS" in err:
            return {"status": "Exist"}
        elif "INVALID_EMAIL" in err:
            return {"status": "Invalid"}
        else:
            print(err)
            return {"status": "Error"}

    else:
        db = firebase.database()

        duplicate_username = (
            db.child("Users")
            .order_by_child("username")
            .equal_to(username)
            .get(token=user["idToken"])
            .val()
        )
        print("duplicate_username", duplicate_username)
        if duplicate_username:
            auth.delete_user_account(user["idToken"])
            return {"status": "Username"}

        data = {
            "email": email,
            "username": username,
            "attended_event_ids": [],
            "friend_ids": [],
            "owned_feature_ids": [],
            "dropped_pins": [],
            "curr_location": {"latitude": latitude, "longitude": longitude},
            "location_public": True,
            "icon_image_path": "../images/Person_icon.png",
            "toucoins": 0,
            "new_messages": [],
        }

        db.child("Users").child(user["localId"]).set(data, token=user["idToken"])
        auth.update_profile(user["idToken"], display_name=username)
        user["displayName"] = username
        user["status"] = "Success"
        return user


def send_password_reset_email(email):
    auth.send_password_reset_email(email)


def store_report(user, subject_id):
    db = firebase.database()
    data = {
        "reporter": user["localId"],
        "subject": subject_id,
        "date_time": datetime.now(timezone.utc).isoformat()
    }
    db.child("Reports").push(data, token=user["idToken"])


def update_username(user, new_username):
    db = firebase.database()
    duplicate_username = (
        db.child("Users")
        .order_by_child("username")
        .equal_to(new_username)
        .get(token=user["idToken"])
        .val()
    )
    print("duplicate_username", duplicate_username)
    if duplicate_username:
        return "Username"

    try:
        db.child("Users").child(user["localId"]).update(
            {"username": new_username}, token=user["idToken"]
        )
        auth.update_profile(
            user["idToken"], display_name=new_username
        )  # added as of Dylan
        user["displayName"] = new_username
    except Exception as e:
        print(f"Error updating username: {e}")
        return "Error"
    return "Success"


def update_user_location(user, latitude, longitude):
    db = firebase.database()
    db.child("Users").child(user["localId"]).update(
        {"curr_location": {"latitude": latitude, "longitude": longitude}},
        token=user["idToken"],
    )


def update_user_location_public(user, status):
    db = firebase.database()
    db.child("Users").child(user["localId"]).update(
        {"location_public": status}, token=user["idToken"]
    )


def update_user_icon_image_path(user, path):
    db = firebase.database()
    db.child("Users").child(user["localId"]).update(
        {"icon_image_path": path}, token=user["idToken"]
    )


def update_user_toucoins(user, amount):
    db = firebase.database()
    db.child("Users").child(user["localId"]).update(
        {"toucoins": amount}, token=user["idToken"]
    )


def delete_user(user):

    # Delete the user's data
    db = firebase.database()
    friends = db.child("Users").child(user["localId"]).child("friend_ids").get(token=user["idToken"]).val()
    if friends:
        for friend_id in friends:
            remove_friend(user, friend_id)
    db.child("Users").child(user["localId"]).remove(token=user["idToken"])

    # Delete the user
    try:
        auth.delete_user_account(user["idToken"])
        return "Success"
    except Exception as e:
        return e


def get_all_users(user):
    db = firebase.database()
    # Fetch all users from the database
    all_users = db.child("Users").get(token=user["idToken"]).val()

    users_list = []

    if all_users:
        # Safely get the current user's data
        my_data = all_users.get(user["localId"], {})
        my_friends = []

        # Verify my_data is a dictionary before calling .get()
        if isinstance(my_data, dict):
            my_friends = my_data.get("friend_ids") or []

        for uid, data in all_users.items():
            # Exclude self and exclude existing friends
            if uid != user["localId"] and uid not in my_friends:
                # Verify the database entry is a dictionary before extracting data
                print(f"Data: {data}")
                if isinstance(data, dict):
                    users_list.append(
                        {
                            "id": uid,
                            "username": data.get("username", "Unknown User"),  # test
                        }
                    )
                else:
                    # Optional: Log the anomaly so you can clean up your database later
                    print(
                        f"Skipping invalid user data for UID {uid}. Expected dict, got string."
                    )

    return users_list


def drop_pin(user, latitude, longitude):
    db = firebase.database()
    dropped_pins = (
        db.child("Users")
        .child(user["localId"])
        .get(token=user["idToken"])
        .val()
        .get("dropped_pins")
    )
    pin_name = f"Pin: {latitude}, {longitude}"
    key = firebase.database().generate_key()
    db.child("Locations").child(key).set(
        {
            "name": pin_name,
            "coordinates": {"latitude": latitude, "longitude": longitude},
            "permanent": False,
            "usedInEvent": False,
        },
        token=user["idToken"],
    )
    if dropped_pins is None:
        dropped_pins = []
    dropped_pins.append(key)
    db.child("Users").child(user["localId"]).update(
        {"dropped_pins": dropped_pins}, token=user["idToken"]
    )
    return key


def pull_pin(user, key):
    db = firebase.database()
    if (
        db.child("Locations")
        .child(key)
        .child("usedInEvent")
        .get(token=user["idToken"])
        .val()
        is False
    ):
        db.child("Locations").child(key).remove(token=user["idToken"])
        # Remove the pin from the user's dropped_pins
        dropped_pins = (
            db.child("Users")
            .child(user["localId"])
            .get(token=user["idToken"])
            .val()
            .get("dropped_pins")
        )
        if key in dropped_pins:
            dropped_pins.remove(key)
            db.child("Users").child(user["localId"]).update(
                {"dropped_pins": dropped_pins}, token=user["idToken"]
            )
    else:
        return "Error: Pin is currently being used in an event and cannot be pulled."


def get_permanent_locations(user):
    db = firebase.database()
    # Fetch all locations from the database
    all_locations = db.child("Locations").get(token=user["idToken"]).val()

    perm_locations = []

    if all_locations:
        for loc_id, loc_data in all_locations.items():
            # Check if the location is marked as permanent
            try:
                if loc_data.get("permanent"):
                    perm_locations.append({"id": loc_id, "name": loc_data.get("name")})
            except Exception as e:
                print(f"Error processing location {loc_id}: {e}")
                continue

    return perm_locations


def get_locations_from_name(user, loc_name):
    all_locations = get_permanent_locations(user)
    matches = [loc for loc in all_locations if loc_name.lower() in loc["name"].lower()]
    return matches


def create_event(user, name, start_time, end_time, locationid, attendee_ids):

    db = firebase.database()

    loc_data = get_location_data(user, locationid)
    location_name = loc_data.get("name") if loc_data else "Unknown"
    creator_username = (
        db.child("Users")
        .child(user["localId"])
        .child("username")
        .get(token=user["idToken"])
        .val()
    )

    data = {
        "creator_id": user["localId"],
        "creator_username": creator_username or "Unknown",
        "name": name,
        "start_time": start_time,
        "end_time": end_time,
        "locationid": locationid,
        "location_name": location_name,
        "attendee_ids": attendee_ids,
    }
    key = firebase.database().generate_key()
    db.child("Events").child(key).set(data, token=user["idToken"])

    db.child("Locations").child(locationid).update(
        {"usedInEvent": True}, token=user["idToken"]
    )

    events = (
        db.child("Users")
        .child(user["localId"])
        .child("attended_event_ids")
        .get(token=user["idToken"])
        .val()
    )
    if events is None:
        events = []
    events.append(key)

    db.child("Users").child(user["localId"]).update(
        {"attended_event_ids": events}, token=user["idToken"]
    )

    for attendee_id in attendee_ids:
        if attendee_id != user["localId"]:
            send_event_invite(user, attendee_id, key)
    return key


def send_event_invite(user, recipient_id, event_id):
    db = firebase.database()
    event = db.child("Events").child(event_id).get(token=user["idToken"]).val()
    if event is None:
        return None

    message = (
        f"You're invited to {event['name']} by {user.get('username', 'a friend')}!"
    )
    # Pass just the user object and the explicit event_id
    send_message(user, recipient_id, message, 1, event_id=event_id)
    return True


def join_event(user, event_id):
    db = firebase.database()
    event = db.child("Events").child(event_id).get(token=user["idToken"]).val()
    if event is None:
        return None

    attendee_ids = event.get("attendee_ids", [])
    if user["localId"] not in attendee_ids:
        attendee_ids.append(user["localId"])
        db.child("Events").child(event_id).update(
            {"attendee_ids": attendee_ids}, token=user["idToken"]
        )

    events = (
        db.child("Users")
        .child(user["localId"])
        .child("attended_event_ids")
        .get(token=user["idToken"])
        .val()
    )
    if events is None:
        events = []
    if event_id not in events:
        events.append(event_id)
        db.child("Users").child(user["localId"]).update(
            {"attended_event_ids": events}, token=user["idToken"]
        )
    return True


def delete_event(user, event_id):
    db = firebase.database()
    event = db.child("Events").child(event_id).get(token=user["idToken"]).val()
    if event["creator_id"] != user["localId"]:
        return None

    # Remove the event from all attendees' attended_event_ids
    attendee_ids = event.get("attendee_ids", [])
    for attendee_id in attendee_ids:
        events = (
            db.child("Users")
            .child(attendee_id)
            .child("attended_event_ids")
            .get(token=user["idToken"])
            .val()
        )
        if events and event_id in events:
            events.remove(event_id)
        db.child("Users").child(attendee_id).update(
            {"attended_event_ids": events}, token=user["idToken"]
        )

    # Delete the event document
    db.child("Events").child(event_id).remove(token=user["idToken"])
    return True


def send_message(user, recipient_id, message, message_type, event_id=None):
    db = firebase.database()
    sender_id = user["localId"]

    # Get sender username correctly
    sender_username = (
        db.child("Users")
        .child(sender_id)
        .child("username")
        .get(token=user["idToken"])
        .val()
    )

    message_data = {
        "sender_id": sender_id,
        "sender_username": sender_username,
        "message": message,
        "type": message_type,
        "event_id": event_id,  # Added so frontend knows which event to join
        "event_name": db.child("Events").child(event_id).child("name").get(token=user["idToken"]).val() if event_id else None,  # Optional: Include event name for better UX
    }
    db.child("Users").child(recipient_id).child("messages").push(
        message_data, token=user["idToken"]
    )

def send_message_to_attendees(user, event_id, message):
    db = firebase.database()
    event = db.child("Events").child(event_id).get(token=user["idToken"]).val()
    if event is None:
        return "Event not found"
    
    if event["creator_id"] != user["localId"]:
        return "Only the event creator can send messages to attendees."

    attendee_ids = event.get("attendee_ids", [])
    for attendee_id in attendee_ids:
        if attendee_id != user["localId"]:
            send_message(user, attendee_id, message, 2, event_id=event_id)
    return "Messages sent to attendees."

def remove_message(user, message_id):
    db = firebase.database()
    db.child("Users").child(user["localId"]).child("messages").child(message_id).remove(
        token=user["idToken"]
    )

def add_friend(user, friend_id):
    if friend_id == user["localId"]:
        return None

    db = firebase.database()

    # 1. Add friend to current user's list
    my_friends = (
        db.child("Users")
        .child(user["localId"])
        .child("friend_ids")
        .get(token=user["idToken"])
        .val()
    )
    if my_friends is None:
        my_friends = []
    if friend_id not in my_friends:
        my_friends.append(friend_id)
        db.child("Users").child(user["localId"]).update(
            {"friend_ids": my_friends}, token=user["idToken"]
        )

    # 2. Add current user to the friend's list (Mutual)
    their_friends = (
        db.child("Users")
        .child(friend_id)
        .child("friend_ids")
        .get(token=user["idToken"])
        .val()
    )
    if their_friends is None:
        their_friends = []
    if user["localId"] not in their_friends:
        their_friends.append(user["localId"])
        db.child("Users").child(friend_id).update(
            {"friend_ids": their_friends}, token=user["idToken"]
        )

    return True


def remove_friend(user, friend_id):
    db = firebase.database()

    # 1. Remove friend from current user's list
    my_friends = (
        db.child("Users")
        .child(user["localId"])
        .child("friend_ids")
        .get(token=user["idToken"])
        .val()
    )
    if my_friends and friend_id in my_friends:
        my_friends.remove(friend_id)
        db.child("Users").child(user["localId"]).update(
            {"friend_ids": my_friends}, token=user["idToken"]
        )

    # 2. Remove current user from the friend's list (Mutual)
    their_friends = (
        db.child("Users")
        .child(friend_id)
        .child("friend_ids")
        .get(token=user["idToken"])
        .val()
    )
    if their_friends and user["localId"] in their_friends:
        their_friends.remove(user["localId"])
        db.child("Users").child(friend_id).update(
            {"friend_ids": their_friends}, token=user["idToken"]
        )


def send_friend_request(user, recipient_id):
    sender_id = user["localId"]
    if sender_id == recipient_id:
        return None
    sender_username = (
        firebase.database()
        .child("Users")
        .child(sender_id)
        .child("username")
        .get(token=user["idToken"])
        .val()
    )
    message = f"{sender_username} has sent you a friend request!"
    send_message(user, recipient_id, message, 0)
    return True


def get_friends(user):
    db = firebase.database()
    try:
        friend_ids = (
            db.child("Users")
            .child(user["localId"])
            .child("friend_ids")
            .get(token=user["idToken"])
            .val()
        )
    except Exception as e:
        print(f"Exceptioned: {e}")
        friend_ids = []
    friends = []
    if friend_ids:
        for friend_id in friend_ids:
            friend_data = (
                db.child("Users").child(friend_id).get(token=user["idToken"]).val()
            )
            if friend_data:
                print(f"Friend: {friend_data}")
                friends.append(
                    {
                        "id": friend_id,
                        "username": friend_data.get("username"),
                        "icon_image_path": friend_data.get("icon_image_path"),
                    }
                )
                print(f"friends = {friends}")
    return friends


def get_event_data(user, event_id):
    db = firebase.database()
    event_data = db.child("Events").child(event_id).get(token=user["idToken"]).val()
    location_data = get_location_data(user, event_data.get("locationid"))
    event_data["location_name"] = location_data.get("name")
    return event_data


def get_user_name(user, id):
    db = firebase.database()
    return (
        db.child("Users").child(id).child("username").get(token=user["idToken"]).val()
    )


def get_location_data(user, location_id):
    db = firebase.database()
    location_data = (
        db.child("Locations").child(location_id).get(token=user["idToken"]).val()
    )
    return location_data


def get_user_data_by_id(user):
    db = firebase.database()
    user_data = (
        db.child("Users").child(user["localId"]).get(token=user["idToken"]).val()
    )
    if user_data.get("messages"):
        for message_id, message in user_data["messages"].items():
            if message["type"] == 0:
                event = (
                    db.child("Events")
                    .child(message["sender"][0])
                    .get(token=user["idToken"])
                    .val()
                )
                if event is None:
                    remove_message(user["localId"], message_id)
                    continue
            else:
                sender_data = (
                    db.child("Users")
                    .child(message["sender"])
                    .get(token=user["idToken"])
                    .val()
                )
                if sender_data is None:
                    remove_message(user["localId"], message_id)
                    continue
    return user_data


def get_user_events(user):
    db = firebase.database()
    event_ids = (
        db.child("Users")
        .child(user["localId"])
        .child("attended_event_ids")
        .get(token=user["idToken"])
        .val()
    )
    events = []
    if event_ids:
        for event_id in event_ids:
            event_data = (
                db.child("Events").child(event_id).get(token=user["idToken"]).val()
            )
            if event_data:
                events.append(
                    {
                        "id": event_id,
                        "name": event_data.get("name"),
                        "creator_username": event_data.get(
                            "creator_username"
                        ),  # <-- ALSO ADD THIS for the GUI
                        "start_time": event_data.get("start_time"),
                        "end_time": event_data.get("end_time"),
                        "locationid": event_data.get("locationid"),
                        "location_name": event_data.get(
                            "location_name"
                        ),  # <-- ADD THIS LINE
                        "attendee_ids": event_data.get("attendee_ids"),
                    }
                )
    return events


def test():
    firebase = empyrebase.initialize_app(config)
    auth = firebase.auth()

    user = create_user(
        "dylan.mahan@gmail.com", "Dylan AutoTest", "Test123", 40.42728, -86.91406
    )
    print(user)
    print(get_user_data(user))

    user = auth_user("dylan.mahan@gmail.com", "Test123", 40.42728, -86.91406)
    print(get_user_data(user))

    key = drop_pin(user, 40.42728, -86.91406)
    print(f"Dropped pin with key: {key}")

    event = create_event(
        user,
        "Test Event",
        "2024-01-01T12:00:00Z",
        "2024-01-01T14:00:00Z",
        key,
        [user["localId"]],
    )
    print(f"Created Event: {get_user_data(user)}")

    store_report(user, "default_user")

    try:
        pull_pin(user, key)
        print("Error: Pin pull should have failed since it's being used in an event.")
    except Exception as e:
        print(f"Error occurred while pulling pin: {e}")

    delete_event(user, event)

    pull_pin(user, key)
    print(f"Pin pulled successfully. Current user data: {get_user_data(user)}")

    delete_user(user)
    try:
        user = auth.refresh(user["refreshToken"])
    except Exception:
        pass
    try:
        get_user_data(user)
        print("Error: User data retrieval should have failed after deletion.")
    except Exception:
        print("User deleted successfully, data retrieval failed as expected.")


