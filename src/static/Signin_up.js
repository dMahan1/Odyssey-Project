/* Variables */

const block = document.getElementById('sign_background');
const sign_here = document.getElementById('sign_here');
let latitude = 0;
let longitude = 0;
let location_success = false;
let user_profile = null;
const socket = io()

let width = .25 * window.innerWidth;
let height = .11 * window.innerWidth;

/* On Run */

window.addEventListener('DOMContentLoaded',() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, fail, {enableHighAccuracy: true});
    } else {
        /* Wont let you signin */
    }
})

block.style.width = width + 'px';
block.style.height = 3 * height + 'px';

sign_here.style.fontSize = height * .0875 +"px"

// On window resize to adjust
window.addEventListener('resize', () => {
    width = .25 * window.innerWidth;
    height = .11 * window.innerWidth;

    block.style.width = width + 'px';
    block.style.height = 3 * height + 'px';

    sign_here.style.fontSize = height * .0875 +"px"

})

function success(position) {
    latitude = position.coords.latitude;
    longitude = position.coords.longitude;
    location_success = true;
    return {latitude: latitude, longitude: longitude};
}

function fail() {
    location_success = false;
}

function get_location_success() {
    return location_success;
}

function set_user_data(user) {
    user_profile = user;
    return;
}