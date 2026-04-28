let latitude;
let longitude;
let updated = false;
let oldLat;
let oldLon;
let currentRouteLayer = null;
let isPlacingPin = false;
let pins = [];
let unownedEventLocations = [];
let pinMarkers = {};  // keyed by pin.id → Leaflet marker
let hotspots = [];
let pinLayerGroup;
let poiLayerGroup;

const suggestions_background = document.getElementById('suggestions_popup_background');
const suggestions_button = document.getElementById('suggestions_btn');
const close_suggestions = document.getElementById('close_suggestions');
const suggestions_text = document.getElementById('suggestions_text');
const send_suggestions = document.getElementById('send_suggestions');
const path_check = document.getElementById('path_check');
const location_check = document.getElementById('location_check');

function initMap() {
  let southWest = L.latLng(40.405, -86.955);
  let northEast = L.latLng(40.445, -86.895);
  let purdueBounds = L.latLngBounds(southWest, northEast);

  map = L.map("map", {
      maxBounds: purdueBounds,
      maxBoundsViscosity: 1,
      minZoom: 14
  }).setView([40.4237, -86.9212], 15);
  window.leafletMap = map;
  window.leafletMap = map;
  window.appLatitude = () => latitude;
  window.appLongitude = () => longitude;
  window.currentRouteLayer = currentRouteLayer;
  window.setAppLocation = (lat, lng) => { latitude = lat; longitude = lng; };
  

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
  }).addTo(map);

    pinLayerGroup = L.layerGroup().addTo(map);
    poiLayerGroup = L.layerGroup().addTo(map);
}

let locationSuccess = false;
var userIcon = L.icon({
    iconUrl: '../static/images/Default.png',

    iconSize:     [25, 30], // size of the icon
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
const backupUser = JSON.parse(sessionStorage.getItem('user_backup'));
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
        console.log(locationSuccess + ", " + latitude + ", " + longitude + ", " + updated);
        window.socket.emit("get_hotspots");
        window.socket.emit("get_user_pins");
        window.socket.emit("get_pois");
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
    sessionStorage.removeItem('user_backup');
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

function getSelectedMode() {
    const activeBtn = document.querySelector('.side-btn.active');

    if (activeBtn) {
        switch (activeBtn.id) {
            case 'walk_btn':
                return 'WALKING';
            case 'bike_btn':
                return 'BIKING';
            case 'car_btn':
                return 'DRIVING';
            case 'bus_btn':
                return 'BUS';
            default:
                console.log("Unknown mode button, defaulting to WALK");
                return 'WALKING';
        }
    }
    console.log("No active mode button found, defaulting to WALK");
    return 'WALKING';
}

function placeDraftPin(latlng) {
    const tempMarker = L.marker(latlng, { draggable: false }).addTo(map);

    const popupContent = `
      <div class="pin-popup">
        <strong style="color: black; display: block; margin-bottom: 8px;">Save this location?</strong>
        <input type="text" id="temp-pin-name" placeholder="Name (e.g. My Lab)"
               style="width: 100%; margin-bottom: 12px; box-sizing: border-box;">
        <div class="pin-popup-btns">
          <button id="save-temp-pin" style="background-color: #4CAF50; color: white; border: 2px solid black; padding: 5px 15px; border-radius: 4px; cursor: pointer; font-family: inherit;">Save</button>
          <button id="cancel-temp-pin" style="background-color: var(--ui-reddish); color: white; border: 2px solid black; padding: 5px 15px; border-radius: 4px; cursor: pointer; font-family: inherit;">Cancel</button>
        </div>
      </div>
    `;

    tempMarker.bindPopup(popupContent, {
        closeButton: false,
        closeOnClick: false,
        keepInView: true
    }).openPopup();

    // Use a polling interval to wait for the DOM elements to exist
    const checkExist = setInterval(() => {
        const saveBtn = document.getElementById('save-temp-pin');
        const cancelBtn = document.getElementById('cancel-temp-pin');
        const nameInput = document.getElementById('temp-pin-name');

        if (saveBtn && cancelBtn && nameInput) {
            console.log("Buttons found and bound!");

            saveBtn.onclick = (e) => {
                e.preventDefault();
                const name = nameInput.value.trim() || "Untitled Pin";

                // ONLY emit the drop. Do NOT emit get_user_pins here.
                window.socket.emit("drop_pin", name, latlng.lat, latlng.lng);
                map.removeLayer(tempMarker);
            };

            cancelBtn.onclick = (e) => {
                e.preventDefault();
                map.removeLayer(tempMarker);
            };

            nameInput.focus();

            // CRITICAL: Stop looking once we found them
            clearInterval(checkExist);
        }
    }, 50); // Check every 50ms

    // Safety: Clear interval if the popup is closed some other way
    tempMarker.on('popupclose', () => clearInterval(checkExist));
}

document.addEventListener("DOMContentLoaded", () => {
    initMap();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(locSuccess, locFail, {enableHighAccuracy: true});
    } else {
        locFail();
    }

    window.socket.emit("get_user_pins");
    window.socket.emit("get_hotspots");

    const otherUserMarkers = {};

    function refreshPublicUsers() {
        window.socket.once("public_users_got", (users) => {
            const seenIds = new Set();
            users.forEach(u => {
                if (u.latitude == null || u.longitude == null) return;
                seenIds.add(u.id);
                const iconUrl = (u.icon_image_path && (u.icon_image_path.startsWith('http') || u.icon_image_path.startsWith('/static/')))
                    ? u.icon_image_path
                    : '../static/images/Default.png';
                if (otherUserMarkers[u.id]) {
                    otherUserMarkers[u.id].setLatLng([u.latitude, u.longitude]);
                } else {
                    const otherIcon = L.icon({
                        iconUrl: iconUrl,
                        iconSize:   [20, 24],
                        iconAnchor: [10, 12],
                        popupAnchor: [0, -12]
                    });
                    otherUserMarkers[u.id] = L.marker([u.latitude, u.longitude], { icon: otherIcon })
                        .addTo(map)
                        .bindPopup(u.username || 'User');
                }
            });
            // Remove markers for users no longer public
            Object.keys(otherUserMarkers).forEach(id => {
                if (!seenIds.has(id)) {
                    otherUserMarkers[id].remove();
                    delete otherUserMarkers[id];
                }
            });
            setTimeout(refreshPublicUsers, 60000);
        });
        window.socket.emit("get_public_users");
    }

    refreshPublicUsers();

    const searchBtn = document.getElementById('loc_search_btn');
    const searchPopup = document.getElementById('loc_search_popup_background');
    const searchPopupClose = document.getElementById('search_popup_close');
    const searchBar = document.getElementById('loc_search_bar');

    socket.emit("get_user");
    window.socket.once("return_user", (user) => {
        if (user && user.banned) {
            alert(`You have been banned until ${new Date(user.banned_until).toLocaleString()}.`);
            window.location.href = "Signin.html";
            return;
        }
        if (user) {
            const iconUrl = (user.icon_image_path && (user.icon_image_path.startsWith('http') || user.icon_image_path.startsWith('/static/')))
                ? user.icon_image_path
                : '../static/images/Default.png';
            userIcon = L.icon({
                iconUrl: iconUrl,
                iconSize:   [25, 30],
                iconAnchor: [19, 19],
                shadowAnchor: [4, 62],
                popupAnchor: [-3, -76]
            });
            if (userMarker) {
                userMarker.setIcon(userIcon);
                userMarker.update();
            }
        }
    });

    searchBtn.addEventListener('click', () => {
        const popupBody = document.getElementById('loc_search_popup');
        const loadingLabel = document.getElementById('loading_label');
        const existingResults = popupBody.querySelectorAll('.loc_search_result');
        existingResults.forEach(res => res.remove());
        loadingLabel.textContent = 'Searching...';

        searchPopup.style.display = 'flex';
        const query = searchBar.value.trim();
        if (query) {
          socket.emit("search_locations", query);
        } else {
            const existingResults = popupBody.querySelectorAll('.loc_search_result');
            existingResults.forEach(res => res.remove());
            const empty = document.createElement('div');
            empty.className = 'loc_search_result';
            empty.innerHTML = '<label class="loc_name">Empty Search Phrase</label>';
            popupBody.appendChild(empty);
            return;
        }
    });

    searchPopup.addEventListener('click', (event) => {
      if (event.target === searchPopup) {
        searchPopup.style.display = 'none';
      }
    });

    searchPopupClose.addEventListener('click', () => {
      searchPopup.style.display = 'none';
    });

    searchBar.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchBtn.click();
    });

    document.getElementById('snap_btn').addEventListener('click', () => {
        map.setView([latitude, longitude]);
    });

    document.getElementById('hotspot_btn').addEventListener('click', () => {
        window.socket.emit('create_hotspot', { "latitude": latitude, "longitude": longitude });
    });

    const modeButtons = document.querySelectorAll('.side-btn');
    let currentMode = getSelectedMode();

    modeButtons.forEach(button => {
        button.addEventListener('click', () => {
            modeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            currentMode = getSelectedMode();
            console.log("Traversal mode changed to:", currentMode);
        });
    });

    // Pin setting
    const pinBtn = document.getElementById('make-pin-btn');

        pinBtn.addEventListener('click', () => {
            isPlacingPin = !isPlacingPin;
            pinBtn.classList.toggle('active', isPlacingPin);

            document.getElementById('map').style.cursor = isPlacingPin ? 'crosshair' : '';
        });

        map.on('click', function(e) {
            if (isPlacingPin) {
                placeDraftPin(e.latlng);

                isPlacingPin = false;
                pinBtn.classList.remove('active');
                document.getElementById('map').style.cursor = '';
            }
        });
    console.log("fetching pins");

    window.socket.emit("get_user_pins");
    window.socket.emit("get_pois");
});

window.socket.on("pois_got", (data) => {
    console.log("POIs received:", JSON.stringify(data, null, 2));

    poiLayerGroup.clearLayers();

    console.log(current_user)
    const id = current_user["localId"];
    data.forEach(poi => {
        if (poi.attendee_ids && poi.attendee_ids.some(attendeeId => String(attendeeId) === String(id))) {
            return;
        }
        if (poi.latitude && poi.longitude) {
            const poiIcon = L.divIcon({
                className: '',
                html: `<img src="https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png"
                            style="filter: hue-rotate(150deg) brightness(1.2);
                                   width: 25px; height: 41px;">`,
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34]
            });

            const marker = L.marker([poi.latitude, poi.longitude], { icon: poiIcon }).addTo(map);

            marker.bindPopup(`
                <div class="poi-popup" style="text-align: center;">
                    <b>⭐ POI: ${poi.name} ⭐</b><br>
                    <sub>Created by ${poi.creator_username}</sub>
                    <button type="button"
                          style="background-color: #FFD700; border: 1px solid black; border-radius: 4px; cursor: pointer; padding: 4px 8px;"
                          onclick="window.socket.emit('join_event', '${poi.id}')">
                          Join Event
                    </button>
                </div>
            `);
        }
    });
});

window.socket.on("search_result", (data) => {
    console.log("Search result received:", JSON.stringify(data, null, 2));
    const popupBody = document.getElementById('loc_search_popup');
    const template = document.getElementById('loc_results_template');
    const loadingLabel = document.getElementById('loading_label');
    loadingLabel.textContent = '';

    const existingResults = popupBody.querySelectorAll('.loc_search_result');
    existingResults.forEach(res => res.remove());

    if (data.status !== "success" || !data.results || data.results.length === 0) {
            const noResult = document.createElement('div');
            noResult.className = 'loc_search_result';
            noResult.innerHTML = '<label class="loc_name">No locations found.</label>';
            popupBody.appendChild(noResult);
            return;
    }
    data.results.sort((a, b) => a.name.localeCompare(b.name));
    data.results.forEach(location => {
        const clone = template.content.cloneNode(true);

        const nameLabel = clone.querySelector('.loc_name');
        nameLabel.textContent = location.name || "Unknown Location";

        const infoBtn = clone.querySelector('.loc_result_info');
        infoBtn.dataset.id = location.id;
        infoBtn.addEventListener('click', () => {
            window.socket.emit("events_at_loc", location.name);
            //document.getElementById('loc_search_popup_background').style.display = 'none';
            map.setView([location.latitude, location.longitude], 17);
        });

        const routeBtn = clone.querySelector('.loc_result_route');
        routeBtn.dataset.id = location.id;
        routeBtn.addEventListener('click', () => {
            const mode = getSelectedMode();
            console.log(`Routing to: ${location.name} at ${location.latitude}, ${location.longitude} as ${mode}`);

            const weatherCheckbox = document.getElementById('weather');
            const isPoorWeather = weatherCheckbox ? weatherCheckbox.checked : false;

            map.setView([location.latitude, location.longitude], 17);

            document.getElementById('loc_search_popup_background').style.display = 'none';

            window.socket.emit("get_route",
                latitude,
                longitude,
                location.latitude,
                location.longitude,
                isPoorWeather,
                mode
            );
        });

        popupBody.appendChild(clone);
    });
});

window.socket.on("route_result", (data) => {
  if (data.status !== "success") {
      console.log(`Route request failed: ${data.message}`);
      alert("Could not find a route.")
      if (currentRouteLayer) {
          map.removeLayer(currentRouteLayer);
      }
      return;
  }

  console.log("Route received:", data);

    if (data.status === "success") {
        const pathIds = data.route.location_ids;

        if (pathIds && pathIds.length > 0) {
            console.log(`Requesting coordinates for ${pathIds.length} nodes...`);
            window.socket.emit("get_id_coords", pathIds);
        }
    }
});

socket.on("id_coords_result", (data) => {
    console.log("ID coords received:", data);
    if (data.status === "success") {
        const coords = data.coords;

        if (currentRouteLayer) {
            map.removeLayer(currentRouteLayer);
        }

        currentRouteLayer = L.polyline(coords, {
            color: (data.flags & 1) ? '#EA213A' : '#00ace6',
            weight: 5,
            opacity: 1.0,
            smoothFactor: 1
        }).addTo(map);

        window.currentRouteLayer = currentRouteLayer;

        map.fitBounds(currentRouteLayer.getBounds(), { padding: [30, 30] });
    } else {
        console.error("Failed to get coordinates:", data.message);
    }
});

window.socket.on("user_pins_got", (data) => {
    console.log("Updating pins on map...", data);

    // Ensure pinLayerGroup exists before trying to clear it
    if (pinLayerGroup) {
        pinLayerGroup.clearLayers();
    } else {
        return; // Map isn't ready yet
    }

    pins = [];
    pinMarkers = {};

    data.forEach(pin => {
        const lat = pin.coordinates?.latitude;
        const lon = pin.coordinates?.longitude;
        const pinId = pin.id;

        if (lat !== undefined && lon !== undefined) {
            pins.push(pin);
            const marker = L.marker([lat, lon]);

            const pinPopupContent = `
                <div style="font-family: Rockwell, monaco, monospace; padding: 5px; text-align: center;">
                    <strong style="color: black; display: block; margin-bottom: 5px;">${pin.name}</strong>
                    <button class="pull-pin-btn"
                            style="background-color: var(--ui-reddish); color: white; border: 2px solid black; border-radius: 4px; cursor: pointer; padding: 2px 8px;"
                            onclick="window.socket.emit('pulled_pin', '${pinId}')">
                        Pull this pin
                    </button>
                </div>
            `;

            marker.bindPopup(pinPopupContent, {
                closeButton: false,
                offset: L.point(0, -5)
            });
            pinLayerGroup.addLayer(marker);
            pinMarkers[pinId] = marker;
        }
    });

    socket.emit("get_event_locations");
});

window.socket.on("event_locations_got", (data) => {
    console.log("Received event locations:", data);

    // Remove stale unowned markers before re-adding from fresh server response
    unownedEventLocations.forEach(loc => {
        if (loc.marker) pinLayerGroup.removeLayer(loc.marker);
    });
    unownedEventLocations = [];

    data.forEach(loc => {
        // Match by name against the current user's own pins only
        const existingPin = pins.find(pin => pin.name === loc.name);

        if (existingPin) {
            // This is the user's own pin used in an event — show pin-style popup with fake pull
            const marker = pinMarkers[existingPin.id];
            if (marker) {
                const eventsHtml = loc.events.map(e => `<div style="color: black;">${e}</div>`).join('');
                const popupContent = `
                    <div style="font-family: Rockwell, monaco, monospace; padding: 5px; text-align: center;">
                        <strong style="color: black; display: block; margin-bottom: 5px;">${loc.name}</strong>
                        <strong style="color: black; display: block; margin-bottom: 3px;">Events:</strong>
                        ${eventsHtml}
                    </div>
                `;
                marker.setPopupContent(popupContent);
            }
        } else {
            // Event at a location the user doesn't own — show event info, no pull button
            const eventsHtml = loc.events.map(e => `<div style="color: black;">${e}</div>`).join('');
            const popupContent = `
                <div style="font-family: Rockwell, monaco, monospace; padding: 5px; text-align: center;">
                    <strong style="color: black; display: block; margin-bottom: 5px;">${loc.name}</strong>
                    <strong style="color: black; display: block; margin-bottom: 3px;">Events:</strong>
                    ${eventsHtml}
                </div>
            `;
            const marker = L.marker([loc.latitude, loc.longitude]);
            marker.bindPopup(popupContent, { closeButton: false, offset: L.point(0, -5) });
            pinLayerGroup.addLayer(marker);
            unownedEventLocations.push({ ...loc, marker });
        }
    });
});

window.socket.on("create_hotspot_result", (data) => {
    window.socket.emit('get_hotspots');
    if (data.status === "success") {
        window.socket.emit('give_toucoins', 10);
        alert("Thank you for creating a hotspot!");
    } else {
        alert("You are creating hotspots too fast!");
    }
});

window.socket.on("events_at_loc_result", (data) => {
    console.log("Events received:", data);

    const popupBackground = document.getElementById('loc_search_popup_background');
    const popupBody = document.getElementById('loc_search_popup');
    const loadingLabel = document.getElementById('loading_label');

    popupBackground.style.display = 'flex';
    const existingResults = popupBody.querySelectorAll('.loc_search_result');
    existingResults.forEach(res => res.remove());

    if (data.status !== "success" || !data.events || data.events.length === 0) {
        loadingLabel.textContent = '';
        const noEvents = document.createElement('div');
        noEvents.className = 'loc_search_result';
        noEvents.innerHTML = `<label class="loc_name">No upcoming events at this location.</label>`;
        popupBody.appendChild(noEvents);
        return;
    }

    loadingLabel.textContent = `Events at ${data.location_name || 'Location'}`;
    loadingLabel.style.fontWeight = 'bold';

    data.events.forEach(event => {
        const eventDiv = document.createElement('div');
        eventDiv.className = 'loc_search_result';
        eventDiv.style.flexDirection = 'column';
        eventDiv.style.alignItems = 'flex-start';
        eventDiv.style.padding = '10px';

        eventDiv.innerHTML = `
            <div style="font-weight: bold; color: var(--ui-black);">${event.name || event}</div>
            ${event.description ? `<div style="font-size: 0.85em; color: #555;">${event.description}</div>` : ''}
            ${event.time ? `<div style="font-size: 0.8em; margin-top: 4px;">🕒 ${event.time}</div>` : ''}
            `;

        popupBody.appendChild(eventDiv);
    });
});

window.socket.on("hotspot_result", (data) => {
    hotspots.forEach(hotspot => {
        if (hotspot.circle) {
            map.removeLayer(hotspot.circle);
        }
    });
    hotspots = [];

    if (data.status === "success" && data.hotspots) {
      Object.values(data.hotspots).forEach(hotspot => {
          if (hotspot.latitude && hotspot.longitude) {
              const endTime = new Date(hotspot.end_time).getTime();
              const now = Date.now();

              const maxLife = 1000 * 60 * 5; // 5 minutes
              const timeLeft = Math.max(0, endTime - now);
              const ratio = Math.min(1, timeLeft / maxLife);

              const dynamicRadius = 10 + (40 * ratio);

              const dynamicOpacity = 0.1 + (0.4 * ratio);

              const dynamicColor = ratio > 0.2 ? '#f03' : '#888';

              const circle = L.circle([hotspot.latitude, hotspot.longitude], {
                  fillColor: dynamicColor,
                  opacity: 0.0,
                  fillOpacity: dynamicOpacity,
                  radius: dynamicRadius
              }).addTo(map);

              hotspots.push({ circle: circle, ...hotspot });
          }
      });
    }
});

window.socket.on("event_joined", (data) => {
    window.socket.emit("get_pois");
});

// Confirmation handlers to trigger the refresh
window.socket.on("pin_dropped", () => window.socket.emit("get_user_pins"));
window.socket.on("pin_pulled", () => {
    window.socket.emit("get_user_pins");
});

close_suggestions.addEventListener('click', () => {
    suggestions_background.style.display = "none";
    suggestions_text.value = null;
})

send_suggestions.addEventListener('click', () => {
    if (location_check.checked) {
        window.socket.emit("make_suggestion", suggestions_text.value, "Location");
        window.socket.once("suggestion_made", (success) => {
            if (success) {
                alert("Thank you for your location suggestion!");
            } else {
                alert("Failed to submit your location suggestion. Please try again later.");
            }
        });
        suggestions_background.style.display = "none";
        suggestions_text.value = null;
    } else if (path_check.checked) {
        window.socket.emit("make_suggestion", suggestions_text.value, "Path");
        window.socket.once("suggestion_made", (success) => {
            if (success) {
                alert("Thank you for your path suggestion!");
            } else {
                alert("Failed to submit your path suggestion. Please try again later.");
            }
        });
        suggestions_background.style.display = "none";
        suggestions_text.value = null;
    } else {
        alert("Please chose suggestion type!");
    }
})

location_check.addEventListener("click", () => {
    if (path_check.checked === true) {
        path_check.checked = false;
    }
})

path_check.addEventListener("click", () => {
    if (location_check.checked === true) {
        location_check.checked = false;
    }
})

suggestions_button.addEventListener("click", () => {
    suggestions_background.style.display = "block";
})
