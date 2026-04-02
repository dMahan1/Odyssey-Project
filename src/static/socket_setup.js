// socket-setup.js
console.log("Socket-setup.js loading...");


// Initialize the socket globally
window.socket = io(); 

window.socket.on('connect', () => {
    console.log("Connected to server with ID:", window.socket.id);
});

window.socket.on('server_instance', (id) => {
    const lastId = sessionStorage.getItem('server_instance_id');
    if (lastId !== null && lastId !== id) {
        // Server restarted — invalidate client session
        sessionStorage.removeItem('user');
        const page = window.location.pathname;
        if (!page.endsWith('Signin.html') && !page.endsWith('Signup.html')) {
            window.location.href = 'Signin.html';
        }
    }
    sessionStorage.setItem('server_instance_id', id);
});

window.socket.on('connect_error', (err) => {
    console.error("Socket connection error:", err);
});