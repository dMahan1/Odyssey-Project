import os
from Database import *
from dotenv import load_dotenv
import json
from flask import Flask, render_template, request, abort, jsonify, session
from jinja2 import TemplateNotFound
from flask_socketio import SocketIO, send, emit, join_room, leave_room

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY', 'fallback_if_env_fails')

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

app.config.update(
    SESSION_COOKIE_SECURE=False,   # Must be False for local http://
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax', # Essential for cross-page navigation
)

socketio = SocketIO(app, manage_session=True)

# added
@socketio.on("verify_session")
def verify_session(user_data):
    if user_data:
        session['user'] = user_data
        session.modified = True
        print(f"Session manually restored for: {user_data.get('username')}")

@socketio.on('connect')
def handle_connect():
    # print("Client connected!")
    user = session.get('user')
    if user:
        print(f"Connected: {user.get('username')} (Session Active)")
    else:
        print("Connected: Anonymous (Session Empty)")

users = {}

@app.route('/', defaults={'page': 'Signin.html'})
@app.route('/<path:page>')
def render_page(page):
    print(f"Rendering page: {page!r}")

    # Don't intercept static file requests
    if not page.endswith('.html'):
        abort(404)

    # Handle empty page or root access
    if not page:
        page = 'Signin.html'

    # Prevent directory traversal and absolute paths
    if '..' in page or page.startswith('/'):
        abort(400)
    try:
        current_user = session.get('user')
        return render_template(page, data=current_user)
    except TemplateNotFound:
        abort(404)

@socketio.on('login')
def login(email, password, longitude, latitude):
    user = auth_user(email, password, latitude, longitude)
    print(f"User: {user}")
    if not user.get("status") == "Success":
        emit("authfail", user)
    else:
        session['user'] = user
        sesh = session.get('user')
        session.permanent = True  # <--- FORCE IT TO PERSIST
        session.modified = True
        print(f"Error sending password reset: {sesh}")
        emit("auth", user)

@socketio.on('signup')
def signup(email, password, username, latitude, longitude):
    user = create_user(email, username, password, latitude, longitude)
    if not isinstance(user, dict):
        emit("auth", None)
    else:
        session['user'] = user
        session.permanent = True  # <--- FORCE IT TO PERSIST
        session.modified = True
        emit("auth", user)

@socketio.on('logout')
def logout():
    session.pop('user', None)
    session.modified = True
    emit("logged_out")

@socketio.on('delete')
def delete():
    user = session.get('user')
    status = delete_user(user)
    if (status == "Success"):
        emit("deleted")
    else:
        emit("deleteError")

@socketio.on('get_user')
def get_user():
    user = session.get('user')
    data = get_user_data(user)
    emit("return_user", data)

@socketio.on('update_loc')
def update_loc(latitude, longitude):
    user = session.get('user')
    update_user_location(user, latitude, longitude)
    emit("updated_loc")

@socketio.on("loc_status_update")
def loc_status_update(status):
    user = session.get('user')
    update_user_location_public(user, status)
    emit("update_status")

@socketio.on("update_toucoins")
def update_toucoins(amount):
    user = session.get('user')
    update_user_toucoins(user, amount)
    emit("toucoins_update")

@socketio.on("drop_pin")
def drop_pins(latitude, longitude):
    user = session.get('user') #added
    key = drop_pin(user, latitude, longitude)
    emit("pin_dropped", key)

@socketio.on("pulled_pin")
def pulled_pins(key):
    user = session.get('user')
    ret = pull_pin(user, key)
    emit("pin_pulled", ret)

@socketio.on("get_permanent_locations")
def handle_get_perm_locs():
    user = session.get('user')
    locations = get_permanent_locations(user)
    emit("permanent_locations_got", locations)

@socketio.on("create_event")
def event_create(name, start_time, end_time, locationid, attendee_ids):
    user = session.get('user')
    key = create_event(user, name, start_time, end_time, locationid, attendee_ids)
    emit("event_created", key)

@socketio.on("get_events")
def get_events():
    user = session.get('user')
    events = get_user_events(user)
    emit("events_got", events)

@socketio.on("accept_event_invite")
def handle_accept_invite(event_id, message_id):
    user = session.get('user')
    # 1. Join the event in the database
    ret = join_event(user, event_id)

    # 2. Delete the invitation from the user's inbox
    remove_message(user, message_id)

    emit("event_accepted", ret)

@socketio.on("delete_event")
def event_delete(event_id):
    user = session.get('user')
    delete_event(user, event_id)
    emit("event deleted")

@socketio.on("send_invite")
#check if none
def send_invite(receiver, event_id):
    sender = session.get('user')
    ret = send_event_invite(sender, receiver, event_id)
    emit("invite_sent", ret)

@socketio.on("join_event")
#check if none
def event_join(event_id):
    user = session.get('user')
    ret = join_event(user, event_id)
    emit("event_joined", ret)

# @socketio.on("send_message")
# def message_send(receiver, message, message_type):
#     sender = session.get('user')
#     send_message(sender, receiver, message, message_type)
#     emit("message_sent")

@socketio.on("remove_message")
def message_remove(mid):
    user = session.get('user')
    remove_message(user, mid)
    emit("message_removed")

@socketio.on("add_friend")
#check none
def friend_add(fid):
    user = session.get('user')
    ret = add_friend(user, fid)
    emit("friend_added", ret)

@socketio.on("remove_friend")
def friend_remove(fid):
    user = session.get('user')
    remove_friend(user, fid)
    emit("removed_friend")

@socketio.on("send_friend_request")
#check none
def send_f_request(receiver):
    sender = session.get('user')
    ret = send_friend_request(sender, receiver)
    emit("request_sent", ret)

@socketio.on("get_friends")
def friend_get():
    user = session.get('user') #added
    ret = get_friends(user)

    emit("friends_got", ret)

@socketio.on("get_all_users")
def handle_get_all_users():
    user = session.get('user')
    users_list = get_all_users(user)
    emit("all_users_got", users_list)

@socketio.on("get_e_data")
def get_e_data(eid):
    user = session.get('user')
    if not user:
        return emit("error", "Not logged in")

    ret = get_event_data(user, eid)
    emit("event_got", ret)

@socketio.on("got_l_data")
def get_l_data(lid):
    user = session.get('user')
    if not user:
        return emit("error", "Not logged in")

    ret = get_location_data(user, lid)
    emit("location_got", ret)

# @socketio.on("get_u_by_id")
# def get_u_by_id(user): #changed from uid
#     ret = get_user_data_by_id(user)
#     emit("user_via_id", ret)

@socketio.on("reset_password")
def handle_password_reset(email):
    try:
        send_password_reset_email(email)
        emit("password_reset_sent", True)
    except Exception as e:
        print(f"Error sending password reset: {e}")
        emit("password_reset_sent", False)

@socketio.on("update_username")
def handle_update_username(new_username):
    print(f"DEBUG: Session Keys: {list(session.keys())}") # See if 'user' is even there

    user = session.get('user')
    print(f"DEBUG: Session User Data: {user}") # This will show if it's None or missing idToken

    # Calls your existing function in Database.py
    result = update_username(user, new_username)

    if result == "Success":
        # 1. Update the dictionary in the server's memory
        user['displayName'] = new_username

        # 2. Re-save it to the session and mark as modified
        session['user'] = user
        print(session['user'])
        session.modified = True

        # 3. Send the NEW user object back so JS can update its storage
        emit("username_updated", {"status": "Success", "user": user})
    else:
        emit("username_updated", {"status": result})

if __name__ == '__main__':
    socketio.run(app, port=8080, allow_unsafe_werkzeug=True)