/* Variables */

const signin_email = document.getElementById('signin_email');
const signin_password = document.getElementById('signin_password');
const signin_button = document.getElementById('signin_button');

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
    window.location.href = "gui/Map.html";
})