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
    user = auth.sign_in_with_email_and_password(email, password)

    # Update the user's location
    update_user_location(user, latitude, longitude)

    return user

def get_user_data(user):
    # Get a reference to the database service
    db = firebase.firestore(auth_id=user['idToken'])

    # Get a reference to the user's data
    user_data = db.collection("Users").get_document(user['localId']).to_dict()

    return user_data

def create_user(email, username, password, latitude, longitude):

    # Create a new user
    user = auth.create_user_with_email_and_password(email, password)

    db = firebase.firestore(auth_id=user['idToken'])

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

    db.collection("Users").create_document(user['localId'], data)

    return user

def update_user_location(user, latitude, longitude):
    db = firebase.firestore(auth_id=user['idToken'])
    db.collection("Users").update_document(user['localId'], {
        "curr_location": {
            "latitude": latitude,
            "longitude": longitude
        }
    })

def update_user_location_public(user, status):
    db = firebase.firestore(auth_id=user['idToken'])
    db.collection("Users").update_document(user['localId'], {
        "location_public": status
    })

def update_user_icon_image_path(user, path):
    db = firebase.firestore(auth_id=user['idToken'])
    db.collection("Users").update_document(user['localId'], {
        "icon_image_path": path
    })

def update_user_toucoins(user, amount):
    db = firebase.firestore(auth_id=user['idToken'])
    db.collection("Users").update_document(user['localId'], {
        "toucoins": amount
    })

def delete_user(user):

    # Delete the user's data
    db = firebase.firestore(auth_id=user['idToken'])
    db.collection("Users").delete_document(user['localId'])

    # Delete the user
    auth.delete_user_account(user['idToken'])

def drop_pin(user, latitude, longitude):
    db = firebase.firestore(auth_id=user['idToken'])
    dropped_pins = db.collection("Users").get_document(user['localId']).to_dict().get("dropped_pins")
    pin_name = f"Pin: {latitude}, {longitude}"
    key = firebase.database().generate_key()
    db.collection("Locations").create_document(key, data={
        "name": pin_name,
        "coordinates": GeoPoint(latitude, longitude),
        "permanent": False,
        "usedInEvent": False
    })
    dropped_pins.append(key)
    db.collection("Users").update_document(user['localId'], {
        "dropped_pins": dropped_pins
    })
    return key

def pull_pin(user, key):
    db = firebase.firestore(auth_id=user['idToken'])
    if key in db.collection("Locations").get_document(key).to_dict().get("usedInEvent", False):
        db.collection("Locations").delete_document(key)
            # Remove the pin from the user's dropped_pins
        dropped_pins = db.collection("Users").get_document(user['localId']).to_dict().get("dropped_pins")
        if key in dropped_pins:
            dropped_pins.remove(key)
            db.collection("Users").update_document(user['localId'], {
                "dropped_pins": dropped_pins
            })
    else:
        return "Error: Pin is currently being used in an event and cannot be pulled."

def create_event(user, name, start_time, end_time, locationid, attendee_ids):
    db = firebase.firestore(auth_id=user['idToken'])
    data = {
        "creator_id": user['localId'],
        "name": name,
        "start_time": start_time,
        "end_time": end_time,
        "locationid": locationid,
        "attendee_ids": attendee_ids
    }
    key = firebase.database().generate_key()
    db.collection("Events").create_document(key, data=data)

    db.collection("Locations").update_document(locationid, {
        "usedInEvent": True
    })

    db.collection("Users").update_document(user['localId'], {
        "attended_event_ids": empyrebase.firestore.ArrayUnion([key])
    })

    return key

def delete_event(user, event_id):
    db = firebase.firestore(auth_id=user['idToken'])
    event = db.collection("Events").get_document(event_id).to_dict()
    if event["creator_id"] != user['localId']:
        raise Exception("User is not the creator of the event and cannot delete it.")
    
    # Remove the event from all attendees' attended_event_ids
    attendee_ids = event.get("attendee_ids", [])
    for attendee_id in attendee_ids:
        db.collection("Users").update_document(attendee_id, {
            "attended_event_ids": empyrebase.firestore.ArrayRemove([event_id])
        })

    # Delete the event document
    db.collection("Events").delete_document(event_id)

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

