import os
import subprocess
import sys

# Normalise CWD to the project root regardless of how WebStorm launches the script
_src_dir = os.path.dirname(os.path.abspath(__file__))
_project_root = os.path.dirname(_src_dir)
os.chdir(_project_root)

# Build bindings before importing
# Windows: use build.py (make is not reliably available)
# macOS/Linux: use Makefile

#ONLY FOR TESTING

# if sys.platform == "win32":
#     _build_script = os.path.join(_src_dir, "build.py")
#     subprocess.check_call(
#         [sys.executable, _build_script],
#         stdin=subprocess.DEVNULL,
#     )
# else:
#     subprocess.check_call(
#         ["make", "all", f"PYTHON={sys.executable}"],
#         stdin=subprocess.DEVNULL,
#     )

# Ensure src/ is on the path so the built bindings module can be found
if _src_dir not in sys.path:
    sys.path.insert(0, _src_dir)

import uuid

import bindings
from dotenv import load_dotenv
from flask import Flask, abort, jsonify, render_template, request, session
from flask_socketio import SocketIO, emit, join_room, leave_room, send
from jinja2 import TemplateNotFound

from Database import *

SERVER_INSTANCE_ID = str(uuid.uuid4())

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

pathfinder = bindings.Pathfinder.get_instance()

# added
@socketio.on("verify_session")
def verify_session(user_data):
    if user_data:
        session['user'] = user_data
        session.modified = True
        print(f"Session manually restored for: {user_data.get('username')}")

@socketio.on('connect')
def handle_connect():
    emit('server_instance', SERVER_INSTANCE_ID)
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
    if not user.get("status") == "Success":
        emit("authfail", user)
    else:
        session['user'] = user
        sesh = session.get('user')
        session.permanent = True  # <--- FORCE IT TO PERSIST
        session.modified = True
        print(f"Error sending password reset: {sesh}")
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
def drop_pins(name, latitude, longitude):
    user = session.get('user') #added
    key = drop_pin(user, name, latitude, longitude)
    emit("pin_dropped", key)

@socketio.on("pulled_pin")
def pulled_pins(key):
    user = session.get('user')
    ret = pull_pin(user, key)
    emit("pin_pulled", ret)

@socketio.on("get_user_pins")
def handle_get_user_pins():
    user = session.get('user')
    if not user:
        return

    pins = []
    user_data = get_user_data(user)

    for pin_id in user_data.get("dropped_pins", []):
        pin_info = get_location_data(user, pin_id)
        if pin_info:
            pin_info['id'] = pin_id
            pins.append(pin_info)

    emit("user_pins_got", pins)


@socketio.on("get_permanent_locations")
def handle_get_perm_locs():
    user = session.get('user')
    locations = get_permanent_locations(user)
    emit("permanent_locations_got", locations)

@socketio.on("report_issue")
def report_issue(message):
    user = session.get('user')
    if not user:
        emit("error", "Not logged in")
        return
    result = store_report(user, message)
    emit("issue_reported", result)

@socketio.on("report_user")
def report_user(subject_username):
    user = session.get('user')
    if not user:
        emit("error", "Not logged in")
        return
    result = report_user(user, subject_username)
    emit("user_reported", result)

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

@socketio.on("send_message")
def message_send(message, event_id):
     sender = session.get('user')
     status = send_message_to_attendees(sender, event_id=event_id, message=message)
     emit("message_sent", status)

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

@socketio.on("search_locations")
def handle_search_locations(loc_name):
    user = session.get('user')
    if not user:
        return emit("search_result", {"status": "error", "message": "Not logged in"})

    matches = get_locations_from_name(user, loc_name)

    if matches:
        all_results = []
        for match in matches:
            full_data = get_location_data(user, match['id'])
            if full_data and 'coordinates' in full_data:
                all_results.append({
                    "id": match['id'],
                    "name": full_data.get("name", "Unnamed Location"),
                    "latitude": full_data['coordinates']['latitude'],
                    "longitude": full_data['coordinates']['longitude']
                })

        emit("search_result", {"status": "success", "results": all_results})
    else:
        emit("search_result", {"status": "error", "message": "No matches found"})

@socketio.on("get_route")
def handle_get_route(src_lat, src_lon, dst_id, bad_weather, traversal_mode):
    user = session.get('user')
    if not user:
        return emit("route_result", {"status": "error", "message": "Not logged in"})
    try:
        traversal_mode = getattr(bindings.TraversalMode, traversal_mode)
    except AttributeError:
        traversal_mode = bindings.TraversalMode.WALKING
    src = pathfinder.approximate_location_via(src_lat, src_lon, traversal_mode)
    true_dst = pathfinder.get_location_by_id(dst_id)
    dst = pathfinder.approximate_location_via(true_dst.get_latitude(), true_dst.get_longitude(), traversal_mode)

    try:
        path_raw = pathfinder.route(src, dst, bad_weather, traversal_mode)
    except Exception as e:
        return emit("route_result", {"status": "error", "message": str(e)})
    path_result = {
        "location_ids": path_raw.location_ids,
        "total_distance": path_raw.total_distance
        }
    emit("route_result", {"status": "success", "route": path_result})

@socketio.on("get_id_coords")
def handle_get_id_coords(ids):
    user = session.get('user')
    if not user:
        return emit("id_coords_result", {"status": "error", "message": "Not logged in"})
    lat_lon = []
    for loc_id in ids:
        loc = pathfinder.get_location_by_id(loc_id)
        if loc:
            lat_lon.append([loc.get_latitude(), loc.get_longitude()])
        else:
            print(f"Warning: Location ID {loc_id} not found in Pathfinder.")
    emit("id_coords_result", {"status": "success", "coords": lat_lon})

if __name__ == '__main__':
    socketio.run(app, port=8080, allow_unsafe_werkzeug=True)