import os
from Database import *
from dotenv import load_dotenv
import json
from flask import Flask, render_template, request, abort, jsonify
from jinja2 import TemplateNotFound
from flask_socketio import SocketIO, send, emit, join_room, leave_room

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

socketio = SocketIO(app)

user_profile = None

@socketio.on('connect')
def handle_connect():
    print("Client connected!")

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
        global user_profile
        return render_template(page, data=user_profile)
    except TemplateNotFound:
        abort(404)

@socketio.on('login')
def login(email, password, longitude, latitude):
    user = auth_user(email, password, latitude, longitude)  
    if user is None:
        emit("auth", None)
    else:
        global user_profile
        user_profile = user
        emit("auth", user)

@socketio.on('signup')
def signup(email, password, username, latitude, longitude):
    global user_profile
    user_profile = create_user(email, username, password, latitude, longitude)
    emit("auth", user_profile)

@socketio.on('delete')
def delete(user):
    delete_user(user)
    emit("deleted")

@socketio.on('get_user')
def get_user(user):
    data = get_user_data(user)
    emit("return_user", data)

@socketio.on('update_loc')
def update_loc(user, latitude, longitude):
    update_user_location(user, latitude, longitude)
    emit("updated_loc")

@socketio.on("loc_status_update")
def loc_status_update(user, status):
    update_user_location_public(user, status)
    emit("update_status")

@socketio.on("update_toucoins")
def update_toucoins(user, amount):
    update_user_toucoins(user, amount)
    emit("toucoins_update")

@socketio.on("drop_pin")
def drop_pins(user, latitude, longitude):
    key = drop_pin(user, latitude, longitude)
    emit("pin_dropped", key)

@socketio.on("pulled_pin")
def pulled_pins(user, key):
    ret = pull_pin(user, key)
    emit("pin_pulled", ret)

@socketio.on("create_event")
def event_create(user, name, start_time, end_time, locationid, attendee_ids):
    key = create_event(user, name, start_time, end_time, locationid, attendee_ids)
    emit("event_created", key)

@socketio.on("delete_event")
def event_delete(user, event_id):
    delete_event(user, event_id)
    emit("event deleted")

@socketio.on("send_invite")
#check if none
def send_invite(sender, reciever, event_id):
    ret = send_event_invite(sender, reciever, event_id)
    emit("invite_sent", ret)

@socketio.on("join_event")
#check if none
def event_join(user, event_id):
    ret = join_event(user, event_id)
    emit("event_joined", ret)

@socketio.on("delete_event")
#check if none
def event_delete(user, event_id):
    ret = delete_event(user, event_id)
    emit("event_deleted", ret)

@socketio.on("send_message")
def message_send(sender, reciever, message, type):
    send_message(sender, reciever, message, type)
    emit("message_sent")

@socketio.on("get_message")
def message_get(uid):
    ret = get_messages(uid)
    emit("messages", ret)

@socketio.on("remove_message")
def message_remove(uid, mid):
    remove_message(uid, mid)
    emit("message_removed")

@socketio.on("add_friend")
#check none
def friend_add(user, fid):
    ret = add_friend(user, fid)
    emit("friend_added", ret)

@socketio.on("remove_friend")
def friend_remove(user, fid):
    remove_friend(user, fid)
    emit("removed_friend")

@socketio.on("send_friend_request")
#check none
def send_f_request(sender, reciever):
    ret = send_friend_request(sender, reciever)
    emit("request_sent", ret)

@socketio.on("get_friends")
def friend_get(user):
    ret = get_friends(user)
    
    emit("friends_got", ret)

@socketio.on("get_e_data")
def get_e_data(eid):
    ret = get_event_data(eid)
    emit("event_got", ret)

@socketio.on("got_l_data")
def get_l_data(lid):
    ret = get_location_data(lid)
    emit("location_got", ret)

@socketio.on("get_u_by_id")
def get_u_by_id(uid):
    ret = get_user_data_by_id(uid)
    emit("user_via_id", ret)


if __name__ == '__main__':
    socketio.run(app, port=8080)