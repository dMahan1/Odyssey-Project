/* Variables */
import { latitude, longitude, location_success, set_user_data } from "./Signin_up";
const signin_email = document.getElementById('signin_email');
const signin_password = document.getElementById('signin_password');
const signin_button = document.getElementById('signin_button');
const socket = io()
/* On run */

signin_email.style.fontSize =
    signin_password.style.fontSize =
    signin_button.style.fontSize =
    logo_height * .175 + "px";

block.style.gap = logo_width * .12 + "px"
sign_here.style.marginTop = -logo_height * .23 + "px"


window.addEventListener('resize', () => {
    // signin adjustments
    signin_email.style.fontSize =
        signin_password.style.fontSize =
        signin_button.style.fontSize =
        logo_height * .175 + "px";

    block.style.gap = logo_width * .12 + "px"
    sign_here.style.marginTop = -logo_height * .23 + "px"
})

signin_button.addEventListener('click', () =>{
    if (location_success) {
        socket.emit("login", signin_email, signin_password, longitude, latitude)
        socket.on("auth", (user) => {
            if (user === NULL) {
                alert("Incorrect Email or Password");
            }
            else {
                set_user_data(user);
                window.location.href = "Map.html";
            }
        });
    }
    else {
        alert("Please allow location access for this application");
    }
})