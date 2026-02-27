import os
from Database import *
from dotenv import load_dotenv
from flask import Flask, render_template, request
from flask_socketio import SocketIO, send, emit, join_room, leave_room

load_dotenv()

SECRET_KEY = os.getenv('SECRET_KEY')

app = Flask(__name__)
app.config['SECRET_KEY'] = SECRET_KEY

socketio = SocketIO(app)

users = {}

@app.route('/')
def index():
    return render_template('Signin.html')

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



if __name__ == '__main__':
    socketio.run(app)