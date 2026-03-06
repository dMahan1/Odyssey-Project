import os
from dotenv import load_dotenv
from pathlib import Path
import empyrebase

# Get the user's home directory path
#home_dir = Path.home()

# Server Requires firebase key downloaded and stored seperately
# Not included in code but shared with server computer manually
# Change path for change in server, currently accesses OdysseyFirebase folder in a user's home directory.
#home_dir = Path.home()
#path = home_dir/"OdysseyFirebase"
load_dotenv()
config = {
  "apiKey": os.getenv("API_KEY"),
  "authDomain": os.getenv("AUTH_DOMAIN"),
  "projectId": os.getenv("PROJECT_ID"),
  "databaseURL": os.getenv("DATABASE_URL"),
  "storageBucket": os.getenv("STORAGE_BUCKET")
  #"serviceAccount": path/"odyssey-cd6c7-firebase-adminsdk-fbsvc-33704d2399.json"
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
            return "Invalid"
        else:
            return "Error"
        
    else: 
        # Update the user's location
        update_user_location(user, latitude, longitude)

        return user

def get_user_data(user):
    # Get a reference to the database service
    db = firebase.database()

    # Get a reference to the user's data
    user_data = db.child("Users").child(user['localId']).get(token=user['idToken']).val()

    return user_data

def create_user(email, username, password, latitude, longitude):

    # Create a new user
    try:
        user = auth.create_user_with_email_and_password(email, password)
    except Exception as e:
        err = str(e)
        if "WEAK_PASSWORD" in err:
            return "Weak"
        elif "EMAIL_EXISTS" in err:
            return "Exist"
        elif "INVALID_EMAIL" in err:
            return "Invalid"
        else:
            return "Error"
        
    else: 
        db = firebase.database()

        duplicate_username = db.child("Users").order_by_child("username").equal_to(username).get(token=user['idToken']).val()
        print("duplicate_username", duplicate_username)
        if duplicate_username:
            auth.delete_user_account(user['idToken'])
            return "Username"

        data = {
            "email": email,
            "username": username,
            "attended_event_ids": [],
            "friend_ids": [],
            "owned_feature_ids": [],
            "dropped_pins": [],
            "curr_location": {
                "latitude": latitude,
                "longitude": longitude
            },
            "location_public": True,
            "icon_image_path": "../images/Person_icon.png",
            "toucoins": 0,
            "new_messages": []
        }

        db.child("Users").child(user['localId']).set(data, token=user['idToken'])

        return user
def send_password_reset_email(email):
    auth.send_password_reset_email(email)

def update_user_location(user, latitude, longitude):
    db = firebase.database()
    db.child("Users").child(user['localId']).update({
        "curr_location": {
            "latitude": latitude,
            "longitude": longitude
        }
    }, token=user['idToken'])

def update_user_location_public(user, status):
    db = firebase.database()
    db.child("Users").child(user['localId']).update({
        "location_public": status
    }, token=user['idToken'])

def update_user_icon_image_path(user, path):
    db = firebase.database()
    db.child("Users").child(user['localId']).update({
        "icon_image_path": path
    }, token=user['idToken'])

def update_user_toucoins(user, amount):
    db = firebase.database()
    db.child("Users").child(user['localId']).update({
        "toucoins": amount
    }, token=user['idToken'])

def delete_user(user):

    # Delete the user's data
    db = firebase.database()
    db.child("Users").child(user['localId']).remove(token=user['idToken'])

    # Delete the user
    auth.delete_user_account(user['idToken'])

def drop_pin(user, latitude, longitude):
    db = firebase.database()
    dropped_pins = db.child("Users").child(user['localId']).get(token=user['idToken']).val().get("dropped_pins")
    pin_name = f"Pin: {latitude}, {longitude}"
    key = firebase.database().generate_key()
    db.child("Locations").child(key).set({
        "name": pin_name,
        "coordinates": {
            "latitude": latitude,
            "longitude": longitude
        },
        "permanent": False,
        "usedInEvent": False
    }, token=user['idToken'])
    if dropped_pins is None:
        dropped_pins = []
    dropped_pins.append(key)
    db.child("Users").child(user['localId']).update({
        "dropped_pins": dropped_pins
    }, token=user['idToken'])
    return key

def pull_pin(user, key):
    db = firebase.database()
    if db.child("Locations").child(key).child("usedInEvent").get(token=user['idToken']).val() is False:
        db.child("Locations").child(key).remove(token=user['idToken'])
            # Remove the pin from the user's dropped_pins
        dropped_pins = db.child("Users").child(user['localId']).get(token=user['idToken']).val().get("dropped_pins")
        if key in dropped_pins:
            dropped_pins.remove(key)
            db.child("Users").child(user['localId']).update({
                "dropped_pins": dropped_pins
            }, token=user['idToken'])
    else:
        return "Error: Pin is currently being used in an event and cannot be pulled."

def create_event(user, name, start_time, end_time, locationid, attendee_ids):
    db = firebase.database()
    data = {
        "creator_id": user['localId'],
        "name": name,
        "start_time": start_time,
        "end_time": end_time,
        "locationid": locationid,
        "attendee_ids": attendee_ids
    }
    key = firebase.database().generate_key()
    db.child("Events").child(key).set(data, token=user['idToken'])

    db.child("Locations").child(locationid).update({
        "usedInEvent": True
    }, token=user['idToken'])

    events = db.child("Users").child(user['localId']).child("attended_event_ids").get(token=user['idToken']).val()
    if events is None:
        events = []
    events.append(key)

    db.child("Users").child(user['localId']).update({
        "attended_event_ids": events
    }, token=user['idToken'])

    return key

def send_event_invite(sender_id, recipient_id, event_id):
    db = firebase.database()
    event = db.child("Events").child(event_id).get(token=sender_id).val()
    if event is None:
        return None
    message = f"You're invited to {event['name']}!"
    send_message([event_id, event], recipient_id, message, 1)
    return True

def join_event(user, event_id):
    db = firebase.database()
    event = db.child("Events").child(event_id).get(token=user['idToken']).val()
    if event is None:
        return None
    attendee_ids = event.get("attendee_ids", [])
    if user['localId'] not in attendee_ids:
        attendee_ids.append(user['localId'])
        db.child("Events").child(event_id).update({
            "attendee_ids": attendee_ids
        }, token=user['idToken'])
        events = db.child("Users").child(user['localId']).child("attended_event_ids").get(token=user['idToken']).val()
        if events is None:
            events = []
        events.append(event_id)
        db.child("Users").child(user['localId']).update({
            "attended_event_ids": events
        }, token=user['idToken'])
    return True

def delete_event(user, event_id):
    db = firebase.database()
    event = db.child("Events").child(event_id).get(token=user['idToken']).val()
    if event["creator_id"] != user['localId']:
        return None
    
    # Remove the event from all attendees' attended_event_ids
    attendee_ids = event.get("attendee_ids", [])
    for attendee_id in attendee_ids:
        events = db.child("Users").child(attendee_id).child("attended_event_ids").get(token=user['idToken']).val()
        if events and event_id in events:
            events.remove(event_id)
        db.child("Users").child(attendee_id).update({
            "attended_event_ids": events
        }, token=user['idToken'])

    # Delete the event document
    db.child("Events").child(event_id).remove(token=user['idToken'])
    return True

def send_message(sender_id, recipient_id, message, message_type):
    db = firebase.database()
    if message_type == 0:
        sender_username = db.child("Users").child(sender_id).child("username").get().val()
    else:
        sender_username = db.child("Events").child(sender_id[0]).child("name").get().val()
    message_data = {
        "sender": sender_id,
        "sender_username": sender_username,
        "message": message,
        "type": message_type,
        "timestamp": empyrebase.ServerValue.TIMESTAMP
    }
    db.child("Users").child(recipient_id).child("messages").push(message_data)

def get_messages(user_id):
    db = firebase.database()
    messages = db.child("Users").child(user_id).child("messages").get().val()
    return messages

def remove_message(user_id, message_id):
    db = firebase.database()
    db.child("Users").child(user_id).child("messages").child(message_id).remove()

def add_friend(user, friend_id):
    if friend_id == user['localId']:
        return None
    db = firebase.database()
    friends = db.child("Users").child(user['localId']).child("friend_ids").get(token=user['idToken']).val()
    if friends is None:
        friends = []
    if friend_id not in friends:
        friends.append(friend_id)
        db.child("Users").child(user['localId']).update({
            "friend_ids": friends
        }, token=user['idToken'])
    return True

def remove_friend(user, friend_id):
    db = firebase.database()
    friends = db.child("Users").child(user['localId']).child("friend_ids").get(token=user['idToken']).val()
    if friends and friend_id in friends:
        friends.remove(friend_id)
        db.child("Users").child(user['localId']).update({
            "friend_ids": friends
        }, token=user['idToken'])

def send_friend_request(sender_id, recipient_id):
    if sender_id == recipient_id:
        return None
    sender_username = firebase.database().child("Users").child(sender_id).child("username").get().val()
    message = f"{sender_username} has sent you a friend request!"
    send_message(sender_id, recipient_id, message, 0)
    return True

def get_friends(user_id):
    db = firebase.database()
    friend_ids = db.child("Users").child(user_id).child("friend_ids").get().val()
    friends = []
    if friend_ids:
        for friend_id in friend_ids:
            friend_data = db.child("Users").child(friend_id).get().val()
            if friend_data:
                friends.append({
                    "id": friend_id,
                    "username": friend_data.get("username"),
                    "icon_image_path": friend_data.get("icon_image_path")
                })
    return friends

def get_event_data(event_id):
    db = firebase.database()
    event_data = db.child("Events").child(event_id).get().val()
    return event_data

def get_location_data(location_id):
    db = firebase.database()
    location_data = db.child("Locations").child(location_id).get().val()
    return location_data

def get_user_data_by_id(user_id):
    db = firebase.database()
    user_data = db.child("Users").child(user_id).get().val()
    return user_data

def test():
    firebase = empyrebase.initialize_app(config)
    auth = firebase.auth()

    user = create_user("dylan.mahan@gmail.com", "Dylan AutoTest", "Test123", 40.42728, -86.91406)
    print(get_user_data(user))

    user = auth_user("dylan.mahan@gmail.com", "Test123", 40.42728, -86.91406)
    print(get_user_data(user))

    key = drop_pin(user, 40.42728, -86.91406)
    print(f"Dropped pin with key: {key}")

    event = create_event(user, "Test Event", "2024-01-01T12:00:00Z", "2024-01-01T14:00:00Z", key, [user['localId']])
    print(f"Created Event: {get_user_data(user)}")

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
        user = auth.refresh(user['refreshToken'])
    except Exception:
        pass
    try:
        get_user_data(user)
        print("Error: User data retrieval should have failed after deletion.")
    except Exception as e:
        print("User deleted successfully, data retrieval failed as expected.")

#test()