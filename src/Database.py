
from pathlib import Path
import pyrebase

# Get the user's home directory path
home_dir = Path.home()

# Server Requires firebase key downloaded and stored seperately
# Not included in code but shared with server computer manually
# Change path for change in server, currently accesses OdysseyFirebase folder in a user's home directory.
home_dir = Path.home()
path = home_dir/"OdysseyFirebase"

config = {
  "apiKey": "AIzaSyC5HfU9FTWu9fLwFAJgE1BhTqlOazIAeOw",
  "authDomain": "odyssey-cd6c7.firebaseapp.com",
  "projectId": "odyssey-cd6c7",
  "databaseURL": "https://odyssey-cd6c7-default-rtdb.firebaseio.com/",
  "storageBucket": "odyssey-cd6c7.firebasestorage.app",
  "serviceAccount": path/"odyssey-cd6c7-firebase-adminsdk-fbsvc-33704d2399.json"
}

firebase = pyrebase.initialize_app(config)

def auth_user(email, password):
    # Get a reference to the auth service
    auth = firebase.auth()

    # Log the user in
    user = auth.sign_in_with_email_and_password(email, password)

    print (auth.get_account_info(user['idToken']))

    return user

