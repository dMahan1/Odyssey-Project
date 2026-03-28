let latitude;
let longitude;
let updated = false;
let oldLat;
let oldLon;
let map;

function initMap() {
    map = L.map("map").setView([40.4237, -86.9212], 15);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
    }).addTo(map);
}

let locationSuccess = false;
var userIcon = L.icon({
    iconUrl: '../static/images/walking_icon.png', //Default to walking guy, will change later

    iconSize:     [38, 38], // size of the icon
    iconAnchor:   [19, 19], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

var userMarker;

const socket = io({
    withCredentials: true,
    transports: ['websocket', 'polling'] // Force websocket to keep the session stable
});
window.socket = socket;

// added
const backupUser = JSON.parse(localStorage.getItem('user_backup'));
if (backupUser) {
    // Manually tell the server "Hey, remember me?"
    // This helps the server re-fill the session['user'] if it got wiped
    socket.emit("verify_session", backupUser);
}

let current_user = JSON.parse(sessionStorage.getItem('user')) || null;

socket.on("auth", (user) => {
    current_user = user;
    sessionStorage.setItem('user', JSON.stringify(user));
});

function updateLoc() {
    console.log("updating");
    if (navigator.geolocation) {
        oldLon = longitude;
        oldLat = latitude;
        updated = false;
        navigator.geolocation.getCurrentPosition(locSuccess, locFail, {enableHighAccuracy: true});
        console.log(locationSuccess+", "+latitude+", "+longitude+", "+updated);
    } else {
        locFail();
    }
}

function locSuccess(position) {
    if (!latitude && !longitude) {
        console.log(latitude+" = "+position.coords.latitude);
        console.log(longitude+" = "+position.coords.longitude);
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        locationSuccess = true;
        addMarker();
        return {latitude: latitude, longitude: longitude};
    } else if (latitude != position.coords.latitude || longitude != position.coords.longitude) {
        console.log(latitude+" = "+position.coords.latitude);
        console.log(longitude+" = "+position.coords.longitude);
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
        updateMarker();
    } else {
        console.log("No update necessary");
        setTimeout(updateLoc, 10000);
    }
    locationSuccess = true;
    return {latitude: latitude, longitude: longitude};
}

function locFail() {
    console.log("Location Didn't Work")
    current_user = null;
    sessionStorage.removeItem('user');
    localStorage.removeItem('user_backup');
    socket.emit('logout');
    window.location.href = "Signin.html";
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function addMarker() {
    while (!latitude && !longitude) {
        await new Promise(r => setTimeout(r, 200));
    }
    userMarker = L.marker([latitude, longitude], {icon: userIcon}).addTo(map);
    map.setView([latitude, longitude], 15);
    window.socket.emit("update_loc", latitude, longitude);
    window.socket.once("updated_loc", () => {
        console.log("Adding Success, Position = [" + latitude+", "+longitude+"]");
    });
    setTimeout(updateLoc, 5000);
}

async function updateMarker() {
    console.log("1")
    while (latitude == oldLat && longitude == oldLon) {
        await new Promise(r => setTimeout(r, 200));
    }
    console.log("2")
    userMarker.setLatLng([latitude, longitude]);
    window.socket.emit("update_loc", latitude, longitude);
    window.socket.once("updated_loc", () => {
        console.log("Success, Position = [" + latitude+", "+longitude+"]");
    });
    setTimeout(updateLoc, 10000);
}

document.addEventListener("DOMContentLoaded", () => {
    initMap();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(locSuccess, locFail, {enableHighAccuracy: true});
    } else {
        locFail();
    }

    const searchBtn = document.getElementById('loc_search_btn');
    const searchPopup = document.getElementById('loc_search_popup_background');
    searchBtn.addEventListener('click', () => {
      searchPopup.style.display = 'flex';
    });

    searchPopup.addEventListener('click', (event) => {
      if (event.target === searchPopup) {
        searchPopup.style.display = 'none';
      }
    });
});