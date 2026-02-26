
from pathlib import Path
import empyrebase
import firebase

# Get the user's home directory path
#home_dir = Path.home()

# Server Requires firebase key downloaded and stored seperately
# Not included in code but shared with server computer manually
# Change path for change in server, currently accesses OdysseyFirebase folder in a user's home directory.
#home_dir = Path.home()
#path = home_dir/"OdysseyFirebase"

config = {
  "apiKey": "AIzaSyC5HfU9FTWu9fLwFAJgE1BhTqlOazIAeOw",
  "authDomain": "odyssey-cd6c7.firebaseapp.com",
  "projectId": "odyssey-cd6c7",
  "databaseURL": "https://odyssey-cd6c7-default-rtdb.firebaseio.com/",
  "storageBucket": "odyssey-cd6c7.firebasestorage.app"
  #"serviceAccount": path/"odyssey-cd6c7-firebase-adminsdk-fbsvc-33704d2399.json"
}

firebase = empyrebase.initialize_app(config)
auth = firebase.auth()

def auth_user(email, password, latitude, longitude):

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

def test():
    firebase = empyrebase.initialize_app(config)
    auth = firebase.auth()

    user = create_user("dylan.mahan@gmail.com", "Dylan AutoTest", "Test123", 40.42728, -86.91406)
    print(get_user_data(user))

    user = auth_user("dylan.mahan@gmail.com", "Test123", 40.42728, -86.91406)
    print(get_user_data(user))

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

test()