from dotenv import load_dotenv
from pathlib import Path
import empyrebase
import sys
import os

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
}

firebase = empyrebase.initialize_app(config)
auth = firebase.auth()
admin = auth.sign_in_with_email_and_password(os.getenv("ADMIN_EMAIL"), os.getenv("ADMIN_PASSWORD"))

def delete_test_users():
    # List of test user emails to delete
    test_user_emails = ["cypressTheGreat@test.cdy"]
    test_user_password = "password"
    for email in test_user_emails:
        try:
            db = firebase.database()
            db.child("users").child(uid).remove(token=admin['idToken'])  # Remove user data from the database

            # Sign in the test user to get their UID
            user = auth.sign_in_with_email_and_password(email, test_user_password)
            uid = user['localId']
            
            # Delete the user using the admin credentials
            auth.delete_user_account(admin['idToken'], uid)
            print(f"Deleted user: {email}")
        except Exception as e:
            print(f"Error deleting user {email}: {e}")

if __name__ == "__main__":

    delete_test_users()