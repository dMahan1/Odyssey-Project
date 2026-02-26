/* Variables */

const logo =  document.getElementById('logo');
const block = document.getElementById('sign_background');
let logo_width = logo.offsetWidth;
let logo_height = logo.offsetHeight;
const sign_here = document.getElementById('sign_here');
let latitude = 0;
let longitude = 0;
let location_success = false;

/* On Run */

window.addEventListener('DOMContentLoaded',() => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(success, fail, {enableHighAccuracy: true});
    } else {
        /* Wont let you signin */
    }
})

block.style.width = logo_width + 'px';
block.style.height = 3 * logo_height + 'px';

sign_here.style.fontSize = logo_height * .0875 +"px"

// On window resize to adjust
window.addEventListener('resize', () => {
    logo_width = logo.offsetWidth;
    block.style.width = logo_width + 'px';
    logo_height = logo.offsetHeight;
    block.style.height = 3 * logo_height + 'px';

    sign_here.style.fontSize = logo_height * .0875 +"px"

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
