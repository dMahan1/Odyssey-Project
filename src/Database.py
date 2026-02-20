import firebase_admin
from firebase_admin import credentials
from firebase_admin import auth
from firebase_admin import firestore
from pathlib import Path
import os

# Get the user's home directory path
home_dir = Path.home()

# Server Requires firebase key downloaded and stored seperately
# Not included in code but shared with server computer manually
# Change path for change in server, currently accesses OdysseyFirebase folder in a user's home directory.
home_dir = Path.home()
path = home_dir/"OdysseyFirebase"

cred = credentials.Certificate(path/"odyssey-cd6c7-firebase-adminsdk-fbsvc-33704d2399.json")
defaultApp = firebase_admin.initialize_app(cred)

print(defaultApp.name)
