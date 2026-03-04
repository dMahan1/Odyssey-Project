import os
from dotenv import load_dotenv
from pathlib import Path
import empyrebase
from empyrebase.types.geopoint import GeoPoint

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
        "coordinates": GeoPoint(latitude, longitude),
        "permanent": False,
        "usedInEvent": False
    }, token=user['idToken'])
    dropped_pins.append(key)
    db.child("Users").child(user['localId']).update({
        "dropped_pins": dropped_pins
    }, token=user['idToken'])
    return key

def pull_pin(user, key):
    db = firebase.database()
    if key in db.child("Locations").child(key).get(token=user['idToken']).val().get("usedInEvent", False):
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

    db.child("Users").child(user['localId']).update({
        "attended_event_ids": empyrebase.firestore.ArrayUnion([key])
    }, token=user['idToken'])

    return key

def delete_event(user, event_id):
    db = firebase.database()
    event = db.child("Events").child(event_id).get(token=user['idToken']).val()
    if event["creator_id"] != user['localId']:
        raise Exception("User is not the creator of the event and cannot delete it.")
    
    # Remove the event from all attendees' attended_event_ids
    attendee_ids = event.get("attendee_ids", [])
    for attendee_id in attendee_ids:
        db.child("Users").child(attendee_id).update({
            "attended_event_ids": empyrebase.firestore.ArrayRemove([event_id])
        }, token=user['idToken'])

    # Delete the event document
    db.child("Events").child(event_id).remove(token=user['idToken'])

def test():
    firebase = empyrebase.initialize_app(config)
    auth = firebase.auth()

    user = create_user("dylan.mahan@gmail.com", "Dylan AutoTest", "Test123", 40.42728, -86.91406)
    print(get_user_data(user))

    user = auth_user("dylan.mahan@gmail.com", "Test123", 40.42728, -86.91406)
    print(get_user_data(user))

    key = drop_pin(user, 40.42728, -86.91406)
    print(f"Dropped pin with key: {key}")

    pull_pin(user, key)

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

