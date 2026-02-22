import os
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
def login():
    return render_template('temp_test.html')

@socketio.on('join')
def handle_join(username):
    users[request.sid] = username

if __name__ == '__main__':
    socketio.run(app)