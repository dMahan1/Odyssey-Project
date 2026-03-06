// socket-setup.js
console.log("Socket-setup.js loading...");


// Initialize the socket globally
window.socket = io(); 

window.socket.on('connect', () => {
    console.log("Connected to server with ID:", window.socket.id);
});

window.socket.on('connect_error', (err) => {
    console.error("Socket connection error:", err);
});