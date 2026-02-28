import os
from Database import *
from dotenv import load_dotenv
from flask import Flask, render_template, request, abort
from jinja2 import TemplateNotFound
from flask_socketio import SocketIO, send, emit, join_room, leave_room

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

socketio = SocketIO(app)

users = {}

@app.route('/', defaults={'page': 'Signin.html'})
@app.route('/<path:page>')
def render_page(page):
    # Prevent directory traversal and absolute paths
    if '..' in page or page.startswith('/'):
        abort(400)
    try:
        return render_template(page)
    except TemplateNotFound:
        abort(404)

@socketio.on('login')
def login(email, password, longitude, latitude):
    user = auth_user(email, password, latitude, longitude)   
    if user is None:
        emit("auth", None)
    else:
        emit("auth", user)

@socketio.on('signup')
def signup(email, password, username, latitude, longitude):
    user = create_user(email, username, password, latitude, longitude)
    emit("auth", user)

@socketio.on('delete')
def delete(user):
    delete_user(user)
    emit("deleted")

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


if __name__ == '__main__':
    socketio.run(app)